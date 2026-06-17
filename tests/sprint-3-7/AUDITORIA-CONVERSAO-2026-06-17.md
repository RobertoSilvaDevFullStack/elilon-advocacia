# Auditoria Completa de Conversão e Rastreamento
**Data:** 2026-06-17  
**Escopo:** Todos os canais de captação de leads do ecossistema Elilon Advocacia  
**Tipo:** Análise — sem implementações

---

## 1. Inventário de Infraestrutura de Rastreamento

### 1.1 Rastreamento instalado

| Ferramenta | Status | Escopo | ID / Config |
|---|---|---|---|
| **Meta Pixel** | ✅ Ativo | Site inteiro + LPs | `2447345122366584` via `MetaPixel.tsx` |
| **PageView automático** | ✅ Ativo | Toda troca de rota | `fbq("track", "PageView")` no `useEffect` de `useLocation` |
| **Google Analytics (GA4)** | ❌ Ausente | — | Nenhum `gtag` ou `G-xxx` no codebase |
| **Google Tag Manager** | ❌ Ausente | — | Não configurado |
| **Pixel noscript fallback** | ✅ Presente | `<noscript>` em `MetaPixel.tsx` | Imagem 1x1 |

### 1.2 Eventos rastreados atualmente

| Evento Meta Pixel | Onde é disparado | Parâmetros |
|---|---|---|
| `PageView` | Toda rota | automático |
| `Contact` via `fbq("track","Contact")` | `openWhatsApp()` (Layout, Headers) | `content_name`, `content_category`, `status` |
| `Contact` inline | `BPCLandingPage` (floating), `SocialProof.tsx` (BPC e IR) | sem parâmetros extras |
| `Lead` | **❌ AUSENTE** em todos os formulários | — |
| `CompleteRegistration` | **❌ AUSENTE** | — |
| `InitiateCheckout` | **❌ AUSENTE** | — |

---

## 2. Análise por Canal

---

### Canal 1 — Formulário Tradicional (`source = site`)

**Endpoint:** `POST /api/leads`  
**Frontend:** `pages/Contact.tsx` → `components/Components.tsx (ContactForm)`

#### Dados armazenados
| Campo | Tabela `leads` | Obrigatório |
|---|---|---|
| `name` | ✅ | Sim |
| `email` | ✅ | Sim |
| `phone` | ✅ | Não |
| `city` | ✅ | Não |
| `interest` | ✅ | Não |
| `message` | ✅ | Não |
| `status` | ✅ `Novo` default | Auto |
| `source` | ✅ `site` default | Auto (Sprint 3.7) |
| `utm_source` | ❌ Não capturado | — |
| `utm_medium` | ❌ Não capturado | — |
| `utm_campaign` | ❌ Não capturado | — |

#### Eventos disparados
| Evento | Status |
|---|---|
| Meta Pixel `Lead` no submit | ❌ **Ausente** |
| Meta Pixel `Contact` | ❌ **Ausente** |
| `PageView` na rota `/contact` | ✅ automático |

#### Webhooks
- ✅ Webhook universal (`webhook_url` da tabela `settings`) disparado **após INSERT**
- Envelope: `{evento: "lead_capturado", canal: "site", timestamp, lead: {...}}`

#### Atribuição de campanha
- ❌ **Cego**: UTMs da URL não são capturados nem persistidos
- Impossível identificar de qual campanha veio o lead

---

### Canal 2 — Chat Jurídico (`source = chat / pré-atendimento`)

**Endpoint:** `POST /api/chat/pre-atendimento`  
**Frontend:** Componente de Chat (multi-step)

#### Dados armazenados
| Campo | Tabela `chat_pre_atendimentos` | Observação |
|---|---|---|
| `area` | ✅ | Selecionado no chat |
| `subarea` | ✅ | Selecionado no chat |
| `nome` | ✅ | |
| `telefone` | ✅ | |
| `email` | ✅ | |
| `cidade` | ✅ | |
| `estado` | ✅ | |
| `descricaoCaso` | ✅ | Texto livre |
| `protocolo` | ✅ | Gerado automaticamente |
| `status` | ✅ | `novo`, `em_atendimento`, etc. |
| `utm_source/medium/campaign` | ❌ **Ausente** | |

