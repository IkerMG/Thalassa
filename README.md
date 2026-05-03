# Thalassa

<p align="center">
  <strong>Plataforma profesional de gestión de acuarios marinos</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-orange?logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?logo=springboot&logoColor=white" alt="Spring Boot 3.2" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker Compose" />
  <img src="https://img.shields.io/badge/Licencia-Académica-lightgrey" alt="Licencia" />
</p>

---

**Thalassa** es un SaaS freemium de pila completa para la gestión integral de acuarios marinos. Combina el seguimiento de parámetros del agua, el inventario de fauna y equipamiento, calculadoras de energía y dosificación, un asistente de inteligencia artificial especializado con Groq/Llama, un marketplace de especies con datos en tiempo real y soporte PWA — todo bajo una interfaz elegante de temática OLED oscura con soporte para inglés, alemán y español.

---

## Funcionalidades

| Módulo | Descripción |
|--------|-------------|
| **Autenticación** | Tokens de acceso JWT + refresh tokens rotativos, recuperación/restablecimiento de contraseña por email, control de acceso freemium por rol |
| **Dashboard** | Vista general de múltiples acuarios con estadísticas globales (fauna, equipos) y tarjetas individuales por acuario |
| **Parámetros del agua** | Registro y visualización histórica de pH, temperatura, salinidad, alcalinidad, calcio, magnesio, nitrato y fosfato |
| **Fauna** | Inventario de peces, corales e invertebrados con validación de compatibilidad con arrecife y enlace al catálogo de especies |
| **Equipamiento** | Seguimiento de dispositivos (luces, bombas, skimmers, calentadores) con potencia en vatios y uso diario |
| **Calculadora de energía** | Estimación del consumo mensual en kWh a partir de los datos del equipamiento *(plan ReefMaster)* |
| **Calculadora de dosificación** | Cálculo de dosis de aditivos en función del volumen del acuario *(plan ReefMaster)* |
| **Asistente IA** | Asistente conversacional especializado en acuariofilia marina, impulsado por Groq (Llama 3.3 70B) |
| **Marketplace de especies** | Listados de productos obtenidos mediante scraping en tiempo real de distribuidores asociados vía FastAPI |
| **Lista de deseos** | Guardado de especies y productos de interés con prioridad y notas |
| **Notificaciones** | Campana de notificaciones con alertas categorizadas dentro de la aplicación |
| **Exportación CSV** | Exportación del historial de parámetros del agua a CSV *(plan ReefMaster)* |
| **i18n** | Interfaz completa en inglés, alemán y español con preferencia de idioma por usuario |
| **PWA** | Instalable en escritorio y móvil, con soporte offline mediante Service Worker |

---

## Arquitectura

```
                    ┌─────────────────────────────────────┐
                    │       Traefik (Proxy inverso)        │
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
                    │  (interno)  │  │  :8001    │  │  dump     │
                    └─────────────┘  └───────────┘  └───────────┘
```

Todos los servicios se comunican a través de la red interna Docker (`thalassa-net`). El puerto de la base de datos **no** está expuesto al host.

---

## Stack Tecnológico

### Backend
| Tecnología | Versión | Rol |
|------------|---------|-----|
| Java | 21 | Runtime |
| Spring Boot | 3.2.5 | API REST, lógica de negocio, seguridad |
| Spring Security | 6.x | Autenticación JWT, autorización |
| Spring Data JPA | 3.x | Capa ORM (Hibernate 6.4) |
| PostgreSQL | 16 | Base de datos principal |
| Flyway | 10.x | Migraciones del esquema de base de datos |
| OpenAPI Generator | 7.x | Generación de DTOs a partir de `openapi.yaml` |
| Spring Actuator | 3.x | Health checks, métricas Prometheus |
| Sentry SDK | 7.x | Seguimiento de errores en producción |
| Testcontainers | 1.19 | Tests de integración con PostgreSQL real |
| JUnit 5 + Mockito | — | Tests unitarios y de integración |
| Spotless | — | Formato de código (Google Java Style) |

