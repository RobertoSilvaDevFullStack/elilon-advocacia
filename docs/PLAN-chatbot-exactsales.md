# PLAN-chatbot-exactsales

## Descrição do Objetivo

Implementar um **Chatbot Inteligente** com IA no site para capturar leads e tirar dúvidas. O sistema utilizará o **n8n (VPS)** como orquestrador central de inteligência e integração, responsável por conectar a IA (OpenAI/Anthropic) e o CRM (Exact Sales).

## Revisão do Usuário Necessária

> [!IMPORTANT]
> **n8n Webhook URL**: Precisaremos da URL do Workflow do n8n (ex: `https://n8n.seudominio.com/webhook/chat`).
>
> **Token da API IA**: Chave da OpenAI ou Anthropic configurada no n8n.
>
> **Token da API Exact Sales**: Token da Exact Spotter configurado no n8n.

## Mudanças Propostas

### Backend (Node.js/Express)

O backend funcionará como um **Proxy Seguro**, recebendo mensagens do frontend e encaminhando para o n8n. Isso protege a URL do n8n e centraliza logs.

#### [NOVO] [chat.service.js](file:///g:/PROJETOS/elilon-advocacia/backend/services/chat.service.js)

- Função `sendMessage(messageData)`:
  - Recebe `{ sessionId, message, userContext }`.
  - Envia via `POST` para o Webhook do n8n (incluindo contexto do usuário).
  - Recebe `{ reply, action }` do n8n.
  - Salva histórico básico no banco local (opcional, para backup).

#### [NOVO] [chat.controller.js](file:///g:/PROJETOS/elilon-advocacia/backend/controllers/chat.controller.js)

- Endpoint `send`:
  - Recebe mensagem do frontend.
  - Chama `ChatService.sendMessage`.
  - Retorna resposta da IA para o frontend.

#### [NOVO] [chat.routes.js](file:///g:/PROJETOS/elilon-advocacia/backend/routes/chat.routes.js)

- `POST /send` -> `ChatController.send`.

#### [MODIFICAR] [app.js](file:///g:/PROJETOS/elilon-advocacia/backend/app.js)

- Registrar `chatRouter` sob `/api/chat`.

### n8n (Orquestração & IA)

O fluxo no n8n será responsável pela lógica:

1.  **Webhook**: Recebe a mensagem + contexto (Nome/Telefone já capturados).
2.  **Agente de IA**:
    - Recebe o contexto do usuário ("O usuário é João, tel: 123456").
    - Analisa a intenção e responde dúvidas jurídicas.
3.  **Ferramenta Exact Sales**:
    - **Dispara Cadastro de Lead na primeira interação** (pois já temos os dados).
4.  **Resposta**: Retorna o texto da IA para o backend.

### Frontend (React)

#### [NOVO] [ChatWidget.tsx](file:///g:/PROJETOS/elilon-advocacia/components/ChatWidget.tsx)

- Botão flutuante que abre/fecha o chat.

#### [NOVO] [ChatApp.tsx](file:///g:/PROJETOS/elilon-advocacia/components/chat/ChatApp.tsx)

- **Lógica de "Lead Gate" (Obrigatório)**:
  - Ao abrir, exibe formulário: **"Para iniciar o atendimento, digite seu Nome e WhatsApp"**.
  - O chat com a IA **só libera** após o preenchimento.
  - Os dados (Nome/Telefone) são enviados em **todas** as mensagens subsequentes para o backend/n8n como contexto.
- Exibe mensagens de usuário (direita) e bot (esquerda).
- Estado de carregamento ("Digitando...") enquanto espera o backend/n8n.

#### [MODIFICAR] [App.tsx](file:///g:/PROJETOS/elilon-advocacia/App.tsx)

- Adicionar `<ChatWidget />` ao layout principal.

## Plano de Verificação

### Testes Automatizados

- **Testes Backend**: Mock do n8n para garantir que o backend repassa corretamente as respostas.

### Verificação Manual

1.  **Fluxo de Lead Gate**:
    - Tentar enviar mensagem sem preencher nome/telefone (botão bloqueado).
    - Preencher e enviar -> Verificar se liberou o chat.
2.  **Integração**:
    - Enviar "Olá" -> Verificar se o n8n recebeu o Nome/Telefone no payload.
    - Verificar no Exact Sales se o lead foi criado.
