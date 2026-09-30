---
name: legal-seo-schema
description: Legal SEO guidelines, structured data, JSON-LD schemas (LegalService, Attorney, FAQPage, BreadcrumbList), canonical URLs, and OpenGraph metadata for Elilon Lopes Advogados. Use when implementing or auditing SEO, schema markup, and OAB-compliant metadata.
---

# Legal SEO & Schema Markup Guidelines

## Overview
Esta Skill documenta a infraestrutura de SEO técnico, schemas semânticos JSON-LD e diretrizes de conformidade ética da OAB para o portal institucional e landing pages de **Elilon Lopes Advogados**. Deve ser ativada na implementação ou auditoria de metadados, rich snippets do Google e otimização para motores de resposta (GEO/LLMs).

---

## 1. Fatos Reais do Projeto (Canonical SEO Facts)

Conforme implementado no utilitário canônico [`utils/seo.ts`](file:///F:/PROJETOS/elilon-advocacia/utils/seo.ts):

- **Domínio Base Canônico:** `https://elilonlopesadvogados.com.br`
- **Nome Oficial:** `Elilon Lopes Advogados`
- **Sede Física:** Montes Claros - MG (`Av. Mestra Fininha da Silveira, 1234 - CEP 39402-000`)
- **Coordenadas Geográficas:** Latitude `-16.7284`, Longitude `-43.8578`
- **Telefone Canônico de Contato:** `+55-38-2200-1615`
- **Email Institucional:** `juridico@elilonlopesadvogados.com.br`
- **Fundador e Responsável:** `Elilon Lopes` (Advogado)
- **Áreas Principais de Atuação:** Direito Trabalhista Bancário, Tributário, Previdenciário (BPC/LOAS) e Empresarial.

---

## 2. Schemas Semânticos JSON-LD (Schema.org)

O portal utiliza `@context: "https://schema.org"` com grafos interligados para assegurar indexação precisa:

### A. LegalService & Organization (Home & Global)
Todo o portal deve estar ancorado na entidade institucional de serviços jurídicos:
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LegalService", "ProfessionalService"],
      "@id": "https://elilonlopesadvogados.com.br/#organization",
      "name": "Elilon Lopes Advogados",
      "url": "https://elilonlopesadvogados.com.br",
      "logo": "https://elilonlopesadvogados.com.br/images/logo-elilon.webp",
      "image": "https://elilonlopesadvogados.com.br/images/escritorio-entrada.webp",
      "description": "Advogado trabalhista para bancários e escritório de advocacia em Montes Claros - MG. Atuação em Direito Trabalhista Bancário, Tributário, Previdenciário e Empresarial.",
      "telephone": "+55-38-2200-1615",
      "email": "juridico@elilonlopesadvogados.com.br",
      "priceRange": "$$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Av. Mestra Fininha da Silveira, 1234",
        "addressLocality": "Montes Claros",
        "addressRegion": "MG",
        "postalCode": "39402-000",
        "addressCountry": "BR"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -16.7284,
        "longitude": -43.8578
      },
      "areaServed": { "@type": "Country", name: "Brasil" }
    },
    {
      "@type": "Person",
      "@id": "https://elilonlopesadvogados.com.br/#elilon-lopes",
      "name": "Elilon Lopes",
      "jobTitle": "Advogado",
      "worksFor": { "@id": "https://elilonlopesadvogados.com.br/#organization" },
      "url": "https://elilonlopesadvogados.com.br/profissionais"
    }
  ]
}
```

### B. FAQPage Schema (Landings e Artigos com Perguntas Frequentes)
Páginas temáticas (BPC, Bancários, Reforma Tributária) devem injetar `FAQPage` para elegibilidade a rich snippets expansíveis:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Bancário tem direito a 7ª e 8ª horas extras?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bancários que não exercem cargo de confiança efetivo têm jornada legal de 6 horas diárias. Caso trabalhem 8 horas sem poderes diretivos reais, têm direito à remuneração extraordinária da 7ª e 8ª horas com os devidos reflexos."
      }
    }
  ]
}
```

### C. BreadcrumbList Schema (Navegação Hierárquica)
Para páginas internas de áreas, artigos e páginas institucionais:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://elilonlopesadvogados.com.br/" },
    { "@type": "ListItem", "position": 2, "name": "Áreas de Atuação", "item": "https://elilonlopesadvogados.com.br/areas" },
    { "@type": "ListItem", "position": 3, "name": "Bancários", "item": "https://elilonlopesadvogados.com.br/areas/bancarios" }
  ]
}
```

---

## 3. Diretrizes de Canonical URLs e OpenGraph

1. **URLs Canônicas Absolutas:**
   - Sempre utilize a função utilitária `toAbsoluteUrl(path)` para garantir que crawlers e scrapers de redes sociais não encontrem links relativos truncados.
2. **Tags OpenGraph & Twitter Cards:**
   - `og:site_name`: "Elilon Lopes Advogados"
   - `og:locale`: "pt_BR"
   - `og:type`: "website" (ou "article" para blog)
   - `og:image`: Sempre absoluta com dimensões mínimas recomendadas de `1200x630px` (ex.: `/images/escritorio-entrada.webp`).

---

## 4. Conformidade Ética OAB (Provimento 205/2021)

Na redação de `meta descriptions`, títulos e conteúdos estruturados:
- **Caráter Puramente Informativo:** É vedado o uso de termos mercantilistas, promessas de causas ganhas, valores de honorários em títulos ou chamadas que sugiram captação indevida de clientela.
- **Autoridade e Sobriedade:** Foco em esclarecimento de teses de direitos, explicações legislativas (ex.: Reforma Tributária, direitos bancários na CLT) e identificação formal do responsável técnico.
