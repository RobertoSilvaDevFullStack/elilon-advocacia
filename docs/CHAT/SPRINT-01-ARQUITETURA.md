# Sprint 1 - Arquitetura Implementada

## Resumo

Esqueleto funcional do módulo Chat Jurídico implementado conforme especificações.

---

## Diagrama da Sprint 1

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Vite/React)                           │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         App.tsx                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │                    ChatWidget                               │  │   │
│  │  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │  │   │
│  │  │  │ ChatButton   │───▶│ ChatWindow   │───▶│ MessageList  │  │  │   │
│  │  │  │  (floating)  │    │  (overlay)   │    │              │  │  │   │
│  │  │  └──────────────┘    └──────────────┘    └──────────────┘  │  │   │
│  │  │                          │                    │            │  │   │
│  │  │                          ▼                    ▼            │  │   │
│  │  │                   ┌──────────────┐    ┌──────────────┐     │  │   │
│  │  │                   │  ChatInput   │    │MessageBubble │     │  │   │
│  │  │                   └──────────────┘    └──────────────┘     │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  │                              │                                  │   │
│  │                              │ useChatSession                   │   │
│  │                              │ useChatMessages                  │   │
│  │                              ▼                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  localStorage (session_id)  │  API Calls (/api/chat/*)    │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     │ HTTP
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Express/Node)                         │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     backend/app.js                               │   │
│  │                         │                                      │   │
│  │                         ▼                                      │   │
│  │              app.use("/api/chat", chatRoutes)                  │   │
│  │                         │                                      │   │
│  │  ┌────────────────────┼────────────────────────────────────┐  │   │
│  │  │              chat.routes.js                          │  │   │
│  │  │  POST /session       → ChatController.createSession   │  │   │
│  │  │  GET  /session/:id   → ChatController.getSession      │  │   │
│  │  │  POST /:id/message   → ChatController.sendMessage     │  │   │
│  │  │  GET  /:id/messages  → ChatController.getMessages       │  │   │
│  │  │  POST /:id/close     → ChatController.closeSession      │  │   │
│  │  └────────────────────┬────────────────────────────────────┘  │   │
│  │                       │                                         │   │
│  │                       ▼                                         │   │
│  │  ┌─────────────────────────────────────────────────────────┐  │   │
│  │  │              ChatController.js                          │  │   │
│  │  │  - Validação de entrada                                 │  │   │
│  │  │  - HTTP status codes                                    │  │   │
│  │  │  - JSON responses                                       │  │   │
│  │  └────────────────────────┬────────────────────────────────┘  │   │
│  │                           │                                    │   │
│  │                           ▼                                    │   │
│  │  ┌─────────────────────────────────────────────────────────┐  │   │
│  │  │              ChatService.js                             │  │   │
│  │  │  - Regras de negócio                                   │  │   │
│  │  │  - State Machine (simplificada)                         │  │   │
│  │  │  - Geração de protocolo                                 │  │   │
│  │  │  - Mensagens de boas-vindas                             │  │   │
│  │  └────────────────────────┬────────────────────────────────┘  │   │
│  │                           │                                    │   │
│  │                           ▼                                    │   │
│  │  ┌─────────────────────────────────────────────────────────┐  │   │
│  │  │              ChatRepository.js                          │  │   │
│  │  │  - PostgreSQL queries (database-postgres.js)            │  │   │
│  │  │  - CRUD sessions/messages/clients                       │  │   │
│  │  └────────────────────────┬────────────────────────────────┘  │   │
│  └───────────────────────────┬────────────────────────────────────┘   │
└──────────────────────────────┬────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE (PostgreSQL)                          │
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │  chat_clients   │  │ chat_sessions   │  │ chat_messages   │         │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤         │
│  │ id (UUID PK)    │  │ id (UUID PK)    │  │ id (UUID PK)    │         │
│  │ name            │◀─┤ client_id (FK)   │◀─┤ session_id (FK) │         │
│  │ email           │  │ current_state   │  │ sender_type     │         │
│  │ phone           │  │ context (JSONB) │  │ content         │         │
│  │ city            │  │ source          │  │ content_html    │         │
│  │ state           │  │ consent_lgpd    │  │ metadata (JSONB)│         │
│  │ area_juridica   │  │ expires_at      │  │ created_at      │         │
│  │ subarea         │  │ closed_at       │  └─────────────────┘         │
│  │ case_desc       │  │ protocol_number │                              │
│  └─────────────────┘  └─────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Arquivos Criada

```
elilon-advocacia/
├── src/modules/chat/
│   ├── domain/
│   │   └── entities/.gitkeep
│   ├── application/
│   │   └── dto/.gitkeep
│   ├── infrastructure/
│   │   └── database/models/.gitkeep
│   ├── presentation/
│   │   ├── components/
│   │   │   ├── ChatWidget/
│   │   │   │   ├── ChatButton.tsx
│   │   │   │   ├── ChatWindow.tsx
│   │   │   │   ├── ChatWidget.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useChatSession.ts
│   │   │   ├── useChatMessages.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── chat.types.ts
│   │   ├── context/.gitkeep
│   │   └── styles/.gitkeep
│   └── index.ts
│
├── backend/
│   ├── src/modules/chat/
│   │   ├── application/
│   │   │   ├── .gitkeep
│   │   │   └── ChatService.js
│   │   ├── infrastructure/
│   │   │   ├── ChatRepository.js
│   │   │   └── http/controllers/
│   │   │       └── ChatController.js
│   │   └── chat.routes.js
│   ├── database/migrations/
│   │   └── 001_create_chat_tables.sql
│   └── app.js (ATUALIZADO)
│
├── App.tsx (ATUALIZADO com ChatWidget)
└── docs/CHAT/
    └── SPRINT-01-ARQUITETURA.md (este arquivo)
```

---

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/chat/session` | Criar nova sessão |
| GET | `/api/chat/session/:id` | Recuperar sessão |
| POST | `/api/chat/session/:id/message` | Enviar mensagem |
| GET | `/api/chat/session/:id/messages` | Listar mensagens |
| POST | `/api/chat/session/:id/close` | Fechar sessão |

---

## Componentes Frontend

| Componente | Props | Descrição |
|------------|-------|-----------|
| ChatButton | `onClick, isOpen, unreadCount?` | Botão flutuante |
| ChatWindow | `isOpen, onClose, session, messages, onSendMessage, loading` | Janela principal |
| MessageList | `messages, loading` | Lista scrollável |
| MessageBubble | `message, isUser` | Balão de mensagem |
| ChatInput | `onSend, disabled, placeholder?` | Input com textarea |

---

## Hooks

| Hook | Retorno | Descrição |
|------|---------|-----------|
| useChatSession | `session, loading, error, startSession, recoverSession, closeSession, clearSession` | Gerenciamento de sessão |
| useChatMessages | `messages, loading, error, sendMessage, loadMessages, addLocalMessage` | Gerenciamento de mensagens |

---

## State Machine (Sprint 1 - Simplificada)

```
START → COLLECTING_NAME → COLLECTING_EMAIL → COLLECTING_PHONE
                                           ↓
                              COLLECTING_LOCATION → SELECTING_AREA
                                                               ↓
                                              DESCRIBING_CASE → READY_TO_CLOSE
                                                                               ↓
                                                                          CLOSED
```

---

## O que NÃO foi implementado (Próximas Sprints)

- ❌ N8N (orquestração)
- ❌ MinIO (storage de documentos)
- ❌ Kinbox (integração CRM)
- ❌ Hermes (IA/NLP)
- ❌ Docker adicional
- ❌ Upload de arquivos
- ❌ Dashboard administrativo
- ❌ Métricas e analytics

---

## Próximos Passos

1. **Sprint 2**: Implementar N8N + State Machine completa
2. **Sprint 3**: Integrar Hermes (IA)
3. **Sprint 4**: Adicionar MinIO para uploads
4. **Sprint 5**: Integrar Kinbox

---

Status: **✅ CONCLUÍDO**
