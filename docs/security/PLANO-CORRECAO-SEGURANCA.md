# Plano de Correção de Segurança

**Data:** 22/06/2026  
**Baseado em:** `SECURITY-REPORT.md` (Nota atual: 6.3/10)  
**Meta pós-correção:** ≥ 8.0 (Boa — apto para produção)

---

## Sprint Segurança — P0 (Bloqueadores de produção)

### S1. Remover registro público duplicado

**Arquivo:** `backend/routes/apiRoutes.js`

```diff
- router.post("/auth/register", authController.register);
- router.post("/auth/login", authController.login);
+ // Login/register: usar apenas authRoutes em /api/auth
```

Manter login em authRoutes ou mover com rate limit.

**Validação:** `POST /api/auth/register` sem token → 404 ou 403.

---

### S2. Revalidar pagamento ASAAS no webhook

**Arquivo:** `backend/controllers/AsaasWebhookController.js`

```js
const asaasPayment = await asaasService.getPayment(payment.id);
if (!["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(asaasPayment.status)) {
  return res.status(200).json({ success: true, message: "Status não confirmado" });
}
await diagnosticoPedidoController._markAsPaid(pedido.id, payment.id);
```

**Validação:** Webhook forjado com body fake mas payment pendente na API → não marca pago.

---

### S3. Proteger download de documentos

**Opções:**
- A) Token JWT admin obrigatório
- B) URL assinada temporária (`?sig=HMAC&id=&exp=`)

**Arquivo:** `apiRoutes.js` — mover download para rota admin ou validar signature.

---

## Sprint Segurança — P1 (Alta prioridade)

### S4. Helmet + rate limit login

```js
// server.js
const helmet = require('helmet');
app.use(helmet());

// apiRoutes.js
const { authLimiter } = require('../middleware/rateLimiter');
router.post("/auth/login", authLimiter, authController.login);
```

### S5. Middleware RBAC

**Novo arquivo:** `backend/middleware/requireRole.js`

```js
module.exports = (roles) => (req, res, next) => {
  if (!roles.includes(req.userRole)) {
    return res.status(403).json({ success: false, message: "Acesso negado" });
  }
  next();
};
```

Aplicar em todas rotas `/api/admin/*`.

### S6. JWT secret obrigatório

```js
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET obrigatório");
  process.exit(1);
}
```

Remover fallback em authMiddleware e authController.

### S7. Sanitizar HTML do chat

**Arquivo:** `MessageBubble.tsx`

```tsx
import DOMPurify from "isomorphic-dompurify";
dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.contentHtml) }}
```

### S8. ASAAS webhook hardening

- Remover `req.query.token`
- `crypto.timingSafeEqual` para comparação
- Gerar `ASAAS_WEBHOOK_TOKEN` forte (32 bytes hex)

---

## Sprint Segurança — P2 (Melhorias)

| ID | Tarefa | Arquivo |
|----|--------|---------|
| S9 | npm audit fix backend/frontend | package.json |
| S10 | Rate limit POST /api/diagnostico | apiRoutes.js |
| S11 | Mensagem genérica no login (anti-enum) | authController.js |
| S12 | bcrypt cost 12 | authController.js |
| S13 | Escapar wildcards LIKE | DiagnosticoPedidoController.js |
| S14 | Assinar webhook diagnostico_pago | DiagnosticoPagamentoWebhookService.js |
| S15 | Alterar senha admin padrão no deploy | database-postgres.js |
| S16 | Token consulta pedido (email parcial) | DiagnosticoPedidoController.js |

---

## Checklist pré-deploy produção

- [ ] P0 completo (S1-S3)
- [ ] P1 completo (S4-S8)
- [ ] `npm audit` sem HIGH
- [ ] `JWT_SECRET`, `ASAAS_*` configurados (sem placeholders)
- [ ] Senha admin alterada
- [ ] Webhook ASAAS apontando para URL HTTPS pública
- [ ] Helmet + HSTS no reverse proxy
- [ ] Teste: registro público bloqueado
- [ ] Teste: webhook forjado rejeitado
- [ ] Teste: download doc sem auth bloqueado

---

## Estimativa

| Sprint | Esforço | Nota esperada |
|--------|---------|---------------|
| P0 | 4-6h | 7.5 |
| P1 | 4-6h | 8.2 |
| P2 | 4h | 8.5+ |
