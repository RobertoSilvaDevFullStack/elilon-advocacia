import React from "react";
import { Link } from "react-router-dom";

const DIFFERENTIALS = [
  {
    title: "Especialização em Direito do Trabalho",
    text: "Atuação concentrada em demandas trabalhistas — com profundidade técnica para cenários complexos do setor bancário e corporativo.",
  },
  {
    title: "Atendimento personalizado",
    text: "Cada caso é tratado de forma individual. Você não é um processo: é um profissional com história e direitos a defender.",
  },
  {
    title: "Demandas de alta complexidade",
    text: "Atendemos bancários, executivos e empresas em situações que envolvem altos valores, cargos estratégicos e negociações sensíveis.",
  },
  {
    title: "Estratégia jurídica, não só advocacia",
    text: "Analisamos o cenário completo antes de agir. A abordagem é planejada para proteger seus interesses com eficiência.",
  },
];

/**
 * Seção “Advocacia com propósito” — logo abaixo do hero.
 */
export const HomePurpose: React.FC = () => {
  return (
    <section
      className="relative z-20 -mt-16 md:-mt-24 pb-20 md:pb-28 bg-neutral-50"
      aria-labelledby="purpose-heading"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-7 bg-white rounded-t-3xl md:rounded-3xl shadow-[0_24px_60px_-28px_rgba(26,26,26,0.35)] p-8 md:p-12 lg:p-14">
            <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.22em] text-accent-600 mb-3">
              Advocacia com propósito
            </p>
            <h2
              id="purpose-heading"
              className="font-headline text-3xl md:text-4xl text-neutral-900 mb-4 font-medium"
            >
              O que nos diferencia
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-10 max-w-xl">
              Não atuamos em qualquer caso. Somos um escritório com foco em
              situações que exigem estratégia, experiência e atenção ao detalhe
              — especialmente para quem vive a rotina do setor bancário.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {DIFFERENTIALS.map((item) => (
                <div key={item.title}>
                  <h3 className="font-headline text-lg text-neutral-900 mb-2 font-medium">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                to="/areas/trabalhista-bancario"
                className="inline-flex text-sm font-bold uppercase tracking-wider text-accent-600 border-b border-accent-600 pb-0.5 hover:text-accent-500 transition-colors"
              >
                Conhecer atuação bancária
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative hidden lg:block pt-8">
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <img
                src="/images/elilon-firmina.webp"
                alt="Equipe Elilon Lopes Advogados"
                width={800}
                height={1000}
                loading="lazy"
                decoding="async"
                className="w-full h-[420px] object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/50 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
