# Relatório Sprint 4.0 — N8N Orchestration Workflow
**Data:** 2026-06-17  
**Status:** ✅ Concluído  
**Arquivo:** `n8n/n8n-workflow-sprint-4-0.json`  
**Objetivo:** Criar a estrutura completa de orquestração do atendimento jurídico no N8N, sem integrações finais com Kinbox.

---

## Princípio Arquitetural

> **A FSM continua sendo a fonte da verdade do fluxo.**  
> O N8N não controla estados. Ele recebe dados prontos (após `qualificacaoCompleta = true`), analisa, enriquece e retorna classificação para a equipe jurídica.

```
ChatWidget (FSM) ──────────► Backend (REST API)
      │                             │
      │ qualificacaoCompleta=true   │
      └────────────────────────────►│
                                    │ POST /api/chat/pre-atendimento
                                    │ → gera protocolo
                                    │ → dispara chat_finalizado
                                    │ → dispara Hermes (análise IA)
                                    │         │
                                    │         └──► Hermes conclui
                                    │               └──► dispara hermes_analise_concluida
                                    │                           │
                                    ▼                           ▼
                              N8N Workflow ◄────────────────────┘
                              (orquestração)
```

---

## Desenho Completo do Workflow

```
🔗 Webhook Entrada
   │ POST /webhook/chat-juridico
   ▼
🛡️ Validação de Sessão
   │ Valida campos obrigatórios: evento, protocolo, cliente.nome, juridico.area
   │ Extrai sessionId do protocolo
   ▼
✅ IF Payload Válido?
   ├─► NÃO ──► ❌ Resposta 400 (payload inválido)
   └─► SIM
         ▼
   📦 Recuperar Contexto
         │ Constrói objeto contexto enriquecido com flags:
         │   - qualificacaoCompleta: true
         │   - temDocumentos: bool
         │   - temHermes: bool
         ▼
   ⚖️ Switch por Área Jurídica
         ├─► Previdenciário ──► 🧠 Memória ──► 🤖 OpenAI ──► 💾 Contexto ──┐
         ├─► Trabalhista    ──► 🧠 Memória ──► 🤖 OpenAI ──► 💾 Contexto ──┤
         ├─► Tributário     ──► 🧠 Memória ──► 🤖 OpenAI ──► 💾 Contexto ──┤
         ├─► Cível          ──► 🧠 Memória ──► 🤖 OpenAI ──► 💾 Contexto ──┤
         └─► [outro]        ──► ⚠️ Área Desconhecida ──► ❌ Resposta 422   │
                                                                            │
                                                   🔀 Merge de Áreas ◄─────┘
                                                         │
                                                         ▼
                                              📄 Gerar Resumo Executivo Final
                                                         │
                                                         ▼
                                              ✅ Encerramento e Resposta Final
                                                         │
                                                         ▼
                                              📤 Resposta Webhook 200
```

---

## Lista de Nodes (21 nodes)

| # | Nome | Tipo | Posição |
|---|---|---|---|
| 1 | 🔗 Webhook Entrada | `n8n-nodes-base.webhook` | Entrada |
| 2 | 🛡️ Validação de Sessão | `code` | — |
| 3 | ✅ Payload Válido? | `if` | — |
| 4 | ❌ Resposta Erro Validação | `respondToWebhook` | Branch Erro |
| 5 | 📦 Recuperar Contexto | `code` | — |
| 6 | ⚖️ Switch por Área Jurídica | `switch` | — |
| 7 | 🧠 Previdenciário — Memória | `code` | Branch Prev. |
| 8 | 🤖 Previdenciário — OpenAI | `@n8n/openAi` | Branch Prev. |
| 9 | 💾 Previdenciário — Contexto | `code` | Branch Prev. |
| 10 | 🧠 Trabalhista — Memória | `code` | Branch Trab. |
| 11 | 🤖 Trabalhista — OpenAI | `@n8n/openAi` | Branch Trab. |
| 12 | 💾 Trabalhista — Contexto | `code` | Branch Trab. |
| 13 | 🧠 Tributário — Memória | `code` | Branch Trib. |
| 14 | 🤖 Tributário — OpenAI | `@n8n/openAi` | Branch Trib. |
| 15 | 💾 Tributário — Contexto | `code` | Branch Trib. |
| 16 | 🧠 Cível — Memória | `code` | Branch Cível |
| 17 | 🤖 Cível — OpenAI | `@n8n/openAi` | Branch Cível |
| 18 | 💾 Cível — Contexto | `code` | Branch Cível |
| 19 | 🔀 Merge de Áreas | `merge` | Convergência |
| 20 | 📄 Gerar Resumo Executivo Final | `code` | — |
| 21 | ✅ Encerramento e Resposta Final | `code` | — |
| 22 | 📤 Resposta Webhook — Sucesso | `respondToWebhook` | Saída |
| 23 | ⚠️ Área Desconhecida | `code` | Branch Erro |
| 24 | ❌ Resposta Área Desconhecida | `respondToWebhook` | Branch Erro |

