/**
 * ChatWebhookService
 * Sprint 3.9 — Webhook Universal do Chat Jurídico
 *
 * Responsabilidades:
 *  - Buscar URL configurada em settings (chat_webhook_url)
 *  - Montar payload padronizado {evento, timestamp, protocolo, cliente, juridico, documentos, hermes}
 *  - Disparar POST com 3 tentativas e backoff exponencial (1s / 3s / 5s)
 *  - Registrar cada tentativa em chat_webhook_logs
 *  - Nunca lançar exceção para o chamador — falha é silenciosa para o usuário
 */

const axios = require("axios");
const db = require("../database/index");
const { logger } = require("../config/logger");

const RETRY_DELAYS_MS = [1000, 3000, 5000];

class ChatWebhookService {
  /**
   * Ponto de entrada principal.
   * @param {number} preAtendimentoId
   * @param {Object} opts
   * @param {Object}   opts.atendimento   - Registro completo de chat_pre_atendimentos
   * @param {Array}    [opts.documentos]  - Lista de documentos vinculados (opcional)
   * @param {Object}   [opts.hermes]      - Resultado da análise Hermes (opcional)
   */
  async dispatch(preAtendimentoId, { atendimento, documentos = [], hermes = null }) {
    try {
      const urlRow = await db.query(
        "SELECT value FROM settings WHERE key = 'chat_webhook_url'"
      );

      const webhookUrl = urlRow.rows[0]?.value?.trim();

      if (!webhookUrl) {
        logger.info("[ChatWebhook] chat_webhook_url não configurada — ignorando disparo", {
          preAtendimentoId,
        });
        return;
      }

      const payload = this._buildPayload(atendimento, documentos, hermes);
      await this._dispatchWithRetry(preAtendimentoId, webhookUrl, payload);
    } catch (err) {
      // Nunca deixar o chamador saber
      logger.error("[ChatWebhook] Erro inesperado no dispatch", {
        preAtendimentoId,
        error: err.message,
      });
    }
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  /**
   * Monta o payload padronizado conforme especificação Sprint 3.9.
   */
  _buildPayload(atendimento, documentos, hermes) {
    return {
      evento: "chat_finalizado",
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

      documentos: documentos.map((d) => ({
        id: d.id,
        nome: d.original_name || d.filename,
        tipo: d.mime_type || d.type,
        tamanho: d.file_size || d.size,
      })),

      hermes: hermes
        ? {
            urgencia: hermes.urgencia ?? hermes.urgency ?? null,
            complexidade: hermes.complexidade ?? hermes.complexity ?? null,
            resumo: hermes.resumo ?? hermes.summary ?? null,
            status: hermes.status ?? "pendente",
          }
        : {
            urgencia: null,
            complexidade: null,
            resumo: null,
            status: "pendente",
          },
    };
  }

  /**
   * Tenta enviar o webhook até 3 vezes com backoff exponencial.
   * Registra cada tentativa em chat_webhook_logs.
   */
  async _dispatchWithRetry(preAtendimentoId, url, payload) {
    let lastError = null;

    for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt++) {
      if (attempt > 0) {
        await this._sleep(RETRY_DELAYS_MS[attempt - 1]);
      }

      try {
        logger.info(`[ChatWebhook] Tentativa ${attempt + 1}/3`, {
          preAtendimentoId,
          url,
        });

        const response = await axios.post(url, payload, {
          timeout: 10000,
          headers: { "Content-Type": "application/json" },
        });

        // Sucesso
        await this._log({
          preAtendimentoId,
          evento: "chat_finalizado",
          url,
          statusCode: response.status,
          success: true,
          response: JSON.stringify(response.data).slice(0, 1000),
        });

        // Atualizar status na tabela principal
        await this._updateWebhookStatus(preAtendimentoId, "enviado");

        logger.info(`[ChatWebhook] ✅ Webhook enviado na tentativa ${attempt + 1}`, {
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

        logger.warn(`[ChatWebhook] ❌ Tentativa ${attempt + 1}/3 falhou`, {
          preAtendimentoId,
          statusCode,
          error: errorMsg,
        });

        await this._log({
          preAtendimentoId,
          evento: "chat_finalizado",
          url,
          statusCode,
          success: false,
          response: errorMsg,
        });
      }
    }

    // Todas as tentativas falharam
    await this._updateWebhookStatus(preAtendimentoId, "falhou");

    logger.error("[ChatWebhook] ❌ Todas as 3 tentativas falharam", {
      preAtendimentoId,
      url,
      error: lastError?.message,
    });
  }

  /**
   * Insere um registro de log em chat_webhook_logs.
   */
  async _log({ preAtendimentoId, evento, url, statusCode, success, response }) {
    try {
      await db.query(
        `INSERT INTO chat_webhook_logs
           (pre_atendimento_id, evento, url, status_code, success, response, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [preAtendimentoId, evento, url, statusCode, success, response]
      );
    } catch (err) {
      logger.error("[ChatWebhook] Falha ao salvar log", { error: err.message });
    }
  }

  /**
   * Atualiza webhook_status em chat_pre_atendimentos.
   */
  async _updateWebhookStatus(preAtendimentoId, status) {
    try {
      await db.query(
        `UPDATE chat_pre_atendimentos
         SET webhook_status = $1, webhook_sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [status, preAtendimentoId]
      );
    } catch (err) {
      logger.error("[ChatWebhook] Falha ao atualizar webhook_status", {
        error: err.message,
      });
    }
  }

  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new ChatWebhookService();
