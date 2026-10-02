/**
 * Feature flag do Chat Widget — desligado por padrão.
 * Opt-in explícito: só ativa se VITE_ENABLE_CHAT=true no build.
 * (URL N8N sozinha NÃO liga o widget — evita deploy acidental.)
 */
export function isChatEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_CHAT === "true";
}
