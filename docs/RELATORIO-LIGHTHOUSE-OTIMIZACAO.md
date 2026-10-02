# Relatório — Otimização Lighthouse, SEO Técnico e Navegação Agêntica

**Data:** 22/06/2026 (Sprint v2 — causas raiz)  
**Escopo:** Performance, Acessibilidade, Best Practices, SEO e AI SEO (llms.txt)  
**Restrição:** Identidade visual preservada — nenhuma alteração de design.

**Validação local:** `npm run build && npm run preview` + Lighthouse 13 mobile (`lighthouse-home-mobile-v3.json`)

---

## 1. Metas Lighthouse — RESULTADO MEDIDO

| Categoria | Meta | Antes | Depois (v3) | Status |
|-----------|------|-------|-------------|--------|
| Performance Mobile | ≥ 95 | **68** | **95** | ✅ Resolvido |
| Accessibility | ≥ 95 | ~90 | **100** | ✅ Resolvido |
| Best Practices | 100 | ~90 | **100** | ✅ Resolvido |
| SEO | 100 | ~95 | **100** | ✅ Resolvido |

### Core Web Vitals (mobile, CPU 4×)

| Métrica | Antes | Depois | Status |
|---------|-------|--------|--------|
| **LCP** | ~4.0 s (i.ytimg.com) | **2.6 s** (hero local 800w) | ⚠️ Score 87 — abaixo de 2.0 s ideal, mas Performance 95 |
| **FCP** | ~2.6 s | **1.6 s** | ✅ |
| **TBT** | ~3000 ms main thread | **10 ms** | ✅ |
| **CLS** | ~0.05 | **0.057** | ✅ |
| **Speed Index** | ~2.6 s | **2.2 s** | ✅ |

---

## 2. Tabela — Problema Lighthouse → Arquivo → Correção

| Problema Lighthouse | Arquivo responsável | Correção | Status |
|---------------------|---------------------|----------|--------|
| LCP ~4 s (i.ytimg.com) | `pages/Home.tsx` + `LazyYouTube` | `HomeHero.tsx` com imagem local; YouTube só após 8 s | ✅ |
| LCP render delay (SPA) | `index.html` + `index.tsx` | Shell estático `#static-hero` pinta antes do React | ✅ |
| ~601 KB JS não utilizado | `pages/Home.tsx` → `Components.tsx` | Imports leves (`ui/Button`, `constants/areas`); Navbar → `constants/nav.ts` | ✅ |
| BLOG_POSTS no bundle crítico | `components/Navbar.tsx` → `constants.ts` | `constants/nav.ts` isolado | ✅ |
| Render-blocking Google Fonts | `index.html` | `@fontsource` self-hosted; fontes defer via `requestIdleCallback` | ✅ |
| Render-blocking CSS (910 ms) | `index.css` + fontes | CSS chat movido; subset `latin`; shell estático | ✅ Mitigado (150 ms residual) |
| Unused CSS ~80 KB | `index.css` | Chat CSS → `styles/chat.css` (só chat); purge Tailwind | ✅ (~19 KiB residual) |
| Forced reflow / carrosséis JS | `pages/Home.tsx` | `MobileSnapCarousel` CSS scroll-snap; removidos `setInterval` | ✅ |
| Main thread 3 s | `pages/Home.tsx`, vendors | Lazy map/blog/popup/pixel; sem `isMobile` listeners | ✅ |
| Long tasks | `MetaPixel`, maps | Pixel após interação; `maps-vendor` só no viewport | ✅ |
| Non-composited animations | `components/Navbar.tsx` | Removido `animate-pulse-subtle` / `scale-105` no CTA | ✅ |
| Legacy JavaScript | `vite.config.ts` | `build.target: 'es2020'` | ✅ |
| Inefficient cache | `public/.htaccess` | `max-age=31536000, immutable` para assets hash | ✅ (produção Apache) |
| Image delivery | Hero, portraits | `ambiente-*-800.webp` (21 KB); WebP em `MobilePortraitImage` | ✅ (64 KiB residual) |
| ARIA inválido `role=geography` | `components/BrazilMap.tsx` | `role="presentation"` + `aria-hidden` nos paths | ✅ |
| Image aspect ratio | `pages/Home.tsx` | Dimensões 853×1280 + WebP no desktop | ✅ |
| Touch targets | `components/Layout.tsx` | Social links 48×48 px | ✅ |
| Third-party cookies (Pixel) | `components/MetaPixel.tsx` | Carrega só após scroll/click (fallback 12 s) | ✅ |
| Network dependency tree | Fontes + CSS chain | Fontes defer; preload hero | ⚠️ Insight informativo |
| `label-content-name-mismatch` | Chat widget (lazy) | Não carrega na Home inicial | ⚠️ Insight (chat off-path) |

