import React from "react";
import { Layout } from "../components/Layout";
import { Hero, SectionTitle, Button } from "../components/Components";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { ScrollReveal } from "../components/ScrollReveal";
import { MobileSnapCarousel } from "../components/MobileSnapCarousel";

const VALUES = [
  {
    title: "Ética",
    description:
      "Atuamos com integridade e transparência em todas as nossas relações, respeitando rigorosamente os princípios éticos da advocacia.",
  },
  {
    title: "Compromisso",
    description:
      "Dedicação total com os interesses de nossos clientes, trabalhando incansavelmente para alcançar os melhores resultados.",
  },
  {
    title: "Excelência",
    description:
      "Buscamos constantemente a qualidade superior em nossos serviços, com técnica jurídica apurada e atualização permanente.",
  },
  {
    title: "Empatia",
    description:
      "Compreendemos profundamente as necessidades de cada cliente, oferecendo um atendimento humanizado e próximo.",
  },
  {
    title: "Inovação",
    description:
      "Utilizamos tecnologia e métodos modernos para otimizar processos e oferecer soluções jurídicas cada vez mais eficientes.",
  },
  {
    title: "Colaboração",
    description:
      "Trabalhamos em equipe, valorizando as contribuições de todos e construindo parcerias duradouras com nossos clientes.",
  },
];

export const About: React.FC = () => {
  return (
    <Layout>
      <SEO
        title="Sobre Nós"
        description="Conheça a história e os valores do Elilon Lopes Advogados. Advocacia artesanal para grandes causas desde 2010."
      />
      <Hero
        title="Sobre Nós"
        subtitle="Quem Somos"
        image="/images/elilon-lopes.JPG"
        height="small"
        imagePosition="center 30%"
      />

      {/* Introduction */}
      <section className="py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12">
          <ScrollReveal animation="fade-in-up">
            <div>
              <h3 className="text-2xl font-headline mb-4">
                Excelência desde a fundação
              </h3>
              <p className="text-neutral-600 mb-4">
                O escritório Elilon Lopes Advogados foi construído sobre pilares
                sólidos de transparência, Lealdade, simplicidade e humildade.
                Esses valores, aliados a um profundo respeito pela experiência
                do cliente, fazem com que cada caso seja tratado com dedicação
                máxima. Nosso diferencial está no compromisso de oferecer uma
                jornada única e personalizada, com foco no que realmente
                importa: as necessidades e os resultados para nossos clientes.
              </p>
              <p className="text-neutral-600 mb-4">
                Nosso propósito não é apenas solucionamos problemas jurídicos —
                construímos relacionamentos baseados na confiança, no respeito e
                na busca por justiça.
              </p>
              <p className="text-neutral-600">
                Seja qual for o desafio legal que você enfrente, conte com a
                experiência, o profissionalismo e os valores humanos que guiam o
                trabalho de Elilon Lopes Advogados.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="slide-in-right" delay="delay-200">
            <div className="bg-neutral-100 p-8 border-l-4 border-accent-500">
              <h4 className="font-bold uppercase tracking-wider mb-4 text-sm">
                Nossa Visão
              </h4>
              <p className="mb-6 text-neutral-600 italic">
                "Ser reconhecido como um escritório de advocacia de excelência,
                que transforma desafios legais em soluções inovadoras,
                proporcionando segurança e confiança a nossos clientes em todas
                as etapas do processo jurídico."
              </p>

              <h4 className="font-bold uppercase tracking-wider mb-4 text-sm">
                Nossa Missão
              </h4>
              <p className="text-neutral-600 italic">
                "Oferecer serviços jurídicos de alta qualidade, com ética e
                transparência, visando sempre a defesa dos interesses de nossos
                clientes. Comprometemo-nos a entender suas necessidades e a
                oferecer soluções personalizadas, com dedicação e
                profissionalismo."
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <SectionTitle title="Nossos Valores" subtitle="Princípios" centered />

          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
            {VALUES.map((value, index) => (
              <div
                key={index}
                className="bg-white p-6 border-t-4 border-accent-500 hover:shadow-lg transition-shadow duration-300"
              >
                <h4 className="text-xl font-headline font-bold text-neutral-900 mb-3">
                  {value.title}
                </h4>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>

          <MobileSnapCarousel className="mt-12 max-w-6xl mx-auto">
            {VALUES.map((value, index) => (
              <div
                key={index}
                className="bg-white p-6 border-t-4 border-accent-500 shadow-sm h-full"
              >
                <h4 className="text-xl font-headline font-bold text-neutral-900 mb-3">
                  {value.title}
                </h4>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </MobileSnapCarousel>
        </div>
      </section>

      {/* Timeline (Simplified) */}
      <section className="py-20 bg-navy-600 text-white">
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
                year: "2014",
                title: "Fundação",
                desc: "Início das atividades em São João da Ponte - MG, com atuação focada em direito civil.",
              },
              {
                year: "2016",
                title: "Expansão Previdenciária",
                desc: "Expansão para a área Previdenciária com atuação local em Minas Gerais.",
              },
              {
                year: "2019",
                title: "Crescimento Regional",
                desc: "Expansão de atendimento previdenciário nos Estados de Minas Gerais, Rio de Janeiro e São Paulo.",
              },
              {
                year: "2023",
                title: "Atuação Nacional",
                desc: "Expansão de atendimento para 11 Estados.",
              },
              {
                year: "2025",
                title: "Unidade Montes Claros",
                desc: "Abertura da unidade Montes Claros, com atendimento em todo território nacional.",
              },
            ].map((item, index) => (
              <div
                key={item.year}
                className={`relative flex items-center justify-between mb-12 w-full ${
                  index % 2 === 0 ? "flex-row-reverse" : ""
                }`}
              >
                <div className="w-5/12"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-accent-500 rounded-full border-4 border-neutral-900 z-10"></div>
                <div
                  className={`w-5/12 p-6 bg-neutral-800 rounded shadow-lg ${
                    index % 2 === 0 ? "text-right" : "text-left"
                  }`}
                >
                  <span className="text-accent-400 font-bold text-xl">
                    {item.year}
                  </span>
                  <h4 className="font-headline text-lg font-bold mt-1">
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
          <h3 className="text-3xl font-headline mb-6">
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
