const axios = require("axios");

const EXACT_SALES_API =
  process.env.EXACT_SALES_API_URL || "https://api.exactsales.com.br/v2";
const EXACT_SALES_TOKEN = process.env.EXACT_SALES_TOKEN;
const ENABLED = process.env.EXACT_SALES_ENABLED === "true";

/**
 * Envia lead para Exact Sales
 * @param {Object} lead - Dados do lead
 * @returns {Promise<Object>} Resposta da API
 */
async function sendLeadToExactSales(lead) {
  if (!ENABLED) {
    console.log("⚠️ Exact Sales integration disabled");
    return { success: false, message: "Integration disabled" };
  }

  if (!EXACT_SALES_TOKEN) {
    console.error("❌ EXACT_SALES_TOKEN not configured");
    return { success: false, message: "Token not configured" };
  }

  try {
    // Formatar dados conforme API Exact Sales
    const payload = {
      nome: lead.name,
      email: lead.email,
      telefone: lead.phone || "",
      cidade: lead.city || "",
      interesse: lead.interest || "Site - Fale Conosco",
      mensagem: lead.message || "",
      origem: "Site Institucional",
    };

    console.log("📤 Enviando lead para Exact Sales (dados ocultos)");

    const response = await axios.post(`${EXACT_SALES_API}/leads`, payload, {
      headers: {
        "Content-Type": "application/json",
        token_exact: EXACT_SALES_TOKEN,
      },
      timeout: 10000, // 10 segundos
    });

    console.log("✅ Lead enviado para Exact Sales:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Erro ao enviar lead para Exact Sales:", error.message);

    if (error.response) {
      console.error(
        "Response error:",
        error.response.status,
        error.response.data,
      );
      return {
        success: false,
        message: error.response.data?.message || "API Error",
        status: error.response.status,
      };
    }

    return { success: false, message: error.message };
  }
}

module.exports = { sendLeadToExactSales };
