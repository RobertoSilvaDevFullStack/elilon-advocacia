/**
 * HermesWebhookLogController
 * Sprint 3.10 — Eventos Hermes
 *
 * Expõe os logs do evento hermes_analise_concluida para o painel administrativo
 * e permite reenvio manual em caso de falha.
 */

const db = require("../database/index");
const hermesWebhookService = require("../services/HermesWebhookService");

class HermesWebhookLogController {
  /**
   * GET /api/admin/chat/hermes-webhook-logs/:preAtendimentoId
   * Retorna status e histórico de disparos do evento Hermes.
   */
  async getByPreAtendimento(req, res) {
    try {
      const { preAtendimentoId } = req.params;

      const analysisResult = await db.query(
        `SELECT id, pre_atendimento_id, status_analise, urgencia, complexidade,
                hermes_webhook_status, hermes_webhook_sent_at, updated_at
         FROM chat_ai_analysis
         WHERE pre_atendimento_id = $1
         ORDER BY updated_at DESC
         LIMIT 1`,
        [preAtendimentoId]
      );

      const logsResult = await db.query(
        `SELECT id, evento, url, status_code, success, response, created_at
         FROM hermes_webhook_logs
         WHERE pre_atendimento_id = $1
         ORDER BY created_at DESC`,
        [preAtendimentoId]
      );

      return res.json({
        success: true,
        data: {
          analysis: analysisResult.rows[0] ?? null,
          logs: logsResult.rows,
        },
      });
    } catch (err) {
      console.error("❌ HermesWebhookLogController.getByPreAtendimento:", err.message);
      return res.status(500).json({ success: false, error: "Erro ao buscar logs Hermes" });
    }
  }

  /**
   * POST /api/admin/chat/hermes-webhook-logs/:preAtendimentoId/reenviar
   * Reenvia manualmente o evento hermes_analise_concluida.
   */
  async reenviar(req, res) {
    try {
      const { preAtendimentoId } = req.params;

      const result = await hermesWebhookService.redispatch(preAtendimentoId);

      if (result.success) {
        return res.json({ success: true, message: "Evento Hermes reenviado com sucesso" });
      } else {
        return res.status(400).json({ success: false, error: result.error });
      }
    } catch (err) {
      console.error("❌ HermesWebhookLogController.reenviar:", err.message);
      return res.status(500).json({ success: false, error: "Erro ao reenviar evento Hermes" });
    }
  }
}

module.exports = new HermesWebhookLogController();
