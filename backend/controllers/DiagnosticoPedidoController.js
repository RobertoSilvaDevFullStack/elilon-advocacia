/**
 * DiagnosticoPedidoController
 * Sprint 3.11 — Pedidos premium do Diagnóstico Tributário (ASAAS)
 */

const crypto = require("crypto");
const db = require("../database/index");
const asaasService = require("../services/AsaasService");
const diagnosticoPagamentoWebhook = require("../services/DiagnosticoPagamentoWebhookService");
const {
  isValidRegime,
  getPriceForRegime,
  isValidPaymentMethod,
} = require("../utils/diagnosticoPricing");
const {
  sanitizeNome,
  sanitizeEmail,
  sanitizePhone,
  sanitizeCpfCnpj,
  sanitizeString,
} = require("../utils/inputValidator");
const { formatPhoneForAsaas, isValidBrazilianMobile } = require("../utils/phoneFormatter");
const { signPedidoAccess, verifyPedidoAccess, escapeLikePattern } = require("../utils/pedidoAccessToken");
const { logger } = require("../config/logger");

const VALID_NIVEIS = ["alto", "medio", "baixo"];

function parseCount(row) {
  return parseInt(row?.count ?? row?.["COUNT(*)"] ?? 0, 10);
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function withRetry(fn, label) {
  let lastError;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const retryable =
        err.code === "ECONNRESET" ||
        err.code === "ETIMEDOUT" ||
        err.response?.status >= 500;
      if (!retryable || i === MAX_RETRIES - 1) throw err;
      logger.warn(`[DiagnosticoPedido] Retry ${label} tentativa ${i + 2}`, {
        error: err.message,
      });
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (i + 1)));
    }
  }
  throw lastError;
}

/**
 * POST /api/diagnostico/pedido
 * Cria lead + pedido + cobrança ASAAS.
 */
