import React from "react";
import { Layout } from "../components/Layout";
import { Hero, SectionTitle, Button } from "../components/Components";
import { AREAS } from "../constants";
import { Link } from "react-router-dom";

export const Areas: React.FC = () => {
  return (
    <Layout>
      <Hero
        title="Áreas de Atuação"
        subtitle="Especialidades"
        image="/images/ambiente-fotorrealista-advogado.jpg"
        height="small"
      />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <p className="text-lg text-neutral-600">
              Atuamos em diversas áreas do direito com foco no setor
              empresarial, oferecendo soluções integradas e preventivas. Nossa
              abordagem multidisciplinar permite uma visão 360º dos desafios de
              nossos clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {AREAS.map((area) => (
              <div
                key={area.id}
                className="group relative border border-neutral-200 hover:border-gold-500 transition-colors duration-300 bg-white p-8 hover:shadow-lg"
              >
                <div className="mb-6 h-48 overflow-hidden bg-neutral-100">
                  <img
                    src={area.image}
                    alt={area.title}
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                </div>
                <h3 className="text-2xl font-serif text-neutral-900 group-hover:text-gold-600 transition-colors mb-4">
                  {area.title}
                </h3>
                <p className="text-neutral-600 mb-6">{area.description}</p>
                <Link to="/contato">
                  <span className="text-sm font-bold uppercase tracking-wider text-neutral-900 group-hover:text-gold-600 border-b border-neutral-200 group-hover:border-gold-600 pb-1 transition-all">
                    Saiba Mais
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-neutral-900 text-white text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-serif mb-6">
            Não encontrou o que procura?
          </h3>
          <p className="text-neutral-400 mb-8">
            Nossa equipe está apta a lidar com demandas complexas e
            personalizadas.
          </p>
          <Link to="/contato">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-neutral-900"
            >
              Fale Conosco
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};
