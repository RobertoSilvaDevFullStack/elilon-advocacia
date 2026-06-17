# Relatório Sprint 3.9 — Webhook Universal do Chat Jurídico
**Data:** 2026-06-17  
**Status:** ✅ Concluído  
**Objetivo:** Transformar o Chat Jurídico em canal de atendimento em tempo real com integração externa via webhook.

---

## Fase 1 — Auditoria do Fluxo Atual

### Mapa do Fluxo (pré-Sprint 3.9)

```
Cliente
  └── ChatWidget.tsx (FSM)
        └── POST /api/chat/pre-atendimento
              └── ChatLeadController.create()
                    └── CreatePreAtendimentoService.execute()
                          └── PreAtendimentoRepository.create()
                                └── INSERT chat_pre_atendimentos → protocolo JUR-YYYYMMDD-XXXX
                          └── [async] HermesAnalysisService.analyzePreAtendimento()
        └── [se documentos] POST /api/chat/upload-documents
              └── ChatDocumentController.upload()
                    └── ChatDocumentRepository.create() × N arquivos
```

### Pontos de Disparo Identificados

| Momento | Dados disponíveis | Escolha |
|---|---|---|
| Após `CreatePreAtendimentoService` | atendimento completo, sem documentos | ✅ **Disparo inicial** |
| Após `ChatDocumentController.upload` | atendimento + documentos vinculados | ✅ **Re-disparo com docs** |
| Após `HermesAnalysisService` concluir | análise de IA disponível | ⏳ Futuro (Sprint 3.10) |

---

## Fase 2 — Configuração

### Chave de settings

```sql
INSERT INTO settings (key, value) VALUES ('chat_webhook_url', 'https://n8n.dominio.com/webhook/chat-juridico');
```

- Se `chat_webhook_url` não existir no banco: **nenhum erro**, nenhum disparo
- Se existir: disparo automático após cada pré-atendimento concluído

---

## Fase 3 — Disparo do Webhook

### Service: `backend/services/ChatWebhookService.js`

**Fluxo interno:**
```
dispatch(preAtendimentoId, { atendimento, documentos, hermes })
  └── SELECT settings WHERE key = 'chat_webhook_url'
        └── [se vazio] return (silencioso)
        └── [se URL] _buildPayload()
              └── _dispatchWithRetry() — 3 tentativas
                    ├── tentativa 1 → axios.POST (timeout 10s)
                    │     ├── sucesso → _log(success:true) + _updateWebhookStatus("enviado")
                    │     └── falha  → _log(success:false) + sleep(1s) → tentativa 2
                    ├── tentativa 2 → sleep(3s) → tentativa 3
                    └── tentativa 3 → falha final → _updateWebhookStatus("falhou")
```

### Payload Enviado

```json
{
  "evento": "chat_finalizado",
  "timestamp": "2026-06-17T13:45:00.000Z",
  "protocolo": "JUR-20260617-0001",
  "cliente": {
    "nome": "João da Silva",
    "telefone": "(11) 99999-9999",
    "email": "joao@email.com",
    "cidade": "São Paulo",
    "estado": "SP"
  },
  "juridico": {
    "area": "Direito Tributário",
    "subarea": "Reforma Tributária",
    "descricao_caso": "Empresa com..."
  },
  "documentos": [
    {
      "id": "uuid",
      "nome": "contrato.pdf",
      "tipo": "application/pdf",
      "tamanho": 204800
    }
  ],
  "hermes": {
    "urgencia": null,
    "complexidade": null,
    "resumo": null,
    "status": "pendente"
  }
}
```

### Estratégia de Dois Disparos

| Disparo | Quem | Quando | Documentos |
|---|---|---|---|
| **Inicial** | `ChatLeadController.create()` | Após INSERT + protocolo | `[]` vazio |
| **Re-disparo** | `ChatDocumentController.upload()` | Após upload de arquivos | Com documentos |

O receptor do webhook recebe dois eventos: o primeiro confirma o lead imediatamente; o segundo entrega os documentos quando chegam (segundos depois, na mesma sessão).

---

## Fase 4 — Auditoria (Tabela de Log)

### Migration: `backend/migrations/006_chat_webhook_tracking.sql`

```sql
-- Colunas adicionadas em chat_pre_atendimentos (idempotente):
ALTER TABLE chat_pre_atendimentos
  ADD COLUMN IF NOT EXISTS webhook_status   VARCHAR(20)  DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS webhook_sent_at  TIMESTAMP    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS webhook_attempts INTEGER      DEFAULT 0;

-- Nova tabela:
CREATE TABLE IF NOT EXISTS chat_webhook_logs (
  id                  SERIAL PRIMARY KEY,
  pre_atendimento_id  UUID         NOT NULL,
  evento              VARCHAR(100) NOT NULL DEFAULT 'chat_finalizado',
  url                 TEXT         NOT NULL,
  status_code         INTEGER      DEFAULT NULL,
  success             BOOLEAN      NOT NULL DEFAULT FALSE,
  response            TEXT         DEFAULT NULL,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pre_atendimento_id) REFERENCES chat_pre_atendimentos(id) ON DELETE CASCADE
);
```

