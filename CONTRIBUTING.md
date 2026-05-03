# Guía de Contribución — Thalassa

## Convención de commits

Usamos **Conventional Commits** (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`).

```
feat(backend): añadir endpoint de refresh token
fix(frontend): corregir redirect agresivo en 401
chore: actualizar dependencias
```

Formato: `tipo(scope): descripción en imperativo, minúsculas, sin punto final`.

## Nomenclatura de branches

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Feature | `feat/<descripcion>` | `feat/refresh-tokens` |
| Fix | `fix/<descripcion>` | `fix/cors-wildcard` |
| Chore / Infra | `chore/<descripcion>` | `chore/ci-pipeline` |
| Refactor | `refactor/<descripcion>` | `refactor/chat-drawer` |

Siempre crear desde `main` o desde la rama de fase activa.

## Workflow de PR

1. Crear branch desde la rama base.
2. Implementar la tarea siguiendo el `MASTER_ACTION_PLAN.md`.
3. Asegurarse de que `npm run typecheck` (frontend) y `mvn compile` (backend) pasan sin errores.
4. Abrir PR contra la rama base con descripción del cambio y referencia a la Fase.
5. Al menos 1 revisión requerida antes de merge.
6. Usar **Squash merge** para mantener el historial limpio.

## Arranque del entorno de desarrollo local

### Prerrequisitos

- Docker & Docker Compose
- Java 21+
- Node.js 20+
- Maven 3.9+

### Setup inicial

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd thalassa

# 2. Copiar variables de entorno y rellenar valores
cp .env.example .env
# Edita .env con tus valores reales

# 3. Levantar todos los servicios
docker compose up --build

# 4. (Opcional) Frontend en modo hot-reload
cd frontend
npm install
npm run dev

# 5. (Opcional) Backend fuera de Docker
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

El backend estará disponible en `http://localhost:8080` y el frontend en `http://localhost:5173`.
