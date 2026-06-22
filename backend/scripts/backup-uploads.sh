#!/usr/bin/env bash
# Sprint 3.12.2 — Backup diário de uploads
# Uso: ./backend/scripts/backup-uploads.sh
# Cron sugerido: 30 2 * * * /app/backend/scripts/backup-uploads.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
UPLOADS_DIR="${CHAT_UPLOADS_DIR:-${BACKEND_DIR}/uploads}"
BACKUP_ROOT="${BACKUP_ROOT:-${BACKEND_DIR}/../backups/uploads}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
DATE_STAMP="$(date +%Y-%m-%d)"
BACKUP_FILE="${BACKUP_ROOT}/uploads-${DATE_STAMP}.tar.gz"

if [ ! -d "${UPLOADS_DIR}" ]; then
  echo "[$(date -Iseconds)] Diretório de uploads não encontrado: ${UPLOADS_DIR}"
  exit 1
fi

mkdir -p "${BACKUP_ROOT}"

echo "[$(date -Iseconds)] Iniciando backup uploads → ${BACKUP_FILE}"

tar -czf "${BACKUP_FILE}" -C "${BACKEND_DIR}" uploads

echo "[$(date -Iseconds)] Backup concluído: $(du -h "${BACKUP_FILE}" | cut -f1)"

find "${BACKUP_ROOT}" -name "uploads-*.tar.gz" -type f -mtime +"${RETENTION_DAYS}" -delete

echo "[$(date -Iseconds)] Retenção aplicada (${RETENTION_DAYS} dias)"
