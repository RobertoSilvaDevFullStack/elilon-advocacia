# Relatório — Workflow N8N v1 (Sprint 4.0.1)
**Arquivo:** `n8n/workflow-n8n-v1.json`  
**Data:** 2026-06-17  
**Status:** ✅ Pronto para importação  
**Versão N8N:** Community Edition ≥ 1.30  

---

## Diferença em relação ao Sprint 4.0

| | Sprint 4.0 | Sprint 4.0.1 (este) |
|---|---|---|
| Tipo | Pós-atendimento | **Atendimento conversacional em tempo real** |
| Quando dispara | Após `chat_finalizado` | **A cada mensagem do usuário** |
| Retorno | Análise interna | **Resposta exibida no ChatWidget** |
| Memória | Sem estado | **Postgres por sessionId** |
| Agentes | 4 branches paralelos | **4 agentes em série (por sessão)** |

---

## Arquitetura Geral

```
ChatWidget (FSM)
   │
   │  POST /webhook/chat-message
   │  { sessionId, currentState, area, subarea, message, dadosColetados, documentos }
   ▼
N8N Workflow v1
   │
   ├─ Normalizar + Validar payload
   ├─ Recuperar contexto anterior (Postgres)
   ├─ Construir/mesclar contexto enriquecido
   │
   ├─ IF qualificacaoCompleta?
   │     │
   │     ├─ NÃO → Switch Área → Agente Especializado → OpenAI → Atualizar Contexto
   │     │              └─ resposta: mensagem BOT com ≤3 perguntas + docs solicitados
   │     │
   │     └─ SIM → Resumo Executivo → Confirmação → Salvar → Hermes → Webhooks → Encerrar
   │
   └─ Resposta JSON para ChatWidget
```

**Regra fundamental:** A FSM **nunca** é substituída. O N8N apenas gera o conteúdo das mensagens BOT.

---

## Lista Completa de Nodes

| # | Nome | Tipo | Função |
|---|---|---|---|
| 01 | Webhook Entrada | `webhook` | Recebe mensagem do ChatWidget |
| 02 | Normalizar Payload | `code` | Valida e padroniza campos |
| 03 | IF Payload Válido | `if` | Bifurca: válido / inválido |
| 04 | Resposta Erro Validação | `respondToWebhook` | Retorna 400 |
| 05 | Recuperar Contexto | `postgres` | SELECT em n8n_chat_contexto |
| 06 | Construir / Mesclar Contexto | `code` | Monta objeto contexto enriquecido |
| 07 | IF Qualificação Completa | `if` | Bifurca: encerramento / coleta |
| 08 | Switch Área Jurídica | `switch` | Roteia para agente correto |
| 09 | Agente Previdenciário | `code` | Prompt + docs por subárea |
| 10 | Agente Trabalhista | `code` | Prompt + docs por subárea |
| 11 | Agente Tributário | `code` | Prompt + docs por subárea |
| 12 | Agente Cível | `code` | Prompt + docs por subárea |
| 13 | OpenAI — Resposta Conversacional | `code` + httpRequest | Chama GPT-4o-mini |
| 14 | Atualizar Contexto | `postgres` | UPSERT em n8n_chat_contexto |
| 15 | Retorno para Frontend | `code` | Monta JSON de resposta |
| 16 | Resposta Webhook Conversacional | `respondToWebhook` | Retorna 200 |
| 17 | Gerar Resumo Executivo | `code` | Consolida todos os dados |
| 18 | Montar Tela de Confirmação | `code` | Formata mensagem de revisão |
| 19 | Salvar Dados | `postgres` | UPSERT com resumo final |
| 20 | Disparar Hermes Analysis | `httpRequest` | POST /api/admin/chat/analysis/:id/reprocess |
| 21 | Disparar Webhooks | `httpRequest` | POST chat_finalizado via backend |
| 22 | Encerrar Atendimento | `code` | Mensagem de encerramento |
| 23 | Resposta Webhook Encerramento | `respondToWebhook` | Retorna 200 |
| 24 | [SETUP] Migration | `postgres` | Cria tabela n8n_chat_contexto |

**Total: 24 nodes — todos Community Edition.**

---

## Configuração de Cada Node