---

## 3. Bundle Analyzer — Antes vs Depois

| Arquivo | Antes | Depois | Δ |
|---------|-------|--------|---|
| `Home-*.js` | ~20 KB (gzip 6.4 KB) + maps inline | **19 KB** (gzip **5.3 KB**) | −17% |
| `index-*.js` | ~25 KB (gzip 8.8 KB) | **22 KB** (gzip **6.7 KB**) | −24% |
| `constants-*.js` (Navbar) | **8.5 KB** no path crítico | **0** (removido) | −100% |
| `index-*.css` | 78 KB (gzip 12.7 KB) | **76 KB** (gzip **9.9 KB**) | −22% gzip |
| `maps-vendor` | Eager na Home | **Lazy** (viewport) | Fora do critical path |
| `MetaPixel` | Eager | **1 KB** lazy + interação | Fora do critical path |
| `react-vendor` | 137 KB (gzip 44 KB) | 137 KB (gzip 44 KB) | Inalterado (framework) |
| **Unused JS (Lighthouse)** | ~601 KB | **0 KB reportado** | ✅ |

Visualização: `dist/stats.html` (rollup-plugin-visualizer)

---

## 4. Tamanho dos chunks (gzip) — Home critical path

| Chunk | Antes (gzip) | Depois (gzip) |
|-------|--------------|---------------|
| `index-*.js` | 8.83 KB | **6.69 KB** |
| `Home-*.js` | 6.43 KB | **5.29 KB** |
| `Layout-*.js` | 3.86 KB | **3.46 KB** |
| `react-vendor` | 44.27 KB | 44.27 KB |
| `router-vendor` | 13.27 KB | **11.76 KB** |
| `ui-vendor` | 6.99 KB | 6.10 KB |
| `index-*.css` | 12.67 KB | **9.92 KB** |
| **Total crítico ~** | **~98 KB** | **~87 KB** |

---

## 5. Imagens — Hero e críticas

| Imagem | Peso antes | Peso otimizado | Formato | Economia |
|--------|------------|----------------|---------|----------|
| Hero LCP (mobile) | 56 KB (1920w webp) | **21 KB** (800w) | WebP | **62%** |
| Hero LCP (fonte) | i.ytimg.com ~150 KB | 0 (defer 8 s) | — | **100%** na carga |
| `elilon-sorrindo` mobile | 157 KB JPG | 68 KB WebP | WebP | **57%** |
| `logo-elilon` | 1 MB PNG antigo | 5 KB | WebP | **99.5%** |

---

## 6. Sprint v2 — Causas raiz corrigidas

### Novos arquivos
- `components/HomeHero.tsx` — LCP local responsivo
- `components/ui/Button.tsx`, `components/ui/SectionTitle.tsx`
- `constants/areas.ts`, `constants/nav.ts`
- `styles/fonts.css`, `styles/chat.css`
- `hooks/useInView.ts`
- `public/images/ambiente-fotorrealista-advogado-800.webp`

### Alterações-chave
- `index.html` — shell estático LCP + preload hero 800w
- `index.tsx` — fontes defer; remove `#static-hero` após mount
- `pages/Home.tsx` — sem `Components.tsx`; carrosséis CSS; blog defer
- `hooks/useBlogPosts.ts` — fetch só no viewport
- `components/LazyBrazilMap.tsx` — IntersectionObserver antes do import
- `components/MetaPixel.tsx` — pixel após interação
- `App.tsx` — `DiagnosticoPopup` lazy
- `vite.config.ts` — `es2020`, visualizer, Brotli

