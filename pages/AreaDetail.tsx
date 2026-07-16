import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Hero, Button } from "../components/Components";
import { SEO } from "../components/SEO";
import { getAreaBySlug, AREAS } from "../constants/areas";
import { getAreaPage } from "../constants/areaPages";
import { buildBreadcrumbSchema, SITE_URL } from "../utils/seo";

export const AreaDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const area = slug ? getAreaBySlug(slug) : undefined;
  const page = slug ? getAreaPage(slug) : undefined;

  if (!area || !page) {
    return <Navigate to="/areas" replace />;
  }

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: page.headline,
        description: page.lead,
        url: `${SITE_URL}/areas/${area.slug}`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "LegalService",
        name: `${area.title} — Elilon Lopes Advogados`,
        description: page.lead,
        url: `${SITE_URL}/areas/${area.slug}`,
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "Country", name: "Brasil" },
      },
      buildBreadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Áreas de Atuação", path: "/areas" },
        { name: area.title, path: `/areas/${area.slug}` },
      ]),
    ],
  };

  return (
    <Layout>
      <SEO
        title={area.title}
        description={page.lead}
        schema={schema}
        url={`${SITE_URL}/areas/${area.slug}`}
      />

      <Hero
        title={page.headline}
        subtitle="Áreas de Atuação"
        image={area.image}
        height="small"
      />

      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-lg md:text-xl text-neutral-600 leading-relaxed mb-10 border-l-4 border-accent-500 pl-5">
            {page.lead}
          </p>

          <div className="mb-8">
            <Link
              to="/contato"
              className="inline-flex items-center justify-center px-8 py-3 text-sm font-semibold uppercase tracking-wider border-2 border-neutral-900 text-neutral-900 hover:bg-accent-600 hover:border-accent-600 hover:text-white transition-colors min-h-[48px]"
            >
              Fale com o escritório
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-neutral-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-headline text-2xl md:text-3xl text-neutral-900 mb-4 font-medium">
            {page.introTitle}
          </h2>
          <p className="text-neutral-600 leading-relaxed mb-12 whitespace-pre-line">
            {page.intro}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 mb-12">
            {page.sections.map((section) => (
              <div key={section.title} className="bg-white p-6 md:p-8 border border-neutral-100 shadow-sm">
                <h3 className="font-headline text-xl text-neutral-900 mb-3 font-medium">
                  {section.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {section.text}
                </p>
              </div>
            ))}
          </div>

          <Link to="/contato">
            <Button variant="primary">{page.ctaLabel}</Button>
          </Link>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-neutral-900 text-white">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <p className="text-lg md:text-xl font-light leading-relaxed mb-8 text-neutral-200">
            {page.closing}
          </p>
          <Link to="/contato">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-neutral-900"
            >
              Fale conosco
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-2xl text-neutral-900 mb-8 text-center font-medium">
            Outras áreas de atuação
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {AREAS.filter((a) => a.slug !== area.slug)
              .slice(0, 4)
              .map((a) => (
                <Link
                  key={a.slug}
                  to={`/areas/${a.slug}`}
                  className="block p-5 border border-neutral-200 hover:border-accent-500 transition-colors text-center"
                >
                  <span className="font-headline text-neutral-900 text-sm md:text-base">
                    {a.title}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};
