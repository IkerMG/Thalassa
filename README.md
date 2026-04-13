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

- Java 21+
- Node.js 20+
- Python 3.12+
- Docker & Docker Compose (para entorno integrado)

---

## Puesta en Marcha (desarrollo local)

Cada módulo tiene su propio proceso de arranque. Consulta el `README.md` de cada subcarpeta para instrucciones detalladas.

Para levantar el entorno completo con Docker:

```bash
docker compose up --build
```

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
