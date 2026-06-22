# Auditoria Autorização (RBAC)

**Data:** 22/06/2026

## Vulnerabilidade 1 — Registro público duplicado

**Classificação:** CRÍTICO

**Localização:**
- Arquivo: `backend/routes/apiRoutes.js` linhas 142-145
- Função: definição de rotas

**Evidência:**

```js
// Auth Routes (Public)
const authController = require("../controllers/authController");
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
```

Enquanto `backend/routes/authRoutes.js` protege register:

```js
router.post("/register", verifyToken, authController.register);
```

**Risco:** Qualquer pessoa cria conta via `POST /api/auth/register` sem autenticação. Contas ficam `approved=false`, mas atacante pode:
- Enumerar emails/usernames
- Preparar contas para aprovação social engineering
- DoS no banco de usuários

**Cenário de Exploração:**

```bash
curl -X POST https://api.../api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"hacker","email":"x@y.com","password":"123456"}'
```

**Recomendação:** Remover rota pública duplicada. Manter apenas `/api/auth/register` protegido ou desabilitar registro público.

---

## Vulnerabilidade 2 — Ausência de RBAC nas rotas admin

**Classificação:** ALTO

**Localização:** Todas rotas `/api/admin/*` em `apiRoutes.js`

**Evidência:** Apenas `authMiddleware.verifyToken` — nunca verifica `req.userRole`:

```js
router.get("/admin/diagnostico/pedidos", authMiddleware.verifyToken, diagnosticoPedidoController.listPedidos);
```

**Risco:** Usuário com role `editor` aprovado acessa leads, pedidos premium, export CSV, documentos, reprocessamento Hermes.

**Cenário de Exploração:** Editor comprometido ou conta editor maliciosa aprovada → exfiltração de CPF, e-mails, documentos jurídicos.

**Recomendação:** Middleware `requireRole('admin')` em rotas sensíveis.

---

## Vulnerabilidade 3 — Exposição de PII via endpoint público de pedido

**Classificação:** MÉDIO

**Localização:**
- Arquivo: `backend/controllers/DiagnosticoPedidoController.js`
- Linha: 267-309
- Função: `getPedido`

**Evidência:**

```js
// GET /api/diagnostico/pedido/:id — Consulta pública de pedido (UUID).
return res.json({ success: true, data: publicPedido });
// publicPedido inclui: nome, empresa, email, whatsapp, payment_link
```

**Risco:** IDOR se UUID vazar (e-mail, logs, referrer). LGPD: dados pessoais acessíveis sem autenticação.

**Cenário de Exploração:** UUID compartilhado na URL de pagamento → terceiro acessa e-mail/WhatsApp do cliente.

**Recomendação:** Token assinado de sessão (`?token=`) ou exigir e-mail+CPF parcial para consulta.

---

## Positivo

- Rotas admin exigem JWT (exceto register público).
- Password reset não revela existência de e-mail (`forgotPassword`).
