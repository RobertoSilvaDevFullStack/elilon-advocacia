/**
 * Sprint 3.11 — Webhook interno para automação N8N (diagnostico_pago)
 * Preparado para futura integração — não implementa automação ainda.
 */

const axios = require("axios");
const db = require("../database/index");
const { logger } = require("../config/logger");
const { signWebhookPayload } = require("../utils/webhookSignature");

const RETRY_DELAYS_MS = [1000, 3000, 5000];

class DiagnosticoPagamentoWebhookService {
  async dispatch(pedido, lead, pagamento) {
    try {
      const urlRow = await db.query(
        "SELECT value FROM settings WHERE key = 'diagnostico_pago_webhook_url'"
      );
      const webhookUrl = urlRow.rows[0]?.value?.trim();
      if (!webhookUrl) {
        logger.info("[DiagnosticoPagoWebhook] diagnostico_pago_webhook_url não configurada — ignorando");
        return;
      }

      const payload = {
        evento: "diagnostico_pago",
        timestamp: new Date().toISOString(),
        pedido: {
          id: pedido.id,
          lead_id: pedido.lead_id,
          nome: pedido.nome,
          empresa: pedido.empresa,
          email: pedido.email,
          whatsapp: pedido.whatsapp,
          regime_tributario: pedido.regime_tributario,
          valor: parseFloat(pedido.valor),
          status_pagamento: pedido.status_pagamento,
          payment_method: pedido.payment_method,
          paid_at: pedido.paid_at,
          created_at: pedido.created_at,
        },
        lead: lead
          ? {
              id: lead.id,
              nome: lead.nome,
              empresa: lead.empresa,
              email: lead.email,
              whatsapp: lead.whatsapp,
              score: lead.score,
              nivel_risco: lead.nivel_risco,
              respostas: lead.respostas,
              origem: lead.origem,
            }
          : null,
        pagamento: {
          asaas_payment_id: pagamento?.asaas_payment_id || pedido.asaas_payment_id,
          asaas_customer_id: pagamento?.asaas_customer_id || pedido.asaas_customer_id,
          asaas_status: pagamento?.asaas_status || null,
          payment_link: pedido.payment_link,
        },
      };

      await this._dispatchWithRetry(webhookUrl, payload, pedido.id);
    } catch (err) {
      logger.error("[DiagnosticoPagoWebhook] Erro inesperado", {
        pedidoId: pedido?.id,
        error: err.message,
      });
    }
  }

  async _dispatchWithRetry(url, payload, pedidoId) {
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      try {
        const signature = signWebhookPayload(payload);
        const response = await axios.post(url, payload, {
          timeout: 15000,
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
          },
        });
        logger.info("[DiagnosticoPagoWebhook] Enviado com sucesso", {
          pedidoId,
          statusCode: response.status,
          attempt: attempt + 1,
        });
        return;
      } catch (err) {
        const isLast = attempt === RETRY_DELAYS_MS.length;
        logger.warn("[DiagnosticoPagoWebhook] Tentativa falhou", {
          pedidoId,
          attempt: attempt + 1,
          error: err.message,
        });
        if (isLast) {
          logger.error("[DiagnosticoPagoWebhook] Todas as tentativas falharam", { pedidoId });
          return;
        }
        await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
      }
    }
  }
}

module.exports = new DiagnosticoPagamentoWebhookService();