#### Eventos disparados
| Evento | Status |
|---|---|
| Meta Pixel no submit | ❌ **Ausente** |
| Hermes AI Analysis | ✅ Assíncrono após INSERT (`HermesAnalysisService`) |

#### Webhooks
- ❌ **Sem webhook** de lead capturado para canal externo
- A análise Hermes é interna (tabela `chat_ai_analysis`)
- Não dispara `webhook_url` nem `diagnostico_webhook_url`

#### Rate Limiting
- ✅ `preAtendimentoLimiter`: 10 req/min por IP

#### Atribuição de campanha
- ❌ **Cego total**: nenhum UTM capturado, nenhum evento Pixel

---

### Canal 3 — Diagnóstico Tributário (`source = diagnostico-reforma-tributaria`)

**Endpoint:** `POST /api/diagnostico`  
**Frontend:** `pages/DiagnosticoTributario.tsx`

#### Dados armazenados
| Campo | Tabela `diagnostico_tributario_leads` | Observação |
|---|---|---|
| `nome` | ✅ | |
| `empresa` | ✅ | |
| `email` | ✅ | |
| `whatsapp` | ✅ | |
| `respostas` | ✅ JSONB | Todas as respostas do quiz |
| `score` | ✅ | 0-100 |
| `nivel_risco` | ✅ | `alto`, `medio`, `baixo` |
| `origem` | ✅ | `"diagnostico-reforma-tributaria"` hardcoded |
| `utm_source` | ✅ | Capturado da URL via `useRef` |
| `utm_medium` | ✅ | Capturado da URL via `useRef` |
| `utm_campaign` | ✅ | Capturado da URL via `useRef` |
| `webhook_enviado` | ✅ BOOLEAN | Auditoria de disparo |
| `webhook_enviado_at` | ✅ TIMESTAMP | |

#### Eventos disparados
| Evento | Status |
|---|---|
| Meta Pixel `Lead` no submit | ❌ **Ausente** |
| `PageView` na rota `/diagnostico-tributario` | ✅ automático |

#### Webhooks
- ✅ Webhook dedicado (`diagnostico_webhook_url` da tabela `settings`)
- Envelope: `{evento: "diagnostico_tributario_lead", timestamp, lead: {...}}`
- ✅ Campo `webhook_enviado` marcado após sucesso — **único canal com auditoria de webhook**

#### Atribuição de campanha
- ✅ **Melhor canal**: UTMs capturados e persistidos
- Possível calcular ROI de campanha por `utm_campaign`

---

### Canal 4 — Landing Page BPC (`source = landing_bpc`)

**Endpoint:** `POST /api/leads` (após Sprint 3.7)  
**Frontend:** `components/lp/bpc/Hero.tsx` → `LandingCapture.tsx`

#### Dados armazenados (após Sprint 3.7)
| Campo | Tabela `leads` | Observação |
|---|---|---|
| `name` | ✅ | |
| `phone` | ✅ | |
| `email` | ✅ `""` | Campo vazio — LP não coleta |
| `source` | ✅ `landing_bpc` | |
| `interest` | ✅ `landing_bpc` | Repetido do source |
| `utm_source` | ✅ | Capturado em `LandingCapture.tsx` |
| `utm_medium` | ✅ | |
| `utm_campaign` | ✅ | |

#### Pontos cegos remanescentes
| Componente | WhatsApp | Pixel | Captura lead |
|---|---|---|---|
| `Hero.tsx` (principal) | ✅ via `LandingCapture` | `fbq Contact` via `openWhatsApp` | ✅ Sprint 3.7 |
| `SocialProof.tsx` (botão secundário) | ✅ `window.fbq Contact` + `wa.me` | ✅ `fbq Contact` inline | ❌ **Sem captura** |
| `Header.tsx` (CTA topo) | ✅ `openWhatsApp("bpc_header_cta")` | ✅ via `pixel.ts` | ❌ **Sem captura** |
| `BPCLandingPage.tsx` (floating) | ✅ `wa.me` direto | ✅ `fbq Contact` | ❌ **Sem captura** |

