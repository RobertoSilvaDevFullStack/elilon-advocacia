/**
 * Metadados dos níveis de risco — Diagnóstico Tributário (Reforma)
 */

export type NivelRisco = "alto" | "medio" | "baixo";

export interface RiscoMeta {
  label: string;
  title: string;
  scoreRange: string;
  summary: string;
  reasons: string[];
  color: string;
  legendColor: string;
}

export const RISCO_META: Record<NivelRisco, RiscoMeta> = {
  alto: {
    label: "Alto",
    title: "Alto Risco de Impacto",
    scoreRange: "Score ≥ 11",
    summary:
      "Perfil com alta exposição às mudanças da Reforma Tributária (IBS/CBS). Análise jurídica especializada recomendada com urgência.",
    reasons: [
      "Provável aumento na carga tributária na transição",
      "Atenção ao período 2026–2032",
      "Regime Híbrido pode ser estratégico",
      "Revisão urgente do planejamento tributário",
    ],
    color: "bg-red-100 text-red-700",
    legendColor: "border-red-500",
  },
  medio: {
    label: "Médio",
    title: "Impacto Moderado",
    scoreRange: "Score 7–10",
    summary:
      "Impactos pontuais identificados, com oportunidades de planejamento preventivo antes da vigência plena da reforma.",
    reasons: [
      "Impactos pontuais na atividade principal",
      "Regime Híbrido pode ser vantajoso",
      "Transição permite planejamento antecipado",
      "Análise detalhada pode revelar oportunidades",
    ],
    color: "bg-amber-100 text-amber-700",
    legendColor: "border-amber-500",
  },
  baixo: {
    label: "Baixo",
    title: "Baixo Risco Imediato",
    scoreRange: "Score ≤ 6",
    summary:
      "Menor exposição imediata, mas monitoramento e revisão periódica do planejamento tributário ainda são recomendados.",
    reasons: [
      "Impacto direto limitado no curto prazo",
      "Monitorar mudanças graduais",
      "Possíveis oportunidades tributárias",
      "Revisão anual prudente",
    ],
    color: "bg-green-100 text-green-700",
    legendColor: "border-green-500",
  },
};

export const QUESTION_LABELS: Record<string, string> = {
  regime: "Regime tributário",
  faturamento: "Faturamento anual",
  setor: "Setor de atuação",
  tributacao_servicos: "ISSQN sobre serviços",
  conhecimento_reforma: "Análise da Reforma Tributária",
};

export function parseRespostas(raw: unknown): Record<string, string> {
  if (!raw) return {};
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, string>;
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, string>;
      }
    } catch {
      return {};
    }
  }
  return {};
}

export function formatQuestionKey(key: string): string {
  return QUESTION_LABELS[key] || key.replace(/_/g, " ");
}
