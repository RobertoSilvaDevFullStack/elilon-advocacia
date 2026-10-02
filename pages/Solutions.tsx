import React from "react";
import { Layout } from "../components/Layout";
import { Hero, SectionTitle, Button } from "../components/Components";
import { Link } from "react-router-dom";
import { CheckCircle, Clock, Shield, Target } from "lucide-react";
import { SEO } from "../components/SEO";
import { ScrollReveal } from "../components/ScrollReveal";
import { MobilePortraitImage } from "../components/MobilePortraitImage";
import { MobileSnapCarousel } from "../components/MobileSnapCarousel";
import { WhatsAppLink } from "../components/WhatsAppLink";

const METHODOLOGY_STEPS = [
  {
    icon: <Target size={40} className="text-accent-500" />,
    title: "Diagnóstico",
    desc: "Análise profunda do cenário e identificação dos riscos e oportunidades.",
  },
  {
    icon: <Shield size={40} className="text-accent-500" />,
    title: "Estratégia",
    desc: "Desenvolvimento de teses jurídicas personalizadas para o caso.",
  },
  {
    icon: <Clock size={40} className="text-accent-500" />,
    title: "Execução",
    desc: "Atuação ágil e proativa nos tribunais e órgãos administrativos.",
  },
  {
    icon: <CheckCircle size={40} className="text-accent-500" />,
    title: "Resultado",
    desc: "Foco total na entrega da melhor solução possível para o cliente.",
  },
];

const DIFFERENTIALS = [
  "Atendimento personalizado e direto com os sócios.",
  "Uso de tecnologia para acompanhamento processual.",
  "Relatórios gerenciais claros e objetivos.",
  "Visão de negócios aplicada ao direito.",
];

const StepCard: React.FC<(typeof METHODOLOGY_STEPS)[0]> = ({
  icon,
  title,
  desc,
}) => (
  <div className="bg-white p-8 rounded shadow-sm hover:shadow-md transition-shadow text-center h-full">
    <div className="flex justify-center mb-6">{icon}</div>
    <h3 className="text-xl font-headline font-bold mb-3">{title}</h3>
    <p className="text-neutral-600 text-sm">{desc}</p>
  </div>
);

export const Solutions: React.FC = () => {
  return (
    <Layout>
      <SEO
        title="Entrega e Soluções"
        description="Nossa metodologia de advocacia de resultado: Diagnóstico, Estratégia, Execução e Resultado."
      />
      <Hero
        title="Entrega e Soluções"
        subtitle="Nossa Metodologia"
        image="/images/elilon-trabalhando.JPG"
        height="small"
      />

      <section className="py-20">
        <ScrollReveal animation="fade-in-up">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <SectionTitle
              title="Advocacia de Resultado"
              subtitle="Como Atuamos"
              centered
            />
            <p className="text-neutral-600 text-lg leading-relaxed mt-6">
              No Elilon Lopes Advogados, não vendemos apenas horas de trabalho;
              entregamos soluções. Nossa metodologia é focada em compreender
              profundamente o negócio do cliente para oferecer estratégias
              jurídicas que gerem valor real, seja na mitigação de riscos ou na
              recuperação de ativos.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <section className="py-20 bg-neutral-100">
        <div className="container mx-auto px-4">
          <div className="hidden md:grid md:grid-cols-4 gap-8">
            {METHODOLOGY_STEPS.map((item) => (
              <StepCard key={item.title} {...item} />
            ))}
          </div>

          <MobileSnapCarousel slideClassName="w-[80vw] max-w-xs">
            {METHODOLOGY_STEPS.map((item) => (
              <StepCard key={item.title} {...item} />
            ))}
          </MobileSnapCarousel>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="md:hidden">
            <h3 className="text-3xl font-headline mb-4 text-center">
              Por que somos diferentes?
            </h3>
            <MobilePortraitImage
              src="/images/elilon-firmina-focados.JPG"
              alt="Equipe Elilon em reunião estratégica"
              objectPosition="center 25%"
              layout="float"
            />
            <ul className="space-y-4">
              {DIFFERENTIALS.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent-500 rounded-full shrink-0" />
                  <span className="text-neutral-700">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 text-center clear-both">
              <WhatsAppLink ctaName="solutions_agende_reuniao_mobile">
                <Button>Agende uma Reunião</Button>
              </WhatsAppLink>
            </div>
          </div>

          <div className="hidden md:grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/images/elilon-firmina-focados.JPG"
                alt="Reunião estratégica"
                className="rounded shadow-xl w-full max-w-md h-auto object-contain"
              />
            </div>
            <div>
              <h3 className="text-3xl font-headline mb-6">
                Por que somos diferentes?
              </h3>
              <ul className="space-y-4">
                {DIFFERENTIALS.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent-500 rounded-full" />
                    <span className="text-neutral-700">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <WhatsAppLink ctaName="solutions_agende_reuniao_desktop">
                  <Button>Agende uma Reunião</Button>
                </WhatsAppLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};
