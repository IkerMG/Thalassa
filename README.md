# Thalassa

> Plataforma de agregación y análisis de precios de viajes marítimos.

Thalassa es un sistema full-stack diseñado como monorepo que integra un backend REST, un microservicio de scraping automatizado, y una interfaz web moderna para la consulta y comparación de ofertas de viajes en ferry.

---

## Arquitectura General

```
thalassa/
├── backend/      Spring Boot (Java)   — API REST + lógica de negocio
├── frontend/     React + Vite (TS)    — Interfaz de usuario
├── scraper/      FastAPI (Python)     — Microservicio de web scraping
├── docs/         Obsidian             — Documentación técnica y de proyecto
└── docker-compose.yml                — Orquestación de contenedores
```

La comunicación entre servicios es síncrona vía HTTP/REST. El scraper es invocado por el backend cuando se necesita actualizar los datos de precios. El frontend consume exclusivamente la API del backend.

```
[Frontend]  ──HTTP──▶  [Backend API]  ──HTTP──▶  [Scraper]
                             │
                         [Base de Datos]
```

---

## Módulos

### `backend/`
API REST construida con **Spring Boot 3** (Java 21). Responsable de:
- Gestión de usuarios y autenticación (JWT)
- CRUD de rutas, ferries y precios
- Orquestación de llamadas al microservicio de scraping
- Exposición de la API consumida por el frontend

### `frontend/`
SPA construida con **React 18 + Vite** (TypeScript). Responsable de:
- Búsqueda y comparación de rutas y precios
- Dashboard de usuario con historial y favoritos
- Visualización de datos en tiempo real

### `scraper/`
Microservicio construido con **FastAPI** (Python 3.12). Responsable de:
- Extracción automatizada de precios desde fuentes externas
- Exposición de endpoints REST consumidos internamente por el backend
- Normalización y limpieza de datos scrapeados

### `docs/`
Vault de **Obsidian** con toda la documentación del proyecto:
- Definición de negocio y viabilidad
- Arquitectura técnica y modelo de datos
- Backlog, cronograma y entregas formales

---

## Requisitos Previos

- Docker & Docker Compose (recomendado para entorno completo)
- Java 21+ y Maven 3.9+ (si ejecutas el backend fuera de Docker)
- Node.js 20+ (si ejecutas el frontend fuera de Docker)

---

## Setup y Puesta en Marcha

### 1. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y rellena **todos** los valores:

| Variable | Descripción |
|----------|-------------|
| `JWT_SECRET` | Secreto para firmar JWTs (mínimo 32 chars). Genera con `openssl rand -hex 64`. |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens. Idem. |
| `POSTGRES_USER` | Usuario de PostgreSQL (ej: `thalassa`). |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL. |
| `GROQ_API_KEY` | API key de [Groq](https://console.groq.com/keys) para el chatbot IA. |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos separados por coma (ej: `http://localhost:5173`). |
| `SPRING_PROFILES_ACTIVE` | Perfil Spring: `dev` (local) o `prod`. |

### 2. Levantar con Docker (recomendado)

```bash
docker compose up --build
```

Servicios disponibles:
- Backend API: `http://localhost:8080`
- Frontend: `http://localhost:5173`
- Scraper: `http://localhost:8001` (solo red interna)

### 3. Desarrollo con hot-reload

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

> El backend necesita que PostgreSQL esté corriendo. Puedes levantar solo la BD con:
> ```bash
> docker compose up db
> ```

---

## Estructura de Sprints

| Sprint | Alcance |
|--------|---------|
| 1 | Arquitectura base, modelo de datos, setup del monorepo |
| 2 | Backend API + autenticación |
| 3 | Scraper + integración backend-scraper |
| 4 | Frontend + Docker Compose completo |

---

## Licencia

Proyecto académico — DAW 2025/2026.
