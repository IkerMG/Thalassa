# Changelog

All notable changes to Thalassa are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions follow [Semantic Versioning](https://semver.org/).

---

## [1.0.0] — 2026-05-03

Complete first release. All 12 development phases implemented and shipped.

---

### Phase 12 — Advanced Features (i18n, PWA, Notifications, CSV Export)

#### Added
- **i18n**: Full internationalization with `react-i18next` — English, German, and Spanish supported across all UI components (Sidebar, BottomTabBar, Dashboard, AquariumDetailPage and all modals)
- **PWA**: Installable Progressive Web App via `vite-plugin-pwa` — Web App Manifest, Service Worker with precaching, offline support for static assets
- **Notification Bell**: In-app `NotificationBell` component with dropdown, unread badge, and categorized alerts (SUCCESS, WARNING, INFO); `GET /api/notifications` backend endpoint
- **CSV Export**: Export water parameter history to CSV — `GET /api/aquariums/{id}/parameters/export` endpoint and download button in the Parameters tab *(ReefMaster plan)*
- Locale selector in Profile page persists preference to backend (`PUT /api/users/me`)
- Translation namespaces: `common`, `auth`, `dashboard`, `aquarium`, `nav`, `profile` for EN/DE/ES

#### Fixed
- `@EntityGraph` with two `@OneToMany List` (bag) collections caused `MultipleBagFetchException` → HTTP 409 on aquarium detail load; removed `@EntityGraph`, added `@Transactional` to `getAquariumDetail`
- `OffsetDateTime` / `LocalDateTime` mismatch in `NotificationController` (OpenAPI `dateLibrary=java8-localdatetime`)
- TypeScript compilation errors in test files after `User` type rename (`name` → `username`, removed `createdAt`)
- `Cannot find name 'beforeAll'` in `test/setup.ts` — added explicit Vitest lifecycle imports
- Docker `version: "3.9"` deprecation warning removed from `docker-compose.yml`

---

### Phase 11 — Operations & Observability

#### Added
- **Spring Actuator + Prometheus**: `/actuator/health`, `/actuator/metrics`, `/actuator/prometheus` endpoints; structured JSON logging with `traceId` via MDC filter
- **Healthchecks**: `healthcheck` directives on all Docker services; `depends_on.condition: service_healthy` dependency chain
- **Java 21 upgrade**: Bumped from Java 17 to 21 in Docker image; nginx Content-Security-Policy hardened
- **Traefik**: Reverse proxy with automatic HTTPS via Let's Encrypt ACME; HTTP→HTTPS permanent redirect; TLS 1.2+ only
- **PostgreSQL backups**: Automated `pg_dump` cron service with daily (7-day), weekly (4-week), and monthly (12-month) retention; compressed `.sql.gz` dumps
- **Sentry**: Error tracking integrated in both frontend (`@sentry/react`) and backend (`sentry-spring-boot-starter`); DSN configurable via env vars; tracing and session replay

---

### Phase 10 — Testing & Code Quality

#### Added
- **Frontend testing**: Vitest + React Testing Library + MSW setup; test suites for `formatters`, `authStore`, `PlanGate`, `AppRouter` route guards
- **Backend testing**: JUnit 5 + Mockito unit tests for `AuthService`, `AquariumService`, `ChatService`; `AuthController` integration test with MockMvc; Testcontainers for real PostgreSQL in IT
- **JaCoCo**: 60% line coverage threshold enforced on `mvn verify`; fails build if threshold not met
- **GitHub Actions CI**: Three parallel jobs — frontend (lint + typecheck + build), backend (mvn verify + Spotless), docker (compose build --no-start)
- **ESLint 9 + Prettier**: Frontend linting and formatting with flat config; Husky pre-commit hook
- **Spotless**: Google Java Format enforced on backend; fails build on violations

---

### Phase 9 — UI/UX Polish & Accessibility

#### Added
- **Landing page**: Full public marketing page with hero, features, pricing, and social proof sections
- **Page transitions**: `AnimatePresence` + `motion.div` for route transitions; staggered entrance animations on feature cards and pricing blocks
- **AquariumSettingsModal**: Edit aquarium name, volume, and type; double-confirmation delete flow with typed aquarium name verification
- **Accessibility**: `aria-label` on all icon-only buttons; `motion-safe` wrappers on animations; `cursor-pointer` on all interactive elements; `focus-visible` ring on inputs

#### Fixed
- `ErrorBoundary` added as global fallback; catches render errors and prevents blank screen
- Inline error states with retry button on fetch failures (replaced automatic redirect to `/dashboard` on 500)

---

### Phase 8 — Chat AI Drawer & Freemium Rate Limiting

#### Added
- **ChatDrawer**: AI assistant as a Zustand-controlled drawer mounted in `GestorLayout` — desktop slide-in (380px), mobile fullscreen modal
- **Rate limiting**: FREE plan limited to 5 AI questions per day; `QuestionCounter` shows remaining quota; counter increments after successful Python response (not before)
- Chat history persists in Zustand `uiStore` across page navigation within the session
- `ChatHeader`, `ChatMessageList`, `ChatInput` split into focused sub-components

---

### Phase 7 — Forgot / Reset Password & Frontend Error Layer

#### Added
- `POST /api/auth/forgot-password` — generates SHA-256 token stored in DB, single-use, 1-hour TTL
- `POST /api/auth/reset-password` — validates token, updates password, revokes all active refresh tokens for the user
- `ForgotPasswordPage` and `ResetPasswordPage` UI components with full form validation

#### Fixed
- Axios 401 interceptor now uses React Router `navigate()` instead of `window.location.href` — preserves React state and enables toast feedback
- `ConfirmDialog` component added for all destructive actions

---

### Phase 6 — Refresh Tokens, Flyway, Pagination

#### Added
- **Refresh token rotation**: `POST /api/auth/refresh` with rotating tokens stored in `refresh_tokens` table (30-day TTL); `POST /api/auth/logout` revokes token
- **Flyway**: Database schema management migrated from `ddl-auto: update` to `ddl-auto: validate`; `V1__init.sql` through `V3__*` migrations cover full schema
- **Parameter pagination**: `GET /api/aquariums/{id}/parameters?page=&size=&from=&to=` with Spring Data `Page<T>` response
- `PUT /api/wishlist/{id}` — edit notes and priority on saved wishlist items
- Refresh token flow wired into Axios interceptor — transparent token rotation on 401

#### Fixed
- N+1 query on `ChatService.buildAquariumContext` — added `@Transactional` and eager loading for livestock and equipment collections
- `LazyInitializationException` in chat context builder resolved
- Chat rate limit counter now increments only after successful Groq response

---

### Phase 5 — Security Hardening

#### Added
- All secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `POSTGRES_PASSWORD`, `GROQ_API_KEY`) moved from source code to environment variables
- `.env.example` template committed; `.env` added to `.gitignore`
- `application-dev.yml` and `application-prod.yml` separation — no secrets in any committed YAML
- CORS restricted to explicit origin list from `CORS_ALLOWED_ORIGINS` env var
- PostgreSQL port 5432 removed from host binding in production compose profile
- `show-sql: false` in non-dev profiles; `ddl-auto: validate` in prod

