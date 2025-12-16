import React, { useState, useEffect, useRef } from "react";

interface LazyYouTubeProps {
  videoId: string;
  title?: string;
  className?: string;
  autoplay?: boolean;
}

/**
 * Componente otimizado para embed do YouTube com lazy loading
 * Usa Intersection Observer para autoplay sem bloquear FCP inicial
 */
export const LazyYouTube: React.FC<LazyYouTubeProps> = ({
  videoId,
  title = "YouTube video",
  className = "",
  autoplay = true,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoplay) return;

    // Usar Intersection Observer para carregar quando visível
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded) {
            // Pequeno delay para não bloquear FCP
            setTimeout(() => {
              setIsLoaded(true);
            }, 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [autoplay, isLoaded]);

  if (isLoaded) {
    // Carregar iframe real quando visível
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1`}
        title={title}
        allow="autoplay; encrypted-media"
        className={className}
        style={{
          border: "none",
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(1.5)",
        }}
      />
    );
  }

  // Mostrar placeholder enquanto não carregar
  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        backgroundImage: `url(https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100vw",
        height: "100vh",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) scale(1.5)",
      }}
    />
  );
};
