import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OptimizedImage from "./OptimizedImage";
import { Button } from "./ui/Button";

const HERO_MOBILE = "/images/ambiente-fotorrealista-advogado-800.webp";
const HERO_DESKTOP = "/images/ambiente-fotorrealista-advogado.webp";

/**
 * Hero da Home — LCP é imagem LOCAL responsiva (não YouTube).
 * Vídeo YouTube só após 8s idle.
 */
export const HomeHero: React.FC = () => {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowVideo(true), 8000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section
      className="relative h-screen flex items-center justify-center overflow-hidden bg-neutral-900"
      aria-label="Destaque principal"
    >
      <div className="absolute inset-0 z-0">
        <picture>
          <source
            media="(min-width: 768px)"
            srcSet={HERO_DESKTOP}
            type="image/webp"
          />
          <OptimizedImage
            src={HERO_MOBILE}
            alt=""
            role="presentation"
            priority
            webp={false}
            width={800}
            height={534}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
            cover
          />
        </picture>
        {showVideo && (
          <iframe
            title="Vídeo institucional Elilon Lopes Advogados"
            src="https://www.youtube.com/embed/nxZTDjDXjOw?autoplay=1&mute=1&loop=1&playlist=nxZTDjDXjOw&controls=0&showinfo=0&rel=0&modestbranding=1"
            loading="lazy"
            allow="autoplay; encrypted-media"
            className="absolute opacity-40 pointer-events-none border-0"
            style={{
              width: "100vw",
              height: "100vh",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) scale(1.5)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-neutral-900/50 pointer-events-none" />
      </div>

      <div className="container relative z-10 px-4 text-center text-white">
        <h1 className="text-5xl md:text-7xl font-headline mb-6 leading-tight">
          Defesa Estratégica.
          <br />
          <span className="text-accent-400 italic">Resultados Reais.</span>
        </h1>
        <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto mb-10 font-light">
          Soluções jurídicas personalizadas para empresas e indivíduos que
          buscam excelência e comprometimento em Montes Claros e em todo o
          Brasil.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link to="/contato">
            <Button variant="primary">Agende uma Consulta</Button>
          </Link>
          <Link to="/areas">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-accent-600 hover:border-accent-600"
            >
              Conheça Nossas Áreas
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
