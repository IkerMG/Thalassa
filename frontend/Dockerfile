# =============================================================================
# Thalassa Frontend — Dockerfile multi-stage
# Stage 1 (builder): instala dependencias y compila el bundle Vite
# Stage 2 (runtime): nginx:alpine sirve los archivos estáticos
# =============================================================================

# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /build

# Copiar manifiestos primero para cachear la instalación de dependencias.
# Este layer solo se invalida si package.json o package-lock.json cambian.
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copiar el resto del código fuente y compilar
COPY . .
RUN npm run build


# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Reemplazar la configuración por defecto de nginx con la del proyecto
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el bundle generado por Vite desde el builder
COPY --from=builder /build/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
