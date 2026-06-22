# Relatório — Sprint 4.0.2 · ChatWidget × N8N Integration
**Data:** 2026-06-17  
**Status:** ✅ Implementado  

---

## Objetivo

Conectar o ChatWidget/FSM ao Workflow Conversacional N8N (Sprint 4.0.1), transformando o chat jurídico em um sistema com inteligência artificial real por área jurídica.

---

## Arquitetura Final

```
Cliente digita mensagem
        ↓
ChatWidget (FSM controla estados)
        ↓
shouldUseN8N(currentState)?
        │
   SIM  │                           NÃO
        ↓                            ↓
n8nChatService.sendMessage()    fluxo legado
        ↓
POST /webhook/chat-message (N8N)
        ↓
Switch Área → Agente Especializado
        ↓
OpenAI GPT-4o-mini
        ↓
{ sucesso, resposta, proximaAcao, ... }
        ↓
ChatWidget exibe resposta como mensagem BOT
        ↓
Se qualificacaoSuficiente → AWAITING_SUMMARY_CONFIRMATION
        ↓
Botões [✏️ Alterar] [✅ Confirmar]
        ↓
Confirmar → submitPreAtendimento → Hermes → Webhook → Encerrar
```

**A FSM continua sendo a única fonte da verdade sobre estados.**  
**O N8N nunca modifica estados — só gera conteúdo inteligente.**

---

## Arquivos Criados

### `src/config/n8n.ts`
Helper centralizado de configuração:

```typescript
N8N_CHAT_WEBHOOK_URL      // lido de VITE_N8N_CHAT_WEBHOOK_URL
N8N_TIMEOUT_MS            // 10.000ms
N8N_CONVERSATIONAL_STATES // lista dos estados que acionam N8N
shouldUseN8N(state)       // retorna true/false
isN8NConfigured()         // verifica se URL está presente
```

**Comportamento quando `VITE_N8N_CHAT_WEBHOOK_URL` está vazio:**  
`shouldUseN8N()` retorna `false` → chat funciona no modo legado sem N8N.

---

### `src/services/n8nChatService.ts`
Serviço de comunicação com o N8N:

```typescript
n8nChatService.sendMessage(payload) → Promise<N8NConversationalResponse>
```

**Recursos:**
- Timeout via `AbortController` (10s)
- Fallback automático se N8N offline — nunca trava o chat
- Resposta diferenciada para timeout vs. erro de rede
- Logs de auditoria: `[N8N] Payload enviado`, `[N8N] Resposta recebida`, `[N8N] Erro`
- Buffer de métricas `n8n_response_time / n8n_success / n8n_failure` para dashboard futuro
- Sanitização da resposta (garante campos obrigatórios mesmo se modelo retornar JSON parcial)

**Payload enviado ao N8N:**
```typescript
{
  sessionId: `session_${protocolo}`,
  currentState: "CASE_DESCRIPTION_COLLECTED",
  area: "Previdenciário",
  subarea: "BPC/LOAS",
  message: "Minha mãe teve o benefício negado",
  dadosColetados: { nome, telefone, email, cidade, estado, descricaoCaso },
  documentos: [{ original_name, mime_type, size_bytes }],
  protocolo: "JUR-20260617-0001"
}
```

**Resposta recebida do N8N:**
```typescript
{
  sucesso: true,
  resposta: "Entendi. Quando foi a negativa? Tem o laudo médico?",
  proximaAcao: "CONTINUAR_COLETA",
  perguntasAdicionais: ["Quando foi a negativa?"],
  documentosSolicitados: ["Laudo médico (< 90 dias)"],
  qualificacaoSuficiente: false,
  turno: 3
}
```

---

## Arquivos Modificados

### `src/modules/chat/presentation/types/chat.types.ts`
Dois novos estados adicionados ao `ChatState`:

| Estado | Quando | Descrição |
|---|---|---|
| `AWAITING_SUMMARY_CONFIRMATION` | Após N8N gerar resumo | Botões Confirmar/Alterar visíveis |
| `SUMMARY_CONFIRMED` | Cliente confirma | Inicia persistência |

---

### `ChatWidget.tsx` — Mudanças por área

