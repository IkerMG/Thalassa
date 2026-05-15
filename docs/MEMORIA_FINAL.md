# Memoria Final del Trabajo de Fin de Grado

## Thalassa — Plataforma de Gestión Integral de Acuarios Marinos

**Autor:** Iker Mozo Gamero
**Ciclo:** Desarrollo de Aplicaciones Web (DAW) — 2º curso
**Centro:** ILERNA Online
**Curso académico:** 2025/2026
**Fecha de defensa prevista:** 18 de mayo de 2026

---

## Índice

1. Introducción
2. La Empresa
3. Planificación y Metodología
4. Análisis y Diseño
5. Desarrollo Técnico
6. Pruebas y Despliegue
7. Conclusiones
8. Bibliografía y Webgrafía
9. Anexos

---

# 1. Introducción

## 1.1. Objeto del proyecto

**Thalassa** es una aplicación web full-stack de tipo SaaS, diseñada como asistente técnico integral para acuaristas marinos. La plataforma centraliza, bajo una única interfaz responsive y de temática OLED oscura, todas las herramientas que un aficionado a la acuariofilia marina necesita para gestionar su acuario de manera profesional:

- **Inventario de fauna y equipamiento** vinculado a cada acuario.
- **Registro histórico de parámetros del agua** (pH, salinidad, temperatura, alcalinidad, calcio, magnesio, nitratos y fosfatos) con visualización gráfica de tendencias.
- **Calculadora de eficiencia energética** que estima el coste eléctrico mensual del acuario a partir del consumo agregado del equipamiento.
- **Calculadora de dosificación** para suplementos en función del volumen del acuario.
- **Asistente conversacional de IA** especializado en acuariofilia marina, alimentado por Groq y el modelo Llama 3.3 70B.
- **Marketplace integrado** que compara precios en tiempo real de tiendas especializadas mediante scraping, con fallback resiliente a datos locales precargados.
- **Lista de deseos**, notificaciones, exportación CSV del historial de parámetros y soporte PWA (instalable en escritorio y móvil).

El problema que Thalassa resuelve es claro: el aficionado a la acuariofilia marina avanzada carece de herramientas digitales especializadas. La gestión actual se realiza mediante hojas de cálculo improvisadas, grupos de mensajería o, sencillamente, de memoria. Esta carencia se traduce en pérdidas económicas (compras incorrectas, equipamiento sobredimensionado, consumo eléctrico desbocado) y, lo que es más grave, en mortandad de animales por incompatibilidades biológicas evitables.

## 1.2. Motivación

La elección del tema responde a tres motivaciones convergentes:

1. **Personal:** la acuariofilia marina es un hobby técnicamente exigente que combina biología, química, electrónica y disciplina operativa. Existe una desproporción clara entre la complejidad del dominio y la pobreza de las herramientas digitales disponibles.
2. **Académica:** el dominio permite ejercitar de forma natural los tres ejes del temario de DAW: una **base de datos relacional** no trivial (con catálogos maestros, validaciones de integridad y reglas de negocio), una **API REST segura** (autenticación JWT con rotación de tokens, autorización por planes Freemium) y una **interfaz cliente rica** (gestión de estado, gráficas, internacionalización, PWA). Adicionalmente, el módulo de scraping y el asistente de IA cumplen con el requisito de **funcionalidad específica en Python**.
3. **Profesional:** el TFG se ha concebido desde el primer día como un producto con vocación de continuidad. Las decisiones técnicas (arquitectura de microservicios, contrato OpenAPI como fuente de verdad, despliegue dockerizado con HTTPS automático) se han tomado con la mirada puesta en una eventual evolución hacia un servicio real.

## 1.3. Objetivos del proyecto

### Objetivos técnicos

- Construir una **API REST** completa con Spring Boot 3.2.5 y Java 21, siguiendo el principio API-First (contrato OpenAPI como fuente de verdad para los DTOs).
- Implementar **autenticación stateless** con JWT (access + refresh) y rotación de refresh tokens con detección de reutilización.
- Diseñar un **modelo de datos relacional** en PostgreSQL 16 gestionado mediante migraciones Flyway.
- Desarrollar una **SPA** con React 18, TypeScript, Vite y Tailwind CSS, organizada por *features*.
- Construir un **microservicio independiente en Python (FastAPI)** que ejecute scrapers asíncronos y exponga el asistente de IA.
- Lograr **resiliencia operativa** del marketplace mediante un mecanismo de *seed cache fallback* en el backend.
- Empaquetar todo el stack en **Docker Compose** con red interna aislada, reverse proxy Traefik y HTTPS automático vía Let's Encrypt.

### Objetivos personales

- Adquirir experiencia trabajando con un stack equivalente al de un equipo profesional Java/React.
- Practicar la disciplina de no entregar funcionalidades incompletas: cualquier *feature* visible en la UI debe funcionar de extremo a extremo.
- Mantener una documentación viva (CHANGELOG, ADRs, OpenAPI) sincronizada con el código.
- Defender públicamente decisiones de diseño justificadas y no meramente intuitivas.

## 1.4. Público objetivo

Thalassa se dirige a tres segmentos de usuarios:

- **Acuarista marino aficionado avanzado** (segmento principal): persona con 1–3 acuarios marinos en casa, alfabetización digital media-alta, sensible al ahorro energético y dispuesta a pagar una pequeña cuota mensual por una herramienta que le ahorre tiempo y errores.
- **Acuarista principiante** (segmento de captación): usuario que estrena su primer acuario y necesita orientación sobre compatibilidad de especies, parámetros adecuados y equipamiento. Para este perfil, el plan FREE actúa como puerta de entrada gratuita.
- **Tienda o profesional del sector** (segmento secundario): aunque no es el foco del TFG, la arquitectura no impide una futura extensión hacia un panel B2B (CRM ligero de clientes, sugerencias automatizadas).

---

# 2. La Empresa

## 2.1. Presentación de la entidad

Thalassa se presenta como un **proyecto de SaaS independiente**, redactado y construido en su totalidad por el alumno como Trabajo de Fin de Grado, pero diseñado con la madurez técnica y comercial de un producto real. No existe a día de hoy una sociedad mercantil constituida; el "ente" Thalassa es, por tanto, una **marca y una visión de producto** que podría dar lugar a una micro-empresa o un proyecto freelance en el futuro.

### Identidad de marca

- **Nombre:** Thalassa, del griego *Θάλασσα* ("mar"). Diosa primordial del mar en la mitología helénica.
- **Lema:** *Your reef, perfected.*
- **Paleta:** OLED dark — negro profundo (`#000`) como base, azul cian acuático (`#59D3FF`) como color de acento, grises neutros (`#A0A0A0`) para tipografía secundaria.
- **Tipografía:** sans-serif moderna, alta legibilidad en pantallas; tracking ancho para el wordmark "THALASSA".

### Misión

Hacer accesible al acuarista marino aficionado una herramienta de gestión profesional que reduzca el coste y el riesgo de su afición, fomentando la sostenibilidad energética y el bienestar animal.

### Visión

Convertirse en la herramienta de referencia del acuarista marino europeo de habla hispana, alemana e inglesa, integrando progresivamente la oferta de tiendas especializadas mediante acuerdos de afiliación.

### Valores

- **Rigor técnico:** el dato sobre compatibilidad de especies y dosificación de suplementos no puede ser aproximado.
- **Resiliencia operativa:** el usuario debe poder usar la plataforma incluso cuando alguna pieza del ecosistema (scraper, tienda externa, red) falle.
- **Transparencia:** modelo Freemium claramente comunicado, sin oscuridades en lo que cada plan ofrece.
- **Sostenibilidad:** la calculadora energética no es solo una utilidad; es una declaración de principios sobre el consumo responsable.

## 2.2. Sección corporativa del web

La página pública, accesible en la ruta `/` y servida sin autenticación, está implementada en [LandingPage.tsx](frontend/src/features/landing/LandingPage.tsx). Estructura:

- **Navbar fijo translúcido** (`bg-black/80 backdrop-blur-md`) con tres anclas internas (*About*, *Features*, *Pricing*) y botones de *Log in* / *Sign up*.
- **Hero con vídeo de fondo en bucle** (`hero-bg.mp4`), un titular en dos colores ("Your reef, perfected.") y dos CTA: *Get Started Free* (registro) y *See How It Works* (anchor a sección de features).
- **Banda de métricas** (`MetricsStrip`) que comunica el alcance del catálogo: acuarios gestionados, parámetros registrados, especies en base de datos.
- **Sección "Features"** con tarjetas animadas (Framer Motion) que describen cada módulo (dashboard, parámetros, fauna, equipo, calculadoras, asistente IA, marketplace, wishlist).
- **Sección "Pricing"** que contrasta visualmente plan FREE y plan ReefMaster (4,99 €/mes).
- **Footer** con enlaces legales y a las redes/contacto.

La implementación es **mobile-first**: todos los breakpoints se construyen mediante utilidades de Tailwind, y la composición se basa en `flexbox` y `grid` para adaptarse a anchos arbitrarios sin scroll horizontal. Las animaciones de entrada (`fadeUp`) se disparan al entrar en el viewport (`whileInView`), no en la carga inicial, para evitar penalizar el LCP.

---

# 3. Planificación y Metodología

## 3.1. Metodología de trabajo

El proyecto se ha gestionado con una **metodología ágil adaptada a un único desarrollador**, inspirada en Scrum pero simplificada:

