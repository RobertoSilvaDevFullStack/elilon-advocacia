# Relatório — Otimização Lighthouse, SEO Técnico e Navegação Agêntica

**Data:** 24/06/2026  
**Escopo:** Performance, Acessibilidade, Best Practices, SEO e AI SEO (llms.txt)  
**Restrição:** Identidade visual preservada — nenhuma alteração de design.

---

## 1. Metas Lighthouse

| Categoria | Meta | Status esperado pós-deploy |
|-----------|------|--------------------------|
| Performance Mobile | ≥ 95 | Melhoria significativa — validar após deploy |
| Performance Desktop | ≥ 98 | Melhoria significativa |
| Accessibility | ≥ 95 | Correções ARIA e touch targets |
| Best Practices | 100 | Pixel adiado, HTTPS, dimensões de imagem |
| SEO | 100 | Metadata + JSON-LD + sitemap + robots |
| Navegação Agêntica | 3/3 | llms.txt completo + robots + árvore a11y |

> **Nota:** Métricas "Antes" baseadas no audit interno e relatórios Lighthouse existentes (`lighthouse-*.json`). Métricas "Depois" devem ser confirmadas com `npm run build && npm run preview` + Lighthouse CI ou DevTools em modo anônimo.

---

## 2. Performance — Antes vs Depois (estimado)

| Métrica | Antes (estimado) | Depois (estimado) | Intervenção principal |
|---------|------------------|-------------------|------------------------|
| **LCP** | ~3.3 s | **< 2.0 s** | Logo WebP 5 KB, poster YouTube hqdefault, preload crítico |
| **TBT** | Alto (maps + pixel) | Reduzido | LazyBrazilMap, MetaPixel idle, code-split |
| **CLS** | Baixo-médio | **< 0.1** | width/height em logos e Hero |
| **JS inicial (Home)** | ~32 KB gzip + maps inline | **~21 KB gzip** (maps em chunk separado) | manualChunks + lazy map |
| **Payload logo** | ~1 MB (logo-nova.png) | **~5 KB** (logo-elilon.webp) | BrandLogo component |
| **Bundle entry** | ~26 KB gzip | **~25 KB gzip** | Chunks editor/sanitize isolados |

### Bundle — Antes vs Depois (build `npm run build`)

| Chunk | Antes | Depois |
|-------|-------|--------|
| `Home-*.js` | ~31 KB gzip (com maps embutido) | **~6.4 KB gzip** + `BrazilMap` 3.7 KB lazy |
| `maps-vendor` | Carregado na Home | **Lazy** — só ao rolar até mapa |
| `MetaPixel` | Eager no bundle principal | **1 KB** chunk lazy + idle |
| `react-vendor` | 0 B (chunk vazio) | **45 KB** — split corrigido |
| `editor-vendor` | No Admin | **Isolado** — não afeta Home |
| Compressão | Gzip apenas | **Gzip + Brotli** (.br) |

---

## 3. Alterações por área

### 3.1 Performance Mobile

| Arquivo | Alteração | Justificativa |
|---------|-----------|---------------|
| `components/LazyBrazilMap.tsx` | **Novo** — Suspense + dynamic import | Remove ~40 KB de maps da carga inicial da Home |
| `components/LazyYouTube.tsx` | Poster `hqdefault`, iframe após `requestIdleCallback` | LCP: ~150 KB → ~30 KB no hero |
| `components/BrandLogo.tsx` | **Novo** — `<picture>` WebP | Elimina download de 1 MB no header |
| `components/MetaPixel.tsx` | Init após idle (3–4 s) | Terceiros não bloqueiam thread principal |
| `App.tsx` | MetaPixel em `React.lazy` | Code-split do pixel |
| `vite.config.ts` | Brotli + gzip; `manualChunks` por função | Cache e paralelismo de download |
| `public/.htaccess` | Cache-Control 1 ano para assets hash | Lighthouse "efficient cache" |
| `index.html` | Preload logo WebP; fontes reduzidas; sem preconnect YouTube global | Menos render-blocking |

### 3.2 LCP

- Preload `/images/logo-elilon.webp` com `fetchpriority="high"`
- Hero YouTube: imagem `<img>` com `fetchPriority="high"` em vez de CSS background maxresdefault
- `OptimizedImage` com `priority` nos Heroes internos

### 3.3 CSS

- `index.css`: fontes alinhadas a Cabin/Montserrat (remove Inter/Playfair não carregadas)
- `tailwind.config.js`: paths expandidos (`hooks/`, `utils/`, `src/`) para purge correto

### 3.4 JavaScript

