import React from "react";
import { Layout } from "../components/Layout";
import { Hero, SectionTitle, Button } from "../components/Components";
import { AREAS } from "../constants";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { MobileSnapCarousel } from "../components/MobileSnapCarousel";
import { WhatsAppLink } from "../components/WhatsAppLink";

const AreaCard: React.FC<(typeof AREAS)[0]> = ({
  title,
  description,
  image,
  slug,
}) => (
  <div className="group relative border border-neutral-200 hover:border-accent-500 transition-colors duration-300 bg-white p-6 md:p-8 hover:shadow-lg h-full">
    <div className="mb-4 md:mb-6 h-36 md:h-48 overflow-hidden bg-neutral-100">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
      />
    </div>
    <h3 className="text-xl md:text-2xl font-headline text-neutral-900 group-hover:text-accent-600 transition-colors mb-3 md:mb-4">
      {title}
    </h3>
    <p className="text-neutral-600 text-sm md:text-base mb-4 md:mb-6">
      {description}
    </p>
    <Link to={`/areas/${slug}`}>
      <span className="text-sm font-bold uppercase tracking-wider text-neutral-900 group-hover:text-accent-600 border-b border-neutral-200 group-hover:border-accent-600 pb-1 transition-all">
        Saiba Mais
      </span>
    </Link>
  </div>
);

export const Areas: React.FC = () => {
  return (
    <Layout>
      <SEO
        title="Áreas de Atuação"
        description="Atuação multidisciplinar em Direito Empresarial, Civil, Trabalhista e Tributário."
      />
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

          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {AREAS.map((area) => (
              <AreaCard key={area.id} {...area} />
            ))}
          </div>

          <MobileSnapCarousel slideClassName="w-[85vw] max-w-sm">
            {AREAS.map((area) => (
              <AreaCard key={area.id} {...area} />
            ))}
          </MobileSnapCarousel>
        </div>
      </section>

      <section className="py-20 bg-navy-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-headline mb-6">
            Não encontrou o que procura?
          </h3>
          <p className="text-neutral-400 mb-8">
            Nossa equipe está apta a lidar com demandas complexas e
            personalizadas.
          </p>
          <WhatsAppLink ctaName="areas_fale_conosco">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-neutral-900"
            >
              Fale Conosco
            </Button>
          </WhatsAppLink>
        </div>
      </section>
    </Layout>
  );
};