### Frontend
| Tecnología | Versión | Rol |
|------------|---------|-----|
| React | 18 | Librería de interfaz de usuario |
| TypeScript | 5 | Tipado estático |
| Vite | 5 | Herramienta de compilación y servidor de desarrollo |
| Tailwind CSS | 3 | Estilos basados en utilidades |
| Zustand | 4 | Estado global (autenticación, UI) |
| TanStack Query | 5 | Estado del servidor, caché, mutaciones |
| React Router DOM | 6 | Enrutamiento SPA y guardas de ruta |
| react-i18next | 14 | Internacionalización (EN/DE/ES) |
| Framer Motion | 11 | Transiciones de página y animaciones |
| Recharts | 2 | Gráficas de parámetros del agua |
| Radix UI | — | Componentes headless accesibles |
| React Hook Form + Zod | — | Validación de formularios |
| Axios | 1 | Cliente HTTP con interceptores |
| MSW | 2 | Simulación de API en tests |
| Vitest + Testing Library | — | Tests unitarios y de componentes |
| Sentry SDK | 8 | Seguimiento de errores en el frontend |
| vite-plugin-pwa | — | Service Worker, Web App Manifest |

### Scraper
| Tecnología | Versión | Rol |
|------------|---------|-----|
| Python | 3.12 | Runtime |
| FastAPI | 0.111 | Microservicio REST |
| HTTPX + BeautifulSoup | — | Scraping HTTP y análisis de HTML |
| Groq SDK | — | Puente con Llama 3.3 70B para el asistente IA |

