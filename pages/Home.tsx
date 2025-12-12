import React from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Hero, SectionTitle, Button } from "../components/Components";
import { SEO } from "../components/SEO";
import { AREAS, BLOG_POSTS } from "../constants";
import { MapPin, ArrowUpRight, ArrowRight } from "lucide-react";
import { BrazilMap } from "../components/BrazilMap";

export const Home: React.FC = () => {
  return (
    <Layout>
      <SEO
        title="Home"
        description="Elilon Lopes Advogados - Sociedade de Advogados. Excelência jurídica com foco em resultados em Montes Claros e região."
      />
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 z-0">
          {/* Simulated Video Background using an image and overlay */}
          <video
            src="/images/video-institucional.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-neutral-900/50" />
        </div>

        <div className="container relative z-10 px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">
            Defesa Estratégica.
            <br />
            <span className="text-gold-400 italic">Resultados Reais.</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto mb-10 font-light">
            Soluções jurídicas personalizadas para empresas e indivíduos que
            buscam excelência e comprometimento em Montes Claros e em todo o
            Brasil.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/contato">
              <Button variant="primary">Agende uma Consulta</Button>
            </Link>
            <Link to="/areas">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-neutral-900"
              >
                Conheça Nossas Áreas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Intro / Mission */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <SectionTitle
                title="Tradição e Modernidade"
                subtitle="Sobre Nós"
              />
              <p className="text-neutral-600 mb-6 leading-relaxed">
                O escritório Elilon Lopes Advogados nasceu da união de advogados
                experientes com uma visão moderna do Direito. Nossa missão é
                oferecer segurança jurídica através de um atendimento próximo,
                ético e tecnicamente impecável.
              </p>
              <p className="text-neutral-600 mb-8 leading-relaxed">
                Entendemos que cada caso é único e exige uma estratégia sob
                medida. Combinamos o rigor da advocacia tradicional com a
                agilidade necessária para o mundo corporativo atual.
              </p>
              <Link to="/sobre">
                <Button
                  variant="text"
                  className="text-gold-600 border-b border-gold-600 pb-1 rounded-none px-0"
                >
                  Saiba Mais
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-gold-500"></div>
              <img
                src="/images/quem-somos-nos.jpg"
                alt="Equipe Elilon Lopes Advogados"
                className="w-full h-auto shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-4 border-r-4 border-gold-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Atuação Nacional"
            subtitle="Onde Estamos"
            centered
          />
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-neutral-600 mb-10">
              Com sede em Montes Claros, atuamos estrategicamente em todo o
              território nacional, com parceiros nas principais capitais.
            </p>
            <BrazilMap />
          </div>
        </div>
      </section>

      {/* Areas Highlight */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <SectionTitle title="Expertise Jurídica" subtitle="Atuação" />
            <Link
              to="/areas"
              className="hidden md:flex items-center text-gold-600 hover:text-neutral-900 transition-colors font-medium"
            >
              Ver todas as áreas <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {AREAS.slice(0, 3).map((area) => (
              <Link
                to={`/areas`}
                key={area.id}
                className="group relative h-80 overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-neutral-900 group-hover:bg-gold-900 transition-colors duration-500">
                  <img
                    src={area.image}
                    alt={area.title}
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity duration-500"
                  />
                </div>
                <div className="absolute inset-0 p-8 flex flex-col justify-end border border-neutral-800 group-hover:border-gold-500 transition-colors duration-300 m-2">
                  <h3 className="text-2xl font-serif text-white mb-2">
                    {area.title}
                  </h3>
                  <div className="w-8 h-0.5 bg-gold-500 mb-4 group-hover:w-16 transition-all duration-300" />
                  <p className="text-neutral-300 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    {area.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Highlight */}
      <section className="py-20 bg-neutral-100">
        <div className="container mx-auto px-4">
          <SectionTitle
            title="Notícias e Artigos"
            subtitle="Atualizações"
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {BLOG_POSTS.sort((a, b) => {
              const months: { [key: string]: number } = {
                Jan: 0,
                Fev: 1,
                Mar: 2,
                Abr: 3,
                Mai: 4,
                Jun: 5,
                Jul: 6,
                Ago: 7,
                Set: 8,
                Out: 9,
                Nov: 10,
                Dez: 11,
              };

              const parseDate = (dateStr: string) => {
                const parts = dateStr.split(" ");
                if (parts.length !== 3) return 0;
                const day = parseInt(parts[0], 10);
                const month = months[parts[1]];
                const year = parseInt(parts[2], 10);
                return new Date(year, month, day).getTime();
              };

              return parseDate(b.date) - parseDate(a.date);
            })
              .slice(0, 3)
              .map((post) => (
                <Link
                  to={`/blog/${post.slug}`}
                  key={post.id}
                  className="group bg-white hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-bold text-gold-600 uppercase tracking-wider">
                      {post.category}
                    </span>
                    <h3 className="text-xl font-serif font-bold mt-2 mb-3 group-hover:text-gold-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-neutral-500 text-sm mb-4">
                      {post.summary}
                    </p>
                    <span className="text-xs text-neutral-400">
                      {post.date}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-neutral-900 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif mb-6">
            Precisa de orientação jurídica?
          </h2>
          <p className="text-lg text-neutral-400 mb-10 max-w-2xl mx-auto">
            Nossa equipe está pronta para entender o seu cenário e propor as
            melhores soluções.
          </p>
          <Link to="/contato">
            <Button
              variant="outline"
              className="border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white"
            >
              Fale com um Especialista
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};
