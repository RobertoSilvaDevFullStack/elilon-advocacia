# SECURITY REPORT V2 — Elilon Advocacia

**Data:** 22/06/2026  
**Escopo:** Backend Express, Frontend React, Diagnóstico Tributário Premium, Chat, Admin  
**Metodologia:** `tests/security/run-security-audit.bat` (npm audit + 21 checks estáticos)  
**Baseline:** [SECURITY-REPORT.md](./SECURITY-REPORT.md) (V1 — Nota 6.3/10)

---

## Score Final

### Segurança Geral

**Nota: 8.1 / 10** *(V1: 6.3)*

**Classificação: Boa — Apto para produção com ressalvas menores**

| Métrica | V1 | V2 | Delta |
|---------|----|----|-------|
| Checks estáticos (S1–S16 + residual) | — | **18/21 PASS** | — |
| npm audit backend | 8 vulns (3 HIGH) | **0 vulns** | +2.0 |
| npm audit frontend | parcial | **9 vulns (4 HIGH)** | pendente |

---

### Resumo por Categoria

| Categoria      | V1  | V2  | Status |
| -------------- | --- | --- | ------ |
| Dependências   | 6.5 | 7.5 | Backend limpo; frontend com 4 HIGH |
| SQL Injection  | 8.5 | 9.0 | LIKE escapado; queries parametrizadas |
| XSS            | 6.0 | 7.5 | DOMPurify no chat; lib desatualizada |
| Upload         | 6.5 | 8.5 | Download admin-only |
| JWT            | 5.5 | 8.5 | Secret centralizado, rate limit, bcrypt 12 |
| Autorização    | 4.0 | 8.5 | RBAC + register protegido + token pedido |
| Webhooks       | 5.0 | 8.5 | Revalidação ASAAS + HMAC + timing-safe |
| CORS           | 7.0 | 6.5 | Null origin ainda permitido |
| Headers        | 4.0 | 8.0 | Helmet em server.js e app.js |
| Infraestrutura | 5.5 | 8.0 | ADMIN_INITIAL_PASSWORD; .env gitignored |

---

## Resultado da Auditoria Automatizada

**Comando:** `tests/security/run-security-audit.bat`  
**Artefato:** [tests/security/audit-results.json](../../tests/security/audit-results.json)

### Checks — Sprint Segurança (S1–S16)

| ID | Verificação | Severidade | Status |
|----|-------------|------------|--------|
| S1 | Registro público duplicado removido | CRÍTICO | ✅ PASS |
| S2 | Webhook ASAAS revalida pagamento na API | ALTO | ✅ PASS |
| S3 | Download de documentos protegido (admin) | ALTO | ✅ PASS |
| S4 | Helmet + authLimiter no login | ALTO | ✅ PASS |
| S5 | RBAC `requireRole` nas rotas admin | ALTO | ✅ PASS |
| S6 | JWT secret centralizado | ALTO | ✅ PASS |
| S7 | DOMPurify no MessageBubble | ALTO | ✅ PASS |
| S8 | Webhook ASAAS hardened (sem query, timing-safe) | MÉDIO | ✅ PASS |
| S10 | Rate limit POST /api/diagnostico | MÉDIO | ✅ PASS |
| S11 | Mensagem genérica no login | MÉDIO | ✅ PASS |
| S12 | bcrypt cost 12 | MÉDIO | ✅ PASS |
| S13 | Wildcards LIKE escapados | BAIXO | ✅ PASS |
| S14 | Webhook diagnostico_pago com HMAC | MÉDIO | ✅ PASS |
| S15 | Admin via ADMIN_INITIAL_PASSWORD | ALTO | ✅ PASS |
| S16 | Token HMAC em consulta de pedido | MÉDIO | ✅ PASS |

### Checks Residuais

| ID | Verificação | Severidade | Status |
|----|-------------|------------|--------|
| R1 | Rate limit global (`generalApiLimiter`) | BAIXO | ❌ FAIL |
| R2 | Rate limit POST /api/leads | MÉDIO | ❌ FAIL |
| R3 | JWT fallback apenas em dev | BAIXO | ✅ PASS |
| R4 | CORS permite requisições sem Origin | MÉDIO | ❌ FAIL |

---

## Vulnerabilidades Corrigidas (V1 → V2)

### 1. Registro público duplicado — CRÍTICO → CORRIGIDO

**Antes:** `POST /api/auth/register` público em `apiRoutes.js`.  
**Depois:** Registro apenas em `authRoutes.js` com `verifyToken` (admin).

```js
// authRoutes.js
router.post("/register", verifyToken, authController.register);
```

---

### 2. Download de documentos sem auth — ALTO → CORRIGIDO

**Antes:** `GET /api/chat/documents/download/:id` público.  
**Depois:** `GET /api/admin/chat/documents/download/:id` com JWT + `requireRole(['admin','superadmin'])`.

---

### 3. Webhook ASAAS confia no body — ALTO → CORRIGIDO

**Depois:** `AsaasWebhookController` chama `asaasService.getPayment()` e só marca pago se status ∈ `RECEIVED | CONFIRMED | RECEIVED_IN_CASH`.

---

### 4. JWT secret fallback — ALTO → CORRIGIDO

**Depois:** `backend/config/jwtSecret.js` — `process.exit(1)` em produção se ausente.

