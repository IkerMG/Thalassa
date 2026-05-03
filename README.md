# Thalassa

<p align="center">
  <strong>Professional aquarium management platform for marine aquarists</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-orange?logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?logo=springboot&logoColor=white" alt="Spring Boot 3.2" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker Compose" />
  <img src="https://img.shields.io/badge/License-Academic-lightgrey" alt="License" />
</p>

---

**Thalassa** is a full-stack, freemium SaaS for managing marine aquariums. It combines water parameter tracking, livestock and equipment inventory, energy and dosing calculators, an AI assistant powered by Groq/Llama, a live-scraped species marketplace, and PWA support — all under a clean OLED-dark interface with support for English, German, and Spanish.

---

## Features

| Module | Description |
|--------|-------------|
| **Auth** | JWT access tokens + rotating refresh tokens, forgot/reset password via email, role-based freemium gates |
| **Dashboard** | Multi-aquarium overview with global stats (livestock count, equipment count), per-aquarium cards |
| **Water Parameters** | Log and visualize pH, temperature, salinity, alkalinity, calcium, magnesium, nitrate, phosphate over time |
| **Livestock** | Inventory of fish, corals, and invertebrates with reef-safe validation and species catalog links |
| **Equipment** | Track devices (lights, pumps, skimmers, heaters) with wattage and daily usage |
| **Energy Calculator** | Estimate monthly kWh consumption from equipment data *(ReefMaster plan)* |
| **Dosing Calculator** | Calculate additive doses based on tank volume *(ReefMaster plan)* |
| **AI Assistant** | Conversational assistant specialized in marine aquarium keeping, powered by Groq (Llama 3.3 70B) |
| **Species Marketplace** | Live-scraped product listings from partner retailers via FastAPI scraper |
| **Wishlist** | Save species and products of interest with priority and notes |
| **Notifications** | In-app notification bell with categorized alerts |
| **CSV Export** | Export water parameter history to CSV *(ReefMaster plan)* |
| **i18n** | Full UI in English, German, and Spanish with per-user locale preference |
| **PWA** | Installable on desktop and mobile, with offline support via Service Worker |

---

## Architecture

```
                    ┌─────────────────────────────────────┐
                    │          Traefik (Reverse Proxy)     │
                    │        HTTP :80 → HTTPS :443         │
                    └─────────┬──────────────┬─────────────┘
                              │              │
                    ┌─────────▼────┐  ┌──────▼──────────┐
                    │  Frontend    │  │    Backend API   │
                    │  nginx SPA   │  │  Spring Boot     │
                    │  React+Vite  │  │  :8080           │
                    └─────────────┘  └──────┬────────────┘
                                            │
                              ┌─────────────┼─────────────┐
                              │             │             │
                    ┌─────────▼───┐  ┌──────▼────┐  ┌────▼──────┐
                    │  PostgreSQL │  │  Scraper  │  │  Backup   │
                    │  :5432      │  │  FastAPI  │  │  cron pg  │
                    │  (internal) │  │  :8001    │  │  dump     │
                    └─────────────┘  └───────────┘  └───────────┘
```

All services communicate over an internal Docker network (`thalassa-net`). The database port is **not** exposed to the host.

---

## Tech Stack

### Backend
| Technology | Version | Role |
|------------|---------|------|
| Java | 21 | Runtime |
| Spring Boot | 3.2.5 | REST API, business logic, security |
| Spring Security | 6.x | JWT authentication, authorization |
| Spring Data JPA | 3.x | ORM layer (Hibernate 6.4) |
| PostgreSQL | 16 | Primary database |
| Flyway | 10.x | Database schema migrations |
| OpenAPI Generator | 7.x | DTO generation from `openapi.yaml` |
| Spring Actuator | 3.x | Health checks, Prometheus metrics |
| Sentry SDK | 7.x | Error tracking in production |
| Testcontainers | 1.19 | Integration tests with real PostgreSQL |
| JUnit 5 + Mockito | — | Unit and integration testing |
| Spotless | — | Code formatting (Google Java Style) |

