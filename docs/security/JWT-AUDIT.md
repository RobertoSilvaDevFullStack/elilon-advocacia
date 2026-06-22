# Auditoria JWT / Autenticação

**Data:** 22/06/2026

## Vulnerabilidade 1 — Secret fallback hardcoded

Ver `SECRETS-AUDIT.md` (ALTO).

## Vulnerabilidade 2 — Rate limit de login não aplicado

**Classificação:** ALTO

**Localização:**
- Arquivo: `backend/middleware/rateLimiter.js` linhas 79-94 (`authLimiter` definido)
- Arquivo: `backend/routes/apiRoutes.js` linha 145

**Evidência:** `authLimiter` exportado mas **nunca usado**:

```js
router.post("/auth/login", authController.login);
// authLimiter ausente
```

**Risco:** Brute force ilimitado em `/api/auth/login`.

**Cenário de Exploração:** Script testa milhares de senhas contra conta `admin`.

**Recomendação:**

```js
router.post("/auth/login", authLimiter, authController.login);
```

---

## Vulnerabilidade 3 — Enumeração de usuário no login

**Classificação:** MÉDIO

**Localização:** `backend/controllers/authController.js` linhas 16-19

**Evidência:**

```js
if (result.rows.length === 0) {
  return res.status(404).json({
    success: false,
    message: "Usuário não encontrado",
  });
}
```

vs senha inválida retorna 401. Respostas distintas revelam usuários existentes.

**Recomendação:** Sempre retornar 401 com mensagem genérica "Credenciais inválidas".

---

## Vulnerabilidade 4 — bcrypt rounds baixo no registro

**Classificação:** MÉDIO

**Evidência:** `bcrypt.hashSync(password, 8)` linha 107 authController.js (cost factor 8).

**Recomendação:** Usar cost ≥ 12.

---

## Positivo

- Tokens expiram em 86400s (24h).
- Middleware valida Bearer token corretamente.
- Registro em `/api/auth` (authRoutes) exige token admin — porém ver AUTHORIZATION-AUDIT (rota duplicada pública).
