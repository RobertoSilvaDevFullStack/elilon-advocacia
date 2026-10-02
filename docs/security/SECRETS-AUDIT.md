# Auditoria de Secrets

**Data:** 22/06/2026

## Status do `.gitignore`

`.env` está corretamente ignorado (`git check-ignore backend/.env` → OK).

## Achados

### Vulnerabilidade 1 — JWT Secret com fallback hardcoded

**Classificação:** ALTO

**Localização:**
- Arquivo: `backend/middleware/authMiddleware.js`
- Linha: 3-4
- Função: módulo (JWT_SECRET)

**Evidência:**

```js
const JWT_SECRET =
  process.env.JWT_SECRET || "your_jwt_secret_key_change_this_in_prod";
```

Duplicado em `backend/controllers/authController.js` linhas 5-6.

**Risco:** Se `JWT_SECRET` não estiver definido em produção, tokens podem ser forjados com secret público.

**Cenário de Exploração:** Atacante gera JWT `{ id: 1, role: 'admin' }` com secret conhecido e acessa painel admin.

**Recomendação:** Falhar startup se `JWT_SECRET` ausente. Remover fallback.

---

### Vulnerabilidade 2 — Credencial admin padrão no bootstrap

**Classificação:** ALTO

**Localização:**
- Arquivo: `backend/database-postgres.js`
- Linha: ~244
- Função: `createDefaultAdmin`

**Evidência:**

```js
const hashedPassword = bcrypt.hashSync("admin123", 10);
// INSERT users username='admin'
```

Também em `backend/database.js` linha 235.

**Risco:** Conta admin com senha previsível em instalações novas.

**Cenário de Exploração:** Scan de `/api/auth/login` com `admin`/`admin123`.

**Recomendação:** Gerar senha aleatória no primeiro boot ou exigir `ADMIN_INITIAL_PASSWORD` via env.

---

### Vulnerabilidade 3 — ASAAS_WEBHOOK_TOKEN fraco/documentado

**Classificação:** MÉDIO

**Localização:**
- Arquivo: `backend/.env.example` linha 53
- Valor exemplo: `seu_token_webhook_asaas_aqui`

**Evidência:** `.env` local continha `ASAAS_WEBHOOK_TOKEN=seu_token` (placeholder).

**Risco:** Token previsível permite forjar confirmações de pagamento.

**Recomendação:** Gerar token criptograficamente aleatório (32+ bytes) e usar `crypto.timingSafeEqual` na comparação.

---

### Positivo

- Chaves ASAAS no `.env` com aspas (correção aplicada para `$` do dotenv).
- `.env` não versionado no Git.
