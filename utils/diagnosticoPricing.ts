/**
 * Sprint 3.11 — Precificação exibida no frontend (apenas visualização).
 * O valor oficial é sempre recalculado no backend.
 */

export type RegimeTributario = "simples_nacional" | "lucro_presumido" | "lucro_real";

export const REGIME_PRICES: Record<RegimeTributario, number> = {
  simples_nacional: 297,
  lucro_presumido: 797,
  lucro_real: 597,
};

export const REGIME_LABELS: Record<RegimeTributario, string> = {
  simples_nacional: "Simples Nacional",
  lucro_presumido: "Lucro Presumido",
  lucro_real: "Lucro Real",
};

export function getDisplayPrice(regime: string | null | undefined): number | null {
  if (!regime || !(regime in REGIME_PRICES)) return null;
  return REGIME_PRICES[regime as RegimeTributario];
}

export function formatPriceBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