#### Novos estados locais
```typescript
n8nLoading              // boolean — exibe "⏳ IA processando..." no header
showSummaryConfirmation // boolean — controla visibilidade dos botões
n8nSummaryData          // objeto do resumo retornado pelo N8N
```

#### `callN8NConversational(message, state)`
Novo handler que:
1. Monta `sessionId` como `session_${protocolo}` (ou fallback local)
2. Chama `n8nChatService.sendMessage()`
3. Exibe `response.resposta` como mensagem BOT
4. Se `qualificacaoSuficiente || state === "QUALIFICATION_COMPLETE"` → ativa botões de confirmação
5. Se `proximaAcao === "ENCERRAR"` → fecha confirmação e transiciona para `CLOSED`

#### `handleConfirmSummary()`
- Esconde botões de confirmação
- Transiciona para `SUMMARY_CONFIRMED`
- Exibe mensagem "✅ Informações confirmadas!"
- Chama `showQualificationSummary()` para persistir e encerrar

#### `handleAlterSummary()`
- Esconde botões de confirmação
- Volta para `CASE_DESCRIPTION_COLLECTED`
- Solicita nova descrição do caso

#### `processCollectedData` — ponto de disparo 1
Após coletar a descrição do caso (`CASE_DESCRIPTION_COLLECTED`):
```typescript
if (shouldUseN8N("CASE_DESCRIPTION_COLLECTED")) {
  await callN8NConversational(normalizedValue, "CASE_DESCRIPTION_COLLECTED");
}
```
O agente N8N recebe a descrição e faz perguntas especializadas **antes** de o usuário ser perguntado sobre documentos.

#### `showQualificationSummary` — ponto de disparo 2
Quando `shouldUseN8N("QUALIFICATION_COMPLETE")`:
```typescript
await callN8NConversational(descricaoCaso, "QUALIFICATION_COMPLETE");
return; // fluxo de persistência aguarda confirmação do usuário
```
O N8N gera o resumo executivo → usuário confirma → `handleConfirmSummary()` persiste.

#### `handleSendMessage`
- Estado `AWAITING_SUMMARY_CONFIRMATION`: **bloqueia** input de texto (usuário deve usar os botões)
- Estado `QUALIFICATION_COMPLETE` / `SUMMARY_CONFIRMED` com N8N: encaminha mensagem para `callN8NConversational`

---

### `ChatWindow.tsx`
- Recebe `isN8NLoading?: boolean`
- Quando `true`: subtítulo do header vira **"⏳ IA processando..."** em amarelo (`#fbbf24`)

---

### `.env.example`
```env
VITE_N8N_CHAT_WEBHOOK_URL=https://seu-n8n.dominio.com/webhook/chat-message
# Dev local:
# VITE_N8N_CHAT_WEBHOOK_URL=http://localhost:5678/webhook/chat-message
```

---

## Fluxo Detalhado por Cenário

### Cenário 1 — Previdenciário › BPC/LOAS (N8N ativo)

```
1. Usuário seleciona Previdenciário → BPC/LOAS                 [FSM]
2. FSM coleta: nome, telefone, email, cidade, estado           [FSM]
3. FSM coleta: descrição do caso                               [FSM]
4. ChatWidget: shouldUseN8N("CASE_DESCRIPTION_COLLECTED") = true
5. N8N recebe descrição → Agente Previdenciário → OpenAI       [N8N]
6. ChatWidget exibe: "Entendi. Quando foi a negativa? Tem laudo?" [BOT N8N]
7. Usuário responde sobre documentos                           [FSM]
8. showQualificationSummary → shouldUseN8N("QUALIFICATION_COMPLETE") = true
9. N8N gera resumo executivo                                   [N8N]
10. ChatWidget exibe resumo + botões [✏️ Alterar] [✅ Confirmar]
11. Usuário clica Confirmar
12. handleConfirmSummary → submitPreAtendimento → Hermes → Webhook
13. ChatWidget exibe protocolo + mensagem de encerramento
```

### Cenário 2 — N8N offline (fallback)

```
1-3. Igual ao Cenário 1
4. callN8NConversacional → fetch falha → catch → FALLBACK_RESPONSE
5. ChatWidget exibe: "Recebi suas informações. Nossa equipe retornará em breve."
6. Fluxo continua normalmente (sem travar)
```

