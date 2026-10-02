# Auditoria Webhooks

**Data:** 22/06/2026

## Vulnerabilidade 1 — Webhook ASAAS confia no body sem verificar na API

**Classificação:** ALTO

**Localização:**
- Arquivo: `backend/controllers/AsaasWebhookController.js`
- Linhas: 14-61
- Função: `handleWebhook`

**Evidência:**

```js
const { event, payment } = req.body;
// ...
if (mapped.isPaid) {
  await diagnosticoPedidoController._markAsPaid(pedido.id, payment.id);
}
```

Não há chamada a `asaasService.getPayment(payment.id)` para confirmar status real.

**Risco:** Com token de webhook comprometido, atacante marca pedidos como pagos sem pagamento real, dispara webhook N8N `diagnostico_pago` e libera entrega.

**Cenário de Exploração:**

```bash
curl -X POST https://api.../api/asaas/webhook?token=seu_token \
  -H "Content-Type: application/json" \
  -d '{"event":"PAYMENT_CONFIRMED","payment":{"id":"pay_xxx","status":"CONFIRMED"}}'
```

**Recomendação:** Sempre revalidar pagamento via API ASAAS antes de `_markAsPaid`.

---

## Vulnerabilidade 2 — Token aceito via query string

**Classificação:** MÉDIO

**Localização:** `AsaasWebhookController.js` linha 19

**Evidência:**

```js
const token =
  req.headers["asaas-access-token"] ||
  req.headers["x-asaas-access-token"] ||
  req.query.token;
```

**Risco:** Token aparece em logs de proxy, histórico de servidor, Referer.

**Recomendação:** Aceitar apenas header. Remover `req.query.token`.

---

## Vulnerabilidade 3 — Comparação de token não timing-safe

**Classificação:** BAIXO

**Evidência:** `AsaasService.js` linha 160:

```js
return receivedToken === expected;
```

**Recomendação:** `crypto.timingSafeEqual(Buffer.from(...), Buffer.from(...))`.

---

## Vulnerabilidade 4 — Webhook interno diagnostico_pago sem autenticação

**Classificação:** MÉDIO

**Localização:** `backend/services/DiagnosticoPagamentoWebhookService.js`

Dispara POST para URL configurada sem HMAC/secret.

**Risco:** Se N8N URL vazar, terceiros recebem PII completa (pedido, lead, pagamento).

**Recomendação:** Assinar payload com `X-Webhook-Signature: sha256=...`.

---

## Positivo

- Webhook ASAAS rejeita se `ASAAS_WEBHOOK_TOKEN` ausente.
- Rate limit `asaasWebhookLimiter` (60/min) aplicado.