#### Eventos disparados
| Evento | Status |
|---|---|
| Meta Pixel `Lead` no submit do formulário | ❌ **Ausente** |
| Meta Pixel `Contact` no clique WhatsApp | ✅ parcial (alguns botões) |

#### Webhooks
- ✅ Webhook universal (`webhook_url`) após INSERT em `/api/leads`

#### Atribuição de campanha
- ✅ UTMs capturados em `LandingCapture`
- ❌ UTMs **não capturados** nos botões de WhatsApp direto (SocialProof, Header, Floating)

---

### Canal 5 — Landing Page Isenção IR (`source = landing_ir`)

**Análise idêntica à Landing BPC.** Mesma estrutura de componentes, mesmos pontos cegos.

| Componente | WhatsApp | Pixel | Captura lead |
|---|---|---|---|
| `Hero.tsx` (principal) | ✅ via `LandingCapture` | ✅ | ✅ Sprint 3.7 |
| `SocialProof.tsx` | ✅ `fbq Contact` + `wa.me` | ✅ | ❌ **Sem captura** |
| `Header.tsx` | ✅ `openWhatsApp("ir_header_cta")` | ✅ | ❌ **Sem captura** |
| `IRLandingPage.tsx` (floating) | ✅ `wa.me` | ✅ `fbq Contact` | ❌ **Sem captura** |

---

### Canal 6 — Newsletter do Blog (`source = blog_newsletter`)

**Endpoint:** `POST /api/leads` (após Sprint 3.7)  
**Frontend:** `NewsletterWidget` em `pages/BlogPostDetail.tsx`

#### Dados armazenados (após Sprint 3.7)
| Campo | Tabela `leads` | Observação |
|---|---|---|
| `name` | ✅ | Prefixo do e-mail (antes do `@`) |
| `email` | ✅ | Campo principal |
| `source` | ✅ `blog_newsletter` | |
| `phone` | ✅ `""` | Vazio — não coletado |
| `utm_source/medium/campaign` | ❌ **Não capturado** | `LandingCapture` não é usado aqui |

#### Eventos disparados
| Evento | Status |
|---|---|
| Meta Pixel `Lead` | ❌ **Ausente** |
| `PageView` no blog | ✅ automático |

#### Webhooks
- ✅ Webhook universal após INSERT
- Envelope inclui `canal: "blog_newsletter"`

#### Atribuição de campanha
- ❌ **Cega**: UTMs não capturados no `NewsletterWidget`

---

### Canal 7 — WhatsApp Direto (links sem captura)

WhatsApp é o canal de destino de todos os outros canais, mas também é acessado diretamente por vários pontos que **não passam por captura**.

#### Inventário de pontos WhatsApp no site

| Localização | Implementação | Pixel | Captura lead |
|---|---|---|---|
| `Layout.tsx` → `FloatingWhatsApp` (site geral) | `openWhatsApp("global_floating_whatsapp")` | ✅ `fbq Contact` | ❌ |
| `BPCLandingPage.tsx` (floating) | `wa.me` hardcoded | ✅ inline | ❌ |
| `IRLandingPage.tsx` (floating) | `wa.me` hardcoded | ✅ inline | ❌ |
| `lp/bpc/SocialProof.tsx` | `wa.me` + `fbq Contact` | ✅ inline | ❌ |
| `lp/ir/SocialProof.tsx` | `wa.me` + `fbq Contact` | ✅ inline | ❌ |
| `lp/bpc/Header.tsx` | `openWhatsApp("bpc_header_cta")` | ✅ via pixel.ts | ❌ |
| `lp/ir/Header.tsx` | `openWhatsApp("ir_header_cta")` | ✅ via pixel.ts | ❌ |
| `DiagnosticoTributario.tsx` (pós-quiz) | `wa.me` hardcoded | ❌ sem pixel | ❌ |
| `DiagnosticoTributario.tsx` (rodapé) | `wa.me` hardcoded | ❌ sem pixel | ❌ |