- **Sprints de 7 días naturales**, cada uno con un objetivo.
- **Definición de "terminado" estricta:** una funcionalidad se considera completada solo cuando funciona en la SPA, devuelve datos coherentes desde el backend y supera al menos un test manual desde la UI.
- **Sin reuniones formales**, sustituidas por entradas de bitácora en el CHANGELOG y por feedbacks intermedios escritos al final de cada hito relevante (ver [docs/](docs/)).
- **Trabajo orientado por valor:** se priorizó tener el flujo completo *login → dashboard → detalle de acuario* funcional al final del tercer sprint, antes de pulir cualquier vista secundaria.

### Cronograma

| Sprint | Fechas | Objetivo |
|--------|--------|---------------------|
| Sprint 1 | 13–19 abril 2026 | Login funcional de extremo a extremo en Postman, esquema PostgreSQL aplicado vía Flyway, proyecto FastAPI inicializado. |
| Sprint 2 | 20–26 abril 2026 | CRUDs de acuarios, fauna y equipamiento + restricción Freemium en creación de acuarios + alerta *reef_safe* + endpoint de energía. |
| Sprint 3 | 27 abril – 3 mayo 2026 | Scrapers reales integrados con el backend Java vía RestClient + SPA React con navegación principal funcional. |
| Sprint 4 | 4–10 mayo 2026 | Vistas pendientes (marketplace, wishlist, perfil, calculadora), modal de upgrade, mejoras de usabilidad, dockerización completa. |
| Cierre y memoria | 11–18 mayo 2026 | Congelación de código el 10 de mayo, redacción de esta memoria, preparación de defensa. |

## 3.2. Herramientas de gestión

- **Git + GitHub** como sistema de control de versiones. Convención de ramas: `main` (producción), feature branches puntuales para refactors de mayor calado, y pull requests revisadas (autorrevisión) antes de merge.
- **GitHub Issues + Pull Requests** como tablero de tareas ligero. El historial de PRs (`#9 githubPages`, `#10 Remove duplicate external link icon`) refleja la iteración continua sobre la UI.
- **GitHub Actions** para la integración continua (lint, typecheck, tests, build), bloqueante en cada PR.
- **CHANGELOG.md** mantenido manualmente, con entradas por versión semántica.
- **Carpeta `docs/`** como *vault* de documentación, con cronograma de Gantt textual, backlog de tareas, ADRs (Architecture Decision Records) y wireframes.
- **VS Code** como IDE principal.

## 3.3. Tecnologías utilizadas

### Frontend (capa cliente)

| Tecnología | Versión | Rol |
|-----------|---------|-----|
| React | 18.3 | Librería de UI |
| TypeScript | 5.7 | Tipado estático |
| Vite | 6.0 | Bundler y dev server |
| Tailwind CSS | 4.0 | Estilos por utilidades |
| Zustand | 5.0 | Estado global ligero (auth, UI) |
| TanStack Query | 5.80 | Estado del servidor, caché y mutaciones |
| React Router DOM | 6.28 | Enrutamiento SPA y guardas |
| react-i18next | 17.0 | Internacionalización (EN / DE / ES) |
| Framer Motion | 11.15 | Animaciones declarativas |
| Recharts | 3.8 | Gráficos del historial de parámetros |
| Axios | 1.7 | Cliente HTTP con interceptores JWT |
| vite-plugin-pwa | — | Service Worker y manifest PWA |
| Sentry SDK | 10.5 | Captura de errores en cliente |

### Backend (capa servidor)

| Tecnología | Versión | Rol |
|-----------|---------|-----|
| Java | 21 (OpenJDK) | Runtime |
| Spring Boot | 3.2.5 | API REST + IoC |
| Spring Security | 6.x | Autenticación JWT, autorización |
| Spring Data JPA | 3.x | ORM (Hibernate 6.4) |
| PostgreSQL | 16-alpine | SGBD relacional |
| Flyway | 10.x | Migraciones SQL versionadas |
| JJWT | 0.12.5 | Generación y validación de JWT |
| OpenAPI Generator | 7.4 | Generación de DTOs desde `openapi.yaml` |
| Spring Actuator + Micrometer | 3.x | Health checks, métricas Prometheus |
| Sentry SDK | 8.13 | Captura de errores en servidor |
| Logstash Logback Encoder | — | Logs estructurados en JSON |
| Cloudinary SDK | — | Subida y transformación de imágenes |
| JUnit 5 + Testcontainers | — | Tests de integración con PostgreSQL real |

### Microservicio Python

| Tecnología | Versión | Rol |
|-----------|---------|-----|
| Python | 3.12 | Runtime |
| FastAPI | 0.115 | Framework REST asíncrono |
| Uvicorn | 0.34 | Servidor ASGI |
| httpx | 0.28 | Cliente HTTP asíncrono |
| BeautifulSoup4 | 4.12 | Parsing HTML |
| lxml | 5.3 | Parser XML/HTML rápido |
| Pydantic | 2.11 | Validación de datos y modelos |
| fake-useragent | 2.1 | Rotación de User-Agent |
| groq | 1.2 | SDK del LLM Llama 3.3 70B |
| python-dotenv | 1.1 | Carga de variables de entorno |

### Infraestructura

| Tecnología | Rol |
|-----------|-----|
| Docker + Docker Compose | Orquestación local y de producción |
| Traefik v3.3 | Reverse proxy + TLS automático con Let's Encrypt |
| nginx | Servidor de estáticos para la SPA |
| pg_dump (cron) | Backups diarios/semanales/mensuales |
| GitHub Actions | Pipeline CI (lint, typecheck, test, build) |

---

# 4. Análisis y Diseño

## 4.1. Requerimientos del sistema

### 4.1.1. Requerimientos funcionales

**RF-01. Gestión de cuentas de usuario.** El sistema debe permitir registro, login, logout, recuperación de contraseña por email y restablecimiento mediante token de un solo uso con caducidad de 1 hora.

**RF-02. Gestión de acuarios.** Cada usuario autenticado puede crear, listar, modificar y eliminar acuarios (nombre, volumen en litros, tipo: `REEF` / `FISH_ONLY` / `MIXED`). El plan FREE limita el inventario a **1 acuario**; el plan REEFMASTER no tiene límite.

**RF-03. Inventario de fauna.** Por cada acuario, el usuario puede registrar
especies con su nombre, categoría (`FISH` / `CORAL` / `INVERTEBRATE`), cantidad
y el atributo `reef_safe`, que se marca manualmente mediante una casilla de
verificación en el formulario de alta. El valor se almacena directamente en la
tabla `livestock` (campo denormalizado), lo que permite gestionar tanto especies
del catálogo integrado como especies personalizadas sin FK obligatoria. Un badge
visual en la tarjeta de cada animal refleja el estado marcado.


**RF-04. Inventario de equipamiento.** Por cada acuario, el usuario puede registrar equipo (nombre, categoría, potencia en vatios, horas/día de funcionamiento).

**RF-05. Registro de parámetros del agua.** Por cada acuario, el usuario puede registrar y consultar mediciones con paginación: temperatura, salinidad, pH, alcalinidad dKH, calcio ppm, magnesio ppm, nitratos ppm, fosfatos ppm, marca temporal automática.

**RF-06. Advertencia de compatibilidad *reef-safe*.** Al añadir un animal a un
acuario de tipo `REEF`, si el usuario ha marcado la casilla `reef_safe = false`
en el formulario, el sistema activa dos avisos de forma simultánea:

- **En el cliente (antes de guardar):** el formulario muestra inline un bloque
  de alerta rojo con el icono `TriangleAlert` advirtiendo de la incompatibilidad,
  mientras el checkbox permanezca desmarcado.
- **En el servidor (tras guardar):** `LivestockService.java` comprueba
  `aquarium.type == REEF && livestock.reefSafe == false` y devuelve un campo
  `warning` en la respuesta. El frontend muestra ese texto como un `toast.info`.

La operación **no se bloquea**: la especie se registra igualmente, respetando
la autonomía del usuario, pero garantizando que la decisión sea consciente.


**RF-07. Calculadora de eficiencia energética.** Endpoint que devuelve el consumo mensual estimado en kWh y el coste asociado, aplicando la fórmula `(W/1000) × h/día × 30 × €/kWh`, siendo `€/kWh` un valor configurable en el perfil. Restringido a plan REEFMASTER.

**RF-08. Marketplace de productos.** Búsqueda por palabra clave que agrega resultados en tiempo real de Urban Natura y Cetamar. Devuelve nombre, precio, imagen, URL del producto y tienda.

**RF-09. Resiliencia del marketplace (*seed fallback*).** Si el scraper en vivo no devuelve resultados (por timeout, error o lista vacía), el backend completa la respuesta con datos precargados desde JSONs locales por tienda. *(Detalle técnico en §5.1.2.)*

**RF-10. Asistente conversacional IA.** Chat especializado en acuariofilia marina, alimentado por Llama 3.3 70B vía Groq, con conocimiento del contexto del acuario (fauna, equipo y parámetros recientes) inyectado en el prompt. Rate limit: 5 mensajes/día en plan FREE, ilimitado en REEFMASTER.

**RF-11. Lista de deseos.** Guardado de productos del marketplace con prioridad (`LOW` / `MEDIUM` / `HIGH`) y notas.

**RF-12. Subida de imágenes.** Subida de imágenes (avatares, fotos de acuarios) a Cloudinary mediante endpoint propio.

**RF-14. Internacionalización.** Interfaz completa en español, inglés y alemán, con preferencia persistida en el perfil del usuario.

**RF-15. Instalación PWA.** La SPA debe poder instalarse en escritorio y móvil y mantener funcionalidad básica de navegación cuando no hay conexión.

### 4.1.2. Requerimientos no funcionales

