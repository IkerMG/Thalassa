#!/usr/bin/env bash
# =============================================================================
# Thalassa — Postgres backup script
#
# Genera un dump comprimido en /backups con el esquema de retención:
#   - 7 backups diarios  (thalassa-daily-YYYY-MM-DD.sql.gz)
#   - 4 backups semanales (thalassa-weekly-YYYY-WNN.sql.gz)  — domingos
#   - 12 backups mensuales (thalassa-monthly-YYYY-MM.sql.gz) — día 1 del mes
#
# Variables de entorno requeridas (se leen del entorno del contenedor o del host):
#   POSTGRES_HOST     — host del servidor Postgres   (default: localhost)
#   POSTGRES_PORT     — puerto                        (default: 5432)
#   POSTGRES_DB       — nombre de la base de datos    (default: thalassa)
#   POSTGRES_USER     — usuario                       (requerido)
#   POSTGRES_PASSWORD — contraseña                    (requerido)
#   BACKUP_DIR        — directorio de salida           (default: /backups)
# =============================================================================

set -euo pipefail

# ── Configuración ─────────────────────────────────────────────────────────────
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-thalassa}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"

TODAY=$(date +%F)                        # 2025-12-31
DOW=$(date +%u)                          # 1=lunes … 7=domingo
DOM=$(date +%d)                          # día del mes (01-31)
WEEK=$(date +%Y-W%V)                     # 2025-W52

mkdir -p "$BACKUP_DIR"

# ── Función de dump ───────────────────────────────────────────────────────────
dump() {
  local FILE="$1"
  echo "[$(date -Iseconds)] Dumping $POSTGRES_DB → $FILE"
  PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
    -h "$POSTGRES_HOST" \
    -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" \
    -Fc \
    "$POSTGRES_DB" | gzip > "$FILE"
  echo "[$(date -Iseconds)] Done. Size: $(du -sh "$FILE" | cut -f1)"
}

# ── Backup diario ─────────────────────────────────────────────────────────────
DAILY_FILE="$BACKUP_DIR/thalassa-daily-${TODAY}.sql.gz"
dump "$DAILY_FILE"

# ── Backup semanal (domingos) ─────────────────────────────────────────────────
if [ "$DOW" -eq 7 ]; then
  WEEKLY_FILE="$BACKUP_DIR/thalassa-weekly-${WEEK}.sql.gz"
  cp "$DAILY_FILE" "$WEEKLY_FILE"
  echo "[$(date -Iseconds)] Weekly backup saved: $WEEKLY_FILE"
fi

# ── Backup mensual (día 1 del mes) ────────────────────────────────────────────
if [ "$DOM" -eq "01" ]; then
  MONTHLY_FILE="$BACKUP_DIR/thalassa-monthly-$(date +%Y-%m).sql.gz"
  cp "$DAILY_FILE" "$MONTHLY_FILE"
  echo "[$(date -Iseconds)] Monthly backup saved: $MONTHLY_FILE"
fi

# ── Retención: eliminar backups antiguos ──────────────────────────────────────
# Diarios: conservar los 7 más recientes
find "$BACKUP_DIR" -name "thalassa-daily-*.sql.gz" | sort | head -n -7 | xargs -r rm -v

# Semanales: conservar los 4 más recientes
find "$BACKUP_DIR" -name "thalassa-weekly-*.sql.gz" | sort | head -n -4 | xargs -r rm -v

# Mensuales: conservar los 12 más recientes
find "$BACKUP_DIR" -name "thalassa-monthly-*.sql.gz" | sort | head -n -12 | xargs -r rm -v

echo "[$(date -Iseconds)] Backup completed successfully."
