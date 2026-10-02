import React from "react";
import { WHATSAPP_URL, trackWhatsAppCta } from "../utils/whatsapp";

interface WhatsAppLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  ctaName: string;
}

/** CTA externo para WhatsApp com rastreamento de clique. */
export const WhatsAppLink: React.FC<WhatsAppLinkProps> = ({
  ctaName,
  children,
  onClick,
  href,
  target = "_blank",
  rel = "noopener noreferrer",
  ...props
}) => (
  <a
    href={href ?? WHATSAPP_URL}
    target={target}
    rel={rel}
    onClick={(event) => {
      trackWhatsAppCta(ctaName);
      onClick?.(event);
    }}
    {...props}
  >
    {children}
  </a>
);