### Node 01 — Webhook Entrada
```
Método: POST
Path:   chat-message
URL:    http://localhost:5678/webhook/chat-message
responseMode: responseNode
```

**Payload esperado:**
```json
{
  "sessionId": "session_JUR-20260617-0001",
  "currentState": "CASE_DESCRIPTION_COLLECTED",
  "area": "Previdenciário",
  "subarea": "BPC/LOAS",
  "message": "Minha mãe possui deficiência grave e teve o BPC negado.",
  "dadosColetados": {
    "nome": "Maria da Silva",
    "telefone": "11999990001",
    "email": "maria@email.com",
    "cidade": "São Paulo",
    "estado": "SP",
    "descricaoCaso": "..."
  },
  "documentos": [],
  "protocolo": "JUR-20260617-0001"
}
```

---

### Node 02 — Normalizar Payload
- Extrai todos os campos do body
- Define `ehEstadoConversacional` baseado nos estados FSM mapeados
- Define `qualificacaoCompleta` quando `currentState` é `QUALIFICATION_COMPLETE` ou `READY_TO_CLOSE`
- Retorna `_valido: false` com lista de erros se campos obrigatórios ausentes

**Estados FSM que chegam ao N8N:**
```
AWAITING_CASE_DESCRIPTION
CASE_DESCRIPTION_COLLECTED
AWAITING_DOCUMENT_UPLOAD_OPTION
DOCUMENT_UPLOAD_OPTION_SELECTED
DOCUMENTS_UPLOADED
QUALIFICATION_COMPLETE     ← encerramento
READY_TO_CLOSE             ← encerramento
```

---

### Node 05 — Recuperar Contexto (Postgres)
```sql
SELECT * FROM n8n_chat_contexto
WHERE session_id = '{{ $json.sessionId }}'
ORDER BY atualizado_em DESC LIMIT 1
```
Se não houver registro: retorna linha vazia → Node 06 inicializa contexto do zero.

---

### Node 06 — Construir / Mesclar Contexto
Mescla:
- Histórico de mensagens (array, últimas 20)
- Perguntas já respondidas (objeto chave-valor)
- Documentos solicitados (array)
- Turno atual (incrementado)
- Dados coletados pela FSM (`dadosColetados`)
- Documentos enviados (`documentos`)

Formata `historicoFormatado` como string para o prompt OpenAI:
```
[CLIENTE]: Minha mãe tem deficiência grave.
[AGENTE]: Entendi. Quando foi a negativa do INSS?
[CLIENTE]: Foi em março de 2026.
```

---

### Node 07 — IF Qualificação Completa
- **TRUE** (branch 1) → fluxo de encerramento (nodes 17–23)
- **FALSE** (branch 2) → fluxo conversacional (nodes 08–16)

---

### Node 08 — Switch Área Jurídica
| Saída | Área | Node destino |
|---|---|---|
| 0 | Previdenciário | 09 |
| 1 | Trabalhista | 10 |
| 2 | Tributário | 11 |
| 3 | Cível | 12 |
| fallback | Qualquer outra | (sem conexão — retorna erro implícito) |

---

### Nodes 09–12 — Agentes Especializados
Cada agente faz 3 coisas:
1. Define a lista de documentos necessários para a subárea
2. Monta o `systemPrompt` especializado com contexto, histórico e dados já coletados
3. Passa para o Node 13 (OpenAI)

**Documentos mapeados por subárea:**

| Área | Subárea | Documentos |
|---|---|---|
| Previdenciário | BPC/LOAS | RG/CPF, Laudo médico (<90d), CadÚnico, Comprovante renda |
| Previdenciário | Aposentadoria | CTPS, CNIS, PPP, Docs períodos especiais |
| Previdenciário | Auxílio-doença | Laudo (<30d), Exames, Atestado c/ CID, CNIS |
| Previdenciário | Pensão | Certidão óbito, RG/CPF, Certidão casamento |
| Previdenciário | Revisão | Carta de concessão, NB, CNIS |
| Trabalhista | Rescisão | CTPS, TRCT, Contracheques, FGTS |
| Trabalhista | Assédio | Prints/e-mails, Laudos, BO |
| Trabalhista | Acidente | CAT, Laudo médico, CTPS, BO |
| Tributário | Execução Fiscal | CDA, CNPJ/CPF, Docs bens |
| Tributário | Planejamento | Balanço, DRE, Faturamento 12m |
| Cível | Família | RG/CPF partes, Certidão casamento, Docs bens |
| Cível | Indenização | BO, Laudos periciais, Docs do dano |