---

## Configuração de Cada Node

### Node 1 — Webhook Entrada
```
Método: POST
Path: chat-juridico
URL local: http://localhost:5678/webhook/chat-juridico
Response Mode: responseNode (aguarda nó de resposta)
```

**Aceita dois eventos:**
- `chat_finalizado` — vindo do `ChatWebhookService` (Sprint 3.9)
- `hermes_analise_concluida` — vindo do `HermesWebhookService` (Sprint 3.10)

### Node 2 — Validação de Sessão
Campos obrigatórios verificados:
- `evento` (string)
- `protocolo` (string, ex: `JUR-20260617-0001`)
- `cliente.nome` (string)
- `juridico.area` (string, uma das 4 áreas)

### Node 6 — Switch por Área Jurídica
- Saída 0: `Previdenciário`
- Saída 1: `Trabalhista`
- Saída 2: `Tributário`
- Saída 3: `Cível`
- Saída 4 (fallback): área desconhecida → 422

### Nodes 7/10/13/16 — Memória Conversacional (por área)
Cada nó:
1. Identifica a subárea
2. Seleciona as 4 perguntas de qualificação específicas para aquela subárea
3. Define documentos necessários
4. Define urgência e complexidade padrão da subárea

### Nodes 8/11/14/17 — Análise OpenAI (por área)
- **Modelo:** `gpt-4o-mini`
- **Temperature:** 0.3 (respostas mais determinísticas)
- **Max tokens:** 1000
- **System prompt:** Especialista jurídico da área específica
- **Resposta esperada:** JSON estruturado (sem markdown)

### Node 20 — Gerar Resumo Executivo Final
Prioridade de classificação:
```
urgência_final = hermes.urgencia  ||  n8n_analysis.urgencia  ||  area_config.urgencia_padrao
complexidade_final = hermes.complexidade  ||  n8n_analysis.complexidade  ||  area_config.complexidade_padrao
```
Hermes (análise de produção) sempre prevalece sobre a análise N8N.

---

## Mapeamento de Payloads

### Payload de Entrada (vindo do backend)
```json
{
  "evento": "chat_finalizado",
  "timestamp": "2026-06-17T14:00:00.000Z",
  "protocolo": "JUR-20260617-0001",
  "cliente": {
    "nome": "Maria da Silva",
    "telefone": "(11) 99999-0001",
    "email": "maria@email.com",
    "cidade": "São Paulo",
    "estado": "SP"
  },
  "juridico": {
    "area": "Previdenciário",
    "subarea": "Aposentadoria",
    "descricao_caso": "Contribuí por 35 anos e o INSS negou minha aposentadoria..."
  },
  "documentos": [
    { "original_name": "extrato_cnis.pdf", "size_bytes": 204800, "mime_type": "application/pdf" }
  ],
  "hermes": {
    "urgencia": "media",
    "complexidade": "alta",
    "resumo": "Caso de negativa de aposentadoria com tempo de contribuição longo...",
    "status": "concluida"
  }
}
```

### Payload de Saída (retorno para o chamador)
```json
{
  "sucesso": true,
  "protocolo": "JUR-20260617-0001",
  "processado_em": "2026-06-17T14:00:45.123Z",
  "area": "Previdenciário",
  "subarea": "Aposentadoria",
  "urgencia": "media",
  "complexidade": "alta",
  "resumo_executivo": "Cliente com 35 anos de contribuição teve aposentadoria negada...",
  "documentos_solicitados": ["CTPS", "Extrato CNIS", "Carta de indeferimento do INSS"],
  "perguntas_adicionais": [
    "Qual o tipo de aposentadoria solicitado (tempo de contribuição, idade, especial)?",
    "Há períodos de atividade especial (insalubre)?",
    "A negativa foi administrativa ou judicial?"
  ],
  "_meta": {
    "workflow": "chat-juridico-orchestration-v1.0",
    "sprint": "4.0",
    "fontes_analise": ["hermes", "n8n-openai"]
  }
}
```

---

## Estrutura de Memória

O N8N NÃO persiste estado entre execuções. A memória é **stateless por design**.

A cada execução, o contexto é **reconstruído** a partir do payload recebido:

```
Execução 1 (chat_finalizado, sem documentos):
  payload → contexto → análise → resumo → resposta

Execução 2 (chat_finalizado, com documentos — mesmo protocolo):
  payload → contexto (enriquecido com docs) → análise → resumo → resposta

Execução 3 (hermes_analise_concluida — mesmo protocolo):
  payload → contexto (enriquecido com Hermes) → análise → resumo melhorado → resposta
```

Cada execução é **independente e idempotente**. O resultado melhora à medida que mais dados chegam.

---

## Perguntas de Qualificação por Subárea

### Previdenciário
| Subárea | Perguntas Específicas |
|---|---|
| BPC/LOAS | Renda familiar, deficiência, negativa anterior, data de nascimento |
| Aposentadoria | Tempo de contribuição, categoria, atividade especial, CTPS |
| Auxílio-doença | CID, início da incapacidade, resultado anterior, atestados recentes |
| Pensão | Grau de parentesco, status do falecido, outros dependentes, data do óbito |
| Revisão | Número NB, motivo da revisão, data de concessão, decisão anterior |