- **RNF-01. Rendimiento.** Las páginas principales deben tener un *Time to Interactive* inferior a 2 s en conexión 4G. Se logra mediante *code-splitting* con `React.lazy`, caché HTTP y Service Worker.
- **RNF-02. Seguridad.** Comunicación cliente-servidor cifrada con HTTPS (Let's Encrypt). Contraseñas almacenadas con BCrypt. JWT firmados con HS512. Refresh tokens opacos rotativos.
- **RNF-03. Disponibilidad del marketplace.** La búsqueda debe devolver siempre HTTP 200, incluso ante fallo del scraper, gracias al *seed fallback*.
- **RNF-04. Portabilidad.** Todo el stack se levanta con `docker compose up`. No hay rutas absolutas hardcodeadas ni dependencias del sistema operativo del host.
- **RNF-05. Mantenibilidad.** Contrato OpenAPI como fuente única de verdad: los DTOs del backend y los tipos de TypeScript se derivan del mismo `openapi.yaml`.
- **RNF-06. Observabilidad.** Logs estructurados en JSON (Logstash Logback Encoder), métricas Prometheus en `/actuator/prometheus`, integración opcional con Sentry.
- **RNF-07. Accesibilidad.** Cumplimiento básico WCAG: contraste verificado en paleta OLED, navegación por teclado, atributos `aria-*` en componentes interactivos.
- **RNF-08. Internacionalización persistente.** El idioma se almacena en el campo `users.locale` y se aplica en cada login.
- **RNF-09. Compatibilidad de navegadores.** Última versión de Chrome, Firefox, Edge y Safari (escritorio y móvil).

## 4.2. Modelo de datos

El esquema relacional se gestiona mediante **6 migraciones Flyway** (`V1__init_schema.sql` … `V6__add_image_urls.sql`) en [backend/src/main/resources/db/migration/](backend/src/main/resources/db/migration/).

### 4.2.1. Diagrama Entidad-Relación

```
┌────────────────────────────────────────────────────────────────────────┐
│                                  USERS                                  │
│  id (PK) · username · email · password · subscription_plan              │
│  electricity_price_kwh · locale · temperature_unit · volume_unit        │
│  chat_count_today · last_chat_date                                      │
└─────┬────────────────────────────────┬───────────────────────┬─────────┘
      │ 1                            1 │                     1 │
      │ *                            * │                     * │
┌─────▼─────────┐         ┌─────────────▼──────────┐  ┌────────▼──────────┐
│   AQUARIUMS   │         │     WISHLIST_ITEMS     │  │  REFRESH_TOKENS   │
│  id (PK)      │         │  id (PK)               │  │  id (PK)          │
│  name         │         │  product_name · price  │  │  token · revoked  │
│  liters       │         │  img_url · product_url │  │  expires_at       │
│  type (ENUM)  │         │  store_name · priority │  └───────────────────┘
│  user_id (FK) │         │  category · notes      │
└──┬────┬───┬───┘         │  user_id (FK)          │  ┌───────────────────┐
   │ 1  │ 1 │ 1           └────────────────────────┘  │PASSWORD_RESET_TKNS│
   │ *  │ * │ *                                       │  id (PK) · token  │
   │    │   │                                         │  expires_at · used│
┌──▼──┐ │   │ ┌──────────────────┐                    │  user_id (FK)     │
│LIVE-│ │   │ │ WATER_PARAMETERS │                    └───────────────────┘
│STOCK│ │   │ │  id (PK)         │
│     │ │   │ │  aquarium_id(FK) │       ┌────────────────────────────┐
│     │ │   │ │  temperature ph  │       │     SPECIES_CATALOG        │
│     │ │   │ │  salinity · alk  │       │  id (PK)                   │
│     │ │   │ │  calcium · mg    │       │  common_name               │
│     │ │   │ │  nitrates · phos │       │  scientific_name           │
│     │ │   │ │  measured_at     │       │  category (ENUM)           │
└──┬──┘ │   │ └──────────────────┘       │  reef_safe (BOOL)          │
   │    │   │                            │  image_url · notes         │
   │    │ ┌─▼────────────┐               └──┬─────────────────────────┘
   │    │ │   EQUIPMENT  │                  │
   │    │ │  id (PK)     │                  │ 1
   │    │ │  name        │                  │ *
   │    │ │  power_watts │              ┌───┴────────┐ (FK opcional
   │    │ │  hours/day   │              │  livestock │  para especies
   │    │ │  category    │              └────────────┘  custom)
   │    │ │  aquarium_id │
   │    │ └──────────────┘
   │    │
   │    └─── EQUIPMENT(aquarium_id) FK → AQUARIUMS.id
   └────── WATER_PARAMETERS(aquarium_id) FK → AQUARIUMS.id
```

### Entidades principales

- **`users`** — credenciales, plan de suscripción (`FREE` / `REEFMASTER`), preferencias (idioma, unidad de temperatura `C/F`, unidad de volumen `L/G`, precio del kWh).
- **`aquariums`** — pertenece a un usuario; almacena nombre, litros y tipo. Constraint CHECK sobre `type` con valores `REEF`, `FISH_ONLY` y `MIXED`.
- **`livestock`** — pertenece a un acuario; opcionalmente enlaza con `species_catalog` para datos curados (incluido `reef_safe`).
- **`equipment`** — pertenece a un acuario; alimenta la calculadora de energía.
- **`water_parameters`** — historial con marca temporal de las mediciones.
- **`species_catalog`** — catálogo maestro **sembrado en la migración `V2__seed_reference_data.sql`**, no editable por el usuario.
- **`wishlist_items`** — productos guardados desde el marketplace, vinculados al usuario.
- **`refresh_tokens`** — refresh tokens opacos, con bandera `revoked` y `expires_at`, para implementar rotación segura.
- **`password_reset_tokens`** — tokens de un solo uso con TTL de 1 hora.

### Reglas de integridad relevantes

- **Cascada en borrado.** Al eliminar un acuario se eliminan en cascada `livestock`, `equipment` y `water_parameters` asociados.
- **Unicidad.** `users.username` y `users.email` son únicos.
- **CHECK constraints.** Sobre los enums (`subscription_plan`, `type`, `category`, `priority`) para garantizar coherencia incluso ante manipulación directa de la BD.
- **Defaults.** `subscription_plan` por defecto a `FREE`; `priority` por defecto a `MEDIUM`; `measured_at` por defecto `NOW()`.

## 4.3. Diseño de la arquitectura

El sistema sigue un patrón **client-server** clásico, ampliado con un microservicio auxiliar de scraping. Hay **tres capas de servicio** en producción (frontend, backend, scraper) más una capa de **infraestructura compartida** (PostgreSQL, Traefik, backup).

```
                       ┌────────────────────────────┐
       Internet ──────►│       Traefik v3.3         │
                       │  HTTPS :443 (Let's Encrypt)│
                       │  HTTP  :80  → redirect 301 │
                       └──┬─────────────────────┬───┘
                          │                     │
                          │  Host(DOMAIN)       │  Host(DOMAIN)
                          │                     │  PathPrefix(/api)
                          ▼                     ▼
                  ┌──────────────┐     ┌──────────────────┐
                  │   Frontend   │     │   Backend Spring │
                  │  nginx :80   │     │   Boot :8080     │
                  │  (React SPA) │     │                  │
                  └──────────────┘     └──┬───────────┬───┘
                                          │           │
                       (red interna thalassa-net)     │
                                          │           │
                                ┌─────────▼───┐ ┌─────▼───────┐
                                │  scraper    │ │ PostgreSQL  │
                                │  FastAPI    │ │ 16-alpine   │
                                │  :8001      │ │ :5432       │
                                └─────────────┘ └─────┬───────┘
                                                      │
                                                ┌─────▼──────┐
                                                │  Backup    │
                                                │  pg_dump   │
                                                │  (cron)    │
                                                └────────────┘
```

### Reglas de la red Docker

Todos los servicios pertenecen a la red interna `thalassa-net` (driver `bridge`). Los hostnames son los nombres de servicio del `docker-compose.yml`:

- El **frontend** llama al backend mediante el path `/api/*`, que **Traefik enruta** al backend Java. En desarrollo, Vite tiene un proxy equivalente que redirige `/api` a `http://localhost:8080`.
- El **backend** llama al scraper mediante la URL interna **`http://scraper:8001`**, inyectada en la variable de entorno `PYTHON_SERVICE_URL`. En ningún caso esta URL apunta a `localhost` ni a una IP externa.
- El **backend** se conecta a PostgreSQL mediante `jdbc:postgresql://db:5432/thalassa`, donde `db` es el nombre de servicio del contenedor.
- **El scraper no es accesible desde Internet.** No tiene labels Traefik; solo es alcanzable dentro de `thalassa-net`. Esto cumple el principio de minimización de superficie de ataque: el scraper no requiere autenticación propia porque solo el backend Java (autenticado) puede invocarlo.
- **PostgreSQL no expone puerto al host** en `docker-compose.yml` (sí lo expone, opcionalmente, el override de desarrollo).

### Configuración de red en producción vs. desarrollo

El proyecto usa el patrón estándar de **override** de Docker Compose:

- `docker-compose.yml` define la configuración de **producción**: Traefik con HTTPS forzado, redirect 301 de HTTP → HTTPS, certificados Let's Encrypt vía challenge HTTP-01, HSTS habilitado.
- `docker-compose.override.yml` aplica los cambios de **desarrollo**: Traefik sin HTTPS, sin redirect, lee la configuración estática desde `traefik-dev.yml`, y el frontend se publica bajo la base path `/Thalassa/` para coincidir con el subpath de GitHub Pages cuando aplique.

Esto permite al desarrollador trabajar contra `http://localhost` sin certificados autofirmados ni dominios reales, mientras que un `docker compose -f docker-compose.yml up` ignora el override y arranca la configuración pulida de producción.

## 4.4. Lenguajes de marcas y Diseño UI/UX

### 4.4.1. Maquetación (HTML5 / CSS3)

El proyecto **no utiliza HTML/CSS plano**: la SPA está construida íntegramente con **JSX** (compilado por Vite) y los estilos se aplican con **Tailwind CSS 4** mediante utilidades en línea (`className="..."`). El HTML estático se reduce al `index.html` mínimo que Vite hidrata.

A pesar de no escribir CSS clásico, el diseño sigue rigurosamente los principios modernos:

- **Mobile-first.** Las utilidades base se diseñan para móvil; los breakpoints (`md:`, `lg:`, `xl:`) añaden complejidad a anchos crecientes.
- **Sistema de tokens.** Los colores se centralizan vía variables CSS y la configuración de Tailwind; la paleta OLED (`#000`, `#0A0A0A`, `#59D3FF`, `#A0A0A0`) está documentada.
- **Layout primitives.** `flex` y `grid` para casi toda la composición. Apenas se usa `absolute` salvo en componentes específicos (modales, drawer, video del hero).
- **Animaciones declarativas.** Framer Motion expresa transiciones como props (`initial`, `animate`, `whileInView`), evitando keyframes manuales.
- **Componentes accesibles.** Los primitivos UI (`Button`, `Modal`, `Input`) llevan `aria-label`, `role`, `tabIndex` cuando procede, y soportan navegación por teclado.

### 4.4.2. Wireframes y prototipos

Los wireframes iniciales se trabajaron en papel y se trasladaron directamente a Tailwind, sin pasar por Figma. La filosofía fue construir prototipos funcionales en JSX desde el primer día (*"a working prototype is a working component"*), y luego iterar sobre código real.

Las pantallas principales del producto son:

| Vista | Ruta | Descripción |
|-------|------|-------------|
| Landing | `/` | Página pública de marketing (ver §2.2) |
| Login | `/login` | Email/password, enlaces a registro y recuperación |
| Registro | `/register` | Username, email, password con validación inline |
| Recuperación / restablecimiento | `/forgot-password`, `/reset-password` | Flujo en dos pasos por email |
| Dashboard | `/dashboard` | Cuadrícula de acuarios + estadísticas globales |
| Detalle de acuario | `/dashboard/aquarium/:id` | Tabs de parámetros / fauna / equipo |
| Marketplace | `/dashboard/market` | Buscador + tarjetas de producto con badge `fromCache` cuando aplica |
| Wishlist | `/dashboard/wishlist` | Lista ordenable por prioridad |
| Perfil | `/dashboard/profile` | Avatar, idioma, precio kWh, unidades |
| Ajustes | `/dashboard/profile/settings` | Cambios sensibles (contraseña) |
| Checkout | `/dashboard/checkout` | Upgrade a ReefMaster |
| Calculadoras | `/dashboard/calculator/dosing`, `/energy` | Dos páginas dedicadas |

La navegación se adapta al dispositivo: **sidebar** lateral en escritorio (`Sidebar.tsx`) y **bottom tab bar** en móvil (`BottomTabBar.tsx`), ambas envueltas por un layout común `GestorLayout`.

---

# 5. Desarrollo Técnico

## 5.1. Desarrollo del Entorno Servidor (Backend)

### 5.1.1. Configuración del entorno de trabajo

El backend es un proyecto **Maven** con descriptor en [backend/pom.xml](backend/pom.xml). Se levanta de dos maneras:

**a) Como contenedor Docker** (uso normal):
```bash
docker compose up backend
```
La imagen es **multi-stage**: una fase Maven que compila el `.jar`, y una fase final con `eclipse-temurin:21-jre-alpine` que solo contiene el JRE y el artefacto. Esto reduce el tamaño de imagen y la superficie de ataque.

