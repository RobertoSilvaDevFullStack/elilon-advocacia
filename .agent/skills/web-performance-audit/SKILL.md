---
name: web-performance-audit
description: Analisa a performance web do projeto, verificando otimizações de build, carregamento de assets, Core Web Vitals (estático) e boas práticas de React/Vite.
---

# Web Performance Audit Skill

Para realizar uma auditoria completa de performance web, siga estas etapas:

## 1. Análise de Build e Configuração (Vite/Webpack)

### Bundle Size & Splitting

- Verifique a configuração de `manualChunks` no `vite.config.ts`.
- Analise se bibliotecas grandes (React, Lodash, UI libs) estão em vendors separados.
- Verifique se a minificação está ativa (Terser/ESBuild).
- Confirme se o Code Splitting está ocorrendo para rotas (dynamic imports).

### Configurações de Deploy

- Verifique configurações de compressão (Gzip/Brotli) se houver plugin.
- Analise headers de cache (Cache-Control) em arquivos de configuração de deploy (ex: `vercel.json`, `netlify.toml`, `railway.json`).

## 2. Otimização de Assets

### Imagens

- Confirme o uso de formatos modernos (WebP, AVIF).
- Verifique se imagens acima da dobra têm `fetchpriority="high"` ou `loading="eager"`.
- Verifique se imagens abaixo da dobra têm `loading="lazy"`.
- Confirme se as tags `img` possuem `width` e `height` explícitos (prevenção de CLS).

### Fontes

- Verifique uso de `font-display: swap`.
- Confirme precaching ou preconnect para domínios de fontes (ex: Google Fonts).
- Avalie se apenas os pesos/estilos necessários estão sendo carregados.

### Vídeos e Mídia

- Verifique uso de `preload="none"` ou Facades para vídeos (Lazy Load).
- Confirme muted/playsinline para autoplay.

## 3. Análise de Código React

### Code Splitting & Lazy Loading

- Verifique se as rotas principais usam `React.lazy` e `Suspense`.
- Analise componentes pesados (Mapas, Charts, Editores) carregados sob demanda.

### Renderização

- Identifique uso excessivo de re-renders (falta de `useMemo`/`useCallback` em objetos/funções passados como props).
- Verifique listas grandes sem virtualização (ex: `react-window`).

### Scripts de Terceiros

- Verifique se scripts de Analytics/Chat estão carregados com `async`, `defer` ou via Web Worker (Partytown).

## 4. Core Web Vitals (Análise Estática)

### LCP (Largest Contentful Paint)

- O elemento principal (Hero Image/H1) está otimizado?
- A imagem LCP está sendo pré-carregada (`<link rel="preload">`)?

### CLS (Cumulative Layout Shift)

- Elementos dinâmicos têm altura reservada (skeletons ou min-height)?
- Fontes causam layout shift (FOUT/FOIT)?

### INP (Interaction to Next Paint) / FID

- O bundle JS principal é muito grande (> 200KB compactado)?
- Há tarefas longas no thread principal bloqueando a hidratação?

---

## Formato do Relatório Final

Ao concluir, gere um relatório detalhado:

### 📊 Score de Performance Estimado (0-100)

Baseado nas boas práticas encontradas.

### ✅ Otimizações Já Implementadas

Liste o que o projeto já faz bem (ex: usa Vite, minificação ativa, WebP).

### 🔴 Problemas Críticos (Alto Impacto)

Boas práticas ausentes que causam grande impacto (ex: Imagens gigantes sem lazy load, bundle monolítico).

### ⚠️ Oportunidades de Melhoria (Médio Impacto)

Ajustes finos (ex: `font-display`, `preload` específico).

### 🎯 Plano de Ação

Passos concretos para resolver os problemas encontrados.