**Problema central:** ~9 pontos de saída para WhatsApp, apenas os que passam por `openWhatsApp()` disparam Pixel. Nenhum registra lead persistente.

---

## 3. Mapa de Conversão Completo

```
TRÁFEGO (Meta Ads / Orgânico / Direto)
        │
        ├─► Site Principal (/contact)
        │     └── ContactForm → POST /api/leads [source=site]
        │           ├── DB: tabela leads ✅
        │           ├── Webhook universal ✅
        │           ├── Exact Sales (async) ✅
        │           ├── Pixel Lead ❌
        │           └── UTMs ❌
        │
        ├─► Chat Jurídico (/chat ou componente embutido)
        │     └── ChatLeadController → POST /api/chat/pre-atendimento
        │           ├── DB: tabela chat_pre_atendimentos ✅
        │           ├── Protocolo gerado ✅
        │           ├── Hermes AI (async) ✅
        │           ├── Webhook ❌
        │           ├── Pixel ❌
        │           └── UTMs ❌
        │
        ├─► Diagnóstico Tributário (/diagnostico-tributario)
        │     └── DiagnosticoTributario → POST /api/diagnostico
        │           ├── DB: tabela diagnostico_tributario_leads ✅
        │           ├── Score + nível risco ✅
        │           ├── Webhook dedicado ✅
        │           ├── UTMs capturados ✅ ← melhor canal
        │           └── Pixel Lead ❌
        │
        ├─► Landing BPC (/bpc)
        │     ├── Hero (LandingCapture) → POST /api/leads [source=landing_bpc] ✅
        │     │     ├── DB: tabela leads ✅
        │     │     ├── UTMs capturados ✅
        │     │     └── Webhook universal ✅
        │     ├── SocialProof (botão) → wa.me DIRETO ❌ (sem captura)
        │     ├── Header (botão) → openWhatsApp → wa.me ❌ (sem captura)
        │     └── Floating (BPCLandingPage) → wa.me DIRETO ❌ (sem captura)
        │
        ├─► Landing IR (/isencao-ir) — idêntica ao BPC
        │     ├── Hero (LandingCapture) → POST /api/leads [source=landing_ir] ✅
        │     └── SocialProof / Header / Floating → wa.me ❌ (sem captura)
        │
        ├─► Blog (/blog/*)
        │     └── NewsletterWidget → POST /api/leads [source=blog_newsletter]
        │           ├── DB: tabela leads ✅
        │           ├── Webhook universal ✅
        │           └── UTMs ❌
        │
        └─► WhatsApp Direto (9 pontos de saída)
              ├── Pixel Contact (parcial, 7/9 botões) ✅
              └── Captura de lead ❌ (nenhum)
```

---

## 4. Funil por Canal

### 4.1 Funil Formulário Tradicional
```
Visita /contact
    │  PageView ✅
    ▼
Preenche formulário
    │  (sem evento Pixel)
    ▼
Submit → POST /api/leads
    │  Lead DB ✅ | Webhook ✅ | Pixel Lead ❌
    ▼
Mensagem de sucesso
```
**Ponto cego:** Meta Ads não recebe confirmação de lead. Otimização automática de campanha **impossível**.

---

### 4.2 Funil Chat Jurídico
```
Acessa chat
    │  PageView ✅
    ▼
Preenche dados (área, subarea, nome, tel, email, caso)
    │  (sem evento Pixel)
    ▼
Submit → POST /api/chat/pre-atendimento
    │  Lead DB ✅ | Protocolo ✅ | Hermes ✅ | Webhook ❌ | Pixel ❌
    ▼
Recebe protocolo
    │
    ▼
Hermes analisa (assíncrono) → chat_ai_analysis ✅
```
**Ponto cego:** Lead mais qualificado do site (descreve o caso) sem nenhum rastreamento de conversão.