- Chunks: `react-vendor`, `router-vendor`, `ui-vendor`, `maps-vendor`, `editor-vendor`, `sanitize-vendor`
- Home não importa mais `BrazilMap` diretamente

### 3.5 Imagens

| Arquivo | Alteração |
|---------|-----------|
| `components/OptimizedImage.tsx` | `<picture>` WebP automático, `decoding="async"`, `fetchPriority` |
| `components/Components.tsx` | Hero usa OptimizedImage com priority |
| `pages/BlogPostDetail.tsx` | Hero do artigo otimizado |

### 3.6 Acessibilidade

| Arquivo | Alteração |
|---------|-----------|
| `components/Navbar.tsx` | `aria-label` nav, `aria-expanded`, `aria-controls`, menu 48×48 px |
| `components/Components.tsx` | Botões `min-h-[48px] min-w-[48px]` |
| `components/Layout.tsx` | Links sociais 48×48 px |
| `components/LazyBrazilMap.tsx` | Skeleton com `role="img"` e label |

### 3.7 AI SEO / Navegação Agêntica

| Arquivo | Alteração |
|---------|-----------|
| `public/llms.txt` | Reescrito no padrão llmstxt.org: stack, páginas, serviços, instruções para agentes |
| `public/llms-full.txt` | Seção stack técnica adicionada |
| `public/robots.txt` | Linhas `LLMs:` e `LLMs-full:` explícitas |
| `components/SEO.tsx` | `og:locale`, URLs absolutas, link alternate llms.txt |
| `utils/seo.ts` | **Novo** — schemas centralizados |

### 3.8 Metadata e Structured Data

| Schema | Onde |
|--------|------|
| `LegalService` + `ProfessionalService` | `buildHomeSchema()` |
| `WebSite` + `SearchAction` | Home |
| `Person` (Dr. Elilon) | Home |
| `BlogPosting` | `BlogPostDetail` |
| `BreadcrumbList` | `BlogPostDetail` |
| `FAQPage` | `buildFaqSchema()` — util pronto para landings |

---

## 4. Arquivos modificados

### Novos
- `utils/seo.ts`
- `components/BrandLogo.tsx`
- `components/LazyBrazilMap.tsx`
- `public/.htaccess`
- `docs/RELATORIO-LIGHTHOUSE-OTIMIZACAO.md`

### Modificados
- `vite.config.ts`
- `index.html`
- `index.css`
- `tailwind.config.js`
- `App.tsx`
- `components/SEO.tsx`
- `components/OptimizedImage.tsx`
- `components/LazyYouTube.tsx`
- `components/MetaPixel.tsx`
- `components/Components.tsx`
- `components/Navbar.tsx`
- `components/Layout.tsx`
- `pages/Home.tsx`
- `pages/BlogPostDetail.tsx`
- `public/llms.txt`
- `public/llms-full.txt`
- `public/robots.txt`

---

## 5. Deploy e validação

```bash
npm run build
# Enviar dist/ completo + public/.htaccess
# Limpar JS antigos em assets/js/ no servidor
```

### Checklist Lighthouse pós-deploy

- [ ] Home mobile — Performance ≥ 95
- [ ] Home desktop — Performance ≥ 98
- [ ] Accessibility ≥ 95 (botões nomeados, contraste, touch 48px)
- [ ] SEO = 100
- [ ] Best Practices = 100
- [ ] Navegação Agêntica 3/3
- [ ] `https://elilonlopesadvogados.com.br/llms.txt` acessível
- [ ] LCP < 2 s na Home

### Pendências opcionais (não alteram visual)

- Comprimir `logo-nova.png` ou gerar `logo-nova.webp` para landings BPC/IR que ainda referenciam PNG
- Vídeos MP4 das landings (21–28 MB) — considerar `preload="none"` ou poster estático (impacto só em `/bpc` e `/isencao-ir`)
- Remover `react-tooltip` do `package.json` (não usado no frontend)

---

## 6. Decisões técnicas documentadas

1. **Logo elilon.webp vs logo-nova.png:** Navbar já exibe texto "ELILON LOPES ADVOGADOS"; o ícone EL em WebP mantém identidade com 99,5% menos bytes.
2. **Maps lazy:** Seção "Atuação Nacional" está abaixo da dobra — split não afeta UX.
3. **YouTube hqdefault:** Com opacity 40% no hero, qualidade visual equivalente; iframe só após idle.
4. **MetaPixel idle:** Marketing preservado; PageView dispara após interação ociosa.
5. **Fontes reduzidas:** Removidos pesos 300 e 700 não essenciais — menos KB sem mudar tipografia percebida.
