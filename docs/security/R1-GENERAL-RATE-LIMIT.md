# R1 — Rate Limit Global (generalApiLimiter)

**Sprint:** 3.12.2  
**Data:** 22/06/2026  
**Status:** ✅ Implementado

---

## Problema (V2)

`generalApiLimiter` existia em `rateLimiter.js` mas não era aplicado globalmente em `/api`.

---

## Implementação

### Middleware

**Arquivo:** `backend/middleware/rateLimiter.js`

- `generalApiLimiter`: 100 requisições / 15 minutos por IP
- Skip automático para webhooks inbound:

```js
const GENERAL_API_SKIP_PATHS = [
  "/asaas/webhook",
  "/chat/webhook",
  "/hermes/webhook",
];
```

### Aplicação

**Arquivos:** `backend/app.js`, `backend/server.js`

```js
app.use("/api/auth", authRoutes);        // authLimiter próprio — fora do global
app.use("/api", generalApiLimiter);      // baseline global
app.use("/api", apiRoutes);
app.use("/api/chat", chatRoutes);
```

### Health checks

`/health` e `/health/simple` montados **fora** de `/api` — não afetados pelo limiter global.

---

## Impacto em integrações

| Integração | Rota | Impacto |
|------------|------|---------|
| ASAAS webhook | `POST /api/asaas/webhook` | **Sem impacto** — skip + `asaasWebhookLimiter` dedicado |
| N8N inbound | `/api/chat/webhook`, `/api/hermes/webhook` | **Sem impacto** — skip (rotas reservadas; webhooks atuais são outbound) |
| Health (Uptime Kuma) | `GET /health`, `/health/simple` | **Sem impacto** — fora de `/api` |
| Login admin | `POST /api/auth/login` | **Sem impacto duplo** — montado antes do global; usa `authLimiter` (5/min) |
| Chat N8N | `POST /api/chat/session/*/message` | Protegido pelo global (100/15min) — suficiente para uso normal |
| Hermes outbound | Disparo interno via axios | **Sem impacto** — não passa pelo Express inbound |

---

## Validação

```bash
# Deve retornar 429 após 100 requests em 15 min (teste de carga)
for i in {1..101}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/api/posts; done

# Webhook ASAAS deve continuar funcionando (com token válido)
curl -X POST http://localhost:5000/api/asaas/webhook \
  -H "asaas-access-token: $ASAAS_WEBHOOK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"event":"PAYMENT_CREATED","payment":{"id":"pay_test"}}'

# Health sem rate limit
curl http://localhost:5000/health/simple
```

**Check automatizado:** `tests/security/run-security-audit.cjs` → R1 PASS

---

## Observações

- Limiters específicos (leads, diagnóstico, upload, pré-atendimento) continuam ativos **além** do global.
- Em produção, monitorar headers `RateLimit-*` nos logs de 429.
