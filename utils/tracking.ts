/**
 * tracking.ts
 * Sprint 3.8 — Central de eventos Meta Pixel
 *
 * REGRAS:
 *  - Todos os fbq("track", ...) do projeto devem passar por aqui.
 *  - Nenhum componente deve chamar window.fbq diretamente para eventos de lead.
 *  - Funções são no-op se o Pixel não estiver carregado (SSR-safe).
 *  - Eventos só devem ser chamados APÓS persistência confirmada na API.
 */

/** Guard: dispara apenas se fbq estiver disponível no window */
const fire = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window === "undefined" || !(window as any).fbq) return;
  if (params) {
    (window as any).fbq("track", eventName, params);
  } else {
    (window as any).fbq("track", eventName);
  }
};

// ─── Eventos de Lead ──────────────────────────────────────────────────────────

/**
 * trackLead — formulário tradicional (/contato)
 * Disparar APÓS response.ok do POST /api/leads com source = "site"
 */
export const trackLead = (source: string = "site") => {
  fire("Lead", {
    content_name: source,
    content_category: "lead_juridico",
  });
};

/**
 * trackLandingLead — LPs (BPC, IR)
 * Disparar APÓS persistência bem-sucedida, ANTES de abrir WhatsApp
 */
export const trackLandingLead = (source: "landing_bpc" | "landing_ir") => {
  fire("Lead", {
    content_name: source,
    content_category: "lead_landing_page",
  });
};

/**
 * trackDiagnostico — Diagnóstico Tributário
 * Disparar APÓS await fetch POST /api/diagnostico sem exceção
 */
export const trackDiagnostico = (params: {
  source?: string;
  risk_level: string;
  score: number;
}) => {
  fire("Lead", {
    content_name: params.source ?? "diagnostico_tributario",
    content_category: "lead_diagnostico",
    risk_level: params.risk_level,
    score: params.score,
  });
};

/**
 * trackChatLead — Chat Jurídico
 * Disparar APÓS protocolo gerado com sucesso (result.success && result.protocolo)
 */
export const trackChatLead = (params: {
  area?: string;
  subarea?: string;
}) => {
  fire("Lead", {
    content_name: "chat_juridico",
    content_category: "lead_chat",
    area: params.area ?? "",
    subarea: params.subarea ?? "",
  });
};

/**
 * trackNewsletter — Newsletter do Blog
 * Disparar APÓS response.ok do POST /api/leads com source = "blog_newsletter"
 */
export const trackNewsletter = () => {
  fire("CompleteRegistration", {
    content_name: "blog_newsletter",
    content_category: "newsletter",
  });
};

// ─── Evento de clique no WhatsApp (mantido para compatibilidade) ───────────────

/**
 * trackWhatsAppClick — clique em qualquer botão de WhatsApp
 * Redireciona para cá o que estava em utils/pixel.ts
 */
export const trackWhatsAppClick = (label: string = "whatsapp_click") => {
  fire("Contact", {
    content_name: label,
    content_category: "lead",
    status: "initiated",
  });
};
