/**
 * URL pública do frontend (CORS, redirects ASAAS, etc.)
 */
function getFrontendUrl() {
  const raw = process.env.FRONTEND_URL || "http://localhost:5173";
  return raw.replace(/\/$/, "");
}

function buildDiagnosticoSuccessUrl(email) {
  const base = getFrontendUrl();
  return `${base}/diagnostico/sucesso?email=${encodeURIComponent(email)}`;
}

module.exports = { getFrontendUrl, buildDiagnosticoSuccessUrl };