**b) Como proceso local** (para hot-reload con Spring DevTools):
```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

La configuración base (`application.yml`) se sobrescribe en `application-dev.yml` cuando `SPRING_PROFILES_ACTIVE=dev`. Las credenciales nunca aparecen en el código: se cargan desde variables de entorno (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `JWT_SECRET`, etc.) con valores por defecto razonables para desarrollo local.

**OpenAPI Generator** se ejecuta como parte de la fase `generate-sources` de Maven y genera los DTOs en `src/main/java/.../dto/generated/` a partir de `src/main/resources/openapi.yaml`. Estos DTOs **no se modifican manualmente**: cualquier cambio se hace primero en el contrato.

### 5.1.2. Desarrollo de la API y lógica de negocio

#### Organización del código

```
com.thalassa.backend/
├── config/         — Beans de configuración (SecurityConfig, ScraperClientConfig, ...)
├── controllers/    — Capa REST. 12 controladores.
├── services/       — Lógica de negocio. 15 servicios.
├── repositories/   — Spring Data JPA. 9 repositorios.
├── models/         — Entidades JPA + enums.
├── security/       — Filtro JWT, UserDetailsService.
└── exceptions/     — Excepciones de dominio + GlobalExceptionHandler.
```

#### Endpoints principales

Los controladores siguen una convención REST estricta. El catálogo completo está en [openapi.yaml](backend/src/main/resources/openapi.yaml), pero las agrupaciones más relevantes son:

- **Autenticación** (`/api/auth`): `register`, `login`, `refresh`, `logout`, `forgot-password`, `reset-password`.
- **Usuario** (`/api/users/me`): perfil del usuario autenticado, lectura y actualización.
- **Acuarios** (`/api/aquariums`): CRUD completo. La creación impone la restricción Freemium en el servicio.
- **Fauna** (`/api/aquariums/{id}/livestock`, `/api/livestock/{id}`): añadir devuelve `{livestock, warning?}`.
- **Equipamiento** (`/api/aquariums/{id}/equipment`, `/api/equipment/{id}`).
- **Parámetros del agua** (`/api/aquariums/{id}/water-parameters`): listado paginado y registro de mediciones.
- **Energía** (`/api/aquariums/{id}/energy`): cálculo on-demand, restringido a REEFMASTER.
- **Catálogo de especies** (`/api/species`): búsqueda por nombre común o científico.
- **Marketplace** (`/api/scraper/search`): único endpoint que se documenta en detalle más abajo.
- **Chat** (`/api/chat`, `/api/chat/usage`): proxy autenticado al microservicio Python con rate-limiting.
- **Wishlist** (`/api/wishlist`): CRUD.
- **Subida de imágenes** (`/api/upload`): multipart hacia Cloudinary.
- **Dashboard** (`/api/dashboard/summary`): agregaciones para la pantalla principal.
- **Notificaciones** (`/api/notifications`).

#### Comunicación con el microservicio Python: RestClient

La configuración del cliente HTTP que apunta al scraper está aislada en [ScraperClientConfig.java](backend/src/main/java/com/thalassa/backend/config/ScraperClientConfig.java). Usa el **`RestClient`** moderno de Spring 6 (no el `WebClient` reactivo, dado que el resto del backend es síncrono):

```java
@Bean
public RestClient scraperRestClient(@Value("${python.service.url}") String baseUrl) {
    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(Duration.ofSeconds(8));
    factory.setReadTimeout(Duration.ofSeconds(8));
    return RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
}
```

El timeout deliberadamente bajo (**8 segundos**) es inferior al timeout interno del scraper Python (~15 s) para que el backend Java nunca quede bloqueado esperando una respuesta que el scraper ya ha abandonado.

#### Resiliencia del marketplace — el corazón técnico

El componente más complejo y diferenciador del proyecto es [ScraperService.java](backend/src/main/java/com/thalassa/backend/services/ScraperService.java) (~247 líneas), responsable de orquestar la búsqueda con un sistema de **tres niveles de fallback**:

1. **Camino feliz: scraping en vivo.** El backend invoca `GET http://scraper:8001/scrape?keyword=...&store=...`. Si el scraper devuelve resultados, se mapean de `snake_case` (Python) a `camelCase` (DTO del backend) y se sirven al cliente con `fromCache: false`.
2. **Suplemento por tienda faltante.** Las tiendas esperadas (`Urban Natura`, `Cetamar`) están enumeradas como constante. Si alguna no aparece en la respuesta viva (por ejemplo, porque su scraper concreto ha lanzado `TIMEOUT_ERROR`), el backend completa los huecos cargando hasta 10 items por tienda desde los JSON locales. Se loguea explícitamente: `"scraper: supplemented '...' with N seed items for store '...'"`.
3. **Fallback completo ante caída total.** Si la llamada al scraper lanza `ResourceAccessException` (timeout / DNS) o `RestClientException` (error de conexión), el backend carga el seed completo y lo devuelve con `errorCode: TIMEOUT_ERROR` o `SERVICE_UNAVAILABLE`. Si tampoco hay seed, devuelve `results: []` con el `errorCode` apropiado, pero **siempre HTTP 200**.

#### Los JSON locales (seed)

Ubicación: [backend/src/main/resources/market-seed/](backend/src/main/resources/market-seed/) — un fichero por tienda (`urbannatura.json`, `cetamar.json`). Estructura:

```json
[
  {
    "name": "Skimmer Bubble Magus Curve 5",
    "price": 109.95,
    "product_url": "https://www.urbannatura.com/...",
    "img_url": "/market-placeholder.svg",
    "store_name": "Urban Natura"
  },
  …
]
```

