import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import OptimizedImage from "./OptimizedImage";
import { Button } from "./ui/Button";
import { WhatsAppLink } from "./WhatsAppLink";

interface HeroSlide {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  image: string;
  imageMobile?: string;
  imageAlt: string;
  primaryCtaName: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}

const SLIDES: HeroSlide[] = [
  {
    id: "trabalhista",
    eyebrow: "Direito Trabalhista Bancário",
    title: (
      <>
        Advogado trabalhista
        <br />
        para bancários doentes
      </>
    ),
    description:
      "Demissões, horas extras, cargo de confiança e assédio no setor bancário exigem quem conhece essa realidade por dentro.",
    image: "/images/ambiente-fotorrealista-advogado.webp",
    imageMobile: "/images/ambiente-fotorrealista-advogado-800.webp",
    imageAlt: "Estátua da Justiça em ambiente jurídico",
    primaryCtaName: "hero_trabalhista_primary",
    primaryLabel: "Fale com um advogado",
    secondaryHref: "/areas/trabalhista-bancario",
    secondaryLabel: "Conheça a atuação bancária",
  },
  {
    id: "previdenciario",
    eyebrow: "Direito Previdenciário",
    title: (
      <>
        Planejamento previdenciário
        <br />
        com segurança
      </>
    ),
    description:
      "Aposentadorias, revisões e benefícios do INSS pedem análise técnica antes de cada decisão — para você não perder tempo nem direitos.",
    image: "/images/direito-previdenciario.webp",
    imageAlt: "Direito previdenciário e benefícios do INSS",
    primaryCtaName: "hero_previdenciario_primary",
    primaryLabel: "Fale com um advogado",
    secondaryHref: "/areas/previdenciario",
    secondaryLabel: "Conheça a atuação previdenciária",
  },
  {
    id: "tributario",
    eyebrow: "Direito Tributário",
    title: (
      <>
        Tributos com estratégia
        <br />
        e conformidade
      </>
    ),
    description:
      "Planejamento tributário, defesa em autuações e recuperação de créditos para empresas e contribuintes que precisam de clareza fiscal.",
    image: "/images/reforma-tributaria.webp",
    imageAlt: "Direito tributário e planejamento fiscal",
    primaryCtaName: "hero_tributario_primary",
    primaryLabel: "Fale com um advogado",
    secondaryHref: "/areas/tributario",
    secondaryLabel: "Conheça a atuação tributária",
  },
];

const SLIDE_MS = 8000;

/**
 * Hero Home — carrossel editorial (trabalhista → previdenciário → tributário).
 */
export const HomeHero: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const slide = SLIDES[index];

  return (
    <section
      className="relative min-h-svh flex items-end md:items-center overflow-hidden bg-neutral-900 pb-24 md:pb-0"
      aria-label="Destaque principal"
      aria-roledescription="carrossel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
    >
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 z-0 transition-opacity duration-700 ease-out ${
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={i !== index}
        >
          <picture>
            {s.imageMobile && (
              <source
                media="(min-width: 768px)"
                srcSet={s.image}
                type="image/webp"
              />
            )}
            <OptimizedImage
              src={s.imageMobile ?? s.image}
              alt=""
              role="presentation"
              priority={i === 0}
              webp={false}
              width={800}
              height={534}
              className="absolute inset-0 w-full h-full object-cover object-center"
              cover
            />
          </picture>
          <div className="absolute inset-0 bg-linear-to-r from-neutral-950/90 via-neutral-950/65 to-neutral-900/35 pointer-events-none" />
          <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-transparent to-neutral-950/40 pointer-events-none" />
        </div>
      ))}

      <div className="container relative z-10 px-4 md:px-6 py-16 md:py-24">
        <div
          key={slide.id}
          className="max-w-2xl text-left text-white animate-[fadeInUp_0.55s_ease-out]"
        >
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-accent-400 mb-4">
            {slide.eyebrow}
          </p>
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] leading-[1.1] mb-6 font-medium">
            {slide.title}
          </h1>
          <p className="text-base md:text-lg text-neutral-200/90 max-w-xl mb-10 font-light leading-relaxed">
            {slide.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <WhatsAppLink ctaName={slide.primaryCtaName}>
              <Button variant="primary">{slide.primaryLabel}</Button>
            </WhatsAppLink>
            <Link to={slide.secondaryHref}>
              <span
                className="inline-flex items-center justify-center px-8 py-3 text-sm font-semibold uppercase tracking-wider transition-colors duration-300 group min-h-12 border-2 border-white/80 text-white bg-transparent hover:bg-white hover:text-neutral-900 hover:border-white"
              >
                {slide.secondaryLabel}
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>

        <div
          className="mt-10 flex items-center gap-2"
          role="tablist"
          aria-label="Slides do destaque"
        >
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}: ${s.eyebrow}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-10 bg-accent-500"
                  : "w-5 bg-white/35 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