**Regras de IA aplicadas em todos os prompts:**
- Nunca prometer resultado, prazo ou valor
- Nunca emitir parecer jurídico
- Máximo 3 perguntas por mensagem
- Linguagem simples e humanizada
- Não repetir perguntas já respondidas

---

### Node 13 — OpenAI Resposta Conversacional
- Usa `process.env.OPENAI_API_KEY` (variável de ambiente N8N)
- Modelo: `gpt-4o-mini` (custo ~R$ 0,001/atendimento)
- Temperature: 0.4
- Max tokens: 800
- `response_format: { type: "json_object" }` — garante JSON válido
- **Fallback automático** se API falhar: resposta genérica humanizada sem travar o fluxo

**Resposta esperada do modelo:**
```json
{
  "resposta": "Entendi que sua mãe teve o BPC negado. Para analisarmos melhor, preciso de algumas informações:\n1. Qual foi a data da negativa?\n2. Você possui o laudo médico atualizado?",
  "perguntas_feitas": ["Qual foi a data da negativa?", "Você possui o laudo médico atualizado?"],
  "documentos_solicitados": ["Laudo médico atualizado (menos de 90 dias)"],
  "informacoes_coletadas": { "data_negativa": "não informado ainda" },
  "qualificacao_suficiente": false
}
```

---

### Node 14 — Atualizar Contexto (Postgres)
```sql
INSERT INTO n8n_chat_contexto (session_id, area, subarea, ...)
VALUES (...)
ON CONFLICT (session_id) DO UPDATE SET ...
```
Persiste o estado atual da conversa. Próxima mensagem do cliente recupera este contexto no Node 05.

---

### Node 15 — Retorno para Frontend
Monta o objeto de resposta que o ChatWidget consome:
```json
{
  "sucesso": true,
  "sessionId": "session_JUR-...",
  "resposta": "Texto da mensagem BOT",
  "proximaAcao": "CONTINUAR_COLETA",
  "perguntasAdicionais": ["..."],
  "documentosSolicitados": ["Laudo médico..."],
  "informacoesColetadas": {},
  "qualificacaoSuficiente": false,
  "turno": 3
}
```

---

### Nodes 17–23 — Fluxo de Encerramento

| Node | Ação |
|---|---|
| 17 · Gerar Resumo | Consolida cliente + jurídico + docs + histórico |
| 18 · Montar Confirmação | Formata mensagem markdown de revisão |
| 19 · Salvar Dados | UPSERT com resumo final em Postgres |
| 20 · Disparar Hermes | POST `/api/admin/chat/analysis/:id/reprocess` |
| 21 · Disparar Webhooks | POST `/api/admin/chat/webhook-logs/:id/reenviar` |
| 22 · Encerrar | Mensagem de encerramento + protocolo |
| 23 · Resposta 200 | Retorna para FSM com `proximaAcao: "ENCERRAR"` |

---

### Node 24 — [SETUP] Migration
Execute **uma única vez** após importar o workflow:
```sql
CREATE TABLE IF NOT EXISTS n8n_chat_contexto (
  session_id             TEXT PRIMARY KEY,
  area                   TEXT,
  subarea                TEXT,
  historico_mensagens    JSONB DEFAULT '[]',
  perguntas_respondidas  JSONB DEFAULT '{}',
  documentos_solicitados JSONB DEFAULT '[]',
  resumo_parcial         TEXT,
  turno                  INTEGER DEFAULT 1,
  criado_em              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
Após executar, desative ou exclua este node.

---

## Estrutura de Memória Conversacional

### Por que Postgres e não Redis?
- Redis está no roadmap (Sprint 4.2)
- Postgres já está disponível e configurado no projeto
- Para o volume atual (< 100 atendimentos/dia), latência do Postgres é aceitável (~10ms)

### Como funciona a memória

```
Turno 1 — Cliente: "Minha mãe teve BPC negado"
  → N8N salva { historico: [{role: user, content: "..."}], turno: 1 }
  → Retorna: "Quando foi a negativa? Tem laudo médico?"

