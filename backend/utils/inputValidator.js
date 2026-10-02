/**
 * Sprint 3.11 — Validação e sanitização de entradas públicas
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeString(value, maxLength = 255) {
  if (value == null) return null;
  return String(value)
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, "")
    .slice(0, maxLength);
}

function sanitizeEmail(email) {
  const clean = sanitizeString(email, 255)?.toLowerCase();
  if (!clean || !EMAIL_REGEX.test(clean)) return null;
  return clean;
}

function sanitizePhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) return null;
  return digits;
}

function sanitizeNome(nome) {
  const clean = sanitizeString(nome, 255);
  if (!clean || clean.length < 2) return null;
  return clean;
}

function sanitizeCpfCnpj(value) {
  if (!value) return null;
  const digits = String(value).replace(/\D/g, "");
  if (digits.length === 11 || digits.length === 14) return digits;
  return null;
}

module.exports = {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeNome,
  sanitizeCpfCnpj,
  EMAIL_REGEX,
};
