# =============================================================================
# Thalassa Scraper — Dockerfile multi-stage
# Stage 1 (builder): instala dependencias en un entorno limpio
# Stage 2 (runtime): imagen mínima para producción
# =============================================================================

# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /build

# Copiar solo el manifiesto de dependencias primero (cache layer)
COPY requirements.txt .

# Instalar dependencias en un directorio local para copiarlas al runtime
RUN pip install --upgrade pip \
    && pip install --prefix=/install --no-cache-dir -r requirements.txt


# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

# Variables de entorno para Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Copiar dependencias instaladas desde el builder
COPY --from=builder /install /usr/local

# Copiar el código fuente de la aplicación
COPY app/ ./app/

# Usuario no-root por seguridad
RUN adduser --disabled-password --gecos "" appuser
USER appuser

EXPOSE 8001

# Arrancar Uvicorn apuntando al objeto `app` en `app/main.py`
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
