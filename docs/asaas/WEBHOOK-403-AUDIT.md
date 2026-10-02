# Auditoria — Webhook ASAAS retornando 403

**Data:** 22/06/2026  
**Endpoint:** `POST https://api.elilonlopesadvogados.com.br/api/asaas/webhook`  
**Evento reportado:** `PAYMENT_RECEIVED`  
**Escopo:** Investigação — sem correções automáticas

---

## Resumo executivo

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | Qual token o ASAAS enviou? | Header **`asaas-access-token`** (valor só visível nos logs temporários em produção) |
| 2 | Qual token o backend esperava? | **`process.env.ASAAS_WEBHOOK_TOKEN`** |
| 3 | Header correto? | **SIM** — `asaas-access-token` (fallback `x-asaas-access-token`) |
| 4 | Causa provável do 403 | **Token incorreto / placeholder no servidor** + possível **camada infra** antes do Node |

**Achado crítico:** O código da aplicação retorna **`401`** quando o token falha, **não `403`**. Se o painel ASAAS mostra 403, parte da rejeição pode ocorrer **antes** do Express (proxy, WAF, hosting) — ou o ASAAS agrupa falhas de autenticação como 403 na UI.

**Achado crítico #2:** No `.env` local, `ASAAS_WEBHOOK_TOKEN=seu_token` é **placeholder** (9 caracteres). O ASAAS exige token entre **32 e 255 caracteres**. Em produção, se o valor for igual ou ausente, a validação **sempre falha**.

---

## ETAPA 1 — Rota, controller e middleware

### Rota

**Arquivo:** `backend/routes/apiRoutes.js` (linha 85)

```javascript
router.post("/asaas/webhook", asaasWebhookLimiter, asaasWebhookController.handleWebhook);
```

URL completa: `POST /api/asaas/webhook`

### Cadeia de middleware (ordem)

```
app.js / server.js
  → helmet()
  → cors(corsOptions)
  → express.json()
  → generalApiLimiter  (skip: /asaas/webhook)
  → apiRoutes
      → asaasWebhookLimiter  (60 req/min)
      → AsaasWebhookController.handleWebhook
```

**Não passa por:** `authMiddleware`, `requireRole`, JWT — rota é **pública** (protegida só por token ASAAS).

### Controller

**Arquivo:** `backend/controllers/AsaasWebhookController.js`  
**Handler:** `exports.handleWebhook`

### Validação de token (completa)

**1. Extração do header** (`AsaasWebhookController.js`):

```javascript
const token =
  req.headers["asaas-access-token"] || req.headers["x-asaas-access-token"];
```

**Não usa:** `Authorization`, `Bearer`, query string ou body.

**2. Validação** (`AsaasService.validateWebhookToken`):

```javascript
validateWebhookToken(receivedToken) {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expected || !receivedToken || typeof receivedToken !== "string") {
    return false;  // env ausente OU header ausente
  }
  if (receivedToken.length !== expected.length) {
    return false;  // tamanhos diferentes → timingSafeEqual nem roda
  }
  return crypto.timingSafeEqual(
    Buffer.from(receivedToken),
    Buffer.from(expected)
  );
}
```

**3. Resposta em falha de autenticação:**

```javascript
return res.status(401).json({ success: false, message: "Não autorizado" });
```

---

## ETAPA 2 — Logs temporários adicionados

**Arquivo:** `backend/controllers/AsaasWebhookController.js`  
**Marcador:** `[AUDIT TEMP]`

```javascript
console.log("ASAAS HEADERS", req.headers);
console.log("ASAAS TOKEN HEADER", req.headers["asaas-access-token"]);
console.log("ASAAS TOKEN HEADER (x-asaas)", req.headers["x-asaas-access-token"]);
console.log("ENV TOKEN", process.env.ASAAS_WEBHOOK_TOKEN);
console.log("ENV TOKEN LENGTH", process.env.ASAAS_WEBHOOK_TOKEN?.length ?? 0);
console.log("RECEIVED TOKEN LENGTH", ...);
```

### Como capturar evidência em produção

1. Fazer deploy/restart do backend em `api.elilonlopesadvogados.com.br`
2. Reenviar webhook no painel ASAAS (ou simular pagamento)
3. Ler logs do servidor (PM2, Docker, painel Cloudez)
4. Comparar **byte a byte** `ASAAS TOKEN HEADER` vs `ENV TOKEN`

> ⚠️ Remover logs após diagnóstico — expõem o token completo.

---

## ETAPA 3 — Header validado pelo backend

| Header | Usado? |
|--------|--------|
| `asaas-access-token` | ✅ **Principal** (documentação ASAAS) |
| `x-asaas-access-token` | ✅ Fallback no código |
| `Authorization` | ❌ Não |
| `Bearer` | ❌ Não |

