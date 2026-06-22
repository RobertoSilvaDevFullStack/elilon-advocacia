# Auditoria de Dependências

**Data:** 22/06/2026  
**Escopo:** `backend/package.json`, `package.json` (frontend)

## Comando executado

```bash
cd backend && npm audit
cd .. && npm audit
```

## Resultado Backend

**8 vulnerabilidades** (3 high, 5 moderate)

| Pacote | Severidade | CVE/GHSA | Impacto |
|--------|------------|----------|---------|
| `form-data` | HIGH | GHSA-hmw2-7cc7-3qxx | CRLF injection em multipart |
| `qs` (via express) | HIGH | — | DoS via arrayLimit |
| `nodemailer` | HIGH | GHSA-268h-hp4c-crq3 | Header injection |
| `express` | MODERATE | via qs | Transitivo |
| `body-parser` | MODERATE | via qs | Transitivo |
| `brace-expansion` | MODERATE | GHSA-jxxr-4gwj-5jf2 | ReDoS |

## Resultado Frontend

Vulnerabilidades transitivas em `@babel/core` (low), `dompurify` (moderate, múltiplos bypasses em versões ≤3.3.3).

## Recomendações

```bash
cd backend && npm audit fix
npm update express nodemailer
cd .. && npm update isomorphic-dompurify dompurify
```

Adicionar `npm audit` ao CI antes de deploy.
