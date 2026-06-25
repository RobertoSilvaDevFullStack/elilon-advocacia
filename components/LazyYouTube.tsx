import React, { useState, useEffect, useRef } from "react";

interface LazyYouTubeProps {
  videoId: string;
  title?: string;
  className?: string;
  autoplay?: boolean;
}

const POSTER_STYLE: React.CSSProperties = {
  width: "100vw",
  height: "100vh",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%) scale(1.5)",
  objectFit: "cover",
};

/**
 * YouTube com lazy load agressivo — LCP usa poster leve (hqdefault),
 * iframe só após idle + interseção para não bloquear renderização.
 */
export const LazyYouTube: React.FC<LazyYouTubeProps> = ({
  videoId,
  title = "Vídeo institucional",
  className = "",
  autoplay = true,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoplay) return;

    const loadVideo = () => {
      if (isLoaded) return;
      setIsLoaded(true);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;

        // Adia iframe até o browser estar ocioso — melhora LCP/TBT
        if ("requestIdleCallback" in window) {
          (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(loadVideo, { timeout: 3000 });
        } else {
          setTimeout(loadVideo, 2000);
        }
        observer.disconnect();
      },
      { threshold: 0.1, rootMargin: "50px" },
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoplay, isLoaded]);

  if (isLoaded) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1`}
        title={title}
        allow="autoplay; encrypted-media"
        className={className}
        loading="lazy"
        style={{
          border: "none",
          ...POSTER_STYLE,
        }}
      />
    );
  }

  // hqdefault (~30 KB) em vez de maxresdefault (~150 KB) — mesmo visual com opacity 40%
  return (
    <div ref={containerRef} className={className} style={POSTER_STYLE}>
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        role="presentation"
        width={480}
        height={360}
        decoding="async"
        fetchPriority="high"
        className="w-full h-full object-cover"
        style={POSTER_STYLE}
      />
    </div>
  );
};
