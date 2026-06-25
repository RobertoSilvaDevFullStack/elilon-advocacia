import React from "react";

interface BrandLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Logo otimizado — WebP (~5 KB) em vez de PNG (~1 MB).
 * Mantém mix-blend-screen e dimensões explícitas para CLS.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = "h-12 w-auto object-contain mix-blend-screen",
  width = 48,
  height = 48,
}) => (
  <picture>
    <source srcSet="/images/logo-elilon.webp" type="image/webp" />
    <img
      src="/images/logo-elilon.png"
      alt="Elilon Lopes Advogados"
      width={width}
      height={height}
      className={className}
      decoding="async"
      fetchPriority="high"
    />
  </picture>
);