La búsqueda dentro del seed es *case-insensitive* sobre `name`: si no hay coincidencia exacta de keyword, se devuelven hasta 10 productos genéricos de cada tienda para no presentar al usuario una página vacía. La respuesta lleva siempre `fromCache: true` cuando proviene de seed, de modo que la SPA puede mostrar un badge visible (*"datos en caché"*) y gestionar la expectativa del usuario.

Esta decisión arquitectónica resuelve el principal riesgo operativo del proyecto: el scraping de terceros es intrínsecamente frágil (cambios de HTML, rate-limiting, mantenimientos de las tiendas). El seed convierte un punto de fallo en una degradación controlada.

### 5.1.3. Seguridad y autenticación

#### JWT con rotación de refresh tokens

El sistema de autenticación es **stateless**. El flujo es:

1. **Login.** `POST /api/auth/login` devuelve `{token, refreshToken, user}`. El `token` (access) es un JWT firmado con HS512 que caduca a los **15 minutos**. El `refreshToken` es un token **opaco** (no JWT), persistido en la tabla `refresh_tokens`, que caduca a los **30 días**.
2. **Petición autenticada.** El frontend envía `Authorization: Bearer <token>` en cada petición. El filtro [JwtAuthFilter](backend/src/main/java/com/thalassa/backend/security/JwtAuthFilter.java) intercepta, valida la firma y la caducidad, y rellena el `SecurityContext`.
3. **Refresh con rotación.** Cuando el access caduca, el frontend llama a `POST /api/auth/refresh` con el refresh token. El backend:
   - Verifica que el refresh existe, no está revocado y no ha caducado.
   - **Lo revoca** (lo marca `revoked = true`).
   - Emite un **nuevo access + nuevo refresh** y los devuelve.
4. **Detección de reutilización.** Si llega un refresh token ya revocado, el backend invalida **todos** los refresh tokens del usuario (asumiendo robo) y obliga a re-login.

En el cliente, el interceptor de Axios implementa el patrón **single-in-flight**: si varias peticiones reciben 401 simultáneamente, **una sola** llamada de refresh se dispara y las demás esperan su resultado, evitando *race conditions*.

#### Otras medidas de seguridad

- **Contraseñas** hasheadas con BCrypt (factor de coste por defecto de Spring Security).
- **CSRF** desactivado para la API REST stateless (no aplica con tokens en header).
- **CORS** configurable mediante `CORS_ALLOWED_ORIGINS` (lista separada por comas).
- **Password reset** mediante token de un solo uso, persistido con TTL de 1 hora; el endpoint `POST /api/auth/forgot-password` devuelve 204 sin revelar si el email existe (mitigación de enumeración de cuentas).
- **Rate limiting por plan** en el endpoint de chat (5/día en FREE, ilimitado en REEFMASTER). Se aplica el patrón *reserve-and-confirm*: la cuota solo se incrementa si el LLM responde con éxito.
- **HSTS** habilitado en producción vía Traefik (`max-age=31536000; includeSubDomains; preload`).
- **Security headers** en nginx para la SPA: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restrictivo y CSP.
- **MDC logging.** Cada request tiene un `requestId` asignado en un filtro, propagado en MDC y serializado por Logback en cada línea de log para trazabilidad.

## 5.2. Desarrollo del Entorno Cliente (Frontend)

### 5.2.1. Lógica de interfaz e interactividad

El frontend está organizado por **features** verticales en [frontend/src/features/](frontend/src/features/), donde cada feature contiene sus componentes, hooks y vistas. Esto contrasta con la organización tradicional por tipo de archivo (componentes, hooks, utils) y favorece la cohesión y la portabilidad de cada módulo.

#### Gestión de estado

El proyecto distingue estrictamente entre **estado del cliente** y **estado del servidor**:

- **Estado del cliente** (autenticación, modo oscuro, sidebar abierto): se gestiona con **Zustand**. Los stores son pequeños, tipados y, en el caso del `authStore`, persistidos en `localStorage` con el helper `persist` de Zustand.
- **Estado del servidor** (acuarios, parámetros, productos, etc.): se gestiona con **TanStack Query**. Cada feature consume hooks personalizados (`useAquariums`, `useDashboardSummary`, `useWishlist`) que encapsulan `useQuery`, la clave de caché y el tiempo de stale.

Para las mutaciones (crear/editar/borrar) existen hooks `useCreateAquarium`, `useAddLivestock`, `useLogParameter`, etc., que combinan `useMutation` con invalidación automática de las queries relacionadas.

#### Rutas y guardas

[AppRouter.tsx](frontend/src/routes/AppRouter.tsx) define las rutas con React Router DOM v6 y **lazy-loading** (`React.lazy`) de las vistas pesadas. Hay dos tipos de guarda:

- **`ProtectedRoute`**: si `authStore.user` es `null`, redirige a `/login`.
- **`PublicRoute`**: si hay sesión activa, redirige al `/dashboard` (impide ver el login estando logueado).

#### Internacionalización

El sistema usa `react-i18next` con tres bundles JSON (`en`, `de`, `es`) en [src/i18n/](frontend/src/i18n/). La preferencia se lee del `users.locale` al iniciar sesión y se aplica con `i18n.changeLanguage()`. El selector está en el menú de perfil.

#### Animaciones y micro-interacciones

Las transiciones de página, los modales y las tarjetas del dashboard usan **Framer Motion** con variantes declarativas. Las animaciones se disparan con `whileInView` cuando entran en el viewport, no en el mount, para no penalizar el LCP.

#### PWA

Configurada vía `vite-plugin-pwa` en [vite.config.ts](frontend/vite.config.ts). Genera un Service Worker con estrategias de cache distintas:

- **Network-First, timeout 3 s** para `/api/*`: si la red falla o tarda más de 3 s, sirve la respuesta cacheada anterior.
- **StaleWhileRevalidate** para Google Fonts.
- **CacheFirst** con expiración de 1 año para los assets hasheados.

El `manifest.json` declara nombre, iconos y `display: standalone`, permitiendo la instalación.

### 5.2.2. Consumo de datos y comunicación con el servidor

Toda la comunicación HTTP se canaliza por **Axios**, configurado en [src/api/axiosConfig.ts](frontend/src/api/axiosConfig.ts):

- **BASE_URL** se lee de `import.meta.env.VITE_API_URL` con fallback a `/api`. En desarrollo, el dev server de Vite redirige `/api` a `http://localhost:8080`; en producción, nginx hace el mismo proxy hacia `http://backend:8080`.
- **Interceptor de petición:** añade `Authorization: Bearer <token>` leyendo del store.
- **Interceptor de respuesta:** si recibe 401, intenta refrescar el token (con single-in-flight) y reintenta automáticamente la petición original.

Cada feature tiene su propio módulo en [src/api/](frontend/src/api/): `aquariumApi.ts`, `marketApi.ts`, `chatApi.ts`, etc. Las firmas usan los tipos generados desde OpenAPI en [src/api/generated/schema.ts](frontend/src/api/generated/schema.ts), garantizando que cualquier cambio de contrato se traduzca en un error de compilación TypeScript.

#### Manejo de errores en la UI

Los errores de TanStack Query se gestionan en dos planos:

- **Local**: cada componente decide cómo reaccionar (mostrar mensaje inline, deshabilitar botón).
- **Global**: un `ErrorBoundary` envuelve el árbol de la aplicación y captura errores no manejados, mostrando una pantalla de fallback en lugar de una página en blanco. Si Sentry está configurado, el error se envía automáticamente.

## 5.3. Implementación de funcionalidad específica con Python

### 5.3.1. Definición de la funcionalidad

El microservicio Python ([scraper/](scraper/)) cumple **dos responsabilidades**:

1. **Scraping de tiendas especializadas.** Endpoint `GET /scrape?keyword=...&store=all|urbannatura|cetamar`. Devuelve productos normalizados (nombre, precio, imagen, URL, tienda).
2. **Asistente conversacional IA.** Endpoint `POST /chat/message`. Recibe un mensaje del usuario y un `aquarium_context` (fauna, equipo, parámetros recientes), lo combina con un *system prompt* especializado en acuariofilia marina y consulta el modelo Llama 3.3 70B mediante el SDK oficial de **Groq**.

### Scrapers activos

Los scrapers en producción atacan dos tiendas españolas sobre **PrestaShop 1.7**: `urbannatura.com` y `cetamar.com`. La elección se justifica:

- PrestaShop expone HTML predecible y estable, con clases CSS consistentes (`product-miniature`, `product-price-and-shipping`).
- Tiendas pequeñas/medianas, sin medidas agresivas anti-bot (a diferencia de Salesforce Commerce Cloud, que rechazaba al scraper inicial sobre Kiwoko).

Cada scraper (`urbannatura.py`, `cetamar.py`, ~290 líneas cada uno) implementa **múltiples selectores CSS en cascada** como estrategia defensiva: si el primario falla, se prueba el secundario, y así sucesivamente. Esto absorbe pequeños cambios de maquetación de la tienda sin necesidad de redeploy inmediato.

El parsing de imágenes detecta y prioriza atributos de **lazy-loading** (`data-src`, `data-lazy-src`, `data-original`) sobre `src` directo, ya que muchas tiendas usan placeholders SVG genéricos hasta que el JavaScript hidrata las imágenes reales.

### Ejecución paralela y aislamiento de fallos

Para `store=all`, [scraper_service.py](scraper/app/services/scraper_service.py) usa `asyncio.gather` para invocar todos los scrapers concurrentemente. Cada uno está envuelto en `_safe_scrape()`, que captura las excepciones específicas (`httpx.TimeoutException`, `httpx.RequestError`, `httpx.HTTPStatusError`) y las traduce a códigos de error normalizados (`TIMEOUT_ERROR`, `PARSING_ERROR`, `STORE_UNAVAILABLE`).

