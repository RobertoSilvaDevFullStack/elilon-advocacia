import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Hero, SectionTitle, Button } from "../components/Components";
import { SEO } from "../components/SEO";
import { AREAS } from "../constants";
import { MapPin, ArrowUpRight, ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";
import { LazyBrazilMap } from "../components/LazyBrazilMap";
import { ScrollReveal } from "../components/ScrollReveal";
import { LazyYouTube } from "../components/LazyYouTube";
import { MobilePortraitImage } from "../components/MobilePortraitImage";
import { useBlogPosts } from "../hooks/useBlogPosts";
import { buildHomeSchema } from "../utils/seo";

export const Home: React.FC = () => {
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [currentBlogIndex, setCurrentBlogIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { posts: blogPosts } = useBlogPosts();

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

    const total = blogPosts.length;
    if (total <= 1) return;

    const interval = setInterval(() => {
      setCurrentBlogIndex((prev) => (prev + 1) % total);
    }, 5000);

    return () => clearInterval(interval);
  }, [isMobile, blogPosts.length]);

  useEffect(() => {
    setCurrentBlogIndex(0);
  }, [blogPosts.length]);

  return (
    <Layout>
      <SEO
        title="Home"
        description="Elilon Lopes Advogados - Sociedade de Advogados. Excelência jurídica com foco em resultados em Montes Claros e região."
        schema={buildHomeSchema()}
      />
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 z-0">
          {/* YouTube Lazy Load - Performance Optimized */}
          <LazyYouTube
            videoId="nxZTDjDXjOw"
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

      {/* ── Diagnóstico Tributário Highlight ──────────────────────────────── */}
      <section className="relative py-16 md:py-20 bg-gradient-to-br from-[#200A0C] via-[#1A1A1A] to-[#0d0d0d] overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-vinho-500/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Left: Text content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-widest rounded-full mb-6">
                <AlertTriangle className="w-3.5 h-3.5" />
                Reforma Tributária 2026 — Não deixe para depois
              </div>

              <h2 className="text-3xl md:text-4xl xl:text-5xl font-headline font-bold text-white mb-4 leading-tight">
                Diagnóstico Gratuito da
                <br />
                <span className="text-amber-400">Reforma Tributária</span>
              </h2>

              <p className="text-neutral-300 text-base md:text-lg mb-8 max-w-xl leading-relaxed">
                Descubra em menos de 3 minutos se sua empresa pode ser impactada
                pela Reforma Tributária e se vale a pena avaliar o Regime Híbrido.
              </p>

              {/* Benefits list */}
              <ul className="flex flex-col gap-3 mb-8 text-sm text-neutral-200 max-w-sm mx-auto lg:mx-0">
                {[
                  "Resultado imediato",
                  "Diagnóstico gratuito",
                  "Identificação de riscos tributários",
                  "Avaliação preliminar sobre o Regime Híbrido",
                  "Análise voltada para empresas do Simples Nacional",
                ].map((b) => (
                  <li key={b} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>

              <Link
                to="/diagnostico-reforma-tributaria"
                className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 text-[#1A1A1A] font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-amber-300 hover:shadow-xl hover:shadow-amber-400/30 transition-all duration-300 hover:scale-105 group"
              >
                Fazer Diagnóstico Gratuito
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right: Visual card */}
            <div className="flex-1 w-full max-w-md lg:max-w-none">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Análise de Risco Tributário</p>
                    <p className="text-neutral-400 text-xs">Simples Nacional · Reforma 2026</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-6">
                  {[
                    { label: "Impacto no IBS/CBS", level: 75, color: "bg-red-400" },
                    { label: "Exposição ao Regime de Transição", level: 60, color: "bg-amber-400" },
                    { label: "Oportunidade no Regime Híbrido", level: 45, color: "bg-green-400" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
                        <span>{item.label}</span>
                        <span className="text-white font-medium">{item.level}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full`}
                          style={{ width: `${item.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-amber-400 font-semibold">⚡ Diagnóstico em 3 min.</span>{" "}
                    Empresas do Simples Nacional com faturamento acima de R$ 360 mil ao ano merecem atenção especial com a Reforma Tributária.
                  </p>
                </div>
              </div>
            </div>
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
                <MobilePortraitImage
                  src="/images/elilon-sorrindo.JPG"
                  alt="Elilon Lopes — sócio fundador"
                  objectPosition="center 15%"
                  layout="float"
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
                <Link to="/sobre" className="clear-both md:clear-none inline-block">
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
              <div className="relative hidden md:block">
                <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-accent-500 opacity-80"></div>
                <img
                  src="/images/elilon-sorrindo.JPG"
                  alt="Equipe Elilon Lopes Advogados"
                  width="800"
                  height="1000"
                  className="w-full max-w-2xl h-auto shadow-2xl hover:shadow-accent-500/20 transition-shadow duration-300"
                />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-4 border-r-4 border-accent-500 opacity-80"></div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Map Section - Atuação Nacional */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-neutral-50 via-white to-neutral-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-vinho-200 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-vinho-200 to-transparent" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Section */}
          <div className="text-center mb-12 lg:mb-16">
            <span className="inline-block px-4 py-1.5 bg-vinho-50 text-vinho-600 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              Presença em Todo Brasil
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-bold text-neutral-900 mb-4">
              Atuação <span className="text-vinho-500">Nacional</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Com sede estratégica em{" "}
              <strong className="text-vinho-600">Montes Claros - MG</strong>,
              nosso escritório atua em todo o território brasileiro, oferecendo
              soluções jurídicas personalizadas com a mesma excelência em
              qualquer região do país.
            </p>
          </div>

          {/* Map Container - Full Width Responsive */}
          <div className="relative">
            <LazyBrazilMap />
          </div>

          {/* Stats Row - Below Map */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8 lg:mt-12">
            {[
              { value: "27", label: "Estados Atendidos", icon: "🇧🇷" },
              { value: "34", label: "Cidades com Atuação", icon: "📍" },
              { value: "5", label: "Regiões do Brasil", icon: "🌎" },
              { value: "100%", label: "Foco no Cliente", icon: "⭐" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="text-center p-3 sm:p-4 lg:p-6 bg-white rounded-lg sm:rounded-xl shadow-sm border border-neutral-100 hover:shadow-md hover:border-vinho-200 transition-all duration-300 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="text-xl sm:text-2xl mb-1 sm:mb-2 block">
                  {stat.icon}
                </span>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-vinho-600 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-tight">
                  {stat.label}
                </p>
              </div>
            ))}
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
                      width="400"
                      height="320"
                      loading="lazy"
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
                    width="400"
                    height="320"
                    loading="lazy"
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
              {blogPosts.map((post, index) => (
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
                        width="400"
                        height="200"
                        loading="lazy"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">
                        {post.category}
                      </span>
                      {index === 0 && (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-white bg-accent-600 px-2 py-0.5 rounded">
                          Novo
                        </span>
                      )}
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
              {blogPosts.map((_, index) => (
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
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {blogPosts.map((post, index) => (
              <Link
                to={`/blog/${post.slug}`}
                key={post.id}
                className="group bg-white hover:shadow-xl transition-shadow duration-300"
              >
                <div className="h-48 overflow-hidden relative">
                  {index === 0 && (
                    <span className="absolute top-3 left-3 z-10 text-[10px] font-bold uppercase tracking-wider text-white bg-accent-600 px-2 py-1 rounded">
                      Novo
                    </span>
                  )}
                  <img
                    src={post.image}
                    alt={post.title}
                    width="400"
                    height="200"
                    loading="lazy"
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
                  <span className="text-xs text-neutral-400">{post.date}</span>
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
