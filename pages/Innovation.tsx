import React from "react";
import { Layout } from "../components/Layout";
import { Hero, SectionTitle, Button } from "../components/Components";
import { Link } from "react-router-dom";
import { Cpu, Scale, Brain, Lightbulb } from "lucide-react";
import { SEO } from "../components/SEO";
import { ScrollReveal } from "../components/ScrollReveal";

export const Innovation: React.FC = () => {
  return (
    <Layout>
      <SEO
        title="Pensamento Inovador"
        description="Advocacia 4.0 integrada com Jurimetria, Legal Design e Gestão Digital."
      />
      <Hero
        title="Pensamento Inovador"
        subtitle="Advocacia 4.0"
        image="/images/escritorio-entrada.jpg"
        height="small"
      />

      {/* Introduction */}
      <section className="py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <ScrollReveal animation="fade-in-up">
            <div>
              <SectionTitle
                title="O Futuro do Direito"
                subtitle="Tecnologia & Estratégia"
              />
              <p className="text-neutral-600 text-lg leading-relaxed mb-6">
                O direito não é mais estático. Em um mundo cada vez mais digital
                e complexo, a advocacia precisa evoluir. No Elilon Lopes
                Advogados, integramos inteligência de dados, automação e design
                para oferecer serviços jurídicos mais ágeis, transparentes e
                assertivos.
              </p>
              <p className="text-neutral-600 mb-6">
                Rompemos com o tradicionalismo ineficiente para focar no que
                realmente importa: a solução inteligente dos problemas de nossos
                clientes.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="slide-in-right" delay="delay-200">
            <div className="relative">
              <img
                src="/images/atendimento.jpg"
                alt="Tecnologia Jurídica"
                className="rounded shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-accent-600 text-white p-6 rounded shadow-lg hidden md:block">
                <p className="font-headline font-bold text-xl">
                  Mais Agilidade
                </p>
                <p className="text-sm opacity-90">
                  Decisões baseadas em dados.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pillars of Innovation */}
      <section className="py-20 bg-neutral-900 text-white">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Nossos Pilares Tecnológicos"
            subtitle="Inovação"
            light
            centered
          />

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              {
                icon: <Scale size={48} className="text-accent-500" />,
                title: "Legal Design",
                desc: "Transformamos documentos jurídicos complexos em materiais visuais e compreensíveis, facilitando a comunicação com juízes e clientes.",
              },
              {
                icon: <Cpu size={48} className="text-accent-500" />,
                title: "Jurimetria",
                desc: "Utilizamos análise estatística de dados para prever tendências de decisões judiciais e definir as melhores estratégias processuais.",
              },
              {
                icon: <Brain size={48} className="text-accent-500" />,
                title: "Gestão Digital",
                desc: "Acompanhamento de processos em tempo real, com fluxos de trabalho automatizados que garantem zero perda de prazos.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-neutral-800 p-8 rounded border border-neutral-700 hover:border-accent-500 transition-colors"
              >
                <div className="mb-6">{item.icon}</div>
                <h3 className="text-xl font-headline font-bold mb-3 text-accent-400">
                  {item.title}
                </h3>
                <p className="text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-neutral-100 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <Lightbulb size={64} className="text-accent-600 mx-auto mb-6" />
          <h3 className="text-3xl font-headline mb-6 text-neutral-900">
            Sua empresa preparada para a era digital?
          </h3>
          <p className="text-neutral-600 mb-8">
            Conte com uma assessoria jurídica que fala a língua da inovação e
            entende os desafios da nova economia.
          </p>
          <Link to="/contato">
            <Button>Fale com um Especialista</Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};