---

## 7. Por que cada alteração melhora o Lighthouse

1. **Shell estático no HTML** — LCP não espera parse/exec do React (element render delay 314 ms → eliminado).
2. **Hero 800w WebP** — 21 KB vs 56 KB; adequado ao viewport mobile 412 px.
3. **Navbar → `constants/nav.ts`** — Remove `BLOG_POSTS` + HTML de artigos do bundle do layout.
4. **Home → imports granulares** — `ContactForm` + `AREAS` pesados não entram no chunk Home.
5. **Fontes defer + latin subset** — CSS cai de 103 KB → 76 KB; sem request a `fonts.googleapis.com`.
6. **Chat CSS isolado** — ~3 KB de regras admin/chat fora do CSS global.
7. **Mapa no viewport** — `maps-vendor` (39 KB) só após scroll.
8. **Meta Pixel pós-interação** — Terceiros fora do TBT inicial.
9. **Carrosséis CSS snap** — Sem `setInterval`, sem forced reflow.
10. **ARIA no mapa** — `role="geography"` inválido removido → Accessibility 100.

---

## 8. Arquivos modificados (Sprint v2)

`index.html`, `index.tsx`, `index.css`, `App.tsx`, `vite.config.ts`, `package.json`,  
`pages/Home.tsx`, `hooks/useBlogPosts.ts`, `constants.ts`, `constants/areas.ts`, `constants/nav.ts`,  
`components/HomeHero.tsx`, `components/Components.tsx`, `components/OptimizedImage.tsx`,  
`components/LazyBrazilMap.tsx`, `components/BrazilMap.tsx`, `components/MetaPixel.tsx`,  
`components/MobilePortraitImage.tsx`, `components/Navbar.tsx`, `components/Layout.tsx`,  
`components/ui/Button.tsx`, `components/ui/SectionTitle.tsx`,  
`styles/fonts.css`, `styles/chat.css`, `hooks/useInView.ts`,  
`src/modules/chat/.../ChatWidget.tsx`,  
`public/images/ambiente-fotorrealista-advogado-800.webp`,  
`lighthouse-home-mobile-v3.json`, `dist/stats.html`

---

## 9. Deploy e validação

```bash
npm run build
# Enviar dist/ + public/.htaccess
# Garantir .htaccess ativo no Apache (cache 1 ano)
```

### Checklist pós-deploy

- [x] Home mobile — Performance **95** (local)
- [x] Accessibility **100**
- [x] Best Practices **100**
- [x] SEO **100**
- [ ] LCP < 2.0 s em produção (atual 2.6 s local — CDN + HTTP/2 podem melhorar)
- [ ] Confirmar cache headers no servidor real

### Pendências menores (não bloqueiam score 95)

- `render-blocking-insight` residual ~150 ms (CSS Tailwind único — aceitável)
- `image-delivery-insight` residual ~64 KiB (imagens de áreas abaixo da dobra)
- Vídeos MP4 das landings BPC/IR (21–28 MB) — impacto só em `/bpc` e `/isencao-ir`

---

## Histórico — Sprint v1 (24/06/2026)

<details>
<summary>Relatório original Sprint v1</summary>

### Metas Lighthouse (v1)

| Categoria | Meta | Status esperado pós-deploy |
|-----------|------|--------------------------|
| Performance Mobile | ≥ 95 | Melhoria significativa — validar após deploy |

### Bundle v1

| Chunk | Antes | Depois |
|-------|-------|--------|
| `Home-*.js` | ~31 KB gzip (com maps embutido) | **~6.4 KB gzip** + `BrazilMap` 3.7 KB lazy |

### Arquivos v1
- `utils/seo.ts`, `components/BrandLogo.tsx`, `components/LazyBrazilMap.tsx`, `public/.htaccess`

</details>
