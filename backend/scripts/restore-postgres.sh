#!/usr/bin/env bash
# Sprint 3.12.2 — Restore PostgreSQL a partir de backup .sql.gz
# Uso: ./backend/scripts/restore-postgres.sh /caminho/backup-YYYY-MM-DD.sql.gz

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Uso: $0 <backup.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

: "${DB_HOST:?Defina DB_HOST}"
: "${DB_PORT:=5432}"
: "${DB_NAME:?Defina DB_NAME}"
: "${DB_USER:?Defina DB_USER}"
: "${PGPASSWORD:?Defina PGPASSWORD}"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Arquivo não encontrado: ${BACKUP_FILE}"
  exit 1
fi

echo "[$(date -Iseconds)] Restaurando ${BACKUP_FILE} em ${DB_NAME}@${DB_HOST}..."

gunzip -c "${BACKUP_FILE}" | psql \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --set ON_ERROR_STOP=on

echo "[$(date -Iseconds)] Restore concluído."
