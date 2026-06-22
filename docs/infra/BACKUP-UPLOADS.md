# Backup de Uploads — Elilon Advocacia

**Sprint:** 3.12.2  
**Script:** `backend/scripts/backup-uploads.sh`

---

## Escopo

Backup diário de `backend/uploads/` (documentos do chat jurídico e demais arquivos enviados).

---

## Pré-requisitos

- `tar` e `gzip` disponíveis
- Variáveis opcionais:

```env
CHAT_UPLOADS_DIR=/app/backend/uploads
BACKUP_ROOT=/var/backups/elilon/uploads
BACKUP_RETENTION_DAYS=30
```

---

## Execução manual

```bash
chmod +x backend/scripts/backup-uploads.sh
./backend/scripts/backup-uploads.sh
```

**Saída:**

```
/backups/uploads/uploads-2026-06-22.tar.gz
```

---

## Agendamento (cron)

```cron
# Todo dia às 02:30 (após backup do banco)
30 2 * * * cd /app && ./backend/scripts/backup-uploads.sh >> /var/log/elilon-backup.log 2>&1
```

---

## Restore

```bash
# Em ambiente de destino
mkdir -p backend/uploads
tar -xzf /backups/uploads/uploads-2026-06-22.tar.gz -C backend/
```

---

## Retenção

Arquivos `uploads-*.tar.gz` com mais de 30 dias removidos automaticamente.

---

## Notas

- Backup separado do PostgreSQL — metadados no banco, arquivos no filesystem
- Restore completo requer **ambos**: banco + uploads
- Em Railway/Cloudez: montar volume persistente para `/backups` ou enviar para S3 (futuro)
