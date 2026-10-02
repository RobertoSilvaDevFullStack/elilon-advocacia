# Auditoria Rate Limiting

**Data:** 22/06/2026

## Cobertura atual

| Endpoint | Limiter | Status |
|----------|---------|--------|
| `POST /api/diagnostico/pedido` | `diagnosticoPedidoLimiter` (5/min) | OK |
| `POST /api/asaas/webhook` | `asaasWebhookLimiter` (60/min) | OK |
| `POST /api/chat/pre-atendimento` | `preAtendimentoLimiter` (10/min) | OK |
| `POST /api/chat/upload-documents` | `uploadLimiter` (10/min) | OK |
| `POST /api/auth/login` | — | **AUSENTE** |
| `POST /api/diagnostico` (lead legado) | — | **AUSENTE** |
| `POST /api/leads` | — | **AUSENTE** |
| `GET /api/diagnostico/pedido/:id` | — | **AUSENTE** |

## Vulnerabilidade 1 — Login sem rate limit

**Classificação:** ALTO — Ver `JWT-AUDIT.md`.

## Vulnerabilidade 2 — Lead spam no diagnóstico legado

**Classificação:** MÉDIO

**Localização:** `apiRoutes.js` linha 70

```js
router.post("/diagnostico", diagnosticoLeadController.create);
```

**Risco:** Spam de leads, DoS no banco e webhooks N8N.

**Recomendação:** Aplicar `diagnosticoPedidoLimiter` ou `generalApiLimiter`.

## Vulnerabilidade 3 — Polling de pedido sem limite

**Classificação:** BAIXO

**Localização:** `GET /api/diagnostico/pedido/:id` — polling a cada 5s no frontend.

**Risco:** Consultas repetidas ao ASAAS API + side effect `_markAsPaid`.

**Recomendação:** Rate limit 30/min por IP+UUID.

## Positivo

- `generalApiLimiter` definido (100/15min) mas **não aplicado globalmente**.

**Recomendação:** `app.use('/api', generalApiLimiter)` em `server.js` como baseline.