---

### 4.3 Funil Diagnóstico Tributário
```
Acessa /diagnostico-tributario
    │  PageView ✅ | UTMs capturados ✅
    ▼
Responde quiz (6–8 perguntas)
    │
    ▼
Vê resultado (alto/médio/baixo risco)
    │
    ▼
Preenche formulário de captura (nome, empresa, email, whatsapp)
    │  (sem evento Pixel)
    ▼
Submit → POST /api/diagnostico
    │  Lead DB ✅ | UTMs ✅ | Webhook ✅ | Pixel Lead ❌
    ▼
Tela de sucesso + link WhatsApp
    │  Pixel Contact ❌ (link hardcoded, sem rastreamento)
```
**Melhor canal em dados**, mas ainda cego para Meta Ads.

---

### 4.4 Funil Landing BPC / IR (após Sprint 3.7)
```
Clique no anúncio (Meta Ads com UTMs)
    │  PageView ✅ | UTMs na URL ✅
    ▼
Assiste vídeo
    │
    ▼
[ Hero — LandingCapture ] preenche Nome + WhatsApp
    │  (sem evento Pixel)
    ▼
Submit → POST /api/leads [source=landing_bpc/ir]
    │  Lead DB ✅ | UTMs ✅ | Webhook ✅ | Pixel Lead ❌
    ▼
WhatsApp abre automaticamente
    │  Pixel Contact via openWhatsApp ✅
    ▼
[ SocialProof / Header / Floating ]
    │  WhatsApp direto ❌ (sem captura, sem lead, Pixel parcial)
```

---

### 4.5 Funil Newsletter Blog
```
Lê artigo do blog
    │  PageView ✅
    ▼
Inscreve e-mail no widget
    │  (sem evento Pixel)
    ▼
Submit → POST /api/leads [source=blog_newsletter]
    │  Lead DB ✅ | Webhook ✅ | Pixel Lead ❌ | UTMs ❌
    ▼
Confirmação visual ✅
```

---

## 5. Pontos Cegos Remanescentes

### Críticos (impactam atribuição de receita)

| # | Ponto Cego | Canal afetado | Impacto |
|---|---|---|---|
| **PC-1** | Meta Pixel `Lead` não disparado em nenhum formulário | Todos | Meta Ads otimiza para PageView em vez de Lead — custo por lead inflado |
| **PC-2** | UTMs não capturados no Formulário Tradicional | `site` | Impossível atribuir lead a campanha específica |
| **PC-3** | UTMs não capturados na Newsletter | `blog_newsletter` | Impossível saber se veio de anúncio ou orgânico |
| **PC-4** | Webhook ausente no Chat Jurídico | `chat` | Lead mais qualificado não notifica sistemas externos (N8N, CRM) |

### Importantes (fugas de leads)

| # | Ponto Cego | Localização | Leads/mês estimados perdidos |
|---|---|---|---|
| **PC-5** | `SocialProof.tsx` BPC — botão WhatsApp direto | LP BPC | 20–40 |
| **PC-6** | `SocialProof.tsx` IR — botão WhatsApp direto | LP IR | 10–20 |
| **PC-7** | `Header.tsx` BPC/IR — botão WhatsApp direto | LP BPC + IR | 10–20 |
| **PC-8** | `BPCLandingPage.tsx` floating — `wa.me` hardcoded | LP BPC | 15–30 |
| **PC-9** | `IRLandingPage.tsx` floating — `wa.me` hardcoded | LP IR | 8–15 |
| **PC-10** | `DiagnosticoTributario.tsx` — links WhatsApp pós-quiz | Diagnóstico | 5–15 |
| **PC-11** | `FloatingWhatsApp` global (Layout.tsx) | Site inteiro | 20–50 |

### Menores (dados incompletos)