### Frontend
| Technology | Version | Role |
|------------|---------|------|
| React | 18 | UI library |
| TypeScript | 5 | Static typing |
| Vite | 5 | Build tool and dev server |
| Tailwind CSS | 3 | Utility-first styling |
| Zustand | 4 | Global state (auth, UI) |
| TanStack Query | 5 | Server state, caching, mutations |
| React Router DOM | 6 | SPA routing and guards |
| react-i18next | 14 | Internationalization (EN/DE/ES) |
| Framer Motion | 11 | Page transitions, animations |
| Recharts | 2 | Water parameter charts |
| Radix UI | — | Accessible headless components |
| React Hook Form + Zod | — | Form validation |
| Axios | 1 | HTTP client with interceptors |
| MSW | 2 | API mocking in tests |
| Vitest + Testing Library | — | Unit and component testing |
| Sentry SDK | 8 | Frontend error tracking |
| vite-plugin-pwa | — | Service Worker, Web App Manifest |

### Scraper
| Technology | Version | Role |
|------------|---------|------|
| Python | 3.12 | Runtime |
| FastAPI | 0.111 | REST microservice |
| HTTPX + BeautifulSoup | — | HTTP scraping and HTML parsing |
| Groq SDK | — | Llama 3.3 70B AI bridge |

