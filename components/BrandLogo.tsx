import React from "react";

interface BrandLogoProps {
  className?: string;
  width?: number;
  height?: number;
  /** dark = logo branca (header/footer escuros); light = marca preta */
  variant?: "dark" | "light";
}

/**
 * Logo com fundo transparente (sem placa branca).
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = "h-10 lg:h-11 w-auto object-contain",
  width = 180,
  height = 48,
  variant = "dark",
}) => {
  const webp =
    variant === "dark"
      ? "/images/logo-branca-transparent.webp"
      : "/images/logo-elilon-transparent.webp";
  const fallback =
    variant === "dark"
      ? "/images/logo-branca-transparent.png"
      : "/images/logo-elilon-transparent.png";

  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img
        src={fallback}
        alt="Elilon Lopes Advogados"
        width={width}
        height={height}
        className={className}
        decoding="async"
        fetchPriority="high"
      />
    </picture>
  );
};
