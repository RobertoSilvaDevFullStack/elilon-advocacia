import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  schema?: object;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image = "/og-image.jpg", // Default image if one exists, or we can use a logo
  url,
  schema,
}) => {
  const siteTitle = "Elilon Lopes Advogados | Sociedade de Advogados";
  const fullTitle =
    title === siteTitle ? title : `${title} | Elilon Lopes Advogados`;
  const currentUrl =
    url ||
    (typeof window !== "undefined"
      ? window.location.href
      : "https://elilonlopesadvogados.com.br");

  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
};
