# R2 — Rate Limit em POST /api/leads

**Sprint:** 3.12.2  
**Data:** 22/06/2026  
**Status:** ✅ Implementado

---

## Problema (V2)

`POST /api/leads` era público sem rate limit — risco de spam e DoS leve.

---

## Implementação

### Middleware `leadsLimiter`

**Arquivo:** `backend/middleware/rateLimiter.js`

| Parâmetro | Valor |
|-----------|-------|
| Janela | 1 minuto |
| Máximo | 20 requisições / IP |
| HTTP | 429 Too Many Requests |

**Resposta:**

```json
{
  "success": false,
  "error": "Limite de requisições excedido",
  "message": "Você enviou muitas solicitações. Aguarde 1 minuto e tente novamente.",
  "retryAfter": 60
}
```

### Rota

**Arquivo:** `backend/routes/apiRoutes.js`

```js
router.post("/leads", leadsLimiter, mainController.createLead);
```

---

## Formulários afetados (validados)

| Formulário | Página | Endpoint |
|------------|--------|----------|
| Landing BPC | `/bpc` | `POST /api/leads` |
| Landing IR | `/isencao-ir` | `POST /api/leads` |
| Contato institucional | `/contato` | `POST /api/leads` |
| Newsletter / captura | Componentes `LandingCapture` | `POST /api/leads` |

**Uso normal:** 1 submit por visitante — bem abaixo de 20/min.  
**Proteção:** scripts de spam bloqueados após 20 tentativas/min por IP.

---

## Validação

```bash
# Simular spam (deve retornar 429 na 21ª requisição)
for i in $(seq 1 21); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:5000/api/leads \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@example.com","phone":"38999999999","message":"test"}'
done
```

**Check automatizado:** `tests/security/run-security-audit.cjs` → R2 PASS

---

## Camadas de proteção atuais em leads

1. `leadsLimiter` — 20/min (dedicado)
2. `generalApiLimiter` — 100/15min (global)
3. Validação de campos no `mainController.createLead`
