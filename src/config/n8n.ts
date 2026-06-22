/**
 * Configuração do N8N — Sprint 4.0.2
 * Helper centralizado de acesso às variáveis de ambiente do N8N.
 */

/** URL do webhook conversacional do N8N */
export const N8N_CHAT_WEBHOOK_URL: string =
  import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL || "";

/** Timeout em ms para chamadas ao N8N (padrão: 10s) */
export const N8N_TIMEOUT_MS: number = 10_000;

/** Estados da FSM que devem acionar o N8N */
export const N8N_CONVERSATIONAL_STATES: readonly string[] = [
  "CASE_DESCRIPTION_COLLECTED",
  "AWAITING_AI_QUESTION",
  "AI_INVESTIGATION_COMPLETE",
  "AWAITING_DOCUMENT_UPLOAD_OPTION",
  "DOCUMENT_UPLOAD_OPTION_SELECTED",
  "DOCUMENTS_UPLOADED",
  "QUALIFICATION_COMPLETE",
  "READY_TO_CLOSE",
] as const;

/**
 * Retorna true se o estado atual da FSM deve acionar o N8N.
 */
export function shouldUseN8N(state: string): boolean {
  if (!N8N_CHAT_WEBHOOK_URL) return false;
  return N8N_CONVERSATIONAL_STATES.includes(state);
}

/**
 * Retorna true se o N8N está configurado (URL presente).
 */
export function isN8NConfigured(): boolean {
  return Boolean(N8N_CHAT_WEBHOOK_URL);
}