### Cenário 3 — N8N não configurado (VITE_N8N_CHAT_WEBHOOK_URL vazio)

```
shouldUseN8N() = false → fluxo legado intacto
Chat funciona exatamente como nas Sprints anteriores
```

### Cenário 4 — Timeout (N8N demorou > 10s)

```
AbortController dispara após 10s
Resposta: "Estamos processando suas informações. Tente novamente."
Log: [N8N] Timeout { sessionId, elapsed: 10001, limit: 10000 }
Chat não trava
```

### Cenário 5 — Usuário quer alterar resumo

```
Botões visíveis após N8N gerar resumo
Clique em ✏️ Alterar:
  → showSummaryConfirmation = false
  → currentState = "CASE_DESCRIPTION_COLLECTED"
  → requestNextField("caseDescription")
Usuário corrige descrição
Fluxo reinicia a partir do ponto de disparo 1
```

---

## Onde N8N É Chamado (mapa de estados)

| Estado FSM | Gatilho | Mensagem enviada ao N8N |
|---|---|---|
| `CASE_DESCRIPTION_COLLECTED` | Após coletar descrição | Texto da descrição do caso |
| `QUALIFICATION_COMPLETE` | Após escolha de docs | Descrição (resumo final) |

---

## Comportamento de Degradação

| Situação | Comportamento |
|---|---|
| `VITE_N8N_CHAT_WEBHOOK_URL` vazio | Fluxo legado — sem chamadas N8N |
| N8N retorna HTTP 4xx/5xx | Fallback silencioso |
| N8N offline / sem rota | Fallback silencioso |
| Timeout > 10s | Mensagem de timeout, chat continua |
| JSON malformado na resposta | Fallback com valores default |

---

## Variáveis de Ambiente

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `VITE_N8N_CHAT_WEBHOOK_URL` | Não | `""` | URL do webhook N8N. Vazio = desativado |
| `VITE_API_URL` | Sim | `localhost:5000/api` | Backend API |

---

## Como Ativar

### 1. Configurar variável de ambiente
```bash
# .env (desenvolvimento local)
VITE_N8N_CHAT_WEBHOOK_URL=http://localhost:5678/webhook/chat-message

# produção
VITE_N8N_CHAT_WEBHOOK_URL=https://n8n.elilon.com.br/webhook/chat-message
```

### 2. Garantir N8N ativo com workflow importado
```
N8N → workflow-n8n-v1.json → Active = ON
```

### 3. Verificar tabela de contexto
```sql
SELECT * FROM n8n_chat_contexto LIMIT 5;
-- Se vazia, executar Node 24 do workflow
```

### 4. Testar com curl
```bash
curl -X POST http://localhost:5678/webhook/chat-message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_TEST-001",
    "currentState": "CASE_DESCRIPTION_COLLECTED",
    "area": "Previdenciário",
    "subarea": "BPC/LOAS",
    "message": "Minha mãe tem deficiência e o BPC foi negado.",
    "dadosColetados": {"nome": "João", "telefone": "11999990001"},
    "documentos": [],
    "protocolo": "JUR-TEST"
  }'
```

---

## Critérios de Aceitação — Status

| Critério | Status |
|---|---|
| ChatWidget conectado ao N8N | ✅ |
| OpenAI respondendo dentro do fluxo | ✅ (via N8N) |
| FSM preservada | ✅ N8N nunca altera estados |
| Resumo com confirmação obrigatória | ✅ AWAITING_SUMMARY_CONFIRMATION |
| Timeout tratado | ✅ 10s AbortController |
| Fallback implementado | ✅ Duplo: timeout + erro genérico |
| Logs implementados | ✅ console.info/error com auditoria |
| Backward compatible (N8N ausente) | ✅ shouldUseN8N() guard |

---

## Roadmap

| Sprint | Funcionalidade |
|---|---|
| **4.1** | Integração Kinbox — criar atendimento automaticamente |
| **4.2** | Memória Redis — substituir Postgres no contexto conversacional |
| **4.3** | Dashboard métricas N8N — `n8n_response_time`, taxa de sucesso |
| **4.4** | Sub-agentes por subárea ultra-especializados |
