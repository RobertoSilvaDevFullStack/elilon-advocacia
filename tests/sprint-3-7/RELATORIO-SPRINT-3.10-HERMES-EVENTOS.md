# Relatório Sprint 3.10 — Eventos Hermes
**Data:** 2026-06-17  
**Status:** ✅ Concluído  
**Objetivo:** Transformar a conclusão da análise Hermes em um evento independente do sistema, disparando o webhook `hermes_analise_concluida` de forma auditável e com retry.

---

## Princípio de Design

O evento `hermes_analise_concluida` é **independente** do evento `chat_finalizado` (Sprint 3.9).  
Cada análise Hermes concluída gera seu próprio payload, sua própria trilha de auditoria e sua própria URL configurável.

---

## Fase 1 — Ponto de Hook no HermesAnalysisService

O hook foi inserido em `saveAnalysisResult()`, **após** o `UPDATE chat_ai_analysis SET status_analise = 'concluida'`:

```
HermesAnalysisService.analyzePreAtendimento()
  └── saveAnalysisResult()          ← análise persistida
        └── [async não-bloqueante]
              └── PreAtendimentoRepository.findById()
                    └── HermesWebhookService.dispatch()
```

O `Promise.then()` garante que:
- A resposta ao `ChatLeadController` não é bloqueada
- Falhas no webhook não afetam a análise persistida
- O fluxo do usuário nunca é impactado

---

## Fase 2 — HermesWebhookService

**Arquivo:** `backend/services/HermesWebhookService.js`

### Métodos públicos

| Método | Quando chamar |
|---|---|
| `dispatch(id, {atendimento, analysis})` | Automático após análise concluída |
| `redispatch(id)` | Manual via botão "Reenviar Evento Hermes" |

### Fluxo interno

```
dispatch(preAtendimentoId, { atendimento, analysis })
  └── SELECT settings WHERE key = 'hermes_webhook_url'
        └── [vazio] return silencioso
        └── [URL presente] _buildPayload()
              └── _dispatchWithRetry()
                    ├── tentativa 1 → POST (timeout 10s)
                    │     ├── 2xx → _log(success:true) + _updateStatus("enviado")
                    │     └── erro → _log(success:false) + sleep(1s)
                    ├── tentativa 2 → sleep(3s)
                    └── tentativa 3 → falha final → _updateStatus("falhou")
```

### Payload do evento

```json
{
  "evento": "hermes_analise_concluida",
  "timestamp": "2026-06-17T14:00:00.000Z",
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
    "descricao_caso": "Empresa com dívida fiscal..."
  },

  "hermes": {
    "urgencia": "alta",
    "complexidade": "media",
    "resumo": "Caso de débito tributário com prazo prescricional próximo...",
    "entidades": ["Empresa XYZ", "Receita Federal"],
    "documentos_relevantes": ["CNPJ", "Certidão de Dívida Ativa"],
    "prazos_potenciais": ["30 dias para recurso"],
    "valores_mencionados": ["R$ 50.000"],
    "observacoes": "Recomenda-se contato imediato.",
    "modelo_ia": "claude-sonnet-4",
    "tempo_processamento_ms": 2341,
    "status": "concluida"
  }
}
```

---

## Fase 3 — Schema (Migration 007)

**Arquivo:** `backend/migrations/007_hermes_webhook_tracking.sql`

### Colunas adicionadas em `chat_ai_analysis`

| Coluna | Tipo | Default |
|---|---|---|
| `hermes_webhook_status` | `VARCHAR(20)` | `'pendente'` |
| `hermes_webhook_sent_at` | `TIMESTAMP` | `NULL` |

### Nova tabela `hermes_webhook_logs`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `SERIAL PK` | — |
| `pre_atendimento_id` | `TEXT` | ID do pré-atendimento |
| `evento` | `VARCHAR(100)` | `hermes_analise_concluida` |
| `url` | `TEXT` | URL de destino |
| `status_code` | `INTEGER` | Código HTTP ou null |
| `success` | `BOOLEAN` | true se 2xx |
| `response` | `TEXT` | Resposta truncada 1000 chars |
| `created_at` | `TIMESTAMP` | Auto |