La clave del diseño es que **un fallo de un scraper no rompe la respuesta completa**: si Urban Natura devuelve resultados pero Cetamar lanza timeout, el endpoint devuelve los resultados de Urban Natura con `error = null`. Solo se devuelve `error` cuando **todos** los scrapers han fallado.

### Asistente IA

[prompts.py](scraper/app/services/prompts.py) define un `SYSTEM_PROMPT` extenso que caracteriza al asistente como experto en acuariofilia marina (química del agua, compatibilidad biológica, equipamiento, enfermedades) y le instruye a responder en el idioma del usuario. La función `build_user_prompt(message, aquarium_context)` compone un mensaje estructurado:

```
[Aquarium context]
Name: Reef cube 90L
Volume: 90 L
Livestock: 2x Amphiprion ocellaris, 1x Acropora millepora
Equipment: Skimmer Reef Octopus 110W · LED Aqua Illumination Hydra 32 90W
Water parameters: pH 8.2, salinity 1.025, alkalinity 8.1 dKH, calcium 420 ppm

[User question]
Mi calcio bajó a 380, ¿cómo lo subo?
```

El modelo recibe entonces tanto el contexto del acuario como la pregunta concreta, generando respuestas específicas y no genéricas.

### 5.3.2. Integración del script Python con el resto de la aplicación

El microservicio Python **nunca es accesible directamente desde el navegador**. El flujo siempre pasa por el backend Java:

```
[ React (axios) ]
       │  GET /api/scraper/search?keyword=skimmer
       ▼
[ Backend Java — ScraperController ]
       │  GET http://scraper:8001/scrape?keyword=skimmer&store=all
       ▼
[ Scraper Python — scraper_router.py ]
       │  asyncio.gather([urbannatura, cetamar])
       ▼
[ Tiendas externas (HTTPS) ]
       │  HTML responses
       ▼
[ Scraper Python — parser BeautifulSoup → ProductResult ]
       │  ScrapeResponse (JSON snake_case)
       ▼
[ Backend Java — mapeo snake_case → camelCase + seed fallback ]
       │  ScraperResponse (JSON camelCase)
       ▼
[ React — TanStack Query cachea el resultado ]
```

#### Razones de este diseño

- **Seguridad:** el scraper no implementa autenticación. Si fuera público, cualquiera podría usarlo. Al delegarla en el backend Java, reutilizamos un único sistema JWT.
- **Resiliencia:** el seed fallback vive en el backend, no en el scraper, porque conceptualmente es lógica de negocio del marketplace (qué se muestra cuando no hay datos vivos), no parte del scraping en sí.
- **Aislamiento de la base de datos:** el scraper Python **no tiene credenciales de PostgreSQL**. El backend Java consulta los datos del acuario, los serializa y los inyecta como `aquarium_context` en la petición al scraper. Esto simplifica las credenciales gestionadas y reduce la superficie de ataque.

#### Variables de entorno relevantes

- `PYTHON_SERVICE_URL` (backend) → apunta a `http://scraper:8001` dentro de Docker.
- `GROQ_API_KEY` (scraper) → llave del modelo Llama, validada en el health check de Docker.
- `GROQ_MODEL` (scraper) → por defecto `llama-3.3-70b-versatile`.

---

# 6. Pruebas y Despliegue

## 6.1. Plan de pruebas

### Tests automatizados

| Capa | Framework | Alcance |
|------|-----------|---------|
| Backend Java — unitarios | JUnit 5 + Mockito | Servicios críticos (AuthService, ScraperService) con mocks |
| Backend Java — integración | JUnit 5 + Testcontainers | Levanta un PostgreSQL real en Docker y prueba el flujo completo de endpoints (`@SpringBootTest`) |
| Frontend — unitarios | Vitest + Testing Library | Componentes UI básicos, hooks de TanStack Query con MSW como mock HTTP |
| Frontend — tipos | `tsc --noEmit` | Verificación de tipos en CI |
| Frontend — lint | ESLint | Reglas de estilo y calidad |

La pipeline de **GitHub Actions** ejecuta los tres jobs (frontend, backend, docker-compose build) en paralelo en cada push y PR. Un PR no se puede mergear a `main` si alguno falla. La cobertura mínima del backend se fija en **60 % de líneas** mediante JaCoCo.

### Pruebas manuales documentadas

Las pruebas manuales más relevantes se ejecutaron al final del Sprint 4:

- **Scraping en vivo:** ejecución de `GET /api/scraper/search?keyword=skimmer` con stack completo, validación de que aparecen resultados de las dos tiendas con datos coherentes.
- **Fallback por timeout total:** apagado del contenedor `scraper` con `docker stop`, repetición de la búsqueda, verificación de que el marketplace muestra los datos de seed con badge `fromCache: true`.
- **Fallback por tienda caída:** simulación de error en uno solo de los scrapers (apagado de red simulado) y verificación de que la respuesta completa el hueco con seed sin marcar error global.
- **Rate limit del chat:** ejecución de 5 mensajes consecutivos con usuario FREE, verificación de que el 6º devuelve `429 Too Many Requests` sin llegar al microservicio Python.
- **Health check de Groq:** arranque con `GROQ_API_KEY=tu_api_key_aqui` (placeholder), verificación de que el backend Java no marca el scraper como `healthy` y queda en espera.
- **Flujos de autenticación:** registro, login, refresh manual desde Postman, logout, password reset por email.
- **Restricción Freemium:** intento de crear un segundo acuario con plan FREE, verificación de `403` y de que el frontend muestra el modal de upgrade.

### Pruebas de usabilidad

Se realizó una pequeña ronda de **test de usabilidad informal** con dos usuarios externos (un acuarista marino real y una persona ajena al sector). Los hallazgos críticos se corrigieron antes del freeze (commit `ab4b20b — Fix critical usability issues from user test`, 9 de mayo de 2026):

- Iconografía duplicada en el botón "Ir al marketplace" → eliminada (commit `b0ae1a0`).
- Confusión en el flujo de creación de acuario al no aclarar la unidad de volumen → añadidos placeholders explícitos.
- Falta de feedback visual al añadir una especie incompatible *reef-safe* → mejorado el toast de warning.

## 6.2. Despliegue

### Stack de despliegue

El despliegue se realiza enteramente sobre **Docker Compose** con seis servicios:

| Servicio | Imagen / contexto | Puertos | Función |
|----------|-------------------|---------|---------|
| `traefik` | `traefik:v3.3` | 80, 443 | Reverse proxy + TLS automático |
| `frontend` | build desde `./frontend` (multi-stage Node → nginx) | 80 (interno) | Sirve la SPA |
| `backend` | build desde `./backend` (multi-stage Maven → JRE) | 8080 (interno) | API REST |
| `scraper` | build desde `./scraper` (Python 3.12 slim) | 8001 (interno) | Scrapers + chat IA |
| `db` | `postgres:16-alpine` | 5432 (interno) | SGBD |
| `backup` | `postgres:16-alpine` con `backup.sh` | — | Cron de `pg_dump` |

### Reverse proxy y TLS

