# 🔍 NEXT STEPS — Auditoría Técnica & Hoja de Ruta

> **Documento:** Auditoría objetiva del proyecto Thalassa  
> **Fecha:** 2026-04-27  
> **Rama analizada:** `ui/master-plan-sync`  
> **Autor:** Tech Lead review  
> **Propósito:** Hoja de ruta definitiva hacia versión final de producción

---

## 0. Resumen Ejecutivo

El proyecto **funciona end-to-end** y la arquitectura es sólida (separación de servicios, API Contract First, JWT, Zustand, lazy loading). Sin embargo, está en estado **MVP / pre-producción**: existen vulnerabilidades de seguridad críticas, ausencia total de manejo de errores en frontend (no hay toasts, error boundaries ni confirmaciones), gestión de schema vía `ddl-auto: update` (peligroso), secretos hardcodeados en el repositorio y un Chat que no respeta el patrón de drawer del Master Plan.

**Veredicto técnico:** *Apto para demo / TFG-DAW. No apto para despliegue real sin abordar al menos los puntos `CRÍTICOS` de la sección 1.*

---

## 1. Auditoría de Imperfecciones y Deuda Técnica

### 1.1 Seguridad — `🔴 CRÍTICO`

| # | Problema | Ubicación | Riesgo |
|---|----------|-----------|--------|
| S-1 | **JWT secret hardcodeado y commiteado al repo** | [application.yml:26](backend/src/main/resources/application.yml#L26) | Cualquier persona con acceso al repo puede firmar tokens válidos. Debe leerse de `${JWT_SECRET}` env var. |
| S-2 | **Password de PostgreSQL `changeme` en repo** | [application.yml:8](backend/src/main/resources/application.yml#L8) y [docker-compose.yml:77](docker-compose.yml#L77) | Credencial de BD expuesta. Mover a `.env` no commiteado. |
| S-3 | **JWT en `localStorage` (Zustand persist)** | [authStore.ts](frontend/src/store/authStore.ts) | Vulnerable a XSS. El estándar moderno es **httpOnly + Secure + SameSite cookies**, gestionadas por el backend. |
| S-4 | **CORS abierto a todos los orígenes con wildcard** | [SecurityConfig.java:61](backend/src/main/java/com/thalassa/backend/config/SecurityConfig.java#L61) | `setAllowedOriginPatterns(List.of("*"))` debe restringirse a dominios concretos en producción. |
| S-5 | **Sin rate-limit en `/api/auth/login`** | AuthController | Vulnerable a fuerza bruta. Implementar Bucket4j o Spring Cloud Gateway rate-limit. |
| S-6 | **Sin política de complejidad de contraseñas** | AuthService (registro) | Cualquier password de 1 carácter es válido. Validar mínimo 8 chars + alfanumérico. |
| S-7 | **Puerto 5432 de Postgres expuesto al host** | [docker-compose.yml:72-73](docker-compose.yml#L72-L73) | En producción no debe exponerse fuera de `thalassa-net`. |
| S-8 | **`show-sql: true` y `format_sql: true`** | [application.yml:13,17](backend/src/main/resources/application.yml#L13-L17) | Logging de SQL en producción puede filtrar PII. Debe estar `false` salvo en perfil dev. |
| S-9 | **`GROQ_API_KEY` con default literal `"tu_api_key_aqui"`** | [docker-compose.yml:60](docker-compose.yml#L60) | El servicio levanta con clave inválida sin fallar; mejor que falle rápido si falta. |
| S-10 | **Sin protección CSRF en endpoints mutadores** | SecurityConfig | Es aceptable con JWT en header (no cookies), pero si se migra a cookies (S-3) vuelve a ser necesaria. |

### 1.2 Bugs Potenciales / Lógica — `🟠 ALTO`

| # | Problema | Ubicación |
|---|----------|-----------|
| B-1 | **Contador de chat se incrementa aunque Python falle.** El usuario pierde una de sus 5 consultas FREE por un fallo de infraestructura. | [ChatService.java:118-137](backend/src/main/java/com/thalassa/backend/services/ChatService.java#L118-L137) |
| B-2 | **`ddl-auto: update`** en producción puede causar pérdida de datos o inconsistencias. Migrar a Flyway o Liquibase. | application.yml |
| B-3 | **`window.location.href = '/login'` en 401** hace hard-reload, pierde el estado de React y no permite mostrar mensaje. | [axiosConfig.ts:24](frontend/src/api/axiosConfig.ts#L24) |
| B-4 | **Silent failures en `handleDelete`** — si la API falla al borrar livestock/equipment, el usuario no se entera; el item solo desaparece en éxito pero sin confirmación. | [AquariumDetailPage.tsx:529-537,637-645](frontend/src/features/aquarium-detail/AquariumDetailPage.tsx#L529-L537) |
| B-5 | **`Promise.all` sin catch en DashboardView** — si una de las dos llamadas falla, `loading=false` se ejecuta pero el componente queda en estado inconsistente sin feedback. | [DashboardView.tsx:149-156](frontend/src/features/dashboard/DashboardView.tsx#L149-L156) |
| B-6 | **N+1 query potencial** en `AquariumService.mapToDetail` — accede a `aquarium.getEquipment()` y `aquarium.getLivestock()` sin `JOIN FETCH`. Usar `@EntityGraph` o JPQL fetch join. | [AquariumService.java:105-126](backend/src/main/java/com/thalassa/backend/services/AquariumService.java#L105-L126) |
| B-7 | **PlanGate solo bloquea visualmente** (blur + overlay). El componente `children` se renderiza siempre — un usuario con DevTools puede inspeccionar y usar la calculadora. La validación real **debe estar siempre en backend** (parcialmente lo está). | [PlanGate.tsx:24-26](frontend/src/components/shared/PlanGate.tsx#L24-L26) |
| B-8 | **JWT expira en 24h y no hay `/auth/refresh`** — los usuarios serán deslogueados abruptamente sin previo aviso. | application.yml + AuthController |
| B-9 | **Tabla de history truncada con `slice(0, 20)` sin paginación** — usuarios con +20 mediciones pierden acceso al histórico antiguo en la UI. | [AquariumDetailPage.tsx:478](frontend/src/features/aquarium-detail/AquariumDetailPage.tsx#L478) |
| B-10 | **No hay abort/cleanup en `useEffect`** — al desmontar la página antes de que termine el fetch, hay setState sobre componente desmontado (warning en dev, leak potencial). | DashboardView, AquariumDetailPage |
| B-11 | **`buildAquariumContext` usa `LAZY` collections fuera del scope `@Transactional`** — puede lanzar `LazyInitializationException` si no hay sesión activa. | [ChatService.java:145-166](backend/src/main/java/com/thalassa/backend/services/ChatService.java#L145-L166) |
| B-12 | **`fetchData` en AquariumDetailPage redirige a `/dashboard` en cualquier error** — un 500 transitorio echa al usuario en vez de mostrar reintento. | [AquariumDetailPage.tsx:744-758](frontend/src/features/aquarium-detail/AquariumDetailPage.tsx#L744-L758) |

### 1.3 Rendimiento — `🟡 MEDIO`

| # | Problema |
|---|----------|
| P-1 | **Sin paginación en `GET /aquariums/{id}/parameters`** — un acuario con 5 años de mediciones devolverá miles de filas de golpe. |
| P-2 | **Sin filtro `?from=&to=`** en histórico de parámetros — el frontend trae todo y filtra en cliente (`filterByTimeRange`). |
| P-3 | **Sin caché HTTP (`ETag`, `Cache-Control`)** en endpoints `GET` que cambian poco (species catalog, dashboard summary). |
| P-4 | **Bundle inicial sin análisis** — falta `vite-plugin-bundle-analyzer` para auditar pesos de chunks. |
| P-5 | **Recharts cargado siempre** (no es lazy) aunque solo se usa en Parameters tab. |
| P-6 | **Sin Spring Actuator** ni métricas — imposible diagnosticar latencias de Python service en producción. |
| P-7 | **Sin connection pool tuning explícito** (HikariCP) — se usan defaults. |

### 1.4 Manejo de Errores — `🟠 ALTO`

| # | Problema |
|---|----------|
| E-1 | **No existe `<ErrorBoundary>`** en frontend. Cualquier render exception tira la SPA entera (pantalla en blanco). |
| E-2 | **No existe sistema de toasts/notificaciones** (sonner, react-hot-toast). Los errores solo se muestran inline en formularios; las acciones exitosas no dan feedback. |
| E-3 | **`catch` vacíos** en delete handlers — el error se traga silenciosamente. |
| E-4 | **No hay confirmación para acciones destructivas** (eliminar acuario, eliminar livestock, eliminar equipment). El Master Plan §9.6 explícitamente pide doble confirmación para borrar acuario. |
| E-5 | **No hay retry logic** en axios para fallos transitorios (5xx, network errors). |
| E-6 | **`GlobalExceptionHandler` (sin auditar a fondo)** — verificar que no expone stack traces en respuestas 500. |

### 1.5 Tipado y Calidad de Código — `🟡 MEDIO`

| # | Problema |
|---|----------|
| T-1 | **Tipos del frontend escritos a mano** (`types/aquarium.ts`, etc.) en vez de generarse desde el `openapi.yaml` del backend. **Riesgo de drift** entre contrato y consumo. |
| T-2 | **Tipos huecos**: faltan `types/inhabitant.ts`, `types/equipment.ts`, `types/wishlist.ts` (definidos en master plan). |
| T-3 | **`as Record<string, number>` cast inseguro** en LogMeasurementModal. | [AquariumDetailPage.tsx:94](frontend/src/features/aquarium-detail/AquariumDetailPage.tsx#L94) |
| T-4 | **`err: unknown` parseado a mano** sin librería de validación de errores HTTP. |
| T-5 | **Sin ESLint/Prettier config visible** comprometida al repo (verificar). |
| T-6 | **Sin CheckStyle/SpotBugs** para el backend Java. |
| T-7 | **Sin tests** ni unitarios ni de integración (ni Vitest, ni JUnit visibles). |
| T-8 | **`api/equipmentApi.ts`, `marketApi.ts`, `wishlistApi.ts`, `inhabitantApi.ts` no existen** — las llamadas están dispersas o ausentes. |
| T-9 | **Inline colors hex/rgba** en cada componente (`text-[#59D3FF]`, `bg-[rgba(89,211,255,0.10)]`) en vez de usar tokens centralizados en `tailwind.config.ts`. **Riesgo de drift visual** y dificulta tema oscuro/claro futuro. |

---

## 2. Propuestas de Mejora de Código & Arquitectura

### 2.1 Backend

1. **Migración de schema con Flyway** — Reemplazar `ddl-auto: update` por `validate`. Crear `db/migration/V1__init.sql`. Esto es **innegociable para producción**.
2. **Generar tipos del frontend desde `openapi.yaml`** con `openapi-typescript-codegen` o `orval` — un solo comando regenera `frontend/src/api/generated/`. Elimina drift contractual.
3. **Spring Boot Actuator + Micrometer** para `/actuator/health`, `/actuator/metrics`, `/actuator/prometheus`. Permite monitoring real.
4. **Configurar timeouts en `RestClient`** (connect: 2s, read: 10s) y reintentos con backoff usando `spring-retry`.
5. **Añadir `@EntityGraph` o `JOIN FETCH`** en `AquariumRepository.findByIdAndUserId` para evitar N+1.
6. **Refactor de `ChatService.checkAndIncrementRateLimit`** para que el incremento ocurra **después** de respuesta exitosa de Python, no antes.
7. **`POST /api/auth/refresh`** con refresh tokens rotativos almacenados en BD (tabla `refresh_tokens` con TTL de 30 días).
8. **`PUT /api/wishlist/{id}`** para editar notas y prioridad (definido en master plan §10.5, ausente).
9. **Filtros `?from=&to=&page=&size=`** en `GET /aquariums/{id}/parameters` — paginación con `Page<WaterParameterResponse>`.
10. **Centralizar el cálculo energético en backend** — actualmente `AquariumDetailPage` lo recalcula en cliente y backend (`/energy`) en paralelo. Una sola fuente de verdad.
11. **Validación `@Valid` + `@NotBlank` + `@Email` + `@Size(min=8)`** en todos los DTO de request (auditar coverage).
12. **`@RestControllerAdvice` retorna `ErrorResponse` sin stack trace** y con `traceId` para correlación de logs.

### 2.2 Frontend

1. **Generar `api/generated/`** desde el OpenAPI (alineado con 2.1.2). Eliminar `types/api.ts`, `types/aquarium.ts` manuales.
2. **Centralizar tokens de diseño en `tailwind.config.ts`**:
   ```ts
   theme.extend.colors = { accent: '#59D3FF', 'accent-hover': '#3DC5F5', 'bg-elevated': '#0A0A0A', ... }
   ```
   Elimina los `text-[#59D3FF]` repartidos por 50+ componentes.
3. **`<ErrorBoundary>` global** en `App.tsx` con fallback genérico + botón "Reload".
4. **Sistema de toasts con `sonner`** — ~3KB, accesible, muy usado en stack moderno. Reemplaza los `setError` inline donde tenga sentido.
5. **Migración a `react-hook-form + zod`** para formularios — validación tipo-segura, errores por campo, mejor UX.
6. **`@tanstack/react-query`** para data fetching — invalidación automática, refetch on focus, cache, retry, optimistic updates. Sustituye el patrón actual de `useState + useEffect + Promise.all`.
7. **Hooks `useAquarium()` y `usePlan()`** que encapsulen lógica reutilizable (master plan §4).
8. **Refactorizar `AquariumDetailPage`** (862 líneas, 4 modales + 4 tabs) en archivos separados: `tabs/OverviewTab.tsx`, `tabs/ParametersTab.tsx`, `modals/LogMeasurementModal.tsx`, etc.
9. **AbortController en `useEffect`** para cancelar fetches al desmontar.
10. **Refresh token flow** en el axios interceptor (cuando exista el endpoint backend).
11. **Tests con Vitest + React Testing Library** — al menos: PlanGate, AppRouter guards, useAuth, formato de parámetros.

### 2.3 Arquitectura

1. **`.env.example`** en raíz del repo con las variables esperadas (sin valores reales).
2. **CI/CD básico con GitHub Actions** (`.github/workflows/ci.yml`):
   - Job `backend`: `mvn verify` + Spotless/Checkstyle.
   - Job `frontend`: `npm ci && npm run lint && npm run typecheck && npm run build`.
   - Job `docker`: `docker compose build` para validar Dockerfiles.
3. **Healthchecks en `docker-compose.yml`** para `db`, `backend`, `scraper` con `depends_on.condition: service_healthy`.
4. **Multi-stage Dockerfiles** (verificar) para minimizar imagen final.
5. **Logging estructurado** (JSON) con Logback + `traceId`/`spanId` para observabilidad.
6. **Separar `application-prod.yml`** del `application.yml` base, sin secretos.

---

## 3. Propuestas de Mejora de UI/UX

### 3.1 Feedback al usuario — `Crítico para producción`

- **Toasts de éxito/error** tras cada acción (crear acuario, logear medición, eliminar item). Actualmente todo es silencioso.
- **Confirmación destructiva** con modal específico: "Type the aquarium name to confirm" (master plan §9.6).
- **Loading skeletons** específicos por componente (cards, tablas, gráficas) en vez de un Spinner genérico de pantalla completa.
- **Empty states ilustrados** en Wishlist, Market, Chat (más allá del actual `EmptyState` con ícono).
- **Error states** con CTA "Reintentar" cuando un fetch falla (no redirección automática a `/dashboard`).
- **Optimistic UI** en deletes: el item desaparece inmediatamente, vuelve si falla.

### 3.2 Animaciones y micro-interacciones

- `framer-motion` está instalado pero **infrautilizado**. Master Plan §7.2 detalla animaciones específicas que faltan:
  - Hero fade-in + slide-up
  - Cards con stagger en Pricing/HowItWorks
  - About Us slide-in lateral
- **Page transitions** con `AnimatePresence` entre rutas del gestor.
- **Button press feedback** (`whileTap={{ scale: 0.97 }}`).
- **Drawer animations** del chat (cuando se refactorice — ver §4 Sprint 4).
- **Number counters animados** (Social Proof) — los contadores actuales son estáticos.
- **Sparkline tendencias** en cards de parámetros (master plan §9.2 lo pide explícitamente, falta).

### 3.3 Accesibilidad — `Mínimo viable WCAG AA`

- **`aria-label` en botones de solo ícono** (X, trash, plus) — actualmente sin label, lectores de pantalla los anuncian como "button".
- **Focus trap en `<Modal>`** — verificar que Tab no se escapa fuera del modal.
- **Cierre con `Escape`** en modales y drawer.
- **Foco visible** (`focus-visible:ring-2 ring-accent`) — actualmente eliminado el outline por defecto sin reemplazo claro.
- **Contraste**: el `#666` sobre `#000` es 5.5:1 (OK) pero `#444` sobre `#000` es 2.7:1 (**falla AA**) — varios `text-[#444]` violan accesibilidad.
- **Etiquetas explícitas en formularios** (los `<Input>` tienen `label` prop, verificar que se asocien con `htmlFor`).
- **`prefers-reduced-motion`** — desactivar animaciones para usuarios que lo configuren.
- **Idioma del documento**: `<html lang="en">` correcto.
- **Skip-to-content link** para teclado.

### 3.4 Diseño y consistencia

- **Tokens de color centralizados** (ver §2.2.2) — actualmente cada componente repite hex.
- **Iconografía consistente**: tamaños 14/16/18 dispersos sin sistema. Definir escala `xs/sm/md/lg`.
- **Espaciado**: el master plan define múltiplos de 4px; verificar que se respeta (`p-5` = 20px ✓).
- **Tipografía monoespaciada**: master plan pide JetBrains Mono para datos numéricos. Verificar que `font-mono` está mapeado a JetBrains Mono en el config (no a la fallback del sistema).
- **Estados de hover de cards**: actualmente solo cambia el border. Añadir glow sutil de acento.
- **Cursor states**: muchos botones tienen `cursor-pointer` redundante (Tailwind 4 ya lo aplica a `<button>`).

### 3.5 UX Flows faltantes

- **Forgot password** flow completo (ruta `/forgot-password` definida en master plan, ausente).
- **Onboarding/First Run** — tras registrar, banner sutil "Crea tu primer acuario" (master plan §12.1).
- **Settings de acuario (⚙)** — botón existe en el plan §9.6, no está en `AquariumDetailPage`.
- **Sparkline + alertas proactivas** tras log de parámetros fuera de rango.
- **Keyboard shortcuts**: `Cmd/Ctrl + K` para búsqueda global (futuro), `Esc` cierra modales.
- **PWA** (manifest + service worker) — aprovecha el modo offline para consultas y push para alertas.

### 3.6 Chat — Discrepancia con master plan

El plan §11.1 dice explícitamente: *"El chat drawer NO tiene ruta. Se controla con estado de Zustand (`uiStore.isChatOpen`)."*  
Actualmente existe `/dashboard/chat` con `ChatView.tsx`. **Refactor obligatorio**:
- Convertir `ChatView` en `<ChatDrawer>` montado en `GestorLayout`.
- En desktop: drawer lateral 380px (slide-in derecha).
- En móvil: modal fullscreen.
- Sidebar y BottomTabBar disparan `openChat()` en vez de `navigate('/dashboard/chat')`.
- Eliminar la ruta `/dashboard/chat` del `AppRouter`.

---

## 4. Plan de Acción para Finalización (Roadmap)

> Orden lógico de desarrollo. Cada sprint es ~1 semana. Los sprints `🔴 CRÍTICO` deben completarse antes de cualquier despliegue real.

### Sprint 5 — `🔴 CRÍTICO` Hardening de Seguridad e Infraestructura
- [ ] S-1, S-2: Mover `JWT_SECRET` y `DB_PASSWORD` a `.env`; añadir `.env.example`; añadir `.env` a `.gitignore`.
- [ ] S-7: Eliminar exposición del puerto 5432 en compose de producción (perfil `prod`).
- [ ] S-8: `show-sql: false` en perfil `docker`/`prod`.
- [ ] S-9: Falla rápida si `GROQ_API_KEY` no está definida.
- [ ] **B-2: Migrar a Flyway**, crear `V1__init.sql` desde el schema actual, cambiar a `ddl-auto: validate`.
- [ ] S-4: Restringir CORS a dominios concretos por perfil.

### Sprint 6 — `🔴 CRÍTICO` Endpoints Backend Faltantes
- [ ] `POST /api/auth/refresh` con refresh tokens rotativos.
- [ ] `PUT /api/wishlist/{id}` (editar notas/prioridad).
- [ ] `GET /api/aquariums/{id}/parameters?from=&to=&page=&size=` con paginación.
- [ ] `POST /api/auth/forgot-password` + `POST /api/auth/reset-password`.
- [ ] B-1: Refactor de rate-limit en chat (incrementar tras éxito, no antes).
- [ ] B-6: `@EntityGraph` para evitar N+1 en `AquariumDetail`.

### Sprint 7 — `🟠 ALTO` UX Layer Frontend
- [ ] Instalar y configurar `sonner` para toasts.
- [ ] `<ErrorBoundary>` global con fallback amigable.
- [ ] Modal de confirmación para acciones destructivas (componente `<ConfirmDialog>`).
- [ ] Skeletons por componente (DashboardCardSkeleton, ParameterChartSkeleton, etc.).
- [ ] Migrar interceptor 401 a redirect React Router (no `window.location`).
- [ ] Refresh token flow en interceptor.
- [ ] Implementar `/forgot-password` UI.

### Sprint 8 — `🟠 ALTO` Refactor del Chat (Drawer)
- [ ] Crear `<ChatDrawer>` que se monta en `GestorLayout`.
- [ ] Eliminar ruta `/dashboard/chat` y vista `ChatView`.
- [ ] Sidebar/BottomTabBar disparan `uiStore.openChat()`.
- [ ] Animación slide-in (Framer Motion, 300ms).
- [ ] Persistir historial de la sesión en `uiStore`.
- [ ] Mostrar contador `X/5 questions used today` arriba del input para FREE.

### Sprint 9 — `🟡 MEDIO` Refactor Tipos & Forms
- [ ] Generar `api/generated/` desde `openapi.yaml` con `openapi-typescript-codegen`.
- [ ] Migrar formularios a `react-hook-form + zod`.
- [ ] Crear `marketApi.ts`, `equipmentApi.ts`, `wishlistApi.ts`, `inhabitantApi.ts`.
- [ ] Hooks `useAquarium()`, `usePlan()`.
- [ ] Refactor `AquariumDetailPage` en archivos por tab/modal.

### Sprint 10 — `🟡 MEDIO` Polish UI/UX & Accesibilidad
- [ ] Tokens de diseño en `tailwind.config.ts` (eliminar inline hex).
- [ ] `aria-label` en todos los botones de solo ícono.
- [ ] Focus visible en todos los interactivos.
- [ ] Sparkline en tarjetas de parámetros (Overview).
- [ ] Settings de acuario (⚙) con flujo de doble confirmación de delete.
- [ ] Animaciones master plan §7.2 (hero, cards, about us).
- [ ] Page transitions con `AnimatePresence`.
- [ ] Verificar contraste WCAG AA (`#444` sobre `#000` falla).

### Sprint 11 — `🟡 MEDIO` Testing & Calidad
- [ ] Vitest + React Testing Library: PlanGate, AppRouter guards, useAuth, formatters.
- [ ] JUnit + MockMvc: AuthService, AquariumService (límite FREE), ChatService (rate-limit).
- [ ] Testcontainers (Postgres) para integración real.
- [ ] Coverage objetivo: 60% líneas backend, 50% frontend.
- [ ] ESLint + Prettier + Spotless config.
- [ ] CI con GitHub Actions (lint + test + build).

### Sprint 12 — `🟢 NICE-TO-HAVE` i18n
- [ ] Instalar `react-i18next` y `i18next-browser-languagedetector`.
- [ ] Estructura `src/i18n/locales/{en,de,es}/*.json` (master plan §14).
- [ ] Selector de idioma en Profile + persistencia (`PUT /users/me { locale }`).
- [ ] Traducción inicial: solo EN (DE/ES post-MVP).

### Sprint 13 — `🟢 NICE-TO-HAVE` Observabilidad
- [ ] Spring Actuator + Prometheus endpoint.
- [ ] Logging estructurado JSON con `traceId`.
- [ ] Healthchecks en `docker-compose.yml`.
- [ ] Sentry (frontend + backend) para errores en producción.

### Sprint 14 — `🟢 PRODUCCIÓN` Deploy
- [ ] Multi-stage Dockerfiles optimizados.
- [ ] Reverse proxy (Nginx o Traefik) con HTTPS (Let's Encrypt).
- [ ] Backups automáticos de PostgreSQL (cron + S3 o equivalente).
- [ ] Despliegue en VPS (Hetzner, DigitalOcean) o PaaS (Railway, Render).
- [ ] Dominio + DNS + SSL.
- [ ] Política de seguridad: rate-limit en login, captcha en register si llega tráfico real.

### Sprint 15 — `🟢 POST-MVP` Features Adicionales
Del Master Plan §16 — todas opcionales para finalizar:
- [ ] Notificaciones in-app (campana en topbar).
- [ ] Export CSV de parámetros (ReefMaster).
- [ ] PWA (vite-plugin-pwa, manifest, offline).
- [ ] Comparador de parámetros entre acuarios.
- [ ] Gamificación / achievements.

---

## 5. Métricas de Done

El proyecto puede considerarse **"Versión Final"** cuando:

- ✅ Sin secretos en el repositorio (`gitleaks` clean).
- ✅ Schema de BD gestionado por Flyway, sin `ddl-auto: update`.
- ✅ Refresh token funcionando, JWT en httpOnly cookie (o decisión documentada de mantener localStorage).
- ✅ Toasts + Error Boundary + confirmación destructiva en frontend.
- ✅ Chat refactorizado a drawer (alineado con master plan).
- ✅ Coverage de tests ≥ 50% en ambos lados.
- ✅ CI verde en cada PR.
- ✅ Lighthouse score ≥ 90 en Performance, Accessibility, Best Practices.
- ✅ Despliegue en URL pública con HTTPS.
- ✅ Documentación: README con instrucciones de setup, `docs/architecture.md`, `docs/api.md` (autogenerado de OpenAPI).

---

## 6. Riesgos Identificados

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Drift entre OpenAPI y tipos de frontend manuales | Bugs en runtime difíciles de detectar | Generar tipos desde el contrato (Sprint 9) |
| Pérdida de datos por `ddl-auto: update` | Catastrófico en producción | Flyway antes del primer despliegue (Sprint 5) |
| Demanda inesperada de Groq agota free tier | Chat AI deja de funcionar | Implementar fallback message + monitoring de cuota |
| Scraper roto por cambio de DOM en tienda externa | Market vacío | Parsers modulares + tests E2E semanales sobre cada parser |
| TFG presentado sin tests | Penalización académica | Sprint 11 antes de la entrega |

---

> **Nota final:** este documento es una hoja de ruta viva. Conforme se completen sprints, marcar checkboxes y mover items resueltos a un `CHANGELOG.md`. Re-auditar cada 2 sprints para detectar nueva deuda técnica introducida.
