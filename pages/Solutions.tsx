import React from "react";
import { Layout } from "../components/Layout";
import { Hero, SectionTitle, Button } from "../components/Components";
import { Link } from "react-router-dom";
import { CheckCircle, Clock, Shield, Target } from "lucide-react";
import { SEO } from "../components/SEO";

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
        image="https://picsum.photos/1920/1080?grayscale&random=100"
        height="small"
      />

      {/* Introduction */}
      <section className="py-20">
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
      </section>

      {/* Methodology Steps */}
      <section className="py-20 bg-neutral-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {[
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
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="flex justify-center mb-6">{item.icon}</div>
                <h3 className="text-xl font-headline font-bold mb-3">
                  {item.title}
                </h3>
                <p className="text-neutral-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentials */}
      <section className="py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://picsum.photos/800/600?grayscale&random=101"
              alt="Reunião estratégica"
              className="rounded shadow-xl"
            />
          </div>
          <div>
            <h3 className="text-3xl font-headline mb-6">
              Por que somos diferentes?
            </h3>
            <ul className="space-y-4">
              {[
                "Atendimento personalizado e direto com os sócios.",
                "Uso de tecnologia para acompanhamento processual.",
                "Relatórios gerenciais claros e objetivos.",
                "Visão de negócios aplicada ao direito.",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                  <span className="text-neutral-700">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link to="/contato">
                <Button>Agende uma Reunião</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};