[Traefik](https://traefik.io) actúa como punto único de entrada. Su configuración estática se declara en el `docker-compose.yml` mediante CLI flags:

- **Docker provider** activado con `--providers.docker=true` y filtro `--providers.docker.exposedByDefault=false`, es decir, solo se enrutan los servicios que llevan label `traefik.enable=true`.
- **Resolver Let's Encrypt** con challenge HTTP-01, email tomado de `ACME_EMAIL` y almacenamiento de certificados en el volumen persistente `acme_data`.
- **Redirect global** de HTTP a HTTPS con código 301.

Las labels Traefik del backend declaran:

```
- "traefik.http.routers.backend.rule=Host(`${DOMAIN}`) && PathPrefix(`/api`)"
- "traefik.http.routers.backend.entrypoints=websecure"
- "traefik.http.routers.backend.tls.certresolver=letsencrypt"
- "traefik.http.services.backend.loadbalancer.server.port=8080"
```

Y las del frontend, equivalentes pero sin PathPrefix. Ambos servicios añaden la cabecera **HSTS** vía middleware.

### Backups automáticos

El servicio `backup` ejecuta `pg_dump` según una planificación cron:

- **Diaria** a las 02:00 UTC, retención 7 días.
- **Semanal** los domingos a las 03:00 UTC, retención 4 semanas.
- **Mensual** el día 1 a las 04:00 UTC, retención 12 meses.

Los volcados comprimidos se almacenan en el volumen persistente `backup_data`. La restauración se documenta en el README:

```bash
gunzip < backups/daily/thalassa_YYYY-MM-DD.sql.gz | \
  docker exec -i thalassa-db psql -U $POSTGRES_USER thalassa
```

### Variables de entorno de producción

Todas las credenciales sensibles se inyectan vía `.env` (no versionado). El fichero `.env.example` enumera las claves obligatorias:

- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `GROQ_API_KEY`
- `CORS_ALLOWED_ORIGINS`
- `SPRING_PROFILES_ACTIVE` (`prod` en despliegue real)
- `DOMAIN`, `ACME_EMAIL` (para Let's Encrypt)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `SENTRY_DSN`, `VITE_SENTRY_DSN` (opcionales)

### Procedimiento de despliegue

En un servidor con Docker y un DNS apuntando al host:

```bash
git clone <repo>
cd thalassa
cp .env.example .env
# Editar .env con valores reales
docker compose pull
docker compose up -d --build
```

En el primer arranque, Traefik solicita y descarga los certificados Let's Encrypt automáticamente. Las migraciones Flyway se aplican al iniciar el backend. Los health checks de Docker garantizan el orden correcto de arranque: el backend espera a que `db` esté `healthy` y a que `scraper` valide su `GROQ_API_KEY`.

### Observabilidad

Una vez en marcha:

- `GET /api/actuator/health` reporta el estado del backend.
- `GET /api/actuator/prometheus` expone métricas en formato Prometheus.
- Los logs estructurados se obtienen con `docker logs thalassa-backend`.
- Sentry (si está configurado) recibe excepciones del frontend y del backend.

---

# 7. Conclusiones

## 7.1. Grado de cumplimiento de los objetivos

Los objetivos planteados en la propuesta inicial se han cumplido en su práctica totalidad:

| Objetivo | Estado | Comentario |
|----------|--------|------------|
| API REST con Spring Boot y Java 21 | Cumplido | Más de 40 endpoints, contrato OpenAPI vivo. |
| Autenticación JWT con rotación | Cumplido | Detección de reutilización implementada. |
| Modelo de datos relacional | Cumplido | PostgreSQL 16 + 6 migraciones Flyway. |
| SPA React con TypeScript | Cumplido | 121 ficheros TS/TSX, organización por features. |
| Microservicio Python | Cumplido | FastAPI con scrapers asíncronos + chat IA. |
| Resiliencia del marketplace | Cumplido y reforzado | Sistema de tres niveles de fallback, más sofisticado que el plan inicial. |
| Docker Compose para todo el stack | Cumplido | Seis servicios con health checks y dependencias declaradas. |
| HTTPS automático | Cumplido | Traefik + Let's Encrypt en producción. |
| PWA instalable | Cumplido | Manifest y Service Worker con estrategias diferenciadas. |
| i18n EN/DE/ES | Cumplido | Selector de idioma en perfil. |

**Desviaciones respecto a la propuesta:**

- **BD: MySQL → PostgreSQL.** La propuesta original mencionaba MySQL. Durante el Sprint 1 se cambió a PostgreSQL 16 por su mejor soporte de tipos, constraints CHECK avanzadas y el ecosistema más maduro de Testcontainers. La migración costó muy poco al haberse hecho temprano.
- **Cliente HTTP: WebClient → RestClient.** La propuesta hablaba de `WebClient` (reactivo). Al ser el resto del backend bloqueante y no haber necesidad de programación reactiva, se eligió el `RestClient` síncrono moderno de Spring 6. Más simple, mismo resultado.
- **Scrapers: Kiwoko/Tiendanimal → Urban Natura/Cetamar.** Las dos primeras tiendas mencionadas en la propuesta resultaron ser hostiles al scraping (Kiwoko corre Salesforce Commerce Cloud con fingerprinting agresivo). Se sustituyeron por dos tiendas españolas equivalentes sobre PrestaShop, con HTML predecible. Los ficheros `kiwoko.py` y `tiendanimal.py` siguen en el repositorio (ya no se invocan) y deberían eliminarse antes de la entrega final.

## 7.2. Problemas encontrados y soluciones aplicadas

### Problema 1 — Fragilidad inherente del scraping de terceros

**Síntoma:** durante el Sprint 3, una actualización menor del HTML de la primera tienda dejó al scraper sin extraer precios durante 24 h.

**Solución:** se introdujeron **dos capas defensivas**: (a) múltiples selectores CSS en cascada dentro de cada scraper, de modo que si el primario falla se prueban alternativas; (b) el **seed fallback** en el backend, que garantiza que la UI nunca aparezca vacía aunque todos los scrapers caigan. Esto convirtió el riesgo operativo más serio del proyecto en una degradación visible pero controlada.

### Problema 2 — Mapeo entre `snake_case` (Python) y `camelCase` (Java)

**Síntoma:** la primera integración devolvía `null` en todos los campos de productos porque Spring Boot no mapeaba `image_url` a `imageUrl`.

**Solución:** se implementó **mapeo manual explícito** en `ScraperService.java` en lugar de depender de anotaciones Jackson globales que podrían afectar a otros endpoints. La conversión queda contenida y documentada en un único lugar.

### Problema 3 — Health check del scraper como dependencia bloqueante

**Síntoma:** un nuevo desarrollador clonó el repo, lanzó `docker compose up` sin configurar `GROQ_API_KEY` y vio que **el backend no arrancaba en absoluto**, no solo el chat. Frustración garantizada.

**Solución:** el comportamiento es correcto en producción (evita arrancar el sistema con el chat silenciosamente roto), pero en desarrollo es desproporcionado. Se mitiga con el **`docker-compose.override.yml`** y con una sección clara en el README sobre la importancia de la `GROQ_API_KEY`. La trampa de onboarding queda mitigada, no eliminada.

### Problema 4 — Race condition en refresh de JWT

**Síntoma:** al cargar una página con muchas peticiones paralelas (dashboard con 6 widgets), cuando el access token estaba a punto de expirar, varias peticiones disparaban refresh simultáneamente. Algunas obtenían un refresh ya revocado y forzaban un logout incorrecto.

**Solución:** se aplicó el patrón **single-in-flight** en el interceptor de Axios. Solo una llamada de refresh queda viva en un instante dado; las peticiones que pierden la carrera esperan su resolución y reintentan con el nuevo token.

### Problema 5 — URLs de imágenes inservibles en PrestaShop

**Síntoma:** muchas tarjetas del marketplace mostraban iconos rotos porque las tiendas servían SVGs placeholder (`pixel.gif`, `blank.png`) durante la fase de lazy-load.

**Solución:** el parser examina los atributos en orden de prioridad (`data-src`, `data-lazy-src`, `data-original`, `src`) y descarta URLs identificadas como placeholder. Si no encuentra una URL válida, devuelve `null` y el frontend muestra un placeholder propio (`/market-placeholder.svg`) en lugar de un icono roto.

## 7.3. Posibles mejoras y líneas futuras

### A corto plazo (post-entrega)

- **Eliminar los scrapers inactivos** `kiwoko.py` y `tiendanimal.py` o documentarlos explícitamente como código de referencia.
- **Tests unitarios pytest** para el microservicio Python, ausentes en el TFG (solo hay tests en backend Java y frontend).
- **Caché HTTP en el frontend** con `stale-while-revalidate` para reducir aún más las peticiones repetidas al backend en sesiones largas.
- **Mejora del seed:** los JSONs actuales contienen ~15 productos por tienda. Una rutina batch que actualice el seed periódicamente desde scraps reales mantendría los precios de fallback razonablemente recientes.
- **Sistema de notificaciones in-app completo.** La campana de notificaciones ya
  existe en la UI y muestra alertas funcionales generadas en cliente a partir de
  los parámetros del agua cacheados (temperatura, pH, KH, nitratos y fosfatos
  fuera de rango). Sin embargo, el endpoint `GET /api/notifications` del backend
  devuelve actualmente datos estáticos de prueba (`stub`). La mejora pendiente
  consiste en persistir notificaciones reales en base de datos (tabla
  `notifications`) y generarlas automáticamente ante eventos del sistema: cambio
  de plan, adición de especie incompatible, parámetros fuera de rango al
  registrar una medición, etc.


### A medio plazo

- **Notificaciones push** vía Web Push API: avisos cuando los parámetros del agua quedan fuera de rango (requiere registro de medias y desviaciones).
- **Importación masiva** de fauna y equipo desde CSV, para usuarios que vienen con inventario existente.
- **Compartir acuario en modo lectura**: URL pública con snapshot del estado del acuario, útil para pedir consejo en foros.
- **Más tiendas en el marketplace** (Aquatic Center, Hydroponiclife, Mar de Coral) con scrapers desactivables individualmente.

### A largo plazo

- **App nativa móvil** (React Native compartiendo lógica de negocio con el frontend web).
- **Modo offline real** para registrar mediciones sin conexión y sincronizar al recuperar señal (Service Worker + IndexedDB + cola de peticiones).
- **Panel B2B** para tiendas: catálogo en vivo desde su propio backend, métricas de visitas, integración como afiliados de pleno derecho.
- **Análisis avanzado de tendencias** con detección automática de patrones (por ejemplo, "tu calcio cae 5 ppm al día, considera aumentar la dosificación").

---

# 8. Bibliografía y Webgrafía

## Documentación oficial

- **Spring Framework Team** (2024). *Spring Boot 3.2 Reference Documentation*. <https://docs.spring.io/spring-boot/docs/3.2.x/reference/html/>
- **Spring Framework Team** (2024). *Spring Security 6 Reference*. <https://docs.spring.io/spring-security/reference/>
- **Oracle / OpenJDK** (2024). *Java Platform, Standard Edition 21 Documentation*. <https://docs.oracle.com/en/java/javase/21/>
- **PostgreSQL Global Development Group** (2024). *PostgreSQL 16 Documentation*. <https://www.postgresql.org/docs/16/>
- **Meta Open Source / React Team** (2024). *React 18 Documentation*. <https://react.dev/>
- **Microsoft** (2024). *TypeScript Handbook*. <https://www.typescriptlang.org/docs/>
- **Tailwind Labs** (2024). *Tailwind CSS Documentation*. <https://tailwindcss.com/docs>
- **TanStack** (2024). *TanStack Query v5 Documentation*. <https://tanstack.com/query/latest>
- **Sebastián Ramírez** (2024). *FastAPI Documentation*. <https://fastapi.tiangolo.com/>
- **encode/httpx** (2024). *HTTPX Documentation*. <https://www.python-httpx.org/>
- **Leonard Richardson** (2024). *Beautiful Soup 4 Documentation*. <https://www.crummy.com/software/BeautifulSoup/bs4/doc/>
- **Pydantic Team** (2024). *Pydantic V2 Documentation*. <https://docs.pydantic.dev/latest/>
- **Docker Inc.** (2024). *Docker Compose Specification*. <https://docs.docker.com/compose/>
- **Traefik Labs** (2024). *Traefik v3 Documentation*. <https://doc.traefik.io/traefik/>
- **Internet Security Research Group** (2024). *Let's Encrypt — Challenge Types*. <https://letsencrypt.org/docs/challenge-types/>
- **OpenAPI Initiative** (2024). *OpenAPI Specification 3.1.0*. <https://spec.openapis.org/oas/v3.1.0>

## Especificaciones y estándares

- **IETF** (2015). *RFC 7519 — JSON Web Token (JWT)*. <https://datatracker.ietf.org/doc/html/rfc7519>
- **W3C** (2024). *Web App Manifest*. <https://www.w3.org/TR/appmanifest/>
- **W3C** (2024). *Service Workers Level 1*. <https://www.w3.org/TR/service-workers/>
- **WHATWG** (2024). *Fetch Standard*. <https://fetch.spec.whatwg.org/>
- **OWASP Foundation** (2023). *OWASP Top 10 — Web Application Security Risks*. <https://owasp.org/www-project-top-ten/>

## Herramientas y servicios externos

- **Groq** (2024). *Groq API Reference — Llama 3.3 70B*. <https://console.groq.com/docs>
- **Cloudinary** (2024). *Cloudinary API Reference*. <https://cloudinary.com/documentation>
- **Sentry** (2024). *Sentry SDK Documentation*. <https://docs.sentry.io/>

## Material académico

- ILERNA Online. *Apuntes de los módulos Desarrollo Web en Entorno Servidor, Desarrollo Web en Entorno Cliente, Despliegue de Aplicaciones Web, Diseño de Interfaces Web e Interfaces de Persona Ordinador II*. Curso 2024–2025, 2025–2026.

---

# 9. Anexos

### Anexo A — Estructura completa del repositorio

```
thalassa/
├── backend/
│   ├── src/main/java/com/thalassa/backend/
│   │   ├── config/                        Beans de configuración
│   │   ├── controllers/                   Controladores REST
│   │   ├── dto/                           DTOs generados por OpenAPI
│   │   ├── exceptions/                    Excepciones personalizadas
│   │   ├── models/                        Entidades JPA + enums
│   │   ├── repositories/                  Repositorios Spring Data
│   │   ├── security/                      JWT filter, UserDetailsService
│   │   └── services/                      Lógica de negocio (incluye ScraperService)
│   ├── src/main/resources/
│   │   ├── db/migration/                  V1..V6 Flyway
│   │   ├── market-seed/                   urbannatura.json, cetamar.json, ...
│   │   ├── application.yml                Configuración base
│   │   ├── application-dev.yml            Overrides de desarrollo
│   │   └── openapi.yaml                   Contrato API (fuente de verdad)
│   └── pom.xml
│
├── frontend/
│   └── src/
│       ├── api/                           Clientes Axios por dominio + tipos generados
│       ├── components/                    layout, shared, charts, ui
│       ├── features/                      auth, dashboard, aquarium-detail, market, ...
│       ├── hooks/                         queries/, mutations/, useAuth, ...
│       ├── i18n/                          en.json, de.json, es.json
│       ├── routes/                        AppRouter, ProtectedRoute, PublicRoute
│       ├── store/                         Zustand stores
│       └── types/                         Tipos compartidos
│
├── scraper/
│   └── app/
│       ├── main.py                        Aplicación FastAPI
│       ├── config.py                      Settings
│       ├── models/                        Pydantic models (requests, responses)
│       ├── routers/                       scraper_router.py, chat_router.py
│       └── services/                      urbannatura.py, cetamar.py, scraper_service.py, groq_client.py, prompts.py
│
├── docs/
│   ├── architecture-decisions/            ADRs
│   ├── *.md                               Especificaciones, wireframes, backlog
│   └── openapi.yaml                       Copia del contrato API
│
├── scripts/
│   └── backup.sh                          Script de pg_dump usado por el servicio backup
│
├── docker-compose.yml                     Configuración de producción
├── docker-compose.override.yml            Overrides de desarrollo
├── traefik-dev.yml                        Config Traefik para desarrollo
├── .env.example                           Plantilla de variables
├── .github/workflows/ci.yml               Pipeline CI
├── README.md
├── CHANGELOG.md
└── MEMORIA_FINAL.md                       (este documento)
```

### Anexo B — Tabla de endpoints REST

Resumen no exhaustivo. La especificación completa está en [openapi.yaml](backend/src/main/resources/openapi.yaml).

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Crear cuenta |
| POST | `/api/auth/login` | No | Login → access + refresh |
| POST | `/api/auth/refresh` | No | Rotar refresh, obtener nuevo access |
| POST | `/api/auth/logout` | Sí | Revocar refresh |
| POST | `/api/auth/forgot-password` | No | Solicitar email de reset (siempre 204) |
| POST | `/api/auth/reset-password` | No | Confirmar reset con token |
| GET | `/api/users/me` | Sí | Perfil actual |
| PUT | `/api/users/me` | Sí | Actualizar preferencias |
| GET | `/api/aquariums` | Sí | Listar acuarios del usuario |
| POST | `/api/aquariums` | Sí | Crear acuario (Freemium: max 1) |
| GET | `/api/aquariums/{id}` | Sí | Detalle |
| PUT | `/api/aquariums/{id}` | Sí | Modificar |
| DELETE | `/api/aquariums/{id}` | Sí | Eliminar (cascada) |
| GET / POST | `/api/aquariums/{id}/livestock` | Sí | Listar / añadir (devuelve `warning?` si no reef-safe) |
| PUT / DELETE | `/api/livestock/{id}` | Sí | Modificar / eliminar |
| GET / POST | `/api/aquariums/{id}/equipment` | Sí | Listar / añadir |
| PUT / DELETE | `/api/equipment/{id}` | Sí | Modificar / eliminar |
| GET / POST | `/api/aquariums/{id}/water-parameters` | Sí | Listar / registrar medición |
| GET | `/api/aquariums/{id}/energy` | Sí | Cálculo energético (REEFMASTER) |
| GET | `/api/species?search=` | Sí | Catálogo |
| GET | `/api/scraper/search` | Sí | Marketplace (con seed fallback) |
| POST | `/api/chat` | Sí | Mensaje al asistente IA (rate-limited) |
| GET | `/api/chat/usage` | Sí | Cuota usada / restante |
| GET / POST / PUT / DELETE | `/api/wishlist[/{id}]` | Sí | CRUD wishlist |
| POST | `/api/upload` | Sí | Subir imagen a Cloudinary |
| GET | `/api/dashboard/summary` | Sí | Agregados para dashboard |
| GET | `/api/notifications` | Sí | Notificaciones in-app |
| GET | `/actuator/health` | No | Health check |
| GET | `/actuator/prometheus` | No | Métricas |

### Anexo C — Variables de entorno

| Variable | Servicio | Obligatoria | Descripción |
|----------|----------|-------------|-------------|
| `JWT_SECRET` | backend | Sí | Secreto HS512 para access tokens |
| `JWT_REFRESH_SECRET` | backend | Sí | Secreto para refresh tokens |
| `POSTGRES_USER` | db, backend | Sí | Usuario PostgreSQL |
| `POSTGRES_PASSWORD` | db, backend | Sí | Contraseña PostgreSQL |
| `SPRING_DATASOURCE_URL` | backend | No | Default: `jdbc:postgresql://db:5432/thalassa` |
| `CORS_ALLOWED_ORIGINS` | backend | Sí | Orígenes permitidos separados por coma |
| `SPRING_PROFILES_ACTIVE` | backend | Sí | `dev` o `prod` |
| `PYTHON_SERVICE_URL` | backend | No | Default: `http://scraper:8001` |
| `GROQ_API_KEY` | scraper | Sí | API key de Groq |
| `GROQ_MODEL` | scraper | No | Default: `llama-3.3-70b-versatile` |
| `CLOUDINARY_CLOUD_NAME` | backend | Sí | Para subida de imágenes |
| `CLOUDINARY_API_KEY` | backend | Sí | — |
| `CLOUDINARY_API_SECRET` | backend | Sí | — |
| `DOMAIN` | traefik | No | Dominio público (default `localhost`) |
| `ACME_EMAIL` | traefik | No | Email para Let's Encrypt |
| `VITE_API_URL` | frontend (build) | No | Default: `/api` |
| `VITE_SENTRY_DSN` | frontend (build) | No | Sentry cliente |
| `SENTRY_DSN` | backend | No | Sentry servidor |

### Anexo D — Comandos esenciales

**Levantar todo el stack (producción):**
```bash
docker compose up -d --build
```

**Modo desarrollo (con override y hot-reload manual de cada servicio):**
```bash
docker compose up db          # solo BD
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
cd frontend && npm install && npm run dev
cd scraper && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8001
```

**Tests:**
```bash
# Backend
cd backend && ./mvnw verify

# Frontend
cd frontend && npm run lint && npm run typecheck && npm run test
```

**Backup manual:**
```bash
docker exec thalassa-db pg_dump -U $POSTGRES_USER thalassa | gzip > backup.sql.gz
```

---

*Memoria redactada en mayo de 2026. El código fuente está disponible en el repositorio del proyecto. Defensa prevista el 18 de mayo de 2026.*
