/**
 * Formata telefone brasileiro para API ASAAS.
 * ASAAS espera DDD + número (somente dígitos) ou com prefixo 55.
 */

function formatPhoneForAsaas(phone) {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, "");

  if (digits.startsWith("55") && digits.length >= 12) {
    return digits;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits.length >= 12 ? digits : null;
}

function isValidBrazilianMobile(phone) {
  const digits = String(phone).replace(/\D/g, "").replace(/^55/, "");
  // DDD (2 dígitos) + celular começando com 9 (9 dígitos)
  return /^[1-9]{2}9[0-9]{8}$/.test(digits);
}

module.exports = {
  formatPhoneForAsaas,
  isValidBrazilianMobile,
};