---

### 5. XSS no chat — ALTO → CORRIGIDO

**Depois:** `MessageBubble.tsx` usa `DOMPurify.sanitize(message.contentHtml)`.

---

### 6. Login sem rate limit — ALTO → CORRIGIDO

**Depois:** `authRoutes.js` → `router.post("/login", authLimiter, ...)`.

---

### 7. Ausência de RBAC admin — ALTO → CORRIGIDO

**Depois:** `requireRole(['admin','superadmin'])` em todas rotas `/api/admin/*` e rotas protegidas do painel.

---

### 8. Security headers ausentes — ALTO → CORRIGIDO

**Depois:** `helmet()` em `server.js` e `app.js`.

---

## Achados Remanescentes (P3)

### R1 — Rate limit global ausente — BAIXO

**Localização:** `backend/middleware/rateLimiter.js` — `generalApiLimiter` definido mas não aplicado.

**Recomendação:**

```js
app.use('/api', generalApiLimiter);
```

---

### R2 — POST /api/leads sem rate limit — MÉDIO

**Localização:** `backend/routes/apiRoutes.js`

```js
router.post("/leads", mainController.createLead); // sem limiter
```

**Risco:** Spam de leads / DoS leve no banco.

**Recomendação:** Aplicar `generalApiLimiter` ou limiter dedicado (ex.: 10/min).

---

### R3 — CORS aceita requisições sem Origin — MÉDIO

**Localização:** `backend/server.js`, `backend/app.js`

```js
if (!origin) return true;
```

**Risco:** Facilita automação server-side; em alguns contextos reduz barreira CSRF.

**Recomendação:** Em produção, `return false` exceto para `/health`.

---

### R4 — Dependências frontend — ALTO (transitivo)

**npm audit frontend:** 9 vulnerabilidades (4 HIGH, 4 MODERATE, 1 LOW)

| Pacote | Severidade | Notas |
|--------|------------|-------|
| `react-router` / `react-router-dom` | HIGH | RCE/deserialization, open redirect |
| `vite` | HIGH | Path traversal (dev server) |
| `undici` | HIGH | TLS bypass, header injection |
| `dompurify` | MODERATE | Bypasses em versões ≤3.4.10 |
| `quill` / `react-quill` | MODERATE | XSS no editor admin |
| `postcss` | MODERATE | XSS em stringify |

**Recomendação:**

```bash
npm audit fix
npm update react-router-dom vite isomorphic-dompurify
# react-quill/quill: avaliar upgrade ou substituição
```

---

### R5 — Content-Disposition filename não sanitizado — BAIXO

**Localização:** `ChatDocumentController.download` — filename do uploader sem escape.

---

### R6 — Listagem pública de documentos por pré-atendimento — MÉDIO

**Localização:** `GET /api/chat/documents/:preAtendimentoId` ainda pública.

**Risco:** Metadados de documentos expostos se UUID vazar (download já protegido).

---

## Pontos Positivos (mantidos + novos)

1. SQL parametrizado em todos controllers críticos.
2. Precificação recalculada no backend (`getPriceForRegime`).
3. Sanitização de entrada (`inputValidator.js`).
4. Upload com magic numbers (`fileValidator.js`).
5. Blog com DOMPurify.
6. Rate limit em pedido premium, webhook ASAAS, pré-atendimento, upload, diagnóstico.
7. `.env` no `.gitignore`.
8. **Novo:** Token HMAC para consulta de pedido premium.
9. **Novo:** Webhook interno `diagnostico_pago` assinado com HMAC.
10. **Novo:** Backend npm audit limpo (0 vulnerabilidades).

---

## Comparativo V1 vs V2

| Item | V1 | V2 |
|------|----|----|
| Nota geral | 6.3 | **8.1** |
| Bloqueadores P0 | 3 abertos | **0 abertos** |
| Alta prioridade P1 | 5 abertos | **0 abertos** |
| Apto produção | Não | **Sim (com ressalvas)** |

---

## Checklist Pré-Deploy Produção

- [x] P0 completo (S1–S3)
- [x] P1 completo (S4–S8)
- [x] Backend `npm audit` sem HIGH
- [ ] Frontend `npm audit` sem HIGH
- [ ] `JWT_SECRET`, `ASAAS_*`, `ADMIN_INITIAL_PASSWORD` configurados
- [ ] Rate limit em POST /api/leads
- [ ] CORS restringido em produção (sem null origin)
- [ ] HSTS no reverse proxy (Cloudflare/Nginx)
- [x] Teste: registro público bloqueado
- [x] Teste: download doc sem auth bloqueado
- [x] Teste: webhook ASAAS revalida pagamento

---

## Documentos Relacionados

- [PLANO-CORRECAO-SEGURANCA.md](./PLANO-CORRECAO-SEGURANCA.md)
- [SECURITY-REPORT.md](./SECURITY-REPORT.md) *(V1)*
- [tests/security/audit-results.json](../../tests/security/audit-results.json)
- Demais auditorias por categoria em `docs/security/`

---

## Estimativa pós-V2

| Sprint | Esforço restante | Nota esperada |
|--------|------------------|---------------|
| P3 (R1–R4 frontend) | 2–4h | 8.5+ |
| Hardening infra (HSTS, WAF) | 2h | 8.7+ |