exports.createPedido = async (req, res) => {
  try {
    const {
      nome,
      empresa,
      email,
      whatsapp,
      cpf_cnpj,
      respostas,
      score,
      nivel_risco,
      regime_tributario,
      payment_method,
      origem = "diagnostico-reforma-tributaria",
      utm_source,
      utm_medium,
      utm_campaign,
    } = req.body;

    const cleanNome = sanitizeNome(nome);
    const cleanEmail = sanitizeEmail(email);
    const cleanWhatsapp = sanitizePhone(whatsapp);
    const cleanCpfCnpj = sanitizeCpfCnpj(cpf_cnpj);
    const cleanEmpresa = sanitizeString(empresa, 255);

    if (!cleanNome || !cleanEmail || !cleanWhatsapp || !cleanEmpresa || !cleanCpfCnpj) {
      return res.status(400).json({
        success: false,
        message: "Preencha todos os campos. CPF/CNPJ deve ter 11 ou 14 dígitos.",
      });
    }

    if (!isValidBrazilianMobile(cleanWhatsapp)) {
      return res.status(400).json({
        success: false,
        message: "WhatsApp inválido. Use DDD + número de celular (ex: 38991376138).",
      });
    }

    const asaasPhone = formatPhoneForAsaas(cleanWhatsapp);

    if (!isValidRegime(regime_tributario)) {
      return res.status(400).json({
        success: false,
        message: "Regime tributário inválido.",
      });
    }

    if (!isValidPaymentMethod(payment_method)) {
      return res.status(400).json({
        success: false,
        message: "Método de pagamento inválido. Use PIX ou CREDIT_CARD.",
      });
    }

    if (!nivel_risco || !VALID_NIVEIS.includes(nivel_risco)) {
      return res.status(400).json({
        success: false,
        message: "Nível de risco inválido.",
      });
    }

    const valor = getPriceForRegime(regime_tributario);
    if (valor == null) {
      return res.status(400).json({
        success: false,
        message: "Não foi possível calcular o valor da análise.",
      });
    }

    if (!asaasService.isConfigured()) {
      logger.error("[DiagnosticoPedido] ASAAS não configurado", {
        hasUrl: Boolean(process.env.ASAAS_API_URL),
        hasKey: Boolean(process.env.ASAAS_API_KEY),
      });
      return res.status(503).json({
        success: false,
        message:
          process.env.NODE_ENV === "production"
            ? "Pagamento temporariamente indisponível. Tente novamente em instantes."
            : "ASAAS não configurado. Verifique ASAAS_API_URL e ASAAS_API_KEY no backend/.env e reinicie o servidor.",
      });
    }

    const leadResult = await db.query(
      `INSERT INTO diagnostico_tributario_leads
         (nome, empresa, email, whatsapp, respostas, score, nivel_risco,
          regime_tributario, valor, origem, utm_source, utm_medium, utm_campaign, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'novo')
       RETURNING *`,
      [
        cleanNome,
        cleanEmpresa,
        cleanEmail,
        cleanWhatsapp,
        JSON.stringify(respostas || {}),
        score || 0,
        nivel_risco,
        regime_tributario,
        valor,
        origem,
        utm_source || null,
        utm_medium || null,
        utm_campaign || null,
      ]
    );

    const lead = leadResult.rows[0];
    const pedidoId = crypto.randomUUID();

    const billingType = payment_method === "PIX" ? "PIX" : "CREDIT_CARD";

    const customer = await withRetry(
      () =>
        asaasService.getOrCreateCustomer({
          name: cleanNome,
          email: cleanEmail,
          mobilePhone: asaasPhone,
          cpfCnpj: cleanCpfCnpj,
        }),
      "createCustomer"
    );

    const payment = await withRetry(
      () =>
        asaasService.createPayment({
          customerId: customer.id,
          value: valor,
          billingType,
          description: `Diagnóstico Tributário Premium — ${cleanEmpresa}`,
          externalReference: pedidoId,
        }),
      "createPayment"
    );

    const paymentLink = payment.invoiceUrl || payment.bankSlipUrl || null;

    const pedidoResult = await db.query(
      `INSERT INTO diagnostico_tributario_pedidos
         (id, lead_id, nome, empresa, email, whatsapp, regime_tributario, valor,
          status_pagamento, asaas_customer_id, asaas_payment_id, payment_method, payment_link)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'aguardando_pagamento',$9,$10,$11,$12)
       RETURNING *`,
      [
        pedidoId,
        lead.id,
        cleanNome,
        cleanEmpresa,
        cleanEmail,
        cleanWhatsapp,
        regime_tributario,
        valor,
        customer.id,
        payment.id,
        payment_method,
        paymentLink,
      ]
    );

    const pedido = pedidoResult.rows[0];

    logger.info("[DiagnosticoPedido] Pedido criado", {
      pedidoId: pedido.id,
      leadId: lead.id,
      valor,
      regime: regime_tributario,
    });

    return res.status(201).json({
      success: true,
      message: "Pedido criado com sucesso",
      pedidoId,
      accessToken: signPedidoAccess(pedidoId),
      valor,
      paymentLink,
    });
  } catch (err) {
    const asaasError = err.response?.data?.errors?.[0]?.description;
    logger.error("[DiagnosticoPedido] Erro ao criar pedido", {
      error: err.message,
      asaasError,
      status: err.response?.status,
    });

    if (asaasError?.toLowerCase().includes("cpf") || asaasError?.toLowerCase().includes("cnpj")) {
      return res.status(400).json({
        success: false,
        message: "CPF ou CNPJ inválido. Verifique o documento informado.",
      });
    }

    if (asaasError?.toLowerCase().includes("celular")) {
      return res.status(400).json({
        success: false,
        message: "WhatsApp inválido para pagamento. Use um número de celular real com DDD.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Não foi possível processar seu pedido. Tente novamente em instantes.",
    });
  }
};

/**
 * GET /api/diagnostico/pedido/:id
 * Consulta pública de pedido (UUID).
 */
exports.getPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const accessToken = req.query.token;

    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      return res.status(400).json({ success: false, message: "ID de pedido inválido" });
    }

    if (!verifyPedidoAccess(id, accessToken)) {
      return res.status(403).json({ success: false, message: "Token de acesso inválido" });
    }

    const result = await db.query(
      `SELECT id, nome, empresa, email, whatsapp, regime_tributario, valor,
              status_pagamento, payment_method, payment_link, paid_at, created_at,
              asaas_payment_id
       FROM diagnostico_tributario_pedidos WHERE id = $1`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Pedido não encontrado" });
    }

    const pedido = result.rows[0];
    const { asaas_payment_id: asaasPaymentId, ...publicPedido } = pedido;

    if (
      asaasPaymentId &&
      publicPedido.status_pagamento !== "pago" &&
      asaasService.isConfigured()
    ) {
      try {
        const asaasPayment = await asaasService.getPayment(asaasPaymentId);
        if (["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(asaasPayment.status)) {
          await exports._markAsPaid(publicPedido.id, asaasPayment.id);
          publicPedido.status_pagamento = "pago";
          publicPedido.paid_at = new Date().toISOString();
        }
      } catch (syncErr) {
        logger.warn("[DiagnosticoPedido] Falha ao sincronizar status ASAAS", {
          pedidoId: publicPedido.id,
          error: syncErr.message,
        });
      }
    }

    return res.json({ success: true, data: publicPedido });
  } catch (err) {
    logger.error("[DiagnosticoPedido] Erro ao buscar pedido", { error: err.message });
    return res.status(500).json({ success: false, message: "Erro ao buscar pedido" });
  }
};

