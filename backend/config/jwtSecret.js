/**
 * JWT secret centralizado — falha no startup se ausente em produção.
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("❌ JWT_SECRET é obrigatório em produção.");
      process.exit(1);
    }
    console.warn("⚠️ JWT_SECRET não definido — usando secret de desenvolvimento.");
    return "dev-only-jwt-secret-change-me";
  }
  return secret;
}

module.exports = { getJwtSecret };
