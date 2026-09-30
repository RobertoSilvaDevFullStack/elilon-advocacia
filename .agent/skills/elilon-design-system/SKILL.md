---
name: elilon-design-system
description: Design system, visual identity, accessibility (WCAG), and UI patterns for Elilon Lopes Advogados. Use when creating or reviewing pages, components, layouts, typography, color palettes, and avoiding generic SaaS templates.
---

# Elilon Design System & UI/UX Guidelines

## Overview
Esta Skill documenta os padrões canônicos de identidade visual, design tokens, acessibilidade e princípios estéticos de interface do escritório **Elilon Lopes Advogados**. Deve ser ativada sempre que páginas, componentes ou fluxos de conversão forem desenvolvidos, revisados ou refatorados.

---

## 1. Fatos Reais do Projeto (Current Project Facts)

Os tokens visuais do projeto estão declarados no arquivo [`tailwind.config.js`](file:///F:/PROJETOS/elilon-advocacia/tailwind.config.js) e [`index.css`](file:///F:/PROJETOS/elilon-advocacia/index.css):

### Paleta de Cores Institucional
O escritório adota uma identidade de autoridade e seriedade jurídica fundamentada em tons de **Vinho**, **Preto**, **Vermelho** e **Off-white**:

- **Vinho (Tom escuro de vermelho - cor de profundidade e sobriedade):**
  - `vinho-50`: `#F9E8EA`
  - `vinho-100`: `#F3D1D5`
  - `vinho-500`: `#A1333E` *(Vinho principal do escritório)*
  - `vinho-600`: `#812932`
  - `vinho-700`: `#611F25`
  - `vinho-900`: `#200A0C`
- **Vermelho (Tom vibrante para CTAs e conversão de urgência jurídica):**
  - `vermelho-500`: `#F51919`
  - `vermelho-600`: `#C41414` *(Base de botões principais)*
  - `vermelho-700`: `#930F0F`
- **Preto da Marca (Elegância e autoridade):**
  - `preto-400`: `#333333`
  - `preto-500`: `#1A1A1A` *(Preto primário / background institucional)*
  - `preto-600`: `#151515`
  - `preto-900`: `#000000`
- **Neutros & Fundos:**
  - `neutral-50`: `#F5F5F0` *(Off-white / Bege institucional)*
  - `neutral-100`: `#E8E8E0`
  - `body-bg`: `#fdfdfd` (fundo limpo de leitura para desktop e mobile)
- **WhatsApp Oficial:**
  - `bg-[#25D366]` / `hover:bg-[#20bd5a]` (verde canônico do WhatsApp).

### Tipografia Oficial
- **Títulos e Headings (`fontFamily.headline`):** `'Cabin', sans-serif` — tipografia formal, geométrica e com excelente legibilidade jurídica.
- **Corpo de Texto (`fontFamily.sans`):** `'Montserrat', sans-serif` — proporções equilibradas para leitura contínua de teses e diagnósticos.

### Padrão dos Botões de Ação (CTAs)
- **CTA Primário institucional:**
  ```tsx
  className="bg-gradient-to-r from-[#C41414] to-[#F51919] text-white font-semibold uppercase tracking-wider hover:shadow-lg hover:shadow-red-500/40 transition-shadow"
  ```
- **CTA Flutuante WhatsApp:**
  ```tsx
  className="bg-[#25D366] text-white font-semibold rounded-full hover:bg-[#20bd5a] transition-all shadow-lg shadow-green-500/30"
  ```

---

## 2. Proibições Rígidas (Design Guidelines)

### A. The Purple Ban (Proibição Absoluta de Tons Roxos/Violetas)
> 🔴 **REGRA ZERO:** É terminantemente proibido utilizar tons de roxo, violeta, índigo, lavanda ou púrpura (`violet-*`, `purple-*`, `indigo-*`, etc.). A advocacia corporativa e bancária do Elilon não transmite seriedade com a paleta neon/púrpura comum em startups de tecnologia. Toda a autoridade visual do escritório reside no **Vinho + Preto + Off-White + Vermelho**.

### B. Anti-Cliché: Proibição do "SaaS Safe Harbor"
- **NÃO** utilize o template genérico de startups: Hero centralizado trivial com gradiente radial borrado roxo ao fundo seguido por 3 cards idênticos flutuantes.
- **NÃO** utilize ilustrações estilo "undraw" ou "corporate Memphis" com bonecos de pernas desproporcionais.
- Utilize imagens de escritório real, advogados de terno, prédios corporativos sóbrios, texturas de documentos e mapas de tribunais/bancários.

---

## 3. Diretrizes de Acessibilidade & WCAG 2.1 AA

Todo componente desenvolvido para o Elilon deve assegurar conformidade com as metas de acessibilidade:
1. **Contraste Mínimo:**
   - Texto padrão: mínimo `4.5:1` em relação ao fundo.
   - Texto grande (18pt+ ou 14pt negrito): mínimo `3.0:1`.
   - Elementos de interface e botões: mínimo `3.0:1` contra fundos adjacentes.
2. **Área de Toque Mobile:**
   - Todo botão, link ou elemento acionável por toque em dispositivos móveis deve ter dimensão mínima de `44x44px` (ou `min-h-[44px]` com padding compensatório).
3. **Redução de Movimento:**
   - Respeitar `@media (prefers-reduced-motion: reduce)` evitando transições longas ou animações pulsantes para usuários sensíveis.
4. **Semântica HTML:**
   - Estrutura clara: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
   - Um único `<h1>` por página, com hierarquia sequencial de títulos (`<h2>`, `<h3>`).

---

## 4. Padrões de Layout e Componentes do Elilon

1. **Card de Área de Atuação / Tese Jurídica:**
   - Fundo neutro limpo (`bg-white` ou `bg-neutral-50`), bordas sutis em `border-neutral-200`, elevação suave `shadow-sm hover:shadow-md`, acentuação em vinho/vermelho no hover.
2. **Selo de Confiança e Prova Social:**
   - Inclusão de referências de atuação, inscrição da OAB, tempo de atuação em direito bancário e números de processos ou clientes atendidos.
3. **Formulários de Contato e Diagnóstico:**
   - Labels explícitos, campos com altura ergonômica (`min-h-[44px]`), estados de foco bem definidos com anéis visíveis (`focus:ring-2 focus:ring-vinho-500`), mensagens de validação acessíveis.
