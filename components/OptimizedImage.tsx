import React from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
}

/**
 * Componente otimizado de imagem com lazy loading e atributos de performance
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  loading = "lazy",
  priority = false,
}) => {
  // Se for priority, força eager loading
  const loadingStrategy = priority ? "eager" : loading;

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loadingStrategy}
      decoding="async"
      className={className}
      style={{
        maxWidth: "100%",
        height: "auto",
      }}
    />
  );
};

export default OptimizedImage;
