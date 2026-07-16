/** Configuração central de SEO — URLs absolutas e JSON-LD reutilizável. */
export const SITE_URL = "https://elilonlopesadvogados.com.br";
export const SITE_NAME = "Elilon Lopes Advogados";
export const SITE_TITLE = `${SITE_NAME} | Sociedade de Advogados`;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/escritorio-entrada.webp`;
export const DEFAULT_DESCRIPTION =
  "Advogado trabalhista para bancários e escritório de advocacia em Montes Claros - MG. Atuação em Direito Trabalhista Bancário, Tributário, Previdenciário e Empresarial.";

/** Garante URL absoluta para crawlers sociais e LLMs. */
export function toAbsoluteUrl(path?: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

const ORGANIZATION = {
  "@type": ["LegalService", "ProfessionalService"],
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo-elilon.webp`,
  image: DEFAULT_OG_IMAGE,
  description: DEFAULT_DESCRIPTION,
  telephone: "+55-38-2200-1615",
  email: "juridico@elilonlopesadvogados.com.br",
  priceRange: "$$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Av. Mestra Fininha da Silveira, 1234",
    addressLocality: "Montes Claros",
    addressRegion: "MG",
    postalCode: "39402-000",
    addressCountry: "BR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -16.7284,
    longitude: -43.8578,
  },
  areaServed: { "@type": "Country", name: "Brasil" },
  sameAs: [
    "https://www.linkedin.com/in/elilon-lopes",
    "https://www.instagram.com/elilonlopesadvogados",
    "https://www.facebook.com/elilon.lopesdeabreu",
  ],
};

/** Schema global do site (Home). */
export function buildHomeSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      ORGANIZATION,
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "pt-BR",
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/blog?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#elilon-lopes`,
        name: "Elilon Lopes",
        jobTitle: "Advogado",
        worksFor: { "@id": `${SITE_URL}/#organization` },
        url: `${SITE_URL}/profissionais`,
      },
    ],
  };
}

/** BreadcrumbList para páginas internas. */
export function buildBreadcrumbSchema(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
}

/** Article schema para posts do blog. */
export function buildArticleSchema(post: {
  title: string;
  description: string;
  slug: string;
  image?: string;
  datePublished: string;
  author?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: toAbsoluteUrl(post.image || "/images/blog.webp"),
    datePublished: post.datePublished,
    author: {
      "@type": "Person",
      name: post.author || SITE_NAME,
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: toAbsoluteUrl(`/blog/${post.slug}`),
    inLanguage: "pt-BR",
  };
}

/** FAQ schema para landings com perguntas frequentes. */
export function buildFaqSchema(
  faqs: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