**Documentação ASAAS:**  
[Webhooks — Authentication Token](https://docs.asaas.com/docs/webhooks-3)  
[Receive Asaas Events at Your Webhook Endpoint](https://docs.asaas.com/docs/receive-asaas-events-at-your-webhook-endpoint)

> *"This token will be sent in the `asaas-access-token` header."*

O header esperado pelo backend está **correto**.

---

## ETAPA 4 — Token ASAAS vs `ASAAS_WEBHOOK_TOKEN`

### Onde configurar cada lado

| Lado | Onde |
|------|------|
| **ASAAS** | Menu → Integrações → Webhooks → campo "Token de autenticação" |
| **Backend** | Variável `ASAAS_WEBHOOK_TOKEN` no `.env` do **servidor de produção** |

### Estado local (dev) — evidência

**Arquivo:** `backend/.env`

```
ASAAS_WEBHOOK_TOKEN=seu_token
```

| Problema | Detalhe |
|----------|---------|
| Placeholder | Valor literal `seu_token`, não token real |
| Tamanho | 9 caracteres — ASAAS exige **32–255** |
| Sandbox vs prod | Webhook aponta para **API produção**; token deve estar no **servidor produção**, não só no `.env` local |

### Requisitos ASAAS para token válido

- 32 a 255 caracteres
- Sem espaços
- Sem sequências numéricas simples (12345)
- Sem 4 letras repetidas
- **Não pode ser a API key do ASAAS**

### Cenários de falha

| Cenário | Sintoma |
|---------|---------|
| `ASAAS_WEBHOOK_TOKEN` ausente no servidor | Header recebido, env vazio → **401** |
| Placeholder `seu_token` no servidor | Token ASAAS longo, env curto → **length mismatch → 401** |
| Token ASAAS ≠ env (typo, sandbox vs prod) | **timingSafeEqual false → 401** |
| Header não enviado pelo ASAAS | `receivedToken` undefined → **401** |
| Infra bloqueia antes do Node | **403** sem logs `[AUDIT TEMP]` |

---

## ETAPA 5 — Por que 403 e não 401?

### O que o código Node retorna

| Situação | HTTP |
|----------|------|
| Token inválido/ausente | **401** |
| Payload inválido | **400** |
| Erro interno | **500** |
| Rate limit webhook | **429** |
| Rate limit geral | **429** |

**Nenhum trecho do webhook ASAAS retorna 403.**

### Onde 403 aparece no projeto (outras rotas)

| Arquivo | Motivo |
|---------|--------|
| `authMiddleware.js` | JWT ausente em rotas protegidas |
| `requireRole.js` | Role insuficiente |
| `DiagnosticoPedidoController.js` | Token de acesso ao pedido inválido |

Essas rotas **não** são o webhook ASAAS.

### Hipóteses para HTTP 403 no painel ASAAS

1. **Proxy / hosting / WAF** (Cloudez, nginx, Cloudflare) bloqueia POST externo
2. **ASAAS UI** rotula falha de autenticação como "403" genericamente
3. Request **não chega** ao Node → logs `[AUDIT TEMP]` **não aparecem**
4. CORS raramente afeta server-to-server (sem `Origin` → permitido)

### Como distinguir

| Evidência | Conclusão |
|-----------|-----------|
| Logs `[AUDIT TEMP]` aparecem + `401` | Problema de **token** no app |
| Logs **não** aparecem + `403` | Problema de **infra** antes do Node |
| `RECEIVED TOKEN LENGTH` ≠ `ENV TOKEN LENGTH` | **timingSafeEqual** nem executa — tokens diferentes |

---

## ETAPA 6 — Respostas finais

### 1. Qual token o ASAAS enviou?

**Não capturado automaticamente nesta auditoria** (requer log em produção no momento do POST).

Formato esperado: string no header `asaas-access-token`, 32–255 chars, definido ao criar o webhook no painel ASAAS.

### 2. Qual token o backend esperava?

`process.env.ASAAS_WEBHOOK_TOKEN` no servidor que atende `api.elilonlopesadvogados.com.br`.

Local dev: `seu_token` (placeholder inválido).

### 3. Header correto?

**SIM** — `asaas-access-token` conforme documentação ASAAS.

### 4. O problema é:

| Causa | Probabilidade | Evidência |
|-------|---------------|-----------|
| **Token incorreto / placeholder no servidor** | **Alta** | `.env` local com `seu_token`; validação exige match exato |
| **Variável ausente em produção** | **Alta** | `validateWebhookToken` retorna false se `!expected` |
| **Header errado** | **Baixa** | Código alinhado à doc ASAAS |
| **timingSafeEqual falhando** | **Média** | Só após lengths iguais; senão falha antes no length check |
| **Infra retornando 403** | **Média** | App retorna 401, não 403 |

---

## Checklist de correção (manual — não implementado)

1. [ ] No painel ASAAS → Webhooks → copiar **token de autenticação** exato
2. [ ] No servidor produção → definir `ASAAS_WEBHOOK_TOKEN=<mesmo valor>` (32+ chars)
3. [ ] Reiniciar backend produção
4. [ ] Reenviar webhook de teste
5. [ ] Confirmar logs: `ASAAS TOKEN HEADER` === `ENV TOKEN` (comprimentos iguais)
6. [ ] Se ainda 403 **sem logs** → abrir ticket hosting / revisar nginx/WAF
7. [ ] Remover logs `[AUDIT TEMP]` após resolver

### Gerar token seguro (se necessário)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use o **mesmo valor** no ASAAS (Integrações → Webhooks) e no `.env` de produção.

---

## Arquivos relacionados

| Arquivo | Função |
|---------|--------|
| `backend/routes/apiRoutes.js` | Rota POST `/asaas/webhook` |
| `backend/controllers/AsaasWebhookController.js` | Handler + logs temporários |
| `backend/services/AsaasService.js` | `validateWebhookToken()` |
| `backend/middleware/rateLimiter.js` | `asaasWebhookLimiter` |
| `backend/app.js` | CORS, helmet, rate limit global |
| `backend/.env.example` | Documentação `ASAAS_WEBHOOK_TOKEN` |

---

## Referências

- [Webhooks ASAAS](https://docs.asaas.com/docs/webhooks-3)
- [Receive events at webhook endpoint](https://docs.asaas.com/docs/receive-asaas-events-at-your-webhook-endpoint)
- [Create webhook via web application](https://docs.asaas.com/docs/create-new-webhook-via-web-application)
