import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Hero, SectionTitle, Button } from "../components/Components";
import { SEO } from "../components/SEO";
import { AREAS, BLOG_POSTS } from "../constants";
import { MapPin, ArrowUpRight, ArrowRight } from "lucide-react";
import { BrazilMap } from "../components/BrazilMap";
import { ScrollReveal } from "../components/ScrollReveal";
import { LazyYouTube } from "../components/LazyYouTube";

export const Home: React.FC = () => {
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [currentBlogIndex, setCurrentBlogIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 756);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-rotate areas carousel
  useEffect(() => {
    if (!isMobile) return;

    const interval = setInterval(() => {
      setCurrentAreaIndex((prev) => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(interval);
  }, [isMobile]);

  // Auto-rotate blog carousel
  useEffect(() => {
    if (!isMobile) return;

    const interval = setInterval(() => {
      setCurrentBlogIndex((prev) => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(interval);
  }, [isMobile]);
  return (
    <Layout>
      <SEO
        title="Home"
        description="Elilon Lopes Advogados - Sociedade de Advogados. Excelência jurídica com foco em resultados em Montes Claros e região."
      />
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 z-0">
          {/* YouTube Lazy Load - Performance Optimized */}
          <LazyYouTube
            videoId="qyZJ364WPEs"
            title="Vídeo Institucional Elilon Lopes Advogados"
            className="absolute opacity-40 pointer-events-auto"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-neutral-900/50 pointer-events-none" />
        </div>

        <div className="container relative z-10 px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-headline mb-6 leading-tight">
            Defesa Estratégica.
            <br />
            <span className="text-accent-400 italic">Resultados Reais.</span>
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
                className="border-white text-white hover:bg-accent-600 hover:border-accent-600"
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
            <ScrollReveal animation="fade-in-up">
              <div>
                <SectionTitle
                  title="Tradição e Modernidade"
                  subtitle="Sobre Nós"
                />
                <p className="text-neutral-600 mb-6 leading-relaxed">
                  O escritório Elilon Lopes Advogados nasceu da união de
                  advogados experientes com uma visão moderna do Direito. Nossa
                  missão é oferecer segurança jurídica através de um atendimento
                  próximo, ético e tecnicamente impecável.
                </p>
                <p className="text-neutral-600 mb-8 leading-relaxed">
                  Entendemos que cada caso é único e exige uma estratégia sob
                  medida. Combinamos o rigor da advocacia tradicional com a
                  agilidade necessária para o mundo corporativo atual.
                </p>
                <Link to="/sobre">
                  <Button
                    variant="text"
                    className="text-accent-600 border-b border-accent-600 pb-1 rounded-none px-0"
                  >
                    Saiba Mais
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="slide-in-right" delay="delay-200">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-accent-500 opacity-80"></div>
                <img
                  src="/images/elilon-sorrindo.JPG"
                  alt="Equipe Elilon Lopes Advogados"
                  className="w-full max-w-2xl h-auto shadow-2xl hover:shadow-accent-500/20 transition-shadow duration-300"
                />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-4 border-r-4 border-accent-500 opacity-80"></div>
              </div>
            </ScrollReveal>
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
              className="hidden md:flex items-center text-accent-600 hover:text-neutral-900 transition-colors font-medium"
            >
              Ver todas as áreas <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {/* Mobile: Carousel */}
          <div className="md:hidden relative h-80 overflow-hidden">
            {AREAS.slice(0, 3).map((area, index) => (
              <div
                key={area.id}
                className={`absolute inset-0 transition-all duration-500 ${
                  index === currentAreaIndex
                    ? "opacity-100 translate-x-0 z-10"
                    : index < currentAreaIndex
                    ? "opacity-0 -translate-x-full z-0"
                    : "opacity-0 translate-x-full z-0"
                }`}
              >
                <Link
                  to={`/areas`}
                  className="block relative h-80 overflow-hidden cursor-pointer group"
                >
                  <div className="absolute inset-0 bg-neutral-900 group-hover:bg-accent-900 transition-colors duration-500">
                    <img
                      src={area.image}
                      alt={area.title}
                      className="w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 p-8 flex flex-col justify-end border-2 border-neutral-800 group-hover:border-accent-500 transition-colors duration-300 m-2 group-hover:shadow-lg group-hover:shadow-accent-500/30">
                    <h3 className="text-2xl font-headline text-white mb-2">
                      {area.title}
                    </h3>
                    <div className="w-8 h-0.5 bg-accent-500 mb-4 group-hover:w-16 transition-all duration-300" />
                    <p className="text-neutral-300 text-sm">
                      {area.description}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentAreaIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentAreaIndex
                      ? "bg-accent-500 w-8"
                      : "bg-white/50"
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8">
            {AREAS.slice(0, 3).map((area) => (
              <Link
                to={`/areas`}
                key={area.id}
                className="group relative h-80 overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-neutral-900 group-hover:bg-accent-900 transition-colors duration-500">
                  <img
                    src={area.image}
                    alt={area.title}
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity duration-500"
                  />
                </div>
                <div className="absolute inset-0 p-8 flex flex-col justify-end border-2 border-neutral-800 group-hover:border-accent-500 transition-colors duration-300 m-2 group-hover:shadow-lg group-hover:shadow-accent-500/30">
                  <h3 className="text-2xl font-headline text-white mb-2">
                    {area.title}
                  </h3>
                  <div className="w-8 h-0.5 bg-accent-500 mb-4 group-hover:w-16 transition-all duration-300" />
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
          {/* Mobile: Blog Carousel */}
          <div className="md:hidden relative mt-12">
            <div className="relative h-96 overflow-hidden">
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
                .map((post, index) => (
                  <div
                    key={post.id}
                    className={`absolute inset-0 transition-all duration-500 ${
                      index === currentBlogIndex
                        ? "opacity-100 translate-x-0 z-10"
                        : index < currentBlogIndex
                        ? "opacity-0 -translate-x-full z-0"
                        : "opacity-0 translate-x-full z-0"
                    }`}
                  >
                    <Link
                      to={`/blog/${post.slug}`}
                      className="block h-full group bg-white hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="h-48 overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6">
                        <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">
                          {post.category}
                        </span>
                        <h3 className="text-xl font-headline font-bold mt-2 mb-3 group-hover:text-accent-600 transition-colors">
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
                  </div>
                ))}
            </div>
            {/* Blog Carousel Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBlogIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentBlogIndex
                      ? "bg-accent-500 w-8"
                      : "bg-neutral-400"
                  }`}
                  aria-label={`Blog slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop: Blog Grid */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
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
                    <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">
                      {post.category}
                    </span>
                    <h3 className="text-xl font-headline font-bold mt-2 mb-3 group-hover:text-accent-600 transition-colors">
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
      <section className="py-24 bg-gradient-to-br from-navy-700 via-navy-600 to-navy-500 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-500/10 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-headline mb-6">
            Precisa de orientação jurídica?
          </h2>
          <p className="text-lg text-neutral-400 mb-10 max-w-2xl mx-auto">
            Nossa equipe está pronta para entender o seu cenário e propor as
            melhores soluções.
          </p>
          <Link to="/contato">
            <Button
              variant="outline"
              className="border-accent-500 text-accent-500 hover:bg-accent-500 hover:text-white"
            >
              Fale com um Especialista
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};
