/**
 * Token de acesso para consulta pública de pedidos (HMAC).
 */
const crypto = require("crypto");
const { getJwtSecret } = require("../config/jwtSecret");

function signPedidoAccess(pedidoId) {
  return crypto
    .createHmac("sha256", getJwtSecret())
    .update(String(pedidoId))
    .digest("hex");
}

function verifyPedidoAccess(pedidoId, token) {
  if (!pedidoId || !token || typeof token !== "string") return false;
  const expected = signPedidoAccess(pedidoId);
  if (token.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

function escapeLikePattern(value) {
  return String(value).replace(/[%_\\]/g, "\\$&");
}

module.exports = {
  signPedidoAccess,
  verifyPedidoAccess,
  escapeLikePattern,
};
