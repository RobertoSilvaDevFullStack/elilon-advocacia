import { trackWhatsAppClick } from "./pixel";

export const openWhatsApp = (ctaName: string) => {
  const phoneNumber = "553899576682";
  const message = "Olá! Vim pelo anúncio. Quero falar com um advogado?";
  const encodedMessage = encodeURIComponent(message);
  const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

  // Track the click
  trackWhatsAppClick(ctaName);

  // Open WhatsApp
  window.open(url, "_blank");
};