### Infrastructure
| Technology | Role |
|------------|------|
| Docker + Docker Compose | Container orchestration |
| Traefik | Reverse proxy, automatic HTTPS (Let's Encrypt) |
| nginx | Static file serving for the SPA |
| GitHub Actions | CI: lint → typecheck → test → build |
| pg_dump cron | Automated PostgreSQL backups (daily/weekly/monthly) |

---

## Prerequisites

- **Docker** 24+ and **Docker Compose** v2 (`docker compose` CLI)
- Git

That's it. The entire stack runs inside containers.

> For local development without Docker you additionally need: Java 21+, Maven 3.9+, Node.js 20+, and a running PostgreSQL 16 instance.

---

## Quick Start (Docker Compose)

### 1. Clone and configure environment

```bash
git clone <repo-url>
cd thalassa

# Copy the environment template
cp .env.example .env
```

Open `.env` and fill in **all required values**:

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ | HS512 signing secret for access tokens. Generate with: `openssl rand -hex 64` |
| `JWT_REFRESH_SECRET` | ✅ | Signing secret for refresh tokens. Generate separately from JWT_SECRET. |
| `POSTGRES_USER` | ✅ | PostgreSQL username (e.g. `thalassa`) |
| `POSTGRES_PASSWORD` | ✅ | PostgreSQL password. Use a strong random value. |
| `GROQ_API_KEY` | ✅ | API key from [console.groq.com](https://console.groq.com/keys). Free tier available. |
| `CORS_ALLOWED_ORIGINS` | ✅ | Comma-separated allowed origins (e.g. `https://thalassa.app`). Use `https://localhost` locally. |
| `SPRING_PROFILES_ACTIVE` | ✅ | Spring profile: `dev` for local, `prod` for production |
| `VITE_SENTRY_DSN` | ⬜ | Sentry DSN for frontend error tracking (leave empty to disable) |
| `SENTRY_DSN` | ⬜ | Sentry DSN for backend error tracking (leave empty to disable) |
| `DOMAIN` | ⬜ | Public domain for Traefik HTTPS (default: `localhost`) |
| `ACME_EMAIL` | ⬜ | Email for Let's Encrypt certificate notifications |

### 2. Build and start all services

```bash
docker compose up --build
```

On the first run, Docker will:
1. Build multi-stage images for `backend` (Maven → JRE) and `frontend` (Node → nginx)
2. Apply Flyway database migrations automatically
3. Start all 5 services with health checks

### 3. Open the app

```
https://localhost
```

> The browser will show a certificate warning — this is expected with the self-signed certificate used for `localhost`. Accept it to proceed.

**Default ports (internal mapping):**

| Service | Internal | Exposed via Traefik |
|---------|----------|---------------------|
| Frontend (nginx) | 80 | `https://localhost` |
| Backend API | 8080 | `https://localhost/api/` |
| Traefik Dashboard | 8080 | `http://localhost:8090` |
| Scraper (FastAPI) | 8001 | Internal only |
| PostgreSQL | 5432 | Internal only |

### 4. Stop and clean up

```bash
# Stop containers (preserve data)
docker compose down

# Stop and delete volumes (wipes database)
docker compose down -v
```

---

## Development Setup (Hot Reload)

For active development with live reloading, run each service independently.

### Database only (required as dependency)

```bash
docker compose up db
```

### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

The API will be available at `http://localhost:8080/api`.

### Frontend (Vite)

```bash
cd frontend
npm install
npm run dev
```

The SPA will be available at `http://localhost:5173`.

### Scraper (FastAPI)

```bash
cd scraper
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

---

## Running Tests

### Frontend

```bash
cd frontend
npm run test           # Run Vitest suite
npm run typecheck      # TypeScript type check (tsc --noEmit)
npm run lint           # ESLint
```

### Backend

```bash
cd backend
./mvnw test            # JUnit 5 + Testcontainers (requires Docker)
./mvnw verify          # Full build: compile → test → Spotless check → JaCoCo coverage
```

Coverage threshold: **60% line coverage** enforced by JaCoCo.

---

## Project Structure

```
thalassa/
├── backend/                         Spring Boot API
│   ├── src/main/java/com/thalassa/
│   │   ├── config/                  Security, CORS, OpenAPI
│   │   ├── controllers/             REST endpoints
│   │   ├── dto/                     Request/Response DTOs (OpenAPI-generated)
│   │   ├── exceptions/              Custom exceptions + GlobalExceptionHandler
│   │   ├── models/                  JPA entities
│   │   ├── repositories/            Spring Data JPA repositories
│   │   ├── security/                JWT filter, token service
│   │   └── services/                Business logic
│   ├── src/main/resources/
│   │   ├── db/migration/            Flyway SQL migrations (V1, V2, …)
│   │   ├── application.yml          Base config (no secrets)
│   │   ├── application-dev.yml      Local development overrides
│   │   └── openapi.yaml             API contract (source of truth for DTOs)
│   └── pom.xml
│
├── frontend/                        React + Vite SPA
│   └── src/
│       ├── api/                     Axios clients per domain
│       ├── components/
│       │   ├── layout/              Sidebar, BottomTabBar, GestorLayout
│       │   ├── shared/              PlanGate, EmptyState, NotificationBell, …
│       │   └── ui/                  Button, Input, Modal, Badge, Spinner
│       ├── features/                Page-level components by feature
│       │   ├── auth/                Login, Register, Forgot/Reset Password
│       │   ├── aquarium-detail/     Parameters, Livestock, Equipment tabs
│       │   ├── calculators/         Energy and Dosing calculators
│       │   ├── chat/                AI Assistant drawer
│       │   ├── dashboard/           Aquarium grid + create modal
│       │   ├── landing/             Public marketing page
│       │   ├── market/              Species marketplace
│       │   ├── profile/             User settings, locale selector
│       │   └── wishlist/            Saved items
│       ├── hooks/                   Custom hooks (queries, mutations, auth)
│       ├── i18n/                    i18next config + locales (en/de/es)
│       ├── lib/                     Zod schemas, toast helper
│       ├── routes/                  AppRouter, ProtectedRoute, PublicRoute
│       ├── store/                   Zustand stores (auth, UI)
│       ├── types/                   TypeScript interfaces
│       └── utils/                   Formatters, parameter ranges
│
├── scraper/                         FastAPI microservice
│   └── app/
│       ├── routers/                 chat, species, wishlist endpoints
│       └── services/                Groq client, HTML parsers
│
├── docs/                            Project documentation (Obsidian vault)
│   ├── architecture-decisions/      ADR records
│   └── *.md                         Specs, wireframes, backlog, Gantt
│
├── .github/workflows/ci.yml         GitHub Actions CI pipeline
├── docker-compose.yml               Full stack orchestration
├── .env.example                     Environment variable template
├── CONTRIBUTING.md                  Commit conventions and branch naming
└── CHANGELOG.md                     Version history
```

---

## API

The backend is designed **API-First**. The source of truth is:

```
backend/src/main/resources/openapi.yaml
```

All request/response DTOs are generated from this spec via `openapi-generator-maven-plugin` during the Maven build phase. The interactive Swagger UI is available at:

```
https://localhost/api/swagger-ui/index.html
```

Core endpoint groups:

| Prefix | Description |
|--------|-------------|
| `POST /api/auth/register` | Create account |
| `POST /api/auth/login` | Authenticate, receive access + refresh tokens |
| `POST /api/auth/refresh` | Rotate refresh token, get new access token |
| `POST /api/auth/logout` | Revoke refresh token |
| `POST /api/auth/forgot-password` | Request password reset email |
| `POST /api/auth/reset-password` | Confirm reset with token |
| `GET/PUT /api/users/me` | User profile and preferences |
| `GET/POST /api/aquariums` | List and create aquariums |
| `GET/PUT/DELETE /api/aquariums/{id}` | Aquarium CRUD |
| `GET/POST /api/aquariums/{id}/parameters` | Water parameter log |
| `GET /api/aquariums/{id}/parameters/export` | CSV export |
| `GET/POST/DELETE /api/aquariums/{id}/livestock` | Livestock management |
| `GET/POST/DELETE /api/aquariums/{id}/equipment` | Equipment management |
| `POST /api/chat/message` | AI assistant message |
| `GET /api/wishlist` | Saved species/products |
| `GET /api/notifications` | In-app notifications |
| `GET /api/dashboard/summary` | Aggregate stats |
| `GET /actuator/health` | Service health (unauthenticated) |
| `GET /actuator/prometheus` | Prometheus metrics scrape endpoint |

---

## CI/CD

GitHub Actions runs on every push and pull request to `main`:

```
┌─────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│  frontend   │    │       backend        │    │     docker      │
│  npm ci     │    │  mvn verify          │    │  compose build  │
│  lint       │    │  (test + coverage)   │    │  --no-start     │
│  typecheck  │    │  Spotless check      │    └─────────────────┘
│  build      │    └──────────────────────┘
└─────────────┘
```

All three jobs run in parallel. A PR cannot be merged unless all checks pass.

---

## Observability

| Tool | Endpoint / Location |
|------|---------------------|
| Spring Actuator health | `GET /actuator/health` |
| Prometheus metrics | `GET /actuator/prometheus` |
| Structured JSON logs | `docker logs thalassa-backend` |
| Sentry (frontend) | Configured via `VITE_SENTRY_DSN` |
| Sentry (backend) | Configured via `SENTRY_DSN` |

---

## Database Backups

An automated backup service runs `pg_dump` on a cron schedule and stores compressed dumps in `./backups/`:

| Schedule | Retention |
|----------|-----------|
| Daily (02:00 UTC) | 7 days |
| Weekly (Sunday 03:00 UTC) | 4 weeks |
| Monthly (1st 04:00 UTC) | 12 months |

To restore a backup:

```bash
gunzip < backups/daily/thalassa_YYYY-MM-DD.sql.gz | \
  docker exec -i thalassa-db psql -U $POSTGRES_USER thalassa
```

---

## License

Academic project — DAW 2025/2026.
