# Relatório Sprint 3.8 — Meta Pixel: Tracking de Conversões Reais
**Data:** 2026-06-17  
**Status:** ✅ Concluído  
**Pixel ID:** `2447345122366584`

---

## Fase 1 — Auditoria do Pixel (pré-Sprint)

### Localização e configuração

| Item | Situação pré-Sprint 3.8 |
|---|---|
| Arquivo de carregamento | `components/MetaPixel.tsx` |
| Pixel ID | `2447345122366584` |
| Inicialização | `fbq("init", PIXEL_ID)` no `useEffect` inicial |
| `PageView` automático | ✅ Em toda troca de rota via `useLocation` |
| Evento `Lead` | ❌ **Ausente em todos os formulários** |
| Evento `CompleteRegistration` | ❌ **Ausente** |
| `fbq` espalhados no projeto | `utils/pixel.ts`, `SocialProof.tsx` (BPC/IR), `BPCLandingPage.tsx`, `IRLandingPage.tsx` |
| Duplicidades | ❌ Nenhuma duplicidade detectada |

### Eventos pré-Sprint (apenas `Contact` e `PageView`)

| Evento | Onde | Parâmetros |
|---|---|---|
| `PageView` | Toda rota | — |
| `Contact` | `openWhatsApp()` via `pixel.ts` | `content_name`, `content_category`, `status` |
| `Contact` | `SocialProof.tsx` BPC + IR | sem parâmetros |
| `Contact` | `BPCLandingPage.tsx` floating | sem parâmetros |
| `Contact` | `IRLandingPage.tsx` floating | sem parâmetros |

---

## Fase 2 — Utilitário Centralizado

### Arquivo criado: `utils/tracking.ts`

Todas as chamadas a `window.fbq` para eventos de lead passam agora por este arquivo.

#### Funções exportadas

| Função | Evento Meta | Canal | Quando disparar |
|---|---|---|---|
| `trackLead(source)` | `Lead` | Formulário principal | Após `response.ok` do `POST /api/leads` |
| `trackLandingLead(source)` | `Lead` | LP BPC / LP IR | Após `res.ok` do `POST /api/leads`, antes de `openWhatsApp()` |
| `trackDiagnostico({source, risk_level, score})` | `Lead` | Diagnóstico Tributário | Após `res.ok` do `POST /api/diagnostico` |
| `trackChatLead({area, subarea})` | `Lead` | Chat Jurídico | Após `result.success && result.protocolo` |
| `trackNewsletter()` | `CompleteRegistration` | Newsletter Blog | Após `response.ok` do `POST /api/leads` |
| `trackWhatsAppClick(label)` | `Contact` | Todos (compatibilidade) | Clique em botão WhatsApp |

#### Refatoração de `utils/pixel.ts`

```ts
// Sprint 3.8: delegado ao utilitário central de tracking
export { trackWhatsAppClick } from "./tracking";
```

Todos os importadores existentes de `pixel.ts` continuam funcionando sem alteração.

---

## Fase 3 — Eventos Implementados por Canal

### 3.1 Formulário Principal (`source = site`)

**Arquivo:** `components/Components.tsx` — `ContactForm`

**Mudanças:**
- Import de `trackLead` no topo do arquivo
- `trackLead(source)` chamado **após** `response.ok`
- UTMs (`utm_source`, `utm_medium`, `utm_campaign`) capturados da URL e enviados ao backend (fix PC-2 da auditoria)

**Parâmetros do evento:**
```js
fbq("track", "Lead", {
  content_name: "General",   // ou source passado via prop
  content_category: "lead_juridico"
})
```

**Garantia anti-duplicidade:** evento só dispara dentro do bloco `if (!response.ok) throw` — nunca no `catch`.

---

### 3.2 Landing BPC (`source = landing_bpc`)

**Arquivo:** `components/lp/shared/LandingCapture.tsx`

**Mudanças:**
- Import de `trackLandingLead`
- `const res = await fetch(...)` — captura o objeto `Response`
- `persisted = res.ok` — flag booleana
- No `finally`: `if (persisted) trackLandingLead(source)` → então `openWhatsApp()`

