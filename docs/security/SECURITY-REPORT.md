# SECURITY REPORT — Elilon Advocacia

**Data:** 22/06/2026  
**Escopo:** Backend Express, Frontend React, Diagnóstico Tributário Premium (Sprint 3.11), Chat, Admin  
**Metodologia:** Análise estática de código + `npm audit`

---

## Score Final

### Segurança Geral

**Nota: 6.3 / 10**

**Classificação: Risco Moderado — Não recomendado para produção sem correções prioritárias**

---

### Resumo por Categoria

| Categoria      | Nota | Principais achados |
| -------------- | ---- | ------------------ |
| Dependências   | 6.5  | 3 HIGH no backend (form-data, qs, nodemailer) |
| SQL Injection  | 8.5  | Queries parametrizadas; wildcards LIKE menores |
| XSS            | 6.0  | Chat `contentHtml` sem DOMPurify |
| Upload         | 6.5  | Magic numbers OK; download público de docs |
| JWT            | 5.5  | Secret fallback; login sem rate limit |
| Autorização    | 4.0  | **Register público duplicado**; sem RBAC |
| Webhooks       | 5.0  | ASAAS confia body; token fraco/query |
| CORS           | 7.0  | Whitelist OK; null origin permitido |
| Headers        | 4.0  | Helmet ausente |
| Infraestrutura | 5.5  | Admin padrão admin123; .env gitignored OK |

---

## Vulnerabilidades Críticas e Altas (Resumo)

### 1. Registro público duplicado — CRÍTICO

**Localização:** `backend/routes/apiRoutes.js:144`

```js
router.post("/auth/register", authController.register);
```

Ver `AUTHORIZATION-AUDIT.md`.

---

### 2. Download de documentos jurídicos sem auth — ALTO

**Localização:** `backend/routes/apiRoutes.js:91`, `ChatDocumentController.download`

Ver `UPLOAD-AUDIT.md`.

---

### 3. Webhook ASAAS não revalida pagamento — ALTO

**Localização:** `backend/controllers/AsaasWebhookController.js:52-53`

Ver `WEBHOOK-AUDIT.md`.

---

### 4. JWT secret fallback — ALTO

**Localização:** `backend/middleware/authMiddleware.js:3-4`

Ver `SECRETS-AUDIT.md`, `JWT-AUDIT.md`.

---

### 5. XSS no chat (contentHtml) — ALTO

**Localização:** `MessageBubble.tsx:55`

Ver `XSS-AUDIT.md`.

---

### 6. Login sem rate limiting — ALTO

**Localização:** `authLimiter` definido mas não aplicado

Ver `RATE-LIMIT-AUDIT.md`.

---

### 7. Ausência de RBAC admin — ALTO

Qualquer `editor` acessa dados sensíveis.

Ver `AUTHORIZATION-AUDIT.md`.

---

### 8. Security headers ausentes — ALTO

Ver `HEADERS-AUDIT.md`.

---

## Pontos Positivos (Evidências)

1. **SQL parametrizado** em DiagnosticoPedidoController, authController, AsaasWebhookController.
2. **Precificação recalculada no backend** — valor do frontend ignorado (`getPriceForRegime`).
3. **Sanitização de entrada** em `inputValidator.js` (email, telefone, CPF/CNPJ).
4. **Upload com magic numbers** (`fileValidator.js`).
5. **Blog com DOMPurify** antes de `dangerouslySetInnerHTML`.
6. **Rate limit** em pedido premium e webhook ASAAS.
7. **`.env` no `.gitignore`**.

---

## Priorização para Produção

| Prioridade | Ação | Esforço |
|------------|------|---------|
| P0 | Remover `/api/auth/register` público | 5 min |
| P0 | Revalidar pagamento ASAAS no webhook | 1h |
| P0 | Proteger download de documentos | 2h |
| P1 | Adicionar helmet + authLimiter no login | 30 min |
| P1 | RBAC `requireAdmin` nas rotas admin | 2h |
| P1 | DOMPurify no MessageBubble | 15 min |
| P1 | Remover JWT secret fallback | 15 min |
| P2 | npm audit fix | 30 min |
| P2 | Token webhook timing-safe + sem query | 30 min |
| P2 | Rate limit em `/api/diagnostico` | 15 min |

---

## Documentos Relacionados

- [DEPENDENCY-AUDIT.md](./DEPENDENCY-AUDIT.md)
- [SECRETS-AUDIT.md](./SECRETS-AUDIT.md)
- [SQL-INJECTION-AUDIT.md](./SQL-INJECTION-AUDIT.md)
- [XSS-AUDIT.md](./XSS-AUDIT.md)
- [UPLOAD-AUDIT.md](./UPLOAD-AUDIT.md)
- [JWT-AUDIT.md](./JWT-AUDIT.md)
- [AUTHORIZATION-AUDIT.md](./AUTHORIZATION-AUDIT.md)
- [WEBHOOK-AUDIT.md](./WEBHOOK-AUDIT.md)
- [RATE-LIMIT-AUDIT.md](./RATE-LIMIT-AUDIT.md)
- [CORS-AUDIT.md](./CORS-AUDIT.md)
- [HEADERS-AUDIT.md](./HEADERS-AUDIT.md)
- [PLANO-CORRECAO-SEGURANCA.md](./PLANO-CORRECAO-SEGURANCA.md)
