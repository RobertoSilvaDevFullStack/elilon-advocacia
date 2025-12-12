import React from "react";
import { Layout } from "../components/Layout";
import { Hero, SectionTitle } from "../components/Components";
import { Award, Star, ThumbsUp, Medal } from "lucide-react";
import { SEO } from "../components/SEO";

export const Awards: React.FC = () => {
  return (
    <Layout>
      <SEO
        title="Prêmios e Reconhecimentos"
        description="Conheça os prêmios e certificações que comprovam a excelência do ELADV."
      />
      <Hero
        title="Prêmios e Reconhecimentos"
        subtitle="Nossa Excelência Comprovada"
        image="https://picsum.photos/1920/1080?grayscale&blur=2&random=110"
        height="small"
      />

      {/* Introduction */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <SectionTitle
            title="Reconhecimento do Mercado"
            subtitle="Nossa Trajetória"
            centered
          />
          <p className="text-neutral-600 text-lg leading-relaxed mt-6">
            O compromisso do ELADV com a excelência jurídica e a satisfação dos
            clientes tem sido consistentemente reconhecido por importantes
            instituições e rankings do setor. Cada prêmio reflete a dedicação
            diária de nossa equipe.
          </p>
        </div>
      </section>

      {/* Awards Grid */}
      <section className="py-20 bg-neutral-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Award size={48} className="text-gold-500" />,
                year: "2023",
                title: "Melhores Escritórios",
                org: "Análise Advocacia",
                desc: "Reconhecido como um dos escritórios mais admirados da região Sudeste.",
              },
              {
                icon: <Star size={48} className="text-gold-500" />,
                year: "2022",
                title: "Excelência em Atendimento",
                org: "Prêmio Regional de Qualidade",
                desc: "Destaque pela satisfação dos clientes e inovação nos processos de atendimento.",
              },
              {
                icon: <Medal size={48} className="text-gold-500" />,
                year: "2021",
                title: "Referência Trabalhista",
                org: "Legal Awards MG",
                desc: "Prêmio de destaque pela atuação estratégica em contencioso trabalhista.",
              },
              {
                icon: <ThumbsUp size={48} className="text-gold-500" />,
                year: "2020",
                title: "Escritório Revelação",
                org: "Jovens Juristas",
                desc: "Menção honrosa pelo crescimento e modernização da estrutura jurídica.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded shadow-sm hover:shadow-lg transition-all border-b-4 border-gold-500"
              >
                <div className="flex justify-between items-start mb-6">
                  {item.icon}
                  <span className="text-4xl font-serif font-bold text-neutral-100">
                    {item.year}
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold mb-1">
                  {item.title}
                </h3>
                <p className="text-sm font-semibold text-gold-600 mb-4 uppercase tracking-wider">
                  {item.org}
                </p>
                <p className="text-neutral-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-serif mb-12 text-neutral-400">
            Certificações e Associações
          </h3>
          <div className="flex flex-wrap justify-center gap-12 items-center opacity-60">
            {/* Placeholders for logos */}
            <div className="text-2xl font-bold text-neutral-300 border-2 border-neutral-200 p-4">
              OAB/MG
            </div>
            <div className="text-2xl font-bold text-neutral-300 border-2 border-neutral-200 p-4">
              AASP
            </div>
            <div className="text-2xl font-bold text-neutral-300 border-2 border-neutral-200 p-4">
              IBDFAM
            </div>
            <div className="text-2xl font-bold text-neutral-300 border-2 border-neutral-200 p-4">
              AB2L
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};