### Infraestructura
| Tecnología | Rol |
|------------|-----|
| Docker + Docker Compose | Orquestación de contenedores |
| Traefik | Proxy inverso con HTTPS automático (Let's Encrypt) |
| nginx | Servidor de archivos estáticos para la SPA |
| GitHub Actions | CI: lint → typecheck → test → build |
| pg_dump cron | Copias de seguridad automáticas de PostgreSQL (diarias/semanales/mensuales) |

---

## Requisitos Previos

- **Docker** 24+ y **Docker Compose** v2 (comando `docker compose`)
- Git

Con esto es suficiente. Todo el stack se ejecuta dentro de contenedores.

> Para el desarrollo local sin Docker también necesitas: Java 21+, Maven 3.9+, Node.js 20+ y una instancia de PostgreSQL 16 en ejecución.

---

## Inicio Rápido (Docker Compose)

### 1. Clonar y configurar el entorno

```bash
git clone <repo-url>
cd thalassa

# Copiar la plantilla de variables de entorno
cp .env.example .env
```

Abre `.env` y rellena **todos los valores obligatorios**:

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `JWT_SECRET` | ✅ | Secreto de firma HS512 para los tokens de acceso. Genera uno con: `openssl rand -hex 64` |
| `JWT_REFRESH_SECRET` | ✅ | Secreto de firma para los refresh tokens. Genera uno distinto al anterior. |
| `POSTGRES_USER` | ✅ | Nombre de usuario de PostgreSQL (ej: `thalassa`) |
| `POSTGRES_PASSWORD` | ✅ | Contraseña de PostgreSQL. Usa un valor aleatorio robusto. |
| `GROQ_API_KEY` | ✅ | Clave de API de [console.groq.com](https://console.groq.com/keys). Disponible en nivel gratuito. |
| `CORS_ALLOWED_ORIGINS` | ✅ | Orígenes permitidos separados por comas (ej: `https://thalassa.app`). En local usa `https://localhost`. |
| `SPRING_PROFILES_ACTIVE` | ✅ | Perfil Spring: `dev` en local, `prod` en producción |
| `VITE_SENTRY_DSN` | ⬜ | DSN de Sentry para el frontend (dejar vacío para desactivar) |
| `SENTRY_DSN` | ⬜ | DSN de Sentry para el backend (dejar vacío para desactivar) |
| `DOMAIN` | ⬜ | Dominio público para HTTPS con Traefik (por defecto: `localhost`) |
| `ACME_EMAIL` | ⬜ | Email para notificaciones de renovación de certificados Let's Encrypt |

### 2. Compilar e iniciar todos los servicios

```bash
docker compose up --build
```

En el primer arranque, Docker realizará automáticamente:
1. Compilación de imágenes multi-etapa para `backend` (Maven → JRE) y `frontend` (Node → nginx)
2. Aplicación de las migraciones de base de datos con Flyway
3. Arranque de los 5 servicios con comprobaciones de salud

### 3. Abrir la aplicación

```
https://localhost
```

> El navegador mostrará una advertencia de certificado — es lo esperado con el certificado autofirmado usado en `localhost`. Acéptala para continuar.

**Puertos por defecto (mapeo interno):**

| Servicio | Puerto interno | Expuesto vía Traefik |
|----------|----------------|----------------------|
| Frontend (nginx) | 80 | `https://localhost` |
| Backend API | 8080 | `https://localhost/api/` |
| Panel de Traefik | 8080 | `http://localhost:8090` |
| Scraper (FastAPI) | 8001 | Solo red interna |
| PostgreSQL | 5432 | Solo red interna |

### 4. Detener y limpiar

```bash
# Detener los contenedores (conserva los datos)
docker compose down

# Detener y eliminar los volúmenes (borra la base de datos)
docker compose down -v
```

---

## Entorno de Desarrollo (Hot Reload)

Para el desarrollo activo con recarga en vivo, ejecuta cada servicio de forma independiente.

### Solo la base de datos (necesaria como dependencia)

```bash
docker compose up db
```

### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

La API estará disponible en `http://localhost:8080/api`.

### Frontend (Vite)

```bash
cd frontend
npm install
npm run dev
```

La SPA estará disponible en `http://localhost:5173`.

### Scraper (FastAPI)

```bash
cd scraper
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

---

## Ejecución de Tests

### Frontend

```bash
cd frontend
npm run test           # Ejecuta la suite Vitest
npm run typecheck      # Comprobación de tipos TypeScript (tsc --noEmit)
npm run lint           # ESLint
```

### Backend

```bash
cd backend
./mvnw test            # JUnit 5 + Testcontainers (requiere Docker)
./mvnw verify          # Build completo: compilar → tests → Spotless → cobertura JaCoCo
```

Umbral de cobertura mínimo: **60% de líneas** aplicado por JaCoCo.

---

## Estructura del Proyecto

```
thalassa/
├── backend/                         API Spring Boot
│   ├── src/main/java/com/thalassa/
│   │   ├── config/                  Seguridad, CORS, OpenAPI
│   │   ├── controllers/             Endpoints REST
│   │   ├── dto/                     DTOs de petición/respuesta (generados por OpenAPI)
│   │   ├── exceptions/              Excepciones personalizadas + GlobalExceptionHandler
│   │   ├── models/                  Entidades JPA
│   │   ├── repositories/            Repositorios Spring Data JPA
│   │   ├── security/                Filtro JWT, servicio de tokens
│   │   └── services/                Lógica de negocio
│   ├── src/main/resources/
│   │   ├── db/migration/            Migraciones SQL de Flyway (V1, V2, …)
│   │   ├── application.yml          Configuración base (sin secretos)
│   │   ├── application-dev.yml      Sobreescrituras para desarrollo local
│   │   └── openapi.yaml             Contrato de la API (fuente de verdad para los DTOs)
│   └── pom.xml
│
├── frontend/                        SPA React + Vite
│   └── src/
│       ├── api/                     Clientes Axios por dominio
│       ├── components/
│       │   ├── layout/              Sidebar, BottomTabBar, GestorLayout
│       │   ├── shared/              PlanGate, EmptyState, NotificationBell, …
│       │   └── ui/                  Button, Input, Modal, Badge, Spinner
│       ├── features/                Componentes de página organizados por funcionalidad
│       │   ├── auth/                Login, Registro, Recuperación/Restablecimiento de contraseña
│       │   ├── aquarium-detail/     Pestañas de Parámetros, Fauna y Equipamiento
│       │   ├── calculators/         Calculadoras de energía y dosificación
│       │   ├── chat/                Drawer del asistente IA
│       │   ├── dashboard/           Cuadrícula de acuarios y modal de creación
│       │   ├── landing/             Página pública de marketing
│       │   ├── market/              Marketplace de especies
│       │   ├── profile/             Ajustes de usuario y selector de idioma
│       │   └── wishlist/            Elementos guardados
│       ├── hooks/                   Hooks personalizados (queries, mutaciones, auth)
│       ├── i18n/                    Configuración i18next + traducciones (en/de/es)
│       ├── lib/                     Esquemas Zod, helper de toasts
│       ├── routes/                  AppRouter, ProtectedRoute, PublicRoute
│       ├── store/                   Stores Zustand (auth, UI)
│       ├── types/                   Interfaces TypeScript
│       └── utils/                   Formateadores, rangos de parámetros
│
├── scraper/                         Microservicio FastAPI
│   └── app/
│       ├── routers/                 Endpoints de chat, especies y lista de deseos
│       └── services/                Cliente Groq, analizadores HTML
│
├── docs/                            Documentación del proyecto (vault Obsidian)
│   ├── architecture-decisions/      Registros ADR
│   └── *.md                         Especificaciones, wireframes, backlog, Gantt
│
├── .github/workflows/ci.yml         Pipeline de CI con GitHub Actions
├── docker-compose.yml               Orquestación del stack completo
├── .env.example                     Plantilla de variables de entorno
├── CONTRIBUTING.md                  Convenciones de commits y nomenclatura de ramas
└── CHANGELOG.md                     Historial de versiones
```

---

## API

El backend sigue el diseño **API-First**. La fuente de verdad es:

```
backend/src/main/resources/openapi.yaml
```

Todos los DTOs de petición y respuesta se generan a partir de esta especificación mediante `openapi-generator-maven-plugin` durante la fase de compilación de Maven. La interfaz interactiva de Swagger UI está disponible en:

```
https://localhost/api/swagger-ui/index.html
```

Grupos de endpoints principales:

| Endpoint | Descripción |
|----------|-------------|
| `POST /api/auth/register` | Crear cuenta |
| `POST /api/auth/login` | Autenticarse y recibir tokens de acceso y refresh |
| `POST /api/auth/refresh` | Rotar el refresh token y obtener un nuevo token de acceso |
| `POST /api/auth/logout` | Revocar el refresh token |
| `POST /api/auth/forgot-password` | Solicitar email de restablecimiento de contraseña |
| `POST /api/auth/reset-password` | Confirmar el restablecimiento con el token recibido |
| `GET/PUT /api/users/me` | Perfil y preferencias del usuario |
| `GET/POST /api/aquariums` | Listar y crear acuarios |
| `GET/PUT/DELETE /api/aquariums/{id}` | CRUD de acuario |
| `GET/POST /api/aquariums/{id}/parameters` | Registro de parámetros del agua |
| `GET /api/aquariums/{id}/parameters/export` | Exportación a CSV |
| `GET/POST/DELETE /api/aquariums/{id}/livestock` | Gestión de fauna |
| `GET/POST/DELETE /api/aquariums/{id}/equipment` | Gestión de equipamiento |
| `POST /api/chat/message` | Mensaje al asistente IA |
| `GET /api/wishlist` | Especies y productos guardados |
| `GET /api/notifications` | Notificaciones dentro de la aplicación |
| `GET /api/dashboard/summary` | Estadísticas agregadas |
| `GET /actuator/health` | Estado del servicio (sin autenticación) |
| `GET /actuator/prometheus` | Endpoint de métricas para Prometheus |

---

## CI/CD

GitHub Actions se ejecuta en cada push y pull request a `main`:

```
┌─────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│  frontend   │    │       backend        │    │     docker      │
│  npm ci     │    │  mvn verify          │    │  compose build  │
│  lint       │    │  (test + cobertura)  │    │  --no-start     │
│  typecheck  │    │  Spotless check      │    └─────────────────┘
│  build      │    └──────────────────────┘
└─────────────┘
```

Los tres jobs se ejecutan en paralelo. No es posible hacer merge de un PR si alguna comprobación falla.

---

## Observabilidad

| Herramienta | Endpoint / Ubicación |
|-------------|----------------------|
| Spring Actuator health | `GET /actuator/health` |
| Métricas Prometheus | `GET /actuator/prometheus` |
| Logs estructurados JSON | `docker logs thalassa-backend` |
| Sentry (frontend) | Configurado mediante `VITE_SENTRY_DSN` |
| Sentry (backend) | Configurado mediante `SENTRY_DSN` |

---

## Copias de Seguridad de la Base de Datos

Un servicio de backup automatizado ejecuta `pg_dump` según una planificación cron y almacena los volcados comprimidos en `./backups/`:

| Planificación | Retención |
|---------------|-----------|
| Diaria (02:00 UTC) | 7 días |
| Semanal (domingos 03:00 UTC) | 4 semanas |
| Mensual (día 1, 04:00 UTC) | 12 meses |

Para restaurar una copia de seguridad:

```bash
gunzip < backups/daily/thalassa_YYYY-MM-DD.sql.gz | \
  docker exec -i thalassa-db psql -U $POSTGRES_USER thalassa
```

---

## Licencia

Proyecto académico — DAW 2025/2026.