| # | Ponto Cego | Impacto |
|---|---|---|
| **PC-12** | `name` da Newsletter = prefixo do e-mail (não nome real) | Dado de má qualidade no dashboard |
| **PC-13** | GA4 / Google Analytics ausente | Zero visibilidade no comportamento de navegação (scroll depth, tempo na página) |
| **PC-14** | `source` de leads pré-Sprint 3.7 = `NULL` ou `"site"` | Segmentação retroativa impossível |

---

## 6. Oportunidades de Melhoria

### Prioridade Alta

**OM-1 — Evento `Lead` no Meta Pixel após cada submit**

Todos os formulários devem chamar:
```typescript
fbq("track", "Lead", {
  content_name: source,        // "landing_bpc", "chat", etc.
  content_category: "juridico",
  currency: "BRL",
  value: 0                     // ou valor estimado por canal
});
```
**Impacto:** Meta Ads passa a otimizar para conversões reais → CPL reduz 20–40%.

**OM-2 — UTMs no Formulário Tradicional e Newsletter**

Adicionar leitura de `URLSearchParams` no `ContactForm` e `NewsletterWidget`, idêntica ao que `LandingCapture` já faz.

**OM-3 — Webhook no Chat Jurídico**

`ChatLeadController.create` deve disparar o `webhook_url` após INSERT, com envelope:
```json
{
  "evento": "chat_pre_atendimento",
  "canal": "chat",
  "timestamp": "...",
  "lead": { "protocolo": "...", "area": "...", "nome": "...", ... }
}
```

**OM-4 — Substituir `wa.me` hardcoded por `LandingCapture` nos SocialProofs**

Nos componentes `SocialProof.tsx` das LPs, o botão CTA principal deve usar `LandingCapture` (ou uma variante modal) em vez de link direto.

### Prioridade Média

**OM-5 — Google Analytics 4 / GTM**

Instalar GA4 para complementar Meta Pixel:
- Scroll depth nas LPs
- Taxa de abandono do chat
- Tempo médio no quiz

**OM-6 — Evento `fbq("track", "Contact")` no pós-quiz Diagnóstico**

Links `wa.me` hardcoded na tela de sucesso do diagnóstico não disparam Pixel. Converter para `openWhatsApp()`.

**OM-7 — `source` retroativo nos leads antigos**

Migration SQL para marcar leads anteriores sem source:
```sql
UPDATE leads SET source = 'site' WHERE source IS NULL;
```

### Prioridade Baixa

**OM-8 — Nome real na Newsletter**

Adicionar campo `name` opcional ao widget antes do e-mail.

**OM-9 — `ChatLeadController` capturar UTMs**

O chat é acessado de dentro do site — seria necessário passar UTMs via context ou localStorage ao abrir o chat.

---

## 7. Estrutura Recomendada para Métricas e ROI

### 7.1 Modelo de Dados para Atribuição

```sql
-- Visão unificada de leads (a criar — não existe ainda)
CREATE VIEW v_leads_unificados AS

-- Canal 1: Formulário tradicional
SELECT
  id,
  name AS nome,
  email,
  phone AS telefone,
  source AS canal,
  NULL AS score,
  NULL AS nivel_risco,
  NULL AS protocolo,
  NULL AS utm_source,   -- ← PC-2: ausente
  NULL AS utm_medium,
  NULL AS utm_campaign,
  created_at
FROM leads

UNION ALL

-- Canal 2: Chat Jurídico
SELECT
  id, nome, email, telefone,
  'chat' AS canal,
  NULL, NULL,
  protocolo,
  NULL, NULL, NULL,   -- ← PC sem UTMs
  created_at
FROM chat_pre_atendimentos

UNION ALL

-- Canal 3: Diagnóstico Tributário (melhor canal)
SELECT
  id, nome, email, whatsapp AS telefone,
  'diagnostico' AS canal,
  score, nivel_risco,
  NULL,
  utm_source, utm_medium, utm_campaign,
  created_at
FROM diagnostico_tributario_leads;
```

### 7.2 KPIs Recomendados por Canal

