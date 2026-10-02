import React from "react";

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  /** Quando true, tenta <picture> com .webp equivalente */
  webp?: boolean;
  /** Quando true, não aplica height:auto (object-cover absoluto) */
  cover?: boolean;
}

/** Resolve .webp a partir de .jpg/.jpeg/.png/.JPG */
function webpSrc(src: string): string | null {
  if (/\.(jpe?g|png)$/i.test(src)) {
    return src.replace(/\.(jpe?g|png)$/i, ".webp");
  }
  return null;
}

/**
 * Imagem com lazy loading, dimensões explícitas (CLS) e WebP via <picture>.
 * priority=true → fetchPriority high + loading eager (LCP).
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  loading = "lazy",
  priority = false,
  webp = true,
  cover = false,
  style,
  ...rest
}) => {
  const loadingStrategy = priority ? "eager" : loading;
  const webpPath = webp ? webpSrc(src) : null;

  const imgProps = {
    alt,
    width,
    height,
    loading: loadingStrategy as "lazy" | "eager",
    decoding: "async" as const,
    className,
    style: cover
      ? style
      : { maxWidth: "100%", height: "auto", ...style },
    ...(priority ? { fetchPriority: "high" as const } : {}),
    ...rest,
  };

  if (webpPath) {
    return (
      <picture>
        <source srcSet={webpPath} type="image/webp" />
        <img src={src} {...imgProps} />
      </picture>
    );
  }

  return <img src={src} {...imgProps} />;
};

export default OptimizedImage;
