/**
 * Sprint 3.11 — Precificação do Diagnóstico Tributário Premium
 * Valores recalculados exclusivamente no backend (nunca confiar no frontend).
 */

const REGIME_PRICES = {
  simples_nacional: 297.0,
  lucro_presumido: 797.0,
  lucro_real: 597.0,
};

const REGIME_LABELS = {
  simples_nacional: "Simples Nacional",
  lucro_presumido: "Lucro Presumido",
  lucro_real: "Lucro Real",
};

const VALID_REGIMES = Object.keys(REGIME_PRICES);

const VALID_PAYMENT_METHODS = ["PIX", "CREDIT_CARD"];

function isValidRegime(regime) {
  return VALID_REGIMES.includes(regime);
}

function getPriceForRegime(regime) {
  if (!isValidRegime(regime)) return null;
  return REGIME_PRICES[regime];
}

function getRegimeLabel(regime) {
  return REGIME_LABELS[regime] || regime;
}

function formatPriceBRL(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function isValidPaymentMethod(method) {
  return VALID_PAYMENT_METHODS.includes(method);
}

module.exports = {
  REGIME_PRICES,
  REGIME_LABELS,
  VALID_REGIMES,
  VALID_PAYMENT_METHODS,
  isValidRegime,
  getPriceForRegime,
  getRegimeLabel,
  formatPriceBRL,
  isValidPaymentMethod,
};