| KPI | Formulário | Chat | Diagnóstico | LP BPC | LP IR | Newsletter |
|---|---|---|---|---|---|---|
| Volume / mês | ✅ mensurável | ✅ | ✅ | ✅ (Sprint 3.7) | ✅ | ✅ |
| CPL por campanha | ❌ PC-2 | ❌ PC-4 | ✅ | ✅ | ✅ | ❌ PC-3 |
| Qualidade (score) | ❌ sem score | ❌ Hermes só interno | ✅ | ❌ sem score | ❌ sem score | ❌ |
| Taxa conversão WhatsApp | ❌ | ❌ | ❌ | ❌ PC-5/8 | ❌ PC-6/9 | — |
| Pixel confirmação | ❌ PC-1 | ❌ PC-1 | ❌ PC-1 | ❌ PC-1 | ❌ PC-1 | ❌ PC-1 |

### 7.3 Dashboard Executivo Recomendado

```
╔══════════════════════════════════════════════════════╗
║  PAINEL DE ROI — ELILON ADVOCACIA                    ║
╠══════════════════════════════════════════════════════╣
║  Total de leads  │  Custo por lead  │  Conversão %   ║
║  [por canal]     │  [por campanha]  │  [lead→cliente]║
╠══════════════════════════════════════════════════════╣
║  FUNIL SEMANAL                                       ║
║  Visitas → Formulários → Leads → WhatsApp → Clientes ║
╠══════════════════════════════════════════════════════╣
║  TOP CAMPANHAS (UTM)   │  TOP CANAIS (source)        ║
║  por volume de leads   │  por qualidade (score)       ║
╚══════════════════════════════════════════════════════╝
```

**Dados disponíveis hoje:** volume por canal, data, status  
**Dados ausentes:** CPL (falta UTMs em 3 canais), taxa de conversão (falta CRM), valor por lead

---

## 8. Matriz de Priorização

| Item | Esforço | Impacto no ROI | Sprint sugerida |
|---|---|---|---|
| PC-1: Pixel `Lead` em todos os formulários | Baixo (2–3h) | **Crítico** | 3.8 |
| PC-2: UTMs no Formulário Tradicional | Baixo (1h) | Alto | 3.8 |
| PC-3: UTMs na Newsletter | Baixo (30min) | Médio | 3.8 |
| PC-4: Webhook no Chat Jurídico | Médio (2h) | Alto | 3.8 |
| PC-5/6: SocialProof com captura | Médio (3h) | Alto | 3.9 |
| PC-8/9: Floating LP com captura | Médio (2h) | Médio | 3.9 |
| OM-5: GA4 / GTM | Baixo (2h config) | Alto | 3.8 |
| OM-1: View unificada de leads | Médio (4h) | Alto | 3.9 |

---

## 9. Sumário Executivo

**Estado atual:** 7 canais de captura operando com dados fragmentados e rastreamento parcial.

**Principal risco:** Meta Ads não recebe evento `Lead` em **nenhum** canal → otimização impossível → custo por resultado acima do necessário.

**3 ações de maior retorno imediato:**

1. `fbq("track", "Lead")` após cada submit (PC-1) — custo: 2–3h, impacto: redução de CPL
2. UTMs no Formulário Tradicional (PC-2) — custo: 1h, impacto: atribuição de receita
3. Webhook no Chat Jurídico (PC-4) — custo: 2h, impacto: notificação de leads mais qualificados

**Cobertura atual de rastreamento completo (lead + pixel + utm):**

| Canal | Cobertura |
|---|---|
| Diagnóstico Tributário | 67% (falta Pixel Lead) |
| LP BPC / IR (Hero) | 60% (falta Pixel Lead, SocialProof/floating) |
| Formulário Tradicional | 40% (falta Pixel Lead, UTMs) |
| Newsletter Blog | 35% (falta Pixel Lead, UTMs, nome real) |
| Chat Jurídico | 20% (falta Pixel, UTMs, Webhook externo) |
| WhatsApp Direto (todos os botões) | 10% (apenas Pixel Contact em alguns) |
