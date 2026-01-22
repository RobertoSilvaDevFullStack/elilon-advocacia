---
name: seo-audit
description: Analisa técnicas e recursos de SEO em projetos web, verificando boas práticas implementadas e oportunidades de melhoria. Use para auditorias completas de SEO.
---

# SEO Audit Skill

Quando analisar um projeto web para SEO, siga estas etapas sistematicamente:

## 1. Análise de Estrutura HTML

### Meta Tags

- Verifique a presença e qualidade da tag `<title>` (50-60 caracteres)
- Confirme a meta description (150-160 caracteres)
- Avalie meta tags Open Graph (og:title, og:description, og:image)
- Verifique Twitter Cards
- Analise meta robots e canonical tags
- Confirme viewport e charset

### Heading Structure

- Valide hierarquia de headings (H1 único, H2-H6 sequenciais)
- Verifique uso semântico e palavras-chave nos headings
- Confirme que H1 reflete o título da página

### HTML Semântico

- Avalie uso de tags semânticas (header, nav, main, article, section, aside, footer)
- Verifique estrutura de landmarks ARIA quando necessário
- Confirme uso adequado de listas, tabelas e formulários

## 2. Análise de Conteúdo

### Qualidade e Relevância

- Avalie densidade de palavras-chave (evitar keyword stuffing)
- Verifique originalidade e valor do conteúdo
- Confirme presença de conteúdo acima da dobra
- Analise uso de LSI keywords (variações semânticas)

### Otimização de Texto

- Verifique comprimento adequado do conteúdo
- Confirme uso de negrito/itálico para ênfase
- Avalie legibilidade (parágrafos curtos, listas, subtítulos)
- Verifique presença de call-to-actions claros

## 3. Análise de URLs e Links

### Estrutura de URLs

- Confirme URLs amigáveis e descritivas
- Verifique presença de palavras-chave nas URLs
- Avalie profundidade da estrutura (máximo 3-4 níveis)
- Confirme uso de hífens em vez de underscores
- Verifique ausência de parâmetros desnecessários

### Link Building

- Analise links internos e anchor texts
- Verifique links quebrados (404)
- Confirme uso de atributos rel (nofollow, sponsored, ugc)
- Avalie estratégia de link juice distribution

## 4. Análise de Imagens e Mídia

### Otimização de Imagens

- Verifique presença de alt text descritivo e relevante
- Confirme nomes de arquivo otimizados
- Avalie formatos de imagem (WebP, AVIF para performance)
- Verifique lazy loading
- Confirme dimensões adequadas e compressão

### Outros Recursos Multimídia

- Analise vídeos (título, descrição, transcrições)
- Verifique áudio e podcasts (metadados)

## 5. Análise Técnica

### Performance

- Avalie velocidade de carregamento (Core Web Vitals)
- Verifique minificação de CSS, JS e HTML
- Confirme uso de CDN
- Analise cache browser
- Verifique compressão Gzip/Brotli

### Mobile-Friendliness

- Confirme design responsivo
- Verifique tamanho de fontes e botões para mobile
- Avalie espaçamento adequado para touch
- Confirme ausência de conteúdo bloqueador

### Indexação

- Verifique arquivo robots.txt
- Analise sitemap XML
- Confirme ausência de diretivas noindex indesejadas
- Verifique structured data (Schema.org)

### Segurança

- Confirme certificado SSL/HTTPS
- Verifique mixed content
- Avalie headers de segurança

## 6. Análise de Schema e Dados Estruturados

- Verifique implementação de JSON-LD
- Confirme tipos de schema relevantes (Article, Product, Organization, etc.)
- Valide sintaxe com Google Rich Results Test
- Avalie breadcrumbs markup
- Confirme FAQ schema quando aplicável

## 7. Análise de Acessibilidade (impacto SEO)

- Verifique contraste de cores
- Confirme navegação por teclado
- Avalie labels em formulários
- Verifique hierarquia lógica de leitura

## 8. Análise de Internacionalização (se aplicável)

- Verifique hreflang tags
- Confirme estrutura de URLs multilíngue
- Avalie conteúdo duplicado entre idiomas

---

## Formato do Relatório Final

Ao concluir a análise, forneça um relatório estruturado:

### ✅ Boas Práticas Implementadas

Liste todas as práticas de SEO que estão corretamente implementadas no projeto, organizadas por categoria.

### ⚠️ Pontos de Atenção

Liste problemas médios que devem ser corrigidos, com explicação do impacto e prioridade.

### 🔴 Problemas Críticos

Liste problemas graves que impactam significativamente o SEO, com explicação detalhada.

### 💡 Oportunidades de Melhoria

Forneça sugestões específicas e acionáveis para otimização, priorizadas por impacto esperado:

- **Alta prioridade**: mudanças com maior impacto
- **Média prioridade**: melhorias incrementais
- **Baixa prioridade**: refinamentos opcionais

### 📊 Score Geral de SEO

Atribua uma pontuação de 0-100 baseada em:

- Estrutura HTML e Meta Tags (20 pontos)
- Conteúdo e Palavras-chave (20 pontos)
- Performance Técnica (20 pontos)
- Mobile e UX (15 pontos)
- Links e URLs (15 pontos)
- Dados Estruturados (10 pontos)

### 🎯 Próximos Passos Recomendados

Liste as 3-5 ações prioritárias que terão maior impacto no SEO do projeto.

---

## Diretrizes de Análise

- Seja específico: cite exemplos concretos do código
- Seja construtivo: explique o "porquê" de cada recomendação
- Priorize: foque no que traz mais resultado
- Seja prático: forneça soluções implementáveis
- Considere o contexto: nem toda prática se aplica a todo projeto
