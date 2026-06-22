/**
 * AsaasWebhookController
 * Sprint 3.11 — Webhook de pagamentos ASAAS
 */

const db = require("../database/index");
const asaasService = require("../services/AsaasService");
const diagnosticoPedidoController = require("./DiagnosticoPedidoController");
const { logger } = require("../config/logger");

const PAID_STATUSES = ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"];

/**
 * POST /api/asaas/webhook
 */
exports.handleWebhook = async (req, res) => {
  try {
    const token =
      req.headers["asaas-access-token"] || req.headers["x-asaas-access-token"];

    if (!asaasService.validateWebhookToken(token)) {
      logger.warn("[AsaasWebhook] Token inválido ou ausente", { ip: req.ip });
      return res.status(401).json({ success: false, message: "Não autorizado" });
    }

    const { event, payment } = req.body;

    if (!event || !payment?.id) {
      return res.status(400).json({ success: false, message: "Payload inválido" });
    }

    logger.info("[AsaasWebhook] Evento recebido", {
      event,
      paymentId: payment.id,
      status: payment.status,
    });

    const mapped = asaasService.handleWebhook(event, payment);

    const pedidoResult = await db.query(
      "SELECT * FROM diagnostico_tributario_pedidos WHERE asaas_payment_id = $1",
      [payment.id]
    );

    if (!pedidoResult.rows.length) {
      logger.info("[AsaasWebhook] Pedido não encontrado para payment", { paymentId: payment.id });
      return res.status(200).json({ success: true, message: "Evento recebido" });
    }

    const pedido = pedidoResult.rows[0];

    if (mapped.isPaid) {
      let asaasPayment;
      try {
        asaasPayment = await asaasService.getPayment(payment.id);
      } catch (apiErr) {
        logger.error("[AsaasWebhook] Falha ao revalidar pagamento na API ASAAS", {
          paymentId: payment.id,
          error: apiErr.message,
        });
        return res.status(200).json({ success: true, message: "Aguardando confirmação" });
      }

      if (!PAID_STATUSES.includes(asaasPayment.status)) {
        logger.warn("[AsaasWebhook] Evento de pagamento sem confirmação na API", {
          paymentId: payment.id,
          asaasStatus: asaasPayment.status,
        });
        return res.status(200).json({ success: true, message: "Status não confirmado" });
      }

      await diagnosticoPedidoController._markAsPaid(pedido.id, payment.id);
    } else if (mapped.internalStatus) {
      await db.query(
        `UPDATE diagnostico_tributario_pedidos
         SET status_pagamento = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND status_pagamento != 'pago'`,
        [mapped.internalStatus, pedido.id]
      );
    }

    return res.status(200).json({ success: true, message: "Webhook processado" });
  } catch (err) {
    logger.error("[AsaasWebhook] Erro ao processar", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Erro interno" });
  }
};
