import React from "react";
import { Layout } from "../components/Layout";
import { Hero, SectionTitle, Button } from "../components/Components";
import { Link } from "react-router-dom";

export const Somos: React.FC = () => {
  return (
    <Layout>
      <Hero
        title="Somos ELADV"
        subtitle="Nossa Essência"
        image="https://picsum.photos/1920/1080?grayscale&random=99"
        height="small"
      />

      {/* Introduction */}
      <section className="py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-serif mb-4">
              Excelência desde a fundação
            </h3>
            <p className="text-neutral-600 mb-4">
              O ELADV (Escritório de Advocacia) foi fundado com o propósito de
              oferecer uma advocacia artesanal para grandes causas. Acreditamos
              que cada cliente merece um atendimento personalizado, onde a
              técnica jurídica se encontra com a estratégia de negócios.
            </p>
            <p className="text-neutral-600">
              Sediado em Montes Claros, expandimos nossa atuação mantendo os
              valores de integridade, transparência e busca incessante pela
              vitória.
            </p>
          </div>
          <div className="bg-neutral-100 p-8 border-l-4 border-gold-500">
            <h4 className="font-bold uppercase tracking-wider mb-4 text-sm">
              Nossa Missão
            </h4>
            <p className="mb-6 text-neutral-600 italic">
              "Prover segurança jurídica e soluções estratégicas que impulsionem
              o sucesso de nossos clientes."
            </p>

            <h4 className="font-bold uppercase tracking-wider mb-4 text-sm">
              Nossa Visão
            </h4>
            <p className="text-neutral-600 italic">
              "Ser referência nacional em advocacia empresarial pela excelência
              técnica e inovação."
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-neutral-900 text-white">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Nossa Trajetória"
            subtitle="História"
            light
            centered
          />

          <div className="mt-12 relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 w-0.5 h-full bg-neutral-700 transform -translate-x-1/2"></div>

            {[
              {
                year: "2010",
                title: "Fundação",
                desc: "Início das atividades em Montes Claros.",
              },
              {
                year: "2015",
                title: "Expansão",
                desc: "Abertura da filial em Belo Horizonte.",
              },
              {
                year: "2018",
                title: "Reconhecimento",
                desc: "Prêmio de escritório destaque regional.",
              },
              {
                year: "2023",
                title: "Inovação",
                desc: "Implementação de gestão jurídica digital.",
              },
            ].map((item, index) => (
              <div
                key={item.year}
                className={`relative flex items-center justify-between mb-12 w-full ${
                  index % 2 === 0 ? "flex-row-reverse" : ""
                }`}
              >
                <div className="w-5/12"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gold-500 rounded-full border-4 border-neutral-900 z-10"></div>
                <div
                  className={`w-5/12 p-6 bg-neutral-800 rounded shadow-lg ${
                    index % 2 === 0 ? "text-right" : "text-left"
                  }`}
                >
                  <span className="text-gold-400 font-bold text-xl">
                    {item.year}
                  </span>
                  <h4 className="font-serif text-lg font-bold mt-1">
                    {item.title}
                  </h4>
                  <p className="text-neutral-400 text-sm mt-2">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-serif mb-6">
            Pronto para conversarmos?
          </h3>
          <Link to="/contato">
            <Button>Entre em Contato</Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};
