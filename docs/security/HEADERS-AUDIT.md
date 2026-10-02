# Auditoria Security Headers

**Data:** 22/06/2026

## Vulnerabilidade 1 — Helmet ausente

**Classificação:** ALTO

**Localização:** `backend/server.js` — nenhum middleware de security headers.

**Evidência:** Apenas `cors` e `express.json()`:

```js
app.use(cors(corsOptions));
app.use(express.json());
// helmet ausente
```

**Risco:** API e arquivos servidos sem:
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security`
- `X-Frame-Options` / `frame-ancestors`
- `Content-Security-Policy`

**Cenário de Exploração:** Clickjacking em páginas servidas pelo backend; MIME sniffing attacks.

**Recomendação:**

```js
const helmet = require('helmet');
app.use(helmet());
```

---

## Frontend

Vite/React — CSP depende do hosting (Cloudez/Railway). Verificar headers no CDN/reverse proxy.

## Recomendação infra

Configurar no reverse proxy (Nginx/Cloudflare):
- HSTS: `max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
