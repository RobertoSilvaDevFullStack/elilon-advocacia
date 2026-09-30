import { trackWhatsAppClick } from "./pixel";

export const WHATSAPP_PHONE = "5531990150870";
export const WHATSAPP_MESSAGE =
  "Olá! Vim pelo site. Quero falar com um advogado?";

export const WHATSAPP_URL = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export const trackWhatsAppCta = (ctaName: string) => {
  trackWhatsAppClick(ctaName);
};

export const openWhatsApp = (ctaName: string) => {
  trackWhatsAppCta(ctaName);
  window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
};