---

## Fase 5 — Retry com Backoff Exponencial

| Tentativa | Delay antes | Timeout HTTP |
|---|---|---|
| 1ª | — | 10s |
| 2ª | 1s | 10s |
| 3ª | 3s | 10s |
| Falha final | +5s (não realizada) | — |

- Cada tentativa gera uma linha em `chat_webhook_logs`
- Falha não lança exceção ao chamador — 100% não-bloqueante
- `webhook_status` final: `enviado` ou `falhou`

---

## Fase 6 — Dashboard

### Badge no Modal de Pré-Atendimento (`pages/Admin.tsx`)

Painel "Webhook Status" adicionado na coluna 2 do modal, após AIAnalysisPanel:

| Estado | Badge | Classe |
|---|---|---|
| `pendente` | 🟡 Pendente | `bg-yellow-100 text-yellow-800` |
| `enviado`  | 🟢 Enviado  | `bg-green-100 text-green-800` |
| `falhou`   | 🔴 Falhou   | `bg-red-100 text-red-800` |

Exibe também:
- Número de tentativas (`webhook_attempts`)
- Data/hora do envio (`webhook_sent_at`)
- Última tentativa + código HTTP (`chat_webhook_logs[0]`)

### Endpoint de suporte

```
GET /api/admin/chat/webhook-logs/:preAtendimentoId
Authorization: Bearer <adminToken>
```

Resposta:
```json
{
  "success": true,
  "data": {
    "pre_atendimento": { "id": "...", "protocolo": "JUR-...", "webhook_status": "enviado", ... },
    "logs": [ { "id": 1, "success": true, "status_code": 200, "created_at": "..." } ]
  }
}
```

---

## Fase 7 — Testes

### Cenários Testáveis

| # | Cenário | Como Testar | Resultado Esperado |
|---|---|---|---|
| 1 | Atendimento sem documentos | Chat normal, sem upload | 1 disparo, `documentos: []` |
| 2 | Atendimento com documentos | Chat + upload de PDF/JPG | 2 disparos, 2º com docs |
| 3 | Hermes concluído | Aguardar análise | `hermes.status: "pendente"` (Hermes não integrado ainda) |
| 4 | Hermes pendente | Imediato após chat | `hermes.status: "pendente"` |
| 5 | Falha de webhook | URL incorreta no settings | 3 tentativas logadas, `webhook_status: "falhou"` |
| 6 | Retry automático | Servidor instável | Logs mostram tentativas 1, 2, 3 |
| 7 | URL não configurada | `chat_webhook_url` ausente | Nenhum erro, nenhum log |

### Endpoint Mock para Testes

```bash
# Simular receptor com httpbin:
INSERT INTO settings (key, value) VALUES ('chat_webhook_url', 'https://httpbin.org/post')
  ON CONFLICT (key) DO UPDATE SET value = 'https://httpbin.org/post';

# Ou endpoint local (Express):
# POST /api/test/webhook-mock → responde 200 {"received": true}
```

---

## Resumo de Arquivos Criados/Modificados

| Arquivo | Tipo | Mudança |
|---|---|---|
| `backend/services/ChatWebhookService.js` | **NOVO** | Service principal: payload, retry, log |
| `backend/migrations/006_chat_webhook_tracking.sql` | **NOVO** | Schema: colunas + tabela de log |
| `backend/controllers/ChatWebhookLogController.js` | **NOVO** | GET logs por pré-atendimento |
| `backend/controllers/ChatLeadController.js` | Modificado | Disparo inicial após `result` |
| `backend/controllers/ChatDocumentController.js` | Modificado | Re-disparo após upload |
| `backend/routes/apiRoutes.js` | Modificado | Rota `GET /admin/chat/webhook-logs/:id` |
| `pages/Admin.tsx` | Modificado | Badge Webhook Status no modal |

---

## Fluxo Final Implementado

```
Cliente
  ↓
Chat Jurídico (FSM)
  ↓
Persistência (chat_pre_atendimentos)
  ↓
Protocolo JUR-YYYYMMDD-XXXX
  ↓
ChatWebhookService.dispatch() ← disparo 1 (sem docs)
  ↓
[se docs] upload de arquivos
  ↓
ChatWebhookService.dispatch() ← disparo 2 (com docs)
  ↓
POST → N8N / Telegram / CRM / Kinbox
  ↓
Equipe Jurídica em tempo real

Sem intervenção manual.
```

---

## Próximos Passos — Sprint 3.10

1. **Integrar Hermes no webhook** — quando `HermesAnalysisService` conclui, re-disparar com `hermes.status: "concluida"` e dados de urgência/complexidade preenchidos
2. **Retry manual no painel** — botão "Re-disparar Webhook" no modal para leads com `status: "falhou"`
3. **Alertas por e-mail** — notificar admin quando `webhook_attempts >= 3 AND success = false`
4. **Configurar URL real** — inserir URL do N8N em `settings.chat_webhook_url` via painel de configurações
