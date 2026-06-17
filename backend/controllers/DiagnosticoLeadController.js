/**
 * DiagnosticoLeadController
 * Sprint 3.6: Diagnóstico Tributário — Persistência e Dashboard de Leads
 *
 * Responsabilidades:
 * - Receber e persistir o lead + respostas do quiz
 * - Listar leads com filtros (admin)
 * - Estatísticas do dashboard (admin)
 * - Estrutura pronta para Hermes e N8N
 */

const db = require("../database/index");
const axios = require("axios");

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

/**
 * POST /api/diagnostico
 * Recebe o lead após o preenchimento do formulário de captura.
 * Persiste: nome, empresa, email, whatsapp, respostas, score, nivel_risco, origem e UTMs.
 */
exports.create = async (req, res) => {
  try {
    const {
      nome,
      empresa,
      email,
      whatsapp,
      respostas,
      score,
      nivel_risco,
      origem = "site",
      utm_source,
      utm_medium,
      utm_campaign,
    } = req.body;

    // Validação mínima
    if (!nome || !nivel_risco) {
      return res.status(400).json({
        success: false,
        message: "Campos obrigatórios: nome e nivel_risco",
      });
    }

    const validNiveis = ["alto", "medio", "baixo"];
    if (!validNiveis.includes(nivel_risco)) {
      return res.status(400).json({
        success: false,
        message: `nivel_risco deve ser: ${validNiveis.join(", ")}`,
      });
    }

    const result = await db.query(
      `INSERT INTO diagnostico_tributario_leads
         (nome, empresa, email, whatsapp, respostas, score, nivel_risco,
          origem, utm_source, utm_medium, utm_campaign, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'novo')
       RETURNING *`,
      [
        nome,
        empresa || null,
        email || null,
        whatsapp || null,
        JSON.stringify(respostas || {}),
        score || 0,
        nivel_risco,
        origem,
        utm_source || null,
        utm_medium || null,
        utm_campaign || null,
      ]
    );

    const lead = result.rows[0];
    console.log(`✅ Diagnóstico Tributário lead salvo: id=${lead.id} risco=${lead.nivel_risco}`);

    // Disparar webhook configurado (N8N / Hermes) — async, não bloqueia resposta
    _dispatchWebhook(lead).catch((err) =>
      console.error("❌ Webhook diagnóstico falhou:", err.message)
    );

    return res.status(201).json({
      success: true,
      message: "Lead registrado com sucesso",
      id: lead.id,
    });
  } catch (err) {
    console.error("❌ DiagnosticoLeadController.create:", err);
    return res.status(500).json({
      success: false,
      message: "Erro ao registrar diagnóstico",
    });
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/diagnostico
 * Lista leads com filtros e paginação.
 * Query params: page, limit, nivel_risco, status, responsavel, empresa,
 *               dataInicio, dataFim, search
 */
exports.list = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      nivel_risco,
      status,
      responsavel,
      empresa,
      dataInicio,
      dataFim,
      search,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const values = [];
    let paramIdx = 1;

    if (nivel_risco) {
      conditions.push(`nivel_risco = $${paramIdx++}`);
      values.push(nivel_risco);
    }
    if (status) {
      conditions.push(`status = $${paramIdx++}`);
      values.push(status);
    }
    if (responsavel) {
      conditions.push(`responsavel = $${paramIdx++}`);
      values.push(responsavel);
    }
    if (empresa) {
      conditions.push(`empresa ILIKE $${paramIdx++}`);
      values.push(`%${empresa}%`);
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
        `(nome ILIKE $${paramIdx} OR email ILIKE $${paramIdx} OR empresa ILIKE $${paramIdx} OR whatsapp ILIKE $${paramIdx})`
      );
      values.push(`%${search}%`);
      paramIdx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // Total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM diagnostico_tributario_leads ${where}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Data
    const dataResult = await db.query(
      `SELECT * FROM diagnostico_tributario_leads ${where}
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
    console.error("❌ DiagnosticoLeadController.list:", err);
    return res.status(500).json({ success: false, message: "Erro ao listar diagnósticos" });
  }
};

/**
 * GET /api/admin/diagnostico/stats
 * Estatísticas para o dashboard.
 */
exports.getStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [total, hoje, alto, medio, baixo, conversoes, porDia] =
      await Promise.all([
        db.query("SELECT COUNT(*) FROM diagnostico_tributario_leads"),
        db.query(
          "SELECT COUNT(*) FROM diagnostico_tributario_leads WHERE created_at::date = $1",
          [today]
        ),
        db.query(
          "SELECT COUNT(*) FROM diagnostico_tributario_leads WHERE nivel_risco = 'alto'"
        ),
        db.query(
          "SELECT COUNT(*) FROM diagnostico_tributario_leads WHERE nivel_risco = 'medio'"
        ),
        db.query(
          "SELECT COUNT(*) FROM diagnostico_tributario_leads WHERE nivel_risco = 'baixo'"
        ),
        db.query(
          "SELECT COUNT(*) FROM diagnostico_tributario_leads WHERE status = 'convertido'"
        ),
        db.query(`
          SELECT created_at::date AS dia, COUNT(*) AS total
          FROM diagnostico_tributario_leads
          WHERE created_at >= NOW() - INTERVAL '30 days'
          GROUP BY dia
          ORDER BY dia
        `),
      ]);

    const totalCount = parseInt(total.rows[0].count);
    const conversoesCount = parseInt(conversoes.rows[0].count);

    return res.json({
      success: true,
      data: {
        total: totalCount,
        hoje: parseInt(hoje.rows[0].count),
        alto_risco: parseInt(alto.rows[0].count),
        medio_risco: parseInt(medio.rows[0].count),
        baixo_risco: parseInt(baixo.rows[0].count),
        conversoes: conversoesCount,
        taxa_conversao:
          totalCount > 0
            ? ((conversoesCount / totalCount) * 100).toFixed(1)
            : "0.0",
        por_dia: porDia.rows,
      },
    });
  } catch (err) {
    console.error("❌ DiagnosticoLeadController.getStats:", err);
    return res.status(500).json({ success: false, message: "Erro ao buscar estatísticas" });
  }
};

/**
 * GET /api/admin/diagnostico/:id
 * Detalhe completo de um lead (respostas + resultado + contato).
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "SELECT * FROM diagnostico_tributario_leads WHERE id = $1",
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Lead não encontrado" });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("❌ DiagnosticoLeadController.getById:", err);
    return res.status(500).json({ success: false, message: "Erro ao buscar lead" });
  }
};

/**
 * PUT /api/admin/diagnostico/:id/status
 * Atualiza status e responsável.
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responsavel, notas } = req.body;

    const valid = ["novo", "em_contato", "convertido", "descartado"];
    if (status && !valid.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status válidos: ${valid.join(", ")}`,
      });
    }

    const sets = [];
    const values = [];
    let idx = 1;

    if (status) { sets.push(`status = $${idx++}`); values.push(status); }
    if (responsavel !== undefined) { sets.push(`responsavel = $${idx++}`); values.push(responsavel); }
    if (notas !== undefined) { sets.push(`notas = $${idx++}`); values.push(notas); }
    sets.push(`updated_at = NOW()`);

    if (sets.length === 1) {
      return res.status(400).json({ success: false, message: "Nada a atualizar" });
    }

    values.push(id);
    const result = await db.query(
      `UPDATE diagnostico_tributario_leads SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Lead não encontrado" });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("❌ DiagnosticoLeadController.updateStatus:", err);
    return res.status(500).json({ success: false, message: "Erro ao atualizar" });
  }
};

// ─── INTERNAL ────────────────────────────────────────────────────────────────

/**
 * Dispara webhook configurado (N8N / Hermes) para o lead criado.
 * Marca webhook_enviado na tabela após sucesso.
 */
async function _dispatchWebhook(lead) {
  try {
    const settingsResult = await db.query(
      "SELECT value FROM settings WHERE key = 'diagnostico_webhook_url'"
    );

    if (!settingsResult.rows.length || !settingsResult.rows[0].value) return;

    const webhookUrl = settingsResult.rows[0].value;

    await axios.post(webhookUrl, {
      evento: "diagnostico_tributario_lead",
      timestamp: new Date().toISOString(),
      lead: {
        id: lead.id,
        nome: lead.nome,
        empresa: lead.empresa,
        email: lead.email,
        whatsapp: lead.whatsapp,
        nivel_risco: lead.nivel_risco,
        score: lead.score,
        respostas: lead.respostas,
        origem: lead.origem,
        utm_source: lead.utm_source,
        utm_medium: lead.utm_medium,
        utm_campaign: lead.utm_campaign,
        created_at: lead.created_at,
      },
    });

    await db.query(
      "UPDATE diagnostico_tributario_leads SET webhook_enviado = TRUE, webhook_enviado_at = NOW() WHERE id = $1",
      [lead.id]
    );

    console.log(`✅ Webhook diagnóstico enviado: lead ${lead.id}`);
  } catch (err) {
    console.error("❌ _dispatchWebhook:", err.message);
  }
}