### Trabalhista
| Subárea | Perguntas Específicas |
|---|---|
| Rescisão | Tipo de desligamento, verbas pendentes, datas, horas extras |
| FGTS | Status do FGTS, irregularidade, tipo de contrato, prazo prescricional |
| Horas Extras | Jornada contratual x real, registros de ponto, período, adicional noturno |
| Assédio | Tipo (moral/sexual), evidências, comunicação interna, danos à saúde |
| Acidente de Trabalho | CAT emitida, afastamento INSS, sequelas, CIPA ativa |

### Tributário
| Subárea | Perguntas Específicas |
|---|---|
| Impostos | Tipo de imposto, regime tributário, auto de infração, valor em disputa |
| Planejamento Tributário | Faturamento, regime atual, operações entre empresas, incentivos |
| Restituição | Tributo pago indevidamente, período, retificadora, valor estimado |
| Execução Fiscal | Penhora em andamento, número CDA, origem da dívida, prazo de embargos |

### Cível
| Subárea | Perguntas Específicas |
|---|---|
| Contratos | Natureza do contrato, cláusulas descumpridas, formalização, valor |
| Consumidor | Produto/serviço, reclamação prévia, nota fiscal, tipo de dano |
| Família | Tipo de ação, filhos menores, litígio/acordo, regime de bens |
| Indenização | Evento causador, tipo de dano, documentação, responsável |

---

## Como Importar no N8N

1. Abrir N8N → menu lateral → **Workflows**
2. Botão **Import from file**
3. Selecionar `n8n/n8n-workflow-sprint-4-0.json`
4. Clicar em **Import**

### Configuração pós-importação

1. **Credencial OpenAI:**
   - N8N → Credentials → New
   - Tipo: `OpenAI API`
   - API Key: `sk-...`
   - Salvar com nome `OpenAI API`

2. **URL do Webhook:**
   - Abrir node "🔗 Webhook Entrada"
   - Copiar a URL gerada (ex: `https://n8n.dominio.com/webhook/chat-juridico`)

3. **Configurar no banco:**
   ```sql
   UPDATE settings SET value = 'https://n8n.dominio.com/webhook/chat-juridico'
   WHERE key = 'chat_webhook_url';
   ```

4. **Ativar o workflow:** toggle no canto superior direito

---

## Regras do Workflow

| Regra | Status |
|---|---|
| FSM é a fonte da verdade | ✅ N8N não controla estados |
| N8N não persiste dados | ✅ Stateless por execução |
| N8N não decide próximos passos do chat | ✅ Apenas classifica e resume |
| Falha no N8N não afeta o usuário | ✅ Backend retorna 201 antes do dispatch |
| Hermes tem prioridade sobre OpenAI | ✅ Implementado em `node_gerar_resumo` |

---

## Cenários de Teste

### Cenário 1 — Payload válido, área Previdenciário, com Hermes
```bash
curl -X POST http://localhost:5678/webhook/chat-juridico \
  -H "Content-Type: application/json" \
  -d '{
    "evento": "chat_finalizado",
    "protocolo": "JUR-20260617-0001",
    "cliente": { "nome": "João", "telefone": "11999990001", "email": "j@j.com", "cidade": "SP", "estado": "SP" },
    "juridico": { "area": "Previdenciário", "subarea": "Aposentadoria", "descricao_caso": "Tenho 35 anos de contribuição e o INSS negou minha aposentadoria por tempo de contribuição." },
    "documentos": [],
    "hermes": { "urgencia": "media", "complexidade": "alta", "resumo": "Caso de negativa...", "status": "concluida" }
  }'
```
**Esperado:** 200, branch Previdenciário processado, urgencia=media (vindo do Hermes)

### Cenário 2 — Payload inválido
```bash
curl -X POST http://localhost:5678/webhook/chat-juridico \
  -H "Content-Type: application/json" \
  -d '{ "evento": "chat_finalizado" }'
```
**Esperado:** 400, `{ success: false, errors: ["protocolo ausente", ...] }`

### Cenário 3 — Área desconhecida
```bash
# ...payload com juridico.area = "Imobiliário"
```
**Esperado:** 422, `{ sucesso: false, erro: "Área jurídica não mapeada: Imobiliário" }`

---

## Roadmap — Sprint 4.1

| Funcionalidade | Descrição |
|---|---|
| **Kinbox Integration** | Encaminhar resumo ao atendente responsável via API Kinbox |
| **Email Notification** | Notificar advogado da área por e-mail com resumo executivo |
| **Memory Persistente** | Usar N8N Variables ou banco externo para acumular histórico da sessão |
| **Webhook de Resposta** | Retornar perguntas adicionais ao ChatWidget para coleta complementar |
| **Score de Prioridade** | Calcular score numérico combinando urgência + complexidade + Hermes |