Turno 2 — Cliente: "Foi em março. Tenho o laudo sim."
  → N8N recupera histórico do turno 1
  → Contexto: cliente já informou data e laudo
  → Retorna: "Ótimo! Você possui CadÚnico cadastrado?"

Turno 3 — QUALIFICATION_COMPLETE=true
  → N8N vai para fluxo de encerramento
  → Não faz mais perguntas
```

### Limite de histórico
- Máximo 20 mensagens armazenadas (evita tokens excessivos no prompt)
- Sliding window: remove as mais antigas automaticamente

---

## Mapeamento de Payloads

### ChatWidget → N8N (entrada)
```typescript
interface N8NMessagePayload {
  sessionId: string;          // ex: "session_JUR-20260617-0001"
  currentState: ChatState;    // estado atual da FSM
  area: AreaJuridica;         // "Previdenciário" | "Trabalhista" | "Tributário" | "Cível"
  subarea: SubareaJuridica;   // subárea selecionada
  message: string;            // mensagem atual do usuário
  dadosColetados: FSMContext; // dados já coletados pela FSM
  documentos: UploadedDocument[];
  protocolo?: string;         // disponível após persistência
}
```

### N8N → ChatWidget (saída — fluxo conversacional)
```typescript
interface N8NConversationalResponse {
  sucesso: boolean;
  sessionId: string;
  resposta: string;                    // EXIBIR como mensagem BOT
  proximaAcao: "CONTINUAR_COLETA";
  perguntasAdicionais: string[];
  documentosSolicitados: string[];
  informacoesColetadas: Record<string, any>;
  qualificacaoSuficiente: boolean;     // se true → FSM pode ir para QUALIFICATION_COMPLETE
  turno: number;
}
```

### N8N → ChatWidget (saída — encerramento)
```typescript
interface N8NClosingResponse {
  sucesso: boolean;
  sessionId: string;
  resposta: string;                    // EXIBIR mensagem de encerramento
  proximaAcao: "ENCERRAR";            // FSM transiciona para CLOSED
  protocolo: string | null;
}
```

---

## Como Importar no N8N

### 1. Importar workflow
```
N8N → Workflows → Import from file → n8n/workflow-n8n-v1.json
```

### 2. Configurar variáveis de ambiente
No N8N, em **Settings → Variables** ou no `.env`:
```env
OPENAI_API_KEY=sk-proj-...
BACKEND_URL=http://localhost:3001
ADMIN_JWT_TOKEN=<token de admin gerado no backend>
```

### 3. Configurar credencial Postgres
```
N8N → Credentials → New → PostgreSQL
Host: localhost (ou DB_HOST)
Port: 5432
Database: elilon_advocacia_db
User: elilon_db_user
Password: <DB_PASSWORD>
```
Nomear como: **PostgreSQL Elilon**

### 4. Criar tabela de contexto
Executar o Node 24 (`[SETUP] Migration`) uma única vez:
- Abrir o node → Test step → executar
- Verificar retorno: `{ status: "n8n_chat_contexto OK" }`
- Desativar o node após execução

### 5. Configurar URL no backend
```sql
UPDATE settings SET value = 'http://localhost:5678/webhook/chat-message'
WHERE key = 'n8n_chat_url';
-- (ou configurar no .env do ChatWidget)
```

### 6. Ativar o workflow
Toggle no canto superior direito → **Active**

---

## Integração com ChatWidget

O ChatWidget precisa chamar o N8N no momento certo da FSM. Sugestão de integração no `ChatWidget.tsx`:

```typescript
// Chamar N8N quando estado for conversacional
const ESTADOS_N8N = [
  'CASE_DESCRIPTION_COLLECTED',
  'DOCUMENTS_UPLOADED',
  'QUALIFICATION_COMPLETE'
];