### Chave de configuração

```sql
INSERT INTO settings (key, value) VALUES ('hermes_webhook_url', '')
ON CONFLICT (key) DO NOTHING;
```

---

## Fase 4 — Endpoints

| Método | Rota | Ação |
|---|---|---|
| `GET` | `/api/admin/chat/hermes-webhook-logs/:id` | Status + histórico de logs |
| `POST` | `/api/admin/chat/hermes-webhook-logs/:id/reenviar` | Reenvio manual do evento |
| `POST` | `/api/admin/chat/analysis/:id/reprocess` | Reprocessar análise Hermes (Sprint 3.5, reutilizado) |

---

## Fase 5 — Admin UI

### Novo painel "Hermes — Ações" no modal de pré-atendimento

**Localização:** Coluna 2, após `AIAnalysisPanel`

#### Botões

| Botão | Cor | Ação |
|---|---|---|
| 🔄 Reprocessar Hermes | Índigo | `POST /admin/chat/analysis/:id/reprocess` |
| 📤 Reenviar Evento Hermes | Âmbar | `POST /admin/chat/hermes-webhook-logs/:id/reenviar` |

- Ambos mostram spinner `Loader2` durante execução
- Ambos ficam `disabled` enquanto qualquer ação está em progresso
- Após sucesso: refresh automático dos logs no painel
- Feedback via `alert()` (substituível por toast em Sprint futuro)

#### Badge de Status

| Estado | Badge |
|---|---|
| `pendente` | 🟡 Pendente |
| `enviado` | 🟢 Enviado |
| `falhou` | 🔴 Falhou |

Exibe também: data/hora do envio, última tentativa + código HTTP.

---

## Diferença entre os dois eventos

| Evento | Sprint | Serviço | Tabela de log | Quando dispara |
|---|---|---|---|---|
| `chat_finalizado` | 3.9 | `ChatWebhookService` | `chat_webhook_logs` | Após `PreAtendimentoRepository.create()` |
| `hermes_analise_concluida` | 3.10 | `HermesWebhookService` | `hermes_webhook_logs` | Após `HermesAnalysisService.saveAnalysisResult()` |

---

## Resumo de Arquivos

| Arquivo | Tipo | Mudança |
|---|---|---|
| `backend/services/HermesWebhookService.js` | **NOVO** | Service principal com retry e redispatch |
| `backend/migrations/007_hermes_webhook_tracking.sql` | **NOVO** | Schema: colunas + tabela de log |
| `backend/controllers/HermesWebhookLogController.js` | **NOVO** | GET logs + POST reenviar |
| `backend/services/HermesAnalysisService.js` | Modificado | Hook após saveAnalysisResult |
| `backend/routes/apiRoutes.js` | Modificado | 2 novas rotas |
| `pages/Admin.tsx` | Modificado | Painel Hermes com 2 botões + badge |

---

## Para ativar

```sql
-- Aplicar migration
\i backend/migrations/007_hermes_webhook_tracking.sql

-- Configurar URL
UPDATE settings SET value = 'https://n8n.dominio.com/webhook/hermes-juridico'
WHERE key = 'hermes_webhook_url';
```

---

## Próximos Passos — Sprint 3.11

1. **Toast notifications** — substituir `alert()` por sistema de toast não-bloqueante no Admin
2. **Histórico expandível** — mostrar todos os logs em accordion no painel, não apenas o mais recente
3. **Retry automático agendado** — job `cron` que verifica `hermes_webhook_status = 'falhou'` e retenta diariamente
4. **Webhook para falha Hermes** — evento `hermes_analise_falhou` para notificar equipe sobre análises que não processaram
