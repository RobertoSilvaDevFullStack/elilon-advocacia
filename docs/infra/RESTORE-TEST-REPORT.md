# Restore Test Report — Sprint 3.12.2

**Data:** 22/06/2026  
**Ambiente:** Desenvolvimento local (Windows) + scripts validados para homologação Linux

---

## Objetivo

Validar procedimento completo de backup e recuperação antes da entrada em produção.

---

## Artefatos testados

| Script | Status |
|--------|--------|
| `backend/scripts/backup-postgres.sh` | ✅ Criado e revisado |
| `backend/scripts/backup-uploads.sh` | ✅ Criado e revisado |
| `backend/scripts/restore-postgres.sh` | ✅ Criado e revisado |

---

## Fluxo documentado (homologação)

### 1. Backup banco

```bash
export PGPASSWORD="..."
./backend/scripts/backup-postgres.sh
# → backups/postgres/backup-YYYY-MM-DD.sql.gz
```

### 2. Backup uploads

```bash
./backend/scripts/backup-uploads.sh
# → backups/uploads/uploads-YYYY-MM-DD.tar.gz
```

### 3. Restore em homologação

```bash
# Banco
createdb elilon_homolog || true
./backend/scripts/restore-postgres.sh backups/postgres/backup-YYYY-MM-DD.sql.gz

# Uploads
tar -xzf backups/uploads/uploads-YYYY-MM-DD.tar.gz -C backend/
```

### 4. Subir backend homolog

```bash
DATABASE_TYPE=postgres NODE_ENV=production node backend/app.js
```

---

## Checklist de validação pós-restore

| Funcionalidade | Endpoint / Ação | Esperado |
|----------------|-----------------|----------|
| Login admin | `POST /api/auth/login` | 200 + JWT |
| Dashboard | `GET /api/dashboard` | Stats retornados |
| Leads | `GET /api/leads` | Lista de leads |
| Documentos | `GET /api/admin/chat/documents` | Metadados + arquivos existem |
| Diagnóstico leads | `GET /api/admin/diagnostico` | Lista |
| Pedidos premium | `GET /api/admin/diagnostico/pedidos` | Lista |
| Chat pré-atendimento | `GET /api/admin/chat/pre-atendimentos` | Lista |
| Health | `GET /health/simple` | `{ status: "ok" }` |

---

## Resultado local (dev)

| Teste | Resultado |
|-------|-----------|
| Scripts bash sintaxe | ✅ Validado |
| Logger com rotação | ✅ `winston-daily-rotate-file` instalado |
| Build frontend pós-deps | ✅ `npm run build` OK |
| Backup uploads (tar Windows) | ⚠️ Requer diretório `backups/` criado previamente |
| Restore PostgreSQL real | ⏳ Pendente — requer instância PostgreSQL de homologação |

---

## Próximo passo obrigatório (pré-produção)

Executar restore **real** em servidor de homologação com PostgreSQL:

1. Criar backup de produção (ou seed de staging)
2. Restaurar em DB limpo
3. Validar checklist acima manualmente
4. Registrar timestamp e responsável neste documento

---

## RTO / RPO estimados

| Métrica | Valor |
|---------|-------|
| RPO (perda máxima de dados) | 24h (backup diário) |
| RTO (tempo de recuperação) | ~30 min (restore + restart) |

---

## Contatos em incidente

1. Executar restore conforme scripts
2. Verificar logs em `backend/logs/error-*.log`
3. Validar `/health` antes de reabrir tráfego
