import React from "react";
import { Helmet } from "react-helmet-async";
import {
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  DEFAULT_OG_IMAGE,
  toAbsoluteUrl,
} from "../utils/seo";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  schema?: object | object[];
  type?: "website" | "article";
  noindex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  url,
  schema,
  type = "website",
  noindex = false,
}) => {
  const fullTitle = title === SITE_TITLE ? title : `${title} | ${SITE_NAME}`;
  const currentUrl =
    url ||
    (typeof window !== "undefined" ? window.location.href : SITE_URL);
  const ogImage = toAbsoluteUrl(image || DEFAULT_OG_IMAGE);

  const schemas = schema
    ? Array.isArray(schema)
      ? schema
      : [schema]
    : [];

  return (
    <Helmet>
      <html lang="pt-BR" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={fullTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* AI / Agentic discovery */}
      <link rel="alternate" type="text/plain" href={`${SITE_URL}/llms.txt`} title="LLMs" />

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};