if (ESTADOS_N8N.includes(currentState)) {
  const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: `session_${protocolo}`,
      currentState,
      area: fsmContext.areaSelecionada,
      subarea: fsmContext.subareaSelecionada,
      message: ultimaMensagemUsuario,
      dadosColetados: fsmContext.dadosColetados,
      documentos: fsmContext.documentos?.documents || [],
      protocolo
    })
  });

  const data = await n8nResponse.json();

  if (data.sucesso) {
    // Adicionar resposta do N8N como mensagem BOT
    adicionarMensagem({ senderType: 'BOT', content: data.resposta });

    // Se N8N sinalizou encerramento
    if (data.proximaAcao === 'ENCERRAR') {
      fsmDispatch({ type: 'CLOSE_CHAT' });
    }
  }
}
```

---

## Cenários de Teste

### Cenário 1 — Primeira mensagem (turno 1)
```json
{
  "sessionId": "session_TEST-001",
  "currentState": "CASE_DESCRIPTION_COLLECTED",
  "area": "Previdenciário",
  "subarea": "BPC/LOAS",
  "message": "Minha mãe tem deficiência e teve o benefício negado.",
  "dadosColetados": { "nome": "João", "telefone": "11999990001", "email": "j@j.com" },
  "documentos": [],
  "protocolo": "JUR-20260617-TEST"
}
```
**Esperado:** 200, `resposta` com ≤3 perguntas sobre BPC/LOAS, `documentosSolicitados` com laudo e CadÚnico.

### Cenário 2 — Qualificação completa
```json
{
  "sessionId": "session_TEST-001",
  "currentState": "QUALIFICATION_COMPLETE",
  "area": "Previdenciário",
  "subarea": "BPC/LOAS",
  "message": "confirmar",
  "dadosColetados": { "nome": "João", ... },
  "documentos": [{ "original_name": "laudo.pdf" }],
  "protocolo": "JUR-20260617-TEST"
}
```
**Esperado:** 200, `proximaAcao: "ENCERRAR"`, Hermes acionado, webhook disparado.

### Cenário 3 — Payload inválido
```json
{ "currentState": "CASE_DESCRIPTION_COLLECTED" }
```
**Esperado:** 400, `{ sucesso: false, erros: ["sessionId obrigatório", "message obrigatório", "area obrigatório"] }`

---

## Diferença FSM × N8N (tabela de responsabilidades)

| Responsabilidade | FSM | N8N |
|---|---|---|
| LGPD / Consentimento | ✅ | ❌ |
| Coleta nome/tel/email/cidade/estado | ✅ | ❌ |
| Seleção de área e subárea | ✅ | ❌ |
| Controle de estados (AWAITING_*, *_COLLECTED) | ✅ | ❌ |
| Upload de documentos | ✅ | ❌ |
| Persistência principal (chat_pre_atendimentos) | ✅ | ❌ |
| Geração de protocolo | ✅ | ❌ |
| Perguntas jurídicas inteligentes | ❌ | ✅ |
| Memória conversacional multi-turno | ❌ | ✅ |
| Solicitação contextual de documentos | ❌ | ✅ |
| Resumo executivo consolidado | ❌ | ✅ |
| Classificação urgência/complexidade | ❌ | ✅ (+ Hermes) |
| Acionamento Hermes | ❌ | ✅ |
| Disparo de webhooks externos | ❌ | ✅ |

---

## Custo Estimado OpenAI

| Componente | Tokens/turno | Custo (gpt-4o-mini) |
|---|---|---|
| System prompt | ~400 tokens | — |
| Histórico (20 msg) | ~800 tokens | — |
| Mensagem usuário | ~50 tokens | — |
| Resposta | ~200 tokens | — |
| **Total/turno** | **~1.450 tokens** | **~R$ 0,004** |
| Atendimento médio (5 turnos) | ~7.250 tokens | **~R$ 0,02** |
| Meta Sprint 4.0.1 | — | **< R$ 0,10** ✅ |

---

## Roadmap

| Sprint | Funcionalidade |
|---|---|
| **4.1** | Integração Kinbox — criar atendimento automaticamente |
| **4.2** | Memória Redis — substituir Postgres no contexto conversacional |
| **4.3** | Sub-agentes por subárea — prompts ultra-especializados (BPC vs Aposentadoria) |
| **4.4** | Conversions API Meta — tracking de conversão pós-atendimento |
| **4.5** | Dashboard de produtividade jurídica — KPIs em tempo real |