/**
 * Marca pedido como pago e dispara webhook interno.
 */
exports._markAsPaid = async (pedidoId, asaasPaymentId) => {
  const result = await db.query(
    `UPDATE diagnostico_tributario_pedidos
     SET status_pagamento = 'pago', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND status_pagamento != 'pago'
     RETURNING *`,
    [pedidoId]
  );

  if (!result.rows.length) return null;

  const pedido = result.rows[0];

  let lead = null;
  if (pedido.lead_id) {
    const leadResult = await db.query(
      "SELECT * FROM diagnostico_tributario_leads WHERE id = $1",
      [pedido.lead_id]
    );
    lead = leadResult.rows[0] || null;

    if (lead) {
      await db.query(
        "UPDATE diagnostico_tributario_leads SET status = 'convertido', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [lead.id]
      );
    }
  }

  diagnosticoPagamentoWebhook
    .dispatch(pedido, lead, { asaas_payment_id: asaasPaymentId, asaas_status: "CONFIRMED" })
    .catch((err) =>
      logger.error("[DiagnosticoPedido] Webhook interno falhou", { error: err.message })
    );

  logger.info("[DiagnosticoPedido] Pagamento confirmado", { pedidoId });
  return pedido;
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/diagnostico/pedidos
 */
exports.listPedidos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status_pagamento,
      regime_tributario,
      dataInicio,
      dataFim,
      search,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const values = [];
    let paramIdx = 1;

    if (status_pagamento) {
      conditions.push(`status_pagamento = $${paramIdx++}`);
      values.push(status_pagamento);
    }
    if (regime_tributario) {
      conditions.push(`regime_tributario = $${paramIdx++}`);
      values.push(regime_tributario);
    }
    if (dataInicio) {
      conditions.push(`created_at >= $${paramIdx++}`);
      values.push(dataInicio);
    }
    if (dataFim) {
      conditions.push(`created_at < ($${paramIdx++}::date + interval '1 day')`);
      values.push(dataFim);
    }
    if (search) {
      const escaped = escapeLikePattern(search);
      conditions.push(
        `(LOWER(nome) LIKE LOWER($${paramIdx}) ESCAPE '\\' OR LOWER(email) LIKE LOWER($${paramIdx}) ESCAPE '\\' OR LOWER(empresa) LIKE LOWER($${paramIdx}) ESCAPE '\\')`
      );
      values.push(`%${escaped}%`);
      paramIdx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await db.query(
      `SELECT COUNT(*) AS count FROM diagnostico_tributario_pedidos ${where}`,
      values
    );
    const total = parseCount(countResult.rows[0]);

    const dataResult = await db.query(
      `SELECT * FROM diagnostico_tributario_pedidos ${where}
       ORDER BY created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...values, parseInt(limit), offset]
    );

    return res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    logger.error("[DiagnosticoPedido] Erro ao listar pedidos", { error: err.message });
    return res.status(500).json({ success: false, message: "Erro ao listar pedidos" });
  }
};

/**
 * GET /api/admin/diagnostico/pedidos/stats
 */
exports.getPedidosStats = async (req, res) => {
  try {
    const [total, receita, pendentes, confirmados] = await Promise.all([
      db.query("SELECT COUNT(*) AS count FROM diagnostico_tributario_pedidos"),
      db.query(
        "SELECT COALESCE(SUM(valor), 0) AS total FROM diagnostico_tributario_pedidos WHERE status_pagamento = 'pago'"
      ),
      db.query(
        "SELECT COUNT(*) AS count FROM diagnostico_tributario_pedidos WHERE status_pagamento IN ('pendente','aguardando_pagamento')"
      ),
      db.query(
        "SELECT COUNT(*) AS count FROM diagnostico_tributario_pedidos WHERE status_pagamento = 'pago'"
      ),
    ]);

    const totalCount = parseCount(total.rows[0]);
    const confirmadosCount = parseCount(confirmados.rows[0]);

    return res.json({
      success: true,
      data: {
        total_pedidos: totalCount,
        receita_total: parseFloat(receita.rows[0].total),
        pagamentos_pendentes: parseCount(pendentes.rows[0]),
        pagamentos_confirmados: confirmadosCount,
        taxa_conversao:
          totalCount > 0 ? ((confirmadosCount / totalCount) * 100).toFixed(1) : "0.0",
      },
    });
  } catch (err) {
    logger.error("[DiagnosticoPedido] Erro ao buscar stats", { error: err.message });
    return res.status(500).json({ success: false, message: "Erro ao buscar estatísticas" });
  }
};

/**
 * GET /api/admin/diagnostico/pedidos/export
 */
exports.exportPedidos = async (req, res) => {
  try {
    const { status_pagamento, regime_tributario, dataInicio, dataFim, search } = req.query;
    const conditions = [];
    const values = [];
    let paramIdx = 1;

    if (status_pagamento) {
      conditions.push(`status_pagamento = $${paramIdx++}`);
      values.push(status_pagamento);
    }
    if (regime_tributario) {
      conditions.push(`regime_tributario = $${paramIdx++}`);
      values.push(regime_tributario);
    }
    if (dataInicio) {
      conditions.push(`created_at >= $${paramIdx++}`);
      values.push(dataInicio);
    }
    if (dataFim) {
      conditions.push(`created_at < ($${paramIdx++}::date + interval '1 day')`);
      values.push(dataFim);
    }
    if (search) {
      conditions.push(
        `(LOWER(nome) LIKE LOWER($${paramIdx}) OR LOWER(email) LIKE LOWER($${paramIdx}) OR LOWER(empresa) LIKE LOWER($${paramIdx}))`
      );
      values.push(`%${search}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await db.query(
      `SELECT nome, empresa, email, whatsapp, regime_tributario, valor,
              status_pagamento, payment_method, paid_at, created_at
       FROM diagnostico_tributario_pedidos ${where}
       ORDER BY created_at DESC`,
      values
    );

    const header =
      "Cliente,Empresa,Email,WhatsApp,Regime,Valor,Status,Metodo,Data Pagamento,Data Pedido\n";
    const rows = result.rows
      .map((r) =>
        [
          `"${(r.nome || "").replace(/"/g, '""')}"`,
          `"${(r.empresa || "").replace(/"/g, '""')}"`,
          r.email,
          r.whatsapp,
          r.regime_tributario,
          r.valor,
          r.status_pagamento,
          r.payment_method,
          r.paid_at || "",
          r.created_at,
        ].join(",")
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="diagnostico-premium-${Date.now()}.csv"`
    );
    return res.send("\uFEFF" + header + rows);
  } catch (err) {
    logger.error("[DiagnosticoPedido] Erro ao exportar", { error: err.message });
    return res.status(500).json({ success: false, message: "Erro ao exportar CSV" });
  }
};
