# Uptime Kuma — Monitoramento

**Sprint:** 3.12.2  
**Objetivo:** Documentar endpoints e checks para monitoramento de produção

---

## Serviços a monitorar

| Serviço | Tipo | URL / Host | Intervalo |
|---------|------|------------|-----------|
| Frontend | HTTP(s) | `https://elilonlopesadvogados.com.br` | 60s |
| Backend API | HTTP(s) | `https://api.elilonlopesadvogados.com.br/health/simple` | 60s |
| Backend (detalhado) | HTTP(s) | `https://api.../health` | 5min |
| PostgreSQL | TCP Port | `DB_HOST:5432` | 60s |
| N8N | HTTP(s) | `https://n8n.seu-dominio.com/healthz` | 60s |

---

## Endpoints de health

### GET /health/simple

Resposta esperada: `200 OK`

```json
{ "status": "ok" }
```

Uso: check rápido para Uptime Kuma (baixa latência).

### GET /health

Resposta esperada: `200 OK` com detalhes de DB, memória, uptime.

Uso: diagnóstico manual ou alertas avançados.

---

## Configuração Uptime Kuma

### 1. Frontend

- **Monitor Type:** HTTP(s)
- **URL:** `https://elilonlopesadvogados.com.br`
- **Accepted Status Codes:** 200
- **Keyword:** `Elilon` (opcional — valida conteúdo HTML)

### 2. Backend

- **Monitor Type:** HTTP(s)
- **URL:** `https://<backend-host>/health/simple`
- **Accepted Status Codes:** 200
- **Keyword:** `"status":"ok"`

### 3. PostgreSQL

- **Monitor Type:** Port
- **Hostname:** valor de `DB_HOST`
- **Port:** 5432

### 4. N8N

- **Monitor Type:** HTTP(s)
- **URL:** endpoint de health do N8N
- **Nota:** N8N é externo ao backend — monitorar separadamente

---

## Alertas recomendados

| Evento | Canal |
|--------|-------|
| Frontend down > 2 min | Telegram / E-mail |
| Backend health fail | Telegram / E-mail |
| PostgreSQL port closed | Telegram / E-mail |
| Certificado SSL < 14 dias | Uptime Kuma built-in |

---

## Endpoints excluídos de monitoramento contínuo

- `POST /api/asaas/webhook` — server-to-server, não health check
- `POST /api/leads` — formulário público
- `/admin` — requer autenticação

---

## Checklist deploy

- [ ] Uptime Kuma instalado (Docker ou VPS dedicado)
- [ ] Monitors criados para frontend + backend + DB
- [ ] Notificações configuradas
- [ ] Status page pública (opcional)
