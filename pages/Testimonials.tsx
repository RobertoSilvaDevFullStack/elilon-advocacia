import React from "react";
import { Layout } from "../components/Layout";
import { Hero, SectionTitle } from "../components/Components";
import { SEO } from "../components/SEO";
import { Star, Quote } from "lucide-react";
import { ScrollReveal } from "../components/ScrollReveal";

export const Testimonials: React.FC = () => {
  // Load Elfsight script
  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://elfsightcdn.com/platform.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  // Depoimentos reais do Google Meu Negócio
  const staticTestimonials = [
    {
      id: 1,
      name: "Tamara Saraiva",
      role: "Cliente",
      rating: 5,
      comment:
        "Gostaria de expressar minha sincera gratidão pelo atendimento de excelência que recebi do escritório. O profissionalismo ímpar e uma atenção notável, fazendo com que todo o processo fosse conduzido de maneira transparente e acolhedora.",
      date: "Há 1 semana",
    },
    {
      id: 2,
      name: "Flavio Felipe",
      role: "Cliente",
      rating: 5,
      comment:
        "O escritório Elilon Lopes Advogados me deu todo o suporte que eu precisava. Eles foram muito atenciosos e me explicaram tudo de uma maneira muito fácil de entender. Tiraram todas as minhas dúvidas com paciência e me auxiliaram até o final. Recomendo demais! Ótimo trabalho!",
      date: "Há 2 semanas",
    },
    {
      id: 3,
      name: "Viviane Cordeiro",
      role: "Cliente",
      rating: 5,
      comment:
        "Um ótimo atendimento. Eu cheguei no escritório com diversas dúvidas e sai com a clareza de quais são meus direitos. Fui bem atendida desde a assinatura do contrato até o fim do processo. O atendimento foi diferenciado.",
      date: "Há 1 semana",
    },
    {
      id: 4,
      name: "Maria José",
      role: "Cliente",
      rating: 5,
      comment:
        "Fui muito bem atendida, são muito atenciosos, sempre estão à disposição tanto para responder as mensagens quanto para atender as ligações. Super indico o escritório.",
      date: "Há 1 semana",
    },
    {
      id: 5,
      name: "Jessica Thais",
      role: "Cliente",
      rating: 5,
      comment:
        "Tive um ótimo atendimento, tirei todas as minhas dúvidas e fiquei muito satisfeita. Recomendo!",
      date: "Há 2 semanas",
    },
  ];

  return (
    <Layout>
      <SEO
        title="Depoimentos"
        description="Veja o que nossos clientes dizem sobre os serviços do Elilon Lopes Advogados. Avaliações e depoimentos reais."
      />
      <Hero
        title="Depoimentos"
        subtitle="O Que Dizem Nossos Clientes"
        image="/images/aperto-mao.jpg"
        height="small"
      />

      {/* Google Reviews Embed Section */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Avaliações Google"
            subtitle="Nossa Reputação"
            centered
          />
          <p className="text-center text-neutral-600 mb-12 max-w-2xl mx-auto">
            Confira as avaliações dos nossos clientes no Google Meu Negócio.
          </p>

          {/* Google Reviews Widget - Elfsight */}
          <div className="max-w-4xl mx-auto">
            <div
              className="elfsight-app-241b9f63-255e-40d3-a18f-89509b41ca7e"
              data-elfsight-app-lazy
              data-elfsight-app-language="pt"
            ></div>
          </div>
        </div>
      </section>

      {/* Static Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Depoimentos de Clientes"
            subtitle="Experiências"
            centered
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
            {staticTestimonials.map((testimonial, index) => (
              <ScrollReveal
                animation="fade-in-up"
                delay={`delay-${Math.min((index % 3) * 100 + 100, 500)}` as any}
                key={testimonial.id}
              >
                <div
                  key={testimonial.id}
                  className="bg-neutral-50 p-6 rounded-lg border-l-4 border-accent-500 hover:shadow-xl transition-shadow duration-300 relative"
                >
                  <Quote
                    className="absolute top-4 right-4 text-accent-200 rotate-180"
                    size={40}
                  />

                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className="fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  <p className="text-neutral-700 mb-6 italic leading-relaxed">
                    "{testimonial.comment}"
                  </p>

                  <div className="border-t border-neutral-200 pt-4">
                    <p className="font-headline font-bold text-neutral-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {testimonial.date}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-navy-700 via-navy-600 to-navy-500 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-headline mb-6">
            Quer ser nosso próximo cliente satisfeito?
          </h2>
          <p className="text-lg text-neutral-300 mb-10 max-w-2xl mx-auto">
            Entre em contato conosco e descubra como podemos ajudar você ou sua
            empresa.
          </p>
          <a
            href="/contato"
            className="inline-block bg-accent-500 text-white px-8 py-3 rounded hover:bg-accent-600 transition-colors font-semibold uppercase tracking-wider"
          >
            Fale Conosco
          </a>
        </div>
      </section>
    </Layout>
  );
};
