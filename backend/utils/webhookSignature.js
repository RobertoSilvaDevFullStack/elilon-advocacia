/**
 * Assinatura HMAC para webhooks internos.
 */
const crypto = require("crypto");
const { getJwtSecret } = require("../config/jwtSecret");

function signWebhookPayload(payload) {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  const secret = process.env.DIAGNOSTICO_PAGO_WEBHOOK_SECRET || getJwtSecret();
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

module.exports = { signWebhookPayload };