**Ordem de execução:**
```
POST /api/leads
  └─► res.ok = true
        └─► trackLandingLead("landing_bpc")   ← Lead
              └─► openWhatsApp("bpc_hero_cta") ← Contact
```

**Parâmetros do evento:**
```js
fbq("track", "Lead", {
  content_name: "landing_bpc",
  content_category: "lead_landing_page"
})
```

---

### 3.3 Landing IR (`source = landing_ir`)

**Arquivo:** `components/lp/shared/LandingCapture.tsx` (mesmo componente)

Implementação idêntica à BPC pelo `source` prop. Parâmetros:
```js
fbq("track", "Lead", {
  content_name: "landing_ir",
  content_category: "lead_landing_page"
})
```

---

### 3.4 Diagnóstico Tributário

**Arquivo:** `pages/DiagnosticoTributario.tsx`

**Mudanças:**
- Import de `trackDiagnostico`
- `const res = await fetch(...)` em vez de `await fetch(...)`
- `if (res.ok) { trackDiagnostico({...}) }`

**Parâmetros do evento:**
```js
fbq("track", "Lead", {
  content_name: "diagnostico_tributario",
  content_category: "lead_diagnostico",
  risk_level: "alto" | "medio" | "baixo",
  score: 0-100
})
```

**Dado extra:** `risk_level` e `score` permitem segmentar audiências no Meta por nível de urgência.

---

### 3.5 Chat Jurídico

**Arquivo:** `src/modules/chat/presentation/components/ChatWidget/ChatWidget.tsx`

**Mudanças:**
- Import de `trackChatLead` (caminho: `../../../../../../utils/tracking`)
- Evento disparado **apenas** dentro de `if (result.success && result.protocolo)`, antes do upload de documentos

**Parâmetros do evento:**
```js
fbq("track", "Lead", {
  content_name: "chat_juridico",
  content_category: "lead_chat",
  area: "Direito Tributário",      // preenchido pelo contexto FSM
  subarea: "Reforma Tributária"    // idem
})
```

**Ponto importante:** o evento não dispara em erro de persistência — garante qualidade do sinal enviado ao Meta.

---

### 3.6 Newsletter Blog

**Arquivo:** `pages/BlogPostDetail.tsx` — `NewsletterWidget`

**Mudanças:**
- Import de `trackNewsletter`
- `trackNewsletter()` chamado **antes** de `setStatus("ok")`, apenas no bloco `try` (nunca no `catch`)

**Parâmetros do evento:**
```js
fbq("track", "CompleteRegistration", {
  content_name: "blog_newsletter",
  content_category: "newsletter"
})
```

---

## Fase 4 — Mapa de Eventos Pós-Sprint

```
USUÁRIO                             META PIXEL
   │                                    │
   ├── Visita qualquer página           ├── PageView ✅
   │                                    │
   ├── Clica WhatsApp (qualquer botão)  ├── Contact ✅
   │                                    │
   ├── Formulário principal (submit OK) ├── Lead { source: "General" } ✅ NOVO
   │                                    │
   ├── LP BPC (form submit OK)          ├── Lead { source: "landing_bpc" } ✅ NOVO
   │   └── abre WhatsApp                └── Contact ✅
   │                                    │
   ├── LP IR (form submit OK)           ├── Lead { source: "landing_ir" } ✅ NOVO
   │   └── abre WhatsApp                └── Contact ✅
   │                                    │
   ├── Diagnóstico (form submit OK)     ├── Lead { source: "diagnostico_tributario",
   │                                    │         risk_level, score } ✅ NOVO
   │                                    │
   ├── Chat (protocolo gerado)          ├── Lead { source: "chat_juridico",
   │                                    │         area, subarea } ✅ NOVO
   │                                    │
   └── Newsletter (e-mail cadastrado)   └── CompleteRegistration ✅ NOVO
```

---

## Validação — Checklist Meta Pixel Helper

