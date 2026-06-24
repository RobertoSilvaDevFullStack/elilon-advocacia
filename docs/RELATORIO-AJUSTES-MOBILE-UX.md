# Relatório — Ajustes Mobile UX e Correções na Home

**Data:** 22/06/2026  
**Escopo:** Versão mobile do site institucional — layout, carrosséis, mapa, blog, menu e SEO.

---

## 1. Resumo executivo

Ajustes solicitados após revisão mobile da home e páginas internas. Foco em melhor uso do espaço vertical, destaque de conteúdo e correção de bugs visuais.

| # | Item | Status |
|---|------|--------|
| 1 | Foto do Elilon circular ao lado do texto (Home — Sobre Nós) | ✅ |
| 2 | Mapa do Brasil sumindo no hover/clique | ✅ |
| 3 | Imagem quebrada no artigo de Previdenciário | ✅ |
| 4 | Home blog: todos os artigos + badge "Novo" no mais recente | ✅ |
| 5 | Cards em slide/swipe no mobile (Sobre, Soluções, Áreas) | ✅ |
| 6 | Foto circular ao lado do texto (Soluções — Por que somos diferentes?) | ✅ |
| 7 | Blog `/blog`: grid 2 colunas no mobile | ✅ |
| 8 | CTA Diagnóstico Tributário no header mobile recolhido | ✅ |
| 9 | `llms.txt` / `robots.txt` — verificação e link no HTML | ✅ |

**Páginas não alteradas (conforme pedido):** Pensamento Inovador, Depoimentos, Profissionais.

---

## 2. Detalhamento técnico

### 2.1 Home — Sobre Nós (Tradição e Modernidade)

**Comportamento mobile:**
- Título e subtítulo permanecem em largura total.
- Foto circular do sócio (`/images/elilon-sorrindo.JPG`) com `layout="float"`: flutua à **esquerda**, tamanho ~112–128px, foco no rosto (`object-position: center 15%`).
- Parágrafos fluem ao lado e abaixo da imagem; botão "Saiba Mais" com `clear-both` para não sobrepor a foto.
- Coluna com foto retangular lateral permanece **apenas no desktop** (`hidden md:block`).

**Componente:** `components/MobilePortraitImage.tsx`  
**Prop `layout`:** `"center"` (acima) ou `"float"` (ao lado do texto).

### 2.2 Mapa do Brasil (`components/BrazilMap.tsx`)

**Problema:** Ao passar o mouse ou clicar no mapa, os estados sumiam; era necessário clicar em reset.

**Causa provável:**
- `ZoomableGroup` permitia pan — arrastar deslocava o `center` para fora da área visível.
- Estilo `hover` com `filter: drop-shadow` no SVG causava falhas de renderização em alguns navegadores.

**Correção:**
- `disablePanning` no `ZoomableGroup` (zoom apenas pelos botões +/−).
- Hover dos estados simplificado (apenas `fill`, sem `filter`).

### 2.3 Blog — imagem quebrada

**Problema:** Card "Aposentadoria por Idade" sem imagem.

**Causa:** Caminho incorreto em `constants.ts` — `/images/previdenciario.webp` (arquivo inexistente).

**Correção:** `/images/direito-previdenciario.webp`.

> Os artigos da home vêm de `BLOG_POSTS` em `constants.ts`, não da API. A página `/blog` usa a API `/posts`.

### 2.4 Home — seção Notícias e Artigos

- Carrossel mobile exibe **todos** os artigos (antes limitado a 3).
- Indicadores dinâmicos conforme quantidade de posts.
- Artigo mais recente (primeiro após ordenação por data) recebe badge **"Novo"**.
- Desktop: grid com todos os artigos (não mais `slice(0, 3)`).

### 2.5 Carrosséis mobile (swipe horizontal)

**Componente:** `components/MobileSnapCarousel.tsx`  
Scroll horizontal com `snap-x snap-mandatory`; visível só abaixo de `md`.

| Página | Seção | Conteúdo |
|--------|--------|----------|
| `pages/About.tsx` | Nossos Valores | 6 cards de princípios |
| `pages/Solutions.tsx` | Metodologia | 4 passos (Diagnóstico → Resultado) |
| `pages/Areas.tsx` | Especialidades | Cards de áreas de atuação |

Desktop mantém grid original (`hidden md:grid`).

### 2.6 Soluções — Por que somos diferentes?

Mesmo padrão da home no mobile:
- Título em largura total.
- Foto circular (`elilon-firmina-focados.JPG`) flutuando à esquerda.
- Lista de diferenciais ao lado; CTA com `clear-both`.

### 2.7 Blog (`pages/Blog.tsx`)

- Mobile: `grid-cols-2` com cards compactos (imagem menor, tipografia reduzida, `line-clamp`).
- Tablet/desktop: 2–3 colunas conforme breakpoint.

### 2.8 Menu mobile — Diagnóstico Tributário

**Arquivo:** `components/Navbar.tsx`

Botão amarelo **"Diagnóstico"** visível no header recolhido (entre logo e hambúrguer), link para `/diagnostico-reforma-tributaria`. Complementa o pop-up e o CTA dentro do menu aberto.

### 2.9 SEO / descoberta por IAs

| Recurso | Status |
|---------|--------|
| `public/robots.txt` | ✅ Já existia — Allow `/`, Disallow `/admin`, Sitemap |
| `public/llms.txt` | ✅ Já existia — especialidades, serviços, URLs prioritárias |
| `public/llms-full.txt` | ✅ Versão estendida referenciada no llms.txt |
| `index.html` | ✅ Adicionado `<link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs" />` |

---

## 3. Arquivos alterados

### Novos
- `components/MobilePortraitImage.tsx`
- `components/MobileSnapCarousel.tsx`
- `docs/RELATORIO-AJUSTES-MOBILE-UX.md`

### Modificados
- `pages/Home.tsx`
- `pages/About.tsx`
- `pages/Solutions.tsx`
- `pages/Areas.tsx`
- `pages/Blog.tsx`
- `components/BrazilMap.tsx`
- `components/Navbar.tsx`
- `constants.ts`
- `index.html`

---

## 4. Deploy

```bash
npm run build
```

Enviar pasta `dist/` completa ao servidor (FileZilla). Limpar JS antigos em `assets/js/` se necessário para evitar cache de bundles anteriores.

---

## 5. Testes manuais sugeridos

- [ ] Home mobile: foto ao lado do texto em Sobre Nós
- [ ] Home: mapa permanece visível ao hover/clique nos estados
- [ ] Home: carrossel de blog com 4 artigos e badge "Novo"
- [ ] `/sobre`: swipe nos cards de valores
- [ ] `/sobre/entrega`: swipe na metodologia + foto ao lado em "Por que somos diferentes?"
- [ ] `/areas`: swipe nos cards
- [ ] `/blog`: grid 2 colunas no mobile
- [ ] Header mobile: botão "Diagnóstico" visível com menu fechado
- [ ] `https://dominio/llms.txt` e `robots.txt` acessíveis em produção
