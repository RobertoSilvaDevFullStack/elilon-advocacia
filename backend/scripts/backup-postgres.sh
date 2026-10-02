#!/usr/bin/env bash
# Sprint 3.12.2 — Backup diário PostgreSQL
# Uso: ./backend/scripts/backup-postgres.sh
# Cron sugerido: 0 2 * * * /app/backend/scripts/backup-postgres.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKUP_ROOT="${BACKUP_ROOT:-${BACKEND_DIR}/../backups/postgres}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
DATE_STAMP="$(date +%Y-%m-%d)"
BACKUP_FILE="${BACKUP_ROOT}/backup-${DATE_STAMP}.sql.gz"

: "${DB_HOST:?Defina DB_HOST}"
: "${DB_PORT:=5432}"
: "${DB_NAME:?Defina DB_NAME}"
: "${DB_USER:?Defina DB_USER}"
: "${PGPASSWORD:?Defina PGPASSWORD}"

mkdir -p "${BACKUP_ROOT}"

echo "[$(date -Iseconds)] Iniciando backup PostgreSQL → ${BACKUP_FILE}"

pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --no-owner \
  --no-acl \
  --format=plain \
  | gzip -9 > "${BACKUP_FILE}"

echo "[$(date -Iseconds)] Backup concluído: $(du -h "${BACKUP_FILE}" | cut -f1)"

find "${BACKUP_ROOT}" -name "backup-*.sql.gz" -type f -mtime +"${RETENTION_DAYS}" -delete

echo "[$(date -Iseconds)] Retenção aplicada (${RETENTION_DAYS} dias)"
