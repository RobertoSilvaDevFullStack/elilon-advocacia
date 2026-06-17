/**
 * HermesWebhookService
 * Sprint 3.10 — Eventos Hermes
 *
 * Responsabilidades:
 *  - Buscar URL configurada em settings (hermes_webhook_url)
 *  - Montar payload do evento hermes_analise_concluida
 *  - Disparar POST com 3 tentativas e backoff exponencial (1s / 3s / 5s)
 *  - Registrar cada tentativa em hermes_webhook_logs
 *  - Nunca lançar exceção para o chamador
 */

const axios = require("axios");
const db = require("../database/index");
const { logger } = require("../config/logger");

const RETRY_DELAYS_MS = [1000, 3000, 5000];

class HermesWebhookService {
  /**
   * Ponto de entrada principal.
   * @param {string|number} preAtendimentoId
   * @param {Object} opts
   * @param {Object}  opts.atendimento  - Registro completo de chat_pre_atendimentos
   * @param {Object}  opts.analysis     - Registro completo de chat_ai_analysis
   */
  async dispatch(preAtendimentoId, { atendimento, analysis }) {
    try {
      const urlRow = await db.query(
        "SELECT value FROM settings WHERE key = 'hermes_webhook_url'"
      );

      const webhookUrl = urlRow.rows[0]?.value?.trim();

      if (!webhookUrl) {
        logger.info("[HermesWebhook] hermes_webhook_url não configurada — ignorando", {
          preAtendimentoId,
        });
        return;
      }

      const payload = this._buildPayload(atendimento, analysis);
      await this._dispatchWithRetry(preAtendimentoId, webhookUrl, payload);
    } catch (err) {
      logger.error("[HermesWebhook] Erro inesperado no dispatch", {
        preAtendimentoId,
        error: err.message,
      });
    }
  }

  /**
   * Re-envia o último evento para um pré-atendimento (para botão "Reenviar").
   * Busca o atendimento e análise diretamente do banco.
   */
  async redispatch(preAtendimentoId) {
    try {
      const [atendRes, analysisRes] = await Promise.all([
        db.query("SELECT * FROM chat_pre_atendimentos WHERE id = $1", [preAtendimentoId]),
        db.query(
          "SELECT * FROM chat_ai_analysis WHERE pre_atendimento_id = $1 ORDER BY updated_at DESC LIMIT 1",
          [preAtendimentoId]
        ),
      ]);

      const atendimento = atendRes.rows[0];
      const analysis = analysisRes.rows[0];

      if (!atendimento) throw new Error("Pré-atendimento não encontrado");
      if (!analysis) throw new Error("Análise Hermes não encontrada");
      if (analysis.status_analise !== "concluida") {
        throw new Error(`Análise não concluída (status: ${analysis.status_analise})`);
      }

      await this.dispatch(preAtendimentoId, { atendimento, analysis });
      return { success: true };
    } catch (err) {
      logger.error("[HermesWebhook] Falha no redispatch", { preAtendimentoId, error: err.message });
      return { success: false, error: err.message };
    }
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  _buildPayload(atendimento, analysis) {
    let entidades = analysis.entidades_detectadas;
    if (typeof entidades === "string") {
      try { entidades = JSON.parse(entidades); } catch { entidades = {}; }
    }

    return {
      evento: "hermes_analise_concluida",
      timestamp: new Date().toISOString(),
      protocolo: atendimento.protocolo,

      cliente: {
        nome: atendimento.nome,
        telefone: atendimento.telefone,
        email: atendimento.email,
        cidade: atendimento.cidade,
        estado: atendimento.estado,
      },

      juridico: {
        area: atendimento.area,
        subarea: atendimento.subarea,
        descricao_caso: atendimento.descricao_caso,
      },

      hermes: {
        urgencia: analysis.urgencia,
        complexidade: analysis.complexidade,
        resumo: analysis.resumo_executivo,
        entidades: entidades?.partes ?? [],
        documentos_relevantes: entidades?.documentos_relevantes ?? [],
        prazos_potenciais: entidades?.prazos_potenciais ?? [],
        valores_mencionados: entidades?.valores_mencionados ?? [],
        observacoes: analysis.observacoes,
        modelo_ia: analysis.modelo_ia,
        tempo_processamento_ms: analysis.tempo_processamento_ms,
        status: "concluida",
      },
    };
  }

  async _dispatchWithRetry(preAtendimentoId, url, payload) {
    let lastError = null;

    for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt++) {
      if (attempt > 0) {
        await this._sleep(RETRY_DELAYS_MS[attempt - 1]);
      }

      try {
        logger.info(`[HermesWebhook] Tentativa ${attempt + 1}/3`, { preAtendimentoId, url });

        const response = await axios.post(url, payload, {
          timeout: 10000,
          headers: { "Content-Type": "application/json" },
        });

        await this._log({
          preAtendimentoId,
          url,
          statusCode: response.status,
          success: true,
          response: JSON.stringify(response.data).slice(0, 1000),
        });

        await this._updateHermesWebhookStatus(preAtendimentoId, "enviado");

        logger.info(`[HermesWebhook] ✅ Evento enviado na tentativa ${attempt + 1}`, {
          preAtendimentoId,
          statusCode: response.status,
        });
        return;
      } catch (err) {
        lastError = err;
        const statusCode = err.response?.status ?? null;
        const errorMsg = err.response?.data
          ? JSON.stringify(err.response.data).slice(0, 500)
          : err.message;

        logger.warn(`[HermesWebhook] ❌ Tentativa ${attempt + 1}/3 falhou`, {
          preAtendimentoId,
          statusCode,
          error: errorMsg,
        });

        await this._log({
          preAtendimentoId,
          url,
          statusCode,
          success: false,
          response: errorMsg,
        });
      }
    }

    await this._updateHermesWebhookStatus(preAtendimentoId, "falhou");

    logger.error("[HermesWebhook] ❌ Todas as 3 tentativas falharam", {
      preAtendimentoId,
      url,
      error: lastError?.message,
    });
  }

  async _log({ preAtendimentoId, url, statusCode, success, response }) {
    try {
      await db.query(
        `INSERT INTO hermes_webhook_logs
           (pre_atendimento_id, evento, url, status_code, success, response, created_at)
         VALUES ($1, 'hermes_analise_concluida', $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [preAtendimentoId, url, statusCode, success, response]
      );
    } catch (err) {
      logger.error("[HermesWebhook] Falha ao salvar log", { error: err.message });
    }
  }

  async _updateHermesWebhookStatus(preAtendimentoId, status) {
    try {
      await db.query(
        `UPDATE chat_ai_analysis
         SET hermes_webhook_status = $1, hermes_webhook_sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE pre_atendimento_id = $2`,
        [status, preAtendimentoId]
      );
    } catch (err) {
      logger.error("[HermesWebhook] Falha ao atualizar hermes_webhook_status", { error: err.message });
    }
  }

  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new HermesWebhookService();
