/**
 * Sprint 3.11 — Integração com API ASAAS
 * Documentação: https://docs.asaas.com/
 */

const axios = require("axios");
const crypto = require("crypto");
const { logger } = require("../config/logger");

class AsaasService {
  _getConfig() {
    return {
      apiUrl: (process.env.ASAAS_API_URL || "").replace(/\/$/, ""),
      apiKey: process.env.ASAAS_API_KEY || "",
    };
  }

  isConfigured() {
    const { apiUrl, apiKey } = this._getConfig();
    return Boolean(apiUrl && apiKey);
  }

  _client() {
    const { apiUrl, apiKey } = this._getConfig();
    if (!apiUrl || !apiKey) {
      throw new Error("ASAAS não configurado. Defina ASAAS_API_URL e ASAAS_API_KEY.");
    }
    return axios.create({
      baseURL: apiUrl,
      headers: {
        access_token: apiKey,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
  }

  /**
   * Cria cliente no ASAAS.
   */
  async createCustomer({ name, email, mobilePhone, cpfCnpj }) {
    const client = this._client();
    const payload = {
      name,
      email,
      mobilePhone,
      cpfCnpj,
      notificationDisabled: false,
    };

    const { data } = await client.post("/customers", payload);
    logger.info("[Asaas] Cliente criado", { customerId: data.id, email });
    return data;
  }

  /**
   * Busca cliente existente por e-mail.
   */
  async findCustomerByEmail(email) {
    const client = this._client();
    const { data } = await client.get("/customers", {
      params: { email, limit: 1 },
    });
    return data?.data?.[0] || null;
  }

  /**
   * Cria ou reutiliza cliente existente.
   */
  async getOrCreateCustomer({ name, email, mobilePhone, cpfCnpj }) {
    const existing = await this.findCustomerByEmail(email);
    if (existing) {
      logger.info("[Asaas] Cliente existente reutilizado", { customerId: existing.id });
      return existing;
    }
    return this.createCustomer({ name, email, mobilePhone, cpfCnpj });
  }

  /**
   * Gera cobrança (PIX ou Cartão de Crédito).
   * callback.successUrl — URL de retorno após pagamento (cadastrar domínio no ASAAS).
   */
  async createPayment({
    customerId,
    value,
    billingType,
    description,
    externalReference,
    callback,
  }) {
    const client = this._client();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    const dueDateStr = dueDate.toISOString().split("T")[0];

    const payload = {
      customer: customerId,
      billingType,
      value,
      dueDate: dueDateStr,
      description,
      externalReference,
    };

    if (callback?.successUrl) {
      payload.callback = {
        successUrl: callback.successUrl,
        autoRedirect: callback.autoRedirect !== false,
      };
    }

    const { data } = await client.post("/payments", payload);
    logger.info("[Asaas] Cobrança criada", {
      paymentId: data.id,
      billingType,
      value,
      status: data.status,
    });
    return data;
  }

  /**
   * Consulta status de pagamento.
   */
  async getPayment(paymentId) {
    const client = this._client();
    const { data } = await client.get(`/payments/${paymentId}`);
    return data;
  }

  /**
   * Mapeia eventos do webhook ASAAS para status interno.
   */
  handleWebhook(event, payment) {
    const paymentId = payment?.id;
    const status = payment?.status;

    const result = {
      paymentId,
      asaasStatus: status,
      internalStatus: null,
      isPaid: false,
    };

    switch (event) {
      case "PAYMENT_CREATED":
        result.internalStatus = "aguardando_pagamento";
        break;
      case "PAYMENT_RECEIVED":
      case "PAYMENT_CONFIRMED":
        result.internalStatus = "pago";
        result.isPaid = true;
        break;
      case "PAYMENT_OVERDUE":
        result.internalStatus = "expirado";
        break;
      case "PAYMENT_DELETED":
        result.internalStatus = "cancelado";
        break;
      default:
        result.internalStatus = null;
    }

    return result;
  }

  /**
   * Valida token do webhook ASAAS.
   */
  validateWebhookToken(receivedToken) {
    const expected = process.env.ASAAS_WEBHOOK_TOKEN;
    if (!expected || !receivedToken || typeof receivedToken !== "string") {
      logger.warn("[Asaas] ASAAS_WEBHOOK_TOKEN não configurado ou token ausente");
      return false;
    }
    if (receivedToken.length !== expected.length) {
      return false;
    }
    try {
      return crypto.timingSafeEqual(
        Buffer.from(receivedToken),
        Buffer.from(expected)
      );
    } catch {
      return false;
    }
  }
}

module.exports = new AsaasService();
