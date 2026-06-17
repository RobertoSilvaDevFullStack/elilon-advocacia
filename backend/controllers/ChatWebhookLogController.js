/**
 * ChatWebhookLogController
 * Sprint 3.9 — Webhook Universal do Chat Jurídico
 *
 * Expõe os logs de webhook para o painel administrativo.
 */

const db = require("../database/index");

class ChatWebhookLogController {
  /**
   * GET /api/admin/chat/webhook-logs/:preAtendimentoId
   * Retorna todos os logs de webhook para um pré-atendimento.
   */
  async getByPreAtendimento(req, res) {
    try {
      const { preAtendimentoId } = req.params;

      // Status atual do pré-atendimento (webhook_status, webhook_sent_at, webhook_attempts)
      const statusResult = await db.query(
        `SELECT id, protocolo, webhook_status, webhook_sent_at, webhook_attempts
         FROM chat_pre_atendimentos
         WHERE id = $1`,
        [preAtendimentoId]
      );

      if (!statusResult.rows.length) {
        return res.status(404).json({
          success: false,
          error: "Pré-atendimento não encontrado",
        });
      }

      // Histórico de tentativas
      const logsResult = await db.query(
        `SELECT id, evento, url, status_code, success, response, created_at
         FROM chat_webhook_logs
         WHERE pre_atendimento_id = $1
         ORDER BY created_at DESC`,
        [preAtendimentoId]
      );

      return res.json({
        success: true,
        data: {
          pre_atendimento: statusResult.rows[0],
          logs: logsResult.rows,
        },
      });
    } catch (err) {
      console.error("❌ ChatWebhookLogController.getByPreAtendimento:", err.message);
      return res.status(500).json({
        success: false,
        error: "Erro ao buscar logs de webhook",
      });
    }
  }
}

module.exports = new ChatWebhookLogController();
