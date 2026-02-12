export const trackWhatsAppClick = (label: string = "whatsapp_click") => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Contact", {
      content_name: label,
      content_category: "lead",
      status: "initiated", // Optional: indicates the user clicked the button
    });
  }
};
