# Auditoria CORS

**Data:** 22/06/2026

## Configuração

**Arquivo:** `backend/server.js` linhas 9-34

## Vulnerabilidade 1 — Requisições sem Origin permitidas

**Classificação:** MÉDIO

**Evidência:**

```js
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  // ...
};
```

**Risco:** Ferramentas server-side (curl, Postman) sempre passam. Alguns contextos de browser também enviam sem Origin. Facilita CSRF-like em endpoints que não verificam Origin adicionalmente.

**Recomendação:** Em produção, `if (!origin) return false` exceto para health checks.

---

## Positivo

- Whitelist explícita de domínios de produção.
- Localhost permitido apenas em dev.
- `credentials: true` com origem controlada.

## Vulnerabilidade 2 — Header ASAAS não listado

**Classificação:** BAIXO

**Evidência:**

```js
allowedHeaders: ["Content-Type", "Authorization"],
```

Webhook ASAAS usa `asaas-access-token` — preflight pode falhar em browsers (webhook é server-to-server, impacto baixo).

**Recomendação:** Adicionar `asaas-access-token` se necessário.
