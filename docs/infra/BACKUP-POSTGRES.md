# Backup PostgreSQL — Elilon Advocacia

**Sprint:** 3.12.2  
**Script:** `backend/scripts/backup-postgres.sh`

---

## Visão geral

Backup diário do banco PostgreSQL com compactação gzip e retenção de 30 dias.

---

## Pré-requisitos

- `pg_dump` e `psql` instalados
- Variáveis de ambiente:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=elilon_advocacia_db
DB_USER=elilon_db_user
PGPASSWORD=sua_senha
BACKUP_ROOT=/var/backups/elilon/postgres   # opcional
BACKUP_RETENTION_DAYS=30                    # opcional
```

---

## Execução manual

```bash
chmod +x backend/scripts/backup-postgres.sh
export PGPASSWORD="..."
./backend/scripts/backup-postgres.sh
```

**Saída:**

```
/backups/postgres/backup-2026-06-22.sql.gz
```

---

## Agendamento (cron)

```cron
# Todo dia às 02:00
0 2 * * * cd /app && set -a && source backend/.env && set +a && ./backend/scripts/backup-postgres.sh >> /var/log/elilon-backup.log 2>&1
```

---

## Restore

Ver `backend/scripts/restore-postgres.sh` e [RESTORE-TEST-REPORT.md](./RESTORE-TEST-REPORT.md).

```bash
./backend/scripts/restore-postgres.sh /backups/postgres/backup-2026-06-22.sql.gz
```

---

## Retenção

Arquivos `backup-*.sql.gz` com mais de 30 dias são removidos automaticamente via `find -mtime`.

---

## Monitoramento

- Alertar se backup diário não gerar arquivo novo
- Verificar tamanho crescente anormal (possível corrupção)
- Testar restore mensal em homologação