---

### Phase 4 — Frontend SPA & Docker Compose Integration

#### Added
- React 18 + Vite + TypeScript scaffold with deep-sea OLED dark theme
- Complete routing: `AppRouter`, `ProtectedRoute` (JWT guard), `PublicRoute` (redirect if authenticated)
- Authentication UI: `LoginPage`, `RegisterPage` with React Hook Form + Zod validation
- Zustand `authStore` with access token, refresh token, and user state; `localStorage` persistence
- Axios instance with JWT Authorization header injection
- `GestorLayout` with responsive `Sidebar` (desktop) and `BottomTabBar` (mobile)
- Multi-stage `Dockerfile` for frontend (Node build → nginx serve)
- nginx config proxying `/api/` to backend service
- Full `docker-compose.yml` with `thalassa-net` internal network; all services containerized

---

### Phase 3 — Python Scraper & Species Marketplace

#### Added
- FastAPI microservice (`scraper/`) with health check, species scraping from Tiendanimal and Kiwoko, and `chat_router` bridging to Groq API
- HTTPX + BeautifulSoup scrapers with normalization and error handling
- Wishlist API: `GET/POST/DELETE /api/wishlist` consumed by frontend
- Backend `RestClient` integration calling scraper endpoints for marketplace data
- Migration from Google Gemini to **Groq (Llama 3.3 70B)** for AI responses
- Multi-stage `Dockerfile` for scraper service

---

### Phase 2 — Core Backend API

#### Added
- API-First design: `openapi.yaml` as source of truth; `openapi-generator-maven-plugin` generates all DTOs
- `GlobalExceptionHandler` (`@RestControllerAdvice`) with typed `ErrorResponse` — no stack traces in API responses
- Full aquarium CRUD: `GET/POST /api/aquariums`, `GET/PUT/DELETE /api/aquariums/{id}`
- Water parameter endpoints: log measurements, retrieve history
- Livestock and equipment endpoints with reef-safe validation
- `Dashboard` summary endpoint with aggregate counts
- `PlanGate` service-level enforcement: FREE plan limited to 1 aquarium, 5 AI messages/day, no premium calculators
- Energy calculator (`GET /api/aquariums/{id}/energy`) — monthly kWh from equipment data
- Dosing calculator (`POST /api/calculators/dosing`)

---

### Phase 1 — Foundation

#### Added
- Monorepo structure: `backend/`, `frontend/`, `scraper/`, `docs/`
- Spring Boot 3.2 (Java 21) project with Maven multi-module setup
- JPA entities: `User`, `Aquarium`, `Livestock`, `Equipment`, `WaterParameter`, `SpeciesCatalog`, `Wishlist`
- PostgreSQL schema with all relationships, constraints, and indexes
- Spring Security + JWT: `JwtAuthFilter`, `JwtTokenService`, `AuthController` (`/register`, `/login`)
- `User` implements `UserDetails`; `getUsername()` returns email (Spring Security principal)
- `SubscriptionPlan` enum: `FREE` / `REEFMASTER`
- `CONTRIBUTING.md` with Conventional Commits, branch naming, and PR workflow

---

[1.0.0]: https://github.com/IkerMG/thalassa/releases/tag/v1.0.0