| Canal | Evento | Condicional | Parâmetros | Status |
|---|---|---|---|---|
| Formulário principal | `Lead` | `response.ok` | `content_name`, `content_category` | ✅ Implementado |
| LP BPC | `Lead` | `res.ok` | `content_name`, `content_category` | ✅ Implementado |
| LP IR | `Lead` | `res.ok` | `content_name`, `content_category` | ✅ Implementado |
| Diagnóstico | `Lead` | `res.ok` | `+ risk_level, score` | ✅ Implementado |
| Chat Jurídico | `Lead` | `result.success && result.protocolo` | `+ area, subarea` | ✅ Implementado |
| Newsletter | `CompleteRegistration` | `try` (não `catch`) | `content_name`, `content_category` | ✅ Implementado |
| Cliques WhatsApp | `Contact` | clique | `content_name`, `status` | ✅ Já existia |
| Navegação | `PageView` | troca de rota | — | ✅ Já existia |

### Garantias anti-duplicidade
- Cada evento disparado uma única vez por submit
- Eventos de `Lead` nunca estão em `finally` — apenas em bloco condicional de sucesso
- `CompleteRegistration` (newsletter) está no `try`, não no `finally`
- `Contact` do `openWhatsApp` é separado do `Lead` — representam ações distintas

### Sem erros JS
- Todos os `fire()` têm guard `typeof window === "undefined" || !window.fbq`
- SSR-safe: sem acesso direto a `window.fbq` nos componentes
- TypeScript: `window.fbq` tipado em `declare global` no `tracking.ts`

---

## Resumo de Arquivos Modificados

| Arquivo | Tipo | Mudança |
|---|---|---|
| `utils/tracking.ts` | **NOVO** | Utilitário central — 6 funções de evento |
| `utils/pixel.ts` | Refatorado | Re-exporta `trackWhatsAppClick` de `tracking.ts` |
| `components/Components.tsx` | Modificado | `trackLead` + captura UTMs no `ContactForm` |
| `components/lp/shared/LandingCapture.tsx` | Modificado | `trackLandingLead` condicional em `persisted` |
| `pages/DiagnosticoTributario.tsx` | Modificado | `trackDiagnostico` com `risk_level` e `score` |
| `src/.../ChatWidget/ChatWidget.tsx` | Modificado | `trackChatLead` após protocolo gerado |
| `pages/BlogPostDetail.tsx` | Modificado | `trackNewsletter` no `NewsletterWidget` |

---

## Recomendações Futuras

### Alta prioridade

1. **Conversões de API (Server-Side Events)**  
   Implementar Meta Conversions API via backend após cada INSERT bem-sucedido.  
   Benefício: dados de conversão persistem mesmo com bloqueadores de anúncio.  
   Endpoint: `POST https://graph.facebook.com/v19.0/{pixel_id}/events`

2. **`fbq("track", "Lead")` nos botões WhatsApp direto restantes**  
   `SocialProof.tsx` (BPC/IR), `BPCLandingPage.tsx` floating, `DiagnosticoTributario.tsx` links pós-quiz  
   → Converter para `openWhatsApp()` para usar o `trackWhatsAppClick` centralizado (PC-5 a PC-10 da auditoria)

3. **Google Analytics 4**  
   Instalar GA4 + GTM para complementar: scroll depth nas LPs, taxa de abandono do chat, funil do quiz.

### Média prioridade

4. **Audiences de remarketing por `content_name`**  
   Criar audiências personalizadas no Meta com:
   - `content_name = "landing_bpc"` → Remarketing BPC
   - `content_name = "diagnostico_tributario"` + `risk_level = "alto"` → Alta intenção tributária
   - `content_name = "chat_juridico"` → Leads mais qualificados

5. **Valor monetário no evento `Lead`**  
   Adicionar `value` estimado por canal (ex: leads de diagnóstico com risco alto = valor maior):
   ```js
   fbq("track", "Lead", { ..., currency: "BRL", value: 500 })
   ```

6. **Event deduplication ID**  
   Adicionar `eventID` único em cada `fbq()` para evitar duplicação com a futura Conversions API:
   ```js
   fbq("track", "Lead", params, { eventID: `lead_${Date.now()}_${Math.random()}` })
   ```
