# Relatório Sprint 3.7 — Fechamento dos Vazamentos de Leads
**Data:** 2026-06-17  
**Status:** ✅ Concluído

---

## 1. Novos Canais Integrados

### 1.1 Landing Page BPC (`source = landing_bpc`)

| Item | Antes | Depois |
|---|---|---|
| Captação | Botão direto → WhatsApp (sem registro) | Formulário Nome + WhatsApp → API → WhatsApp |
| Dados persistidos | ❌ Nenhum | ✅ `name`, `phone`, `source=landing_bpc`, UTMs |
| Webhook | ❌ | ✅ Envelope universal disparado após INSERT |
| UX | Clique único | Formulário 2 campos + botão. WhatsApp abre após submit (falha silenciosa não bloqueia) |

**Arquivo alterado:** `components/lp/bpc/Hero.tsx`  
**Componente criado:** `components/lp/shared/LandingCapture.tsx`

---

### 1.2 Landing Page Isenção IR (`source = landing_ir`)

| Item | Antes | Depois |
|---|---|---|
| Captação | Botão direto → WhatsApp (sem registro) | Formulário Nome + WhatsApp → API → WhatsApp |
| Dados persistidos | ❌ Nenhum | ✅ `name`, `phone`, `source=landing_ir`, UTMs |
| Webhook | ❌ | ✅ Envelope universal |

**Arquivo alterado:** `components/lp/ir/Hero.tsx`

---

### 1.3 Newsletter do Blog (`source = blog_newsletter`)

| Item | Antes | Depois |
|---|---|---|
| Captação | Campo e-mail presente, botão sem handler (UI morta) | Form com submit conectado à API |
| Dados persistidos | ❌ Nenhum | ✅ `name` (prefixo do e-mail), `email`, `source=blog_newsletter` |
| Webhook | ❌ | ✅ Envelope universal |
| UX | Botão inerte | Estados: idle → loading → sucesso / erro |

**Arquivo alterado:** `pages/BlogPostDetail.tsx` — componente `NewsletterWidget` adicionado inline.

---

## 2. Endpoints Utilizados

Todos os canais utilizam o endpoint já existente:

```
POST /api/leads
Content-Type: application/json

{
  "name": "string",
  "email": "string",        // vazio para LPs
  "phone": "string",        // vazio para newsletter
  "interest": "string",     // igual ao source
  "source": "landing_bpc" | "landing_ir" | "blog_newsletter" | "site",
  "utm_source": "string",   // capturado da URL (LandingCapture)
  "utm_medium": "string",
  "utm_campaign": "string"
}
```

**Nenhuma rota nova criada.** O endpoint `/api/leads` existente foi estendido para suportar o campo `source`.

---

## 3. Alterações no Backend

### 3.1 Banco de dados — coluna `source` adicionada

**`backend/database.js` (SQLite):**
- `CREATE TABLE leads` agora inclui `source TEXT DEFAULT 'site'`
- `ALTER TABLE leads ADD COLUMN source TEXT DEFAULT 'site'` (idempotente via callback vazio)

**`backend/database-postgres.js` (PostgreSQL):**
- `CREATE TABLE leads` inclui `source VARCHAR(100) DEFAULT 'site'`
- `ALTER TABLE leads ADD COLUMN IF NOT EXISTS source VARCHAR(100) DEFAULT 'site'` (idempotente)

### 3.2 `mainController.createLead`

- Extrai `source` do `req.body`
- Inclui `source` no INSERT SQL (8º parâmetro)
- Webhook disparado com **envelope padronizado**:

```json
{
  "evento": "lead_capturado",
  "canal": "landing_bpc",
  "timestamp": "2026-06-17T13:00:00.000Z",
  "lead": {
    "id": 42,
    "nome": "...",
    "email": "...",
    "telefone": "...",
    "cidade": "...",
    "interesse": "...",
    "mensagem": "...",
    "source": "landing_bpc",
    "created_at": "..."
  }
}
```

---

## 4. Dashboard — Filtro por Canal

**`pages/Admin.tsx` — view `leads`:**

- Dropdown "Todos os canais" com opções: `Site (geral)`, `Landing BPC`, `Landing IR`, `Newsletter Blog`
- Filtro client-side sobre o array `leads` já carregado
- Badge colorida por canal na coluna "Canal":
  - 🔵 Azul → `landing_bpc`
  - 🟣 Roxo → `landing_ir`
  - 🟢 Verde → `blog_newsletter`
  - ⚫ Neutro → `site`
- Exportar CSV respeita o filtro ativo
- Nome do arquivo CSV inclui o canal: `leads_landing_bpc_2026-06-17.csv`

---

## 5. Volume Potencial Recuperado

Estimativa baseada no perfil de tráfego pago (Meta Pixel configurado em ambas as LPs):

| Canal | Estimativa mensal | Antes | Depois |
|---|---|---|---|
| Landing BPC | ~150–300 cliques/mês | 0 leads capturados | ~30–60 leads (taxa ~20%) |
| Landing IR | ~80–150 cliques/mês | 0 leads capturados | ~16–30 leads (taxa ~20%) |
| Newsletter Blog | ~200–400 visitantes/mês | 0 inscrições salvas | ~10–20 leads (taxa ~5%) |

**Total estimado:** 56–110 leads/mês recuperados que antes saíam do ecossistema sem rastro.

---

## 6. Componente Reutilizável — `LandingCapture`

`components/lp/shared/LandingCapture.tsx`

- Props: `source`, `ctaName`, `buttonLabel`, `buttonClass`
- Captura UTMs automaticamente da URL
- Falha silenciosa: se a API falhar, o WhatsApp ainda abre
- Validação: telefone mínimo 10 dígitos, nome obrigatório
- Reutilizável para futuras LPs (previdenciário, trabalhista, etc.)

---

## 7. Próximos Passos

### Curto prazo
1. **Botões de WhatsApp flutuantes nas LPs** (fixo no canto) — substituir pelo `LandingCapture` também, ou redirecionar para a seção Hero com o formulário via âncora
2. **SocialProof.tsx (BPC/IR)** — botões WhatsApp no rodapé das LPs também disparam sem captura; aplicar `LandingCapture` ou modal

### Médio prazo
3. **`Central de Leads Unificada`** — implementar tabela `leads_unificados` com deduplicação por e-mail/telefone cruzando os três bancos
4. **Score de qualificação automático** — leads de LP (tráfego pago) recebem score inicial mais alto
5. **Hermes para LPs** — análise automática de leads de LP com dados mínimos (área inferida pelo canal)

### Longo prazo
6. **N8N Flow ativo** — ligar envelope universal ao N8N para automação de follow-up por canal
7. **Exact Sales para todos os canais** — hoje só recebe do formulário tradicional

---

## 8. Resumo de Arquivos Modificados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `components/lp/shared/LandingCapture.tsx` | **NOVO** | Formulário reutilizável LP → API → WhatsApp |
| `components/lp/bpc/Hero.tsx` | Modificado | Substituído botão por `LandingCapture` |
| `components/lp/ir/Hero.tsx` | Modificado | Substituído botão por `LandingCapture` |
| `pages/BlogPostDetail.tsx` | Modificado | `NewsletterWidget` conectado à API |
| `backend/controllers/mainController.js` | Modificado | Campo `source` no INSERT + webhook universal |
| `backend/database.js` | Modificado | Coluna `source` na tabela `leads` (SQLite) |
| `backend/database-postgres.js` | Modificado | Coluna `source` na tabela `leads` (PostgreSQL) |
| `pages/Admin.tsx` | Modificado | Filtro por canal, badge colorida, CSV por canal |
