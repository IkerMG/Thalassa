# MASTER ACTION PLAN — Thalassa

> **Documento:** Hoja de ruta táctica de ejecución hacia versión final
> **Rama base:** `ui/master-plan-sync`
> **Insumo:** [docs/NEXT_STEPS_AUDIT.md](docs/NEXT_STEPS_AUDIT.md)
> **Estado del proyecto:** MVP funcional end-to-end, requiere hardening de seguridad y madurez UX antes de producción.

---

## Convenciones de este documento

Cada fase contiene rigurosamente la siguiente estructura:

1. **Objetivo de la Fase** — el problema concreto a resolver y por qué.
2. **Archivos Implicados** — lista exacta a crear, modificar o eliminar.
3. **Instrucciones de Ejecución** — pasos numerados, sin código fuente completo, con directrices arquitectónicas claras.
4. **Criterios de Aceptación (QA)** — comandos curl, scripts npm o verificaciones manuales para validar la fase.
5. **Punto de Control y Git Commit** — comando exacto para cierre atómico de la fase.

**Reglas globales:**
- Una fase = un commit. No avanzar a la siguiente fase sin completar el commit y validar QA.
- Si una fase introduce dependencias nuevas, ejecutar `npm install` o `mvn dependency:resolve` antes de codificar.
- Toda decisión arquitectónica relevante se documenta en `docs/architecture-decisions/ADR-NNN-titulo.md`.
- Conventional Commits obligatorio: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`.

**Estado actual verificado** (referencia para el ejecutor):
- JWT secret hardcodeado en [application.yml:26](backend/src/main/resources/application.yml#L26).
- Password DB hardcodeada en [application.yml:8](backend/src/main/resources/application.yml#L8) y [docker-compose.yml:77](docker-compose.yml#L77).
- `uiStore.isChatOpen` ya existe en [uiStore.ts](frontend/src/store/uiStore.ts) pero NO se consume — la ruta `/dashboard/chat` está registrada en [AppRouter.tsx:45](frontend/src/routes/AppRouter.tsx#L45).
- OpenAPI generator ya configurado en [pom.xml:123-194](backend/pom.xml#L123-L194).
- Existe un `.env` raíz pero solo con `GROQ_API_KEY`. No hay `.env.example` raíz.
- No están instaladas: `sonner`, `react-hook-form`, `zod`, `@tanstack/react-query`, `flyway-core`, `spring-boot-starter-actuator`.

---

## Roadmap general

| Fase | Título | Criticidad |
|------|--------|------------|
| 0 | Preparación del Entorno y Convenciones | Setup |
| 1 | Hardening de Secretos y Configuración | 🔴 CRÍTICO |
| 2 | Migración de Schema con Flyway | 🔴 CRÍTICO |
| 3 | Refresh Tokens Rotativos | 🔴 CRÍTICO |
| 4 | Endpoints Backend Faltantes y Fixes Lógicos | 🟠 ALTO |
| 5 | Capa de UX Frontend (Toasts, ErrorBoundary, ConfirmDialog) | 🟠 ALTO |
| 6 | Refactor del Chat a Drawer Global | 🟠 ALTO |
| 7 | Generación de Tipos OpenAPI + Forms (RHF + Zod) | 🟡 MEDIO |
| 8 | Adopción de React Query | 🟡 MEDIO |
| 9 | Polish UI/UX, Animaciones, Accesibilidad | 🟡 MEDIO |
| 10 | Testing y CI/CD | 🟡 MEDIO |
| 11 | Observabilidad y Hardening de Producción | 🟢 PRODUCCIÓN |
| 12 | i18n + PWA + Funcionalidades Post-MVP | 🟢 NICE-TO-HAVE |
| 13 | Verificación Final y Definition of Done | Cierre |

---

# FASE 0 — Preparación del Entorno y Convenciones

### Objetivo de la Fase
Establecer una base reproducible (`.env.example`, `.gitignore` saneado, branch dedicada por fase, convención Conventional Commits) **antes** de tocar código. Sin esta fase, los secretos podrían filtrarse o el equipo trabajaría con setups inconsistentes.

### Archivos Implicados
- **Crear**: `.env.example`, `CONTRIBUTING.md`
- **Modificar**: `.gitignore`

### Instrucciones de Ejecución
1. Crear `.env.example` en la raíz del proyecto con las siguientes variables (sin valores reales, solo claves):
   ```
   JWT_SECRET=
   JWT_REFRESH_SECRET=
   POSTGRES_USER=
   POSTGRES_PASSWORD=
   GROQ_API_KEY=
   CORS_ALLOWED_ORIGINS=
   SPRING_PROFILES_ACTIVE=
   ```
2. Verificar que `.env` está incluido en `.gitignore`. Añadir también `*.local`, `*.env.local` si faltan.
3. Crear `CONTRIBUTING.md` breve documentando: convención Conventional Commits, naming de branches (`feat/`, `fix/`, `chore/`), workflow de PR, comando para arrancar dev local.
4. Crear branch dedicada para la primera fase ejecutable: `git checkout -b feat/security-hardening`.

### Criterios de Aceptación (QA)
- `git status` no muestra `.env` como tracked.
- `cat .env.example` lista las claves esperadas sin valores.
- `git branch` muestra la branch nueva activa.

### Punto de Control y Git Commit
```bash
git add .env.example .gitignore CONTRIBUTING.md && git commit -m "chore: establecer baseline .env.example y convenciones de contribución"
```

---

# FASE 1 — 🔴 CRÍTICO Hardening de Secretos y Configuración

### Objetivo de la Fase
Eliminar todo secreto hardcodeado del repositorio. Resuelve los hallazgos de seguridad **S-1, S-2, S-4, S-7, S-8, S-9** del audit. Sin esta fase, el repositorio es público-equivalente porque cualquiera con acceso puede firmar JWTs válidos o conectar a la BD.

### Archivos Implicados
- **Modificar**:
  - [application.yml](backend/src/main/resources/application.yml)
  - [docker-compose.yml](docker-compose.yml)
  - [SecurityConfig.java](backend/src/main/java/com/thalassa/backend/config/SecurityConfig.java)
  - `README.md` (sección de setup)
- **Crear**:
  - `backend/src/main/resources/application-dev.yml`
  - `backend/src/main/resources/application-prod.yml`

### Instrucciones de Ejecución
1. **Refactor `application.yml`**: convertirlo en archivo base (solo configuración común). Reemplazar todos los literales sensibles por placeholders Spring sin defaults: `${JWT_SECRET}`, `${JWT_REFRESH_SECRET}`, `${SPRING_DATASOURCE_PASSWORD}`. Esto fuerza fail-fast si la variable no está definida.
2. **Crear `application-dev.yml`**: hereda del base. Activa `show-sql: true`, `format_sql: true`. Define `app.cors.allowed-origins: http://localhost:5173, http://localhost:3000`.
3. **Crear `application-prod.yml`**: `show-sql: false`, `format_sql: false`. `app.cors.allowed-origins: ${CORS_ALLOWED_ORIGINS}` (lista CSV desde env).
4. **Refactor `SecurityConfig.java`**: inyectar `app.cors.allowed-origins` como `List<String>` con `@Value("${app.cors.allowed-origins}")`. Reemplazar `setAllowedOriginPatterns(List.of("*"))` por `setAllowedOrigins(allowedOrigins)`. **NO usar wildcard** en producción.
5. **Refactor `docker-compose.yml`**:
   - Migrar `POSTGRES_PASSWORD`, `POSTGRES_USER`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GROQ_API_KEY` a referencias `${VAR}` desde `.env`.
   - En perfil `prod`, eliminar el mapeo `ports: 5432:5432` del servicio `db` (sustituir por `expose: ["5432"]` solo dentro de la red `thalassa-net`).
   - Configurar entrypoint o healthcheck del servicio `scraper` para fallar al arranque si `GROQ_API_KEY` está vacía o tiene el valor literal `tu_api_key_aqui`.
6. **Actualizar `README.md`**: sección "Setup" con instrucciones para copiar `.env.example` a `.env` y poblar valores.

### Criterios de Aceptación (QA)
- Instalar gitleaks (`brew install gitleaks` o equivalente) y ejecutar `gitleaks detect --source . --no-git` → 0 leaks.
- Con `.env` vacío, `docker compose up backend` falla con `Could not resolve placeholder 'JWT_SECRET'`.
- Con `.env` poblado, `docker compose up` arranca normalmente.
- `curl -i http://localhost:8080/api/auth/login -H "Origin: https://evil.com"` → respuesta NO incluye header `Access-Control-Allow-Origin: https://evil.com`.
- `docker compose --profile prod up db` → no expone puerto 5432 al host.

### Punto de Control y Git Commit
```bash
git add . && git commit -m "fix(security): migrar credenciales hardcodeadas a variables de entorno y separar perfiles dev/prod"
```

---

# FASE 2 — 🔴 CRÍTICO Migración de Schema con Flyway

### Objetivo de la Fase
Reemplazar `spring.jpa.hibernate.ddl-auto: update` (que puede causar pérdida de datos o desincronizar schema en producción) por gestión de schema versionada con Flyway. Resuelve **B-2** del audit. Esta fase es **innegociable antes del primer despliegue real**.

### Archivos Implicados
- **Modificar**:
  - [pom.xml](backend/pom.xml)
  - [application.yml](backend/src/main/resources/application.yml)
  - `application-dev.yml`, `application-prod.yml` (creados en Fase 1)
- **Crear**:
  - `backend/src/main/resources/db/migration/V1__init_schema.sql`
  - `backend/src/main/resources/db/migration/V2__seed_reference_data.sql` (si aplica)

### Instrucciones de Ejecución
1. **Añadir dependencias** en `pom.xml`:
   - `org.flywaydb:flyway-core`
   - `org.flywaydb:flyway-database-postgresql`
2. **Generar el schema baseline**:
   - Levantar Postgres limpio: `docker compose down -v && docker compose up -d db`.
   - Levantar el backend con `ddl-auto: create` temporalmente para que Hibernate genere todas las tablas.
   - Hacer dump del schema: `pg_dump --schema-only --no-owner --no-acl thalassa > V1__init_schema.sql`.
   - Limpiar el dump: eliminar comandos específicos de Postgres irrelevantes (`SET`, `SELECT pg_catalog.set_config`, etc.).
   - Mover a `backend/src/main/resources/db/migration/V1__init_schema.sql`.
3. **Configurar Flyway** en `application.yml` (base):
   ```yaml
   spring:
     flyway:
       enabled: true
       baseline-on-migrate: true
       locations: classpath:db/migration
   ```
4. **Cambiar `ddl-auto`**:
   - `application-prod.yml`: `spring.jpa.hibernate.ddl-auto: validate`.
   - `application-dev.yml`: `spring.jpa.hibernate.ddl-auto: validate` (recomendado para detectar drift) o `none`.
5. **Si hay datos seed** (planes FREE/PRO, catálogo de especies, parámetros target): crear `V2__seed_reference_data.sql` con `INSERT ... ON CONFLICT DO NOTHING`.
6. **Validar la migración**: `docker compose down -v && docker compose up -d` → backend logs deben mostrar `Flyway Community Edition ... Successfully applied 1 migration`.

### Criterios de Aceptación (QA)
- `docker compose logs backend | grep Flyway` muestra ejecución exitosa.
- `psql -U thalassa -d thalassa -c "\dt"` lista todas las tablas esperadas.
- `psql -U thalassa -d thalassa -c "SELECT * FROM flyway_schema_history;"` muestra V1 (y V2 si aplica) con `success = true`.
- Modificar manualmente una columna en una `@Entity` y reiniciar → backend lanza `SchemaManagementException` (validate funciona).

### Punto de Control y Git Commit
```bash
git add . && git commit -m "feat(backend): migrar gestión de schema a Flyway y eliminar ddl-auto update"
```

---

# FASE 3 — 🔴 CRÍTICO Refresh Tokens Rotativos

### Objetivo de la Fase
Implementar el flujo de refresh token rotativo (resuelve **B-8**) para evitar que el usuario sea deslogueado abruptamente cada 24h. Se mantiene JWT en localStorage por **decisión arquitectónica documentada** (alcance TFG): la mitigación XSS se delega a CSP estricta + sanitización en formularios. La decisión queda registrada en `docs/architecture-decisions/ADR-001-jwt-storage.md`.

### Archivos Implicados
- **Modificar**:
  - [JwtUtil.java](backend/src/main/java/com/thalassa/backend/security/JwtUtil.java)
  - [AuthController.java](backend/src/main/java/com/thalassa/backend/controllers/AuthController.java)
  - [AuthService.java](backend/src/main/java/com/thalassa/backend/services/AuthService.java)
  - [authStore.ts](frontend/src/store/authStore.ts)
  - [axiosConfig.ts](frontend/src/api/axiosConfig.ts)
  - [application.yml](backend/src/main/resources/application.yml)
- **Crear**:
  - `backend/src/main/java/com/thalassa/backend/entities/RefreshToken.java`
  - `backend/src/main/java/com/thalassa/backend/repositories/RefreshTokenRepository.java`
  - `backend/src/main/java/com/thalassa/backend/services/RefreshTokenService.java`
  - `backend/src/main/java/com/thalassa/backend/dto/auth/RefreshTokenRequest.java`
  - `backend/src/main/java/com/thalassa/backend/dto/auth/AuthTokensResponse.java`
  - `backend/src/main/resources/db/migration/V3__refresh_tokens.sql`
  - `frontend/src/api/authApi.ts` (si aún no existe)
  - `docs/architecture-decisions/ADR-001-jwt-storage.md`

### Instrucciones de Ejecución
1. **Crear el ADR-001**: documento markdown breve justificando mantener localStorage para JWT, listando riesgos (XSS) y mitigaciones (CSP en Fase 11, validación de inputs, no `dangerouslySetInnerHTML`). Esto blindará la decisión ante futuras revisiones.
2. **Modelo `RefreshToken`** (entity + migración Flyway `V3__refresh_tokens.sql`):
   - Campos: `id` (PK), `user_id` (FK a users), `token_hash` (SHA-256 del token, NO el plano), `expires_at` (timestamp), `revoked_at` (timestamp nullable), `replaced_by_id` (FK a sí mismo, nullable — para auditar la cadena de rotación), `user_agent` (varchar), `ip` (varchar), `created_at`.
   - Índices: `(user_id, revoked_at)` para queries de cleanup y detección de reuse.
3. **TTLs y secretos** en `application.yml`:
   ```yaml
   app:
     jwt:
       access-expiration-ms: 900000      # 15 min
       refresh-expiration-ms: 2592000000  # 30 días
       refresh-secret: ${JWT_REFRESH_SECRET}
   ```
4. **`RefreshTokenService`**:
   - `generateRefreshToken(User user, String userAgent, String ip)` → genera UUID aleatorio, lo firma como JWT con `JWT_REFRESH_SECRET`, hashea SHA-256, guarda hash en BD, retorna el token plano (solo se muestra una vez).
   - `validateAndRotate(String token)` → valida firma, hashea, busca en BD, verifica `revoked_at == null` y `expires_at > now`. Si todo OK: marca el actual como `revoked_at = now()`, crea uno nuevo, enlaza con `replaced_by_id`, retorna nuevo token.
   - `revoke(String token)` → marca como revocado. Idempotente.
   - `detectReuse(RefreshToken used)` → si `used.revoked_at != null` (reuse de un token ya rotado): revocar TODA la familia del usuario (recorrer `replaced_by_id` hacia atrás y adelante). Loggear como `SECURITY: Refresh token reuse detected for user {id}`.
   - Job `@Scheduled(cron = "0 0 3 * * *")` que purga tokens con `expires_at < now() - 90 days`.
5. **Endpoints nuevos** en `AuthController`:
   - `POST /api/auth/refresh` recibe `RefreshTokenRequest { refreshToken: String }`. Devuelve `AuthTokensResponse { accessToken, refreshToken, expiresIn, user }`.
   - `POST /api/auth/logout` recibe `RefreshTokenRequest`. Marca el refresh como revocado. Retorna 204. Idempotente.
   - Modificar `POST /api/auth/login` y `/register` para devolver también `refreshToken` en el body.
6. **`JwtUtil`**: añadir métodos `generateAccessToken(User)` con TTL 15 min (separar del refresh).
7. **Frontend `authStore`** (Zustand persist se mantiene):
   - Estado: `{ user, accessToken, refreshToken }`.
   - Acciones: `setAuth({ accessToken, refreshToken, user })`, `setAccessToken(token)` (refresh in-place), `clearAuth()`.
   - Persistir en localStorage clave `thalassa-auth`.
8. **Frontend `axiosConfig`**:
   - Interceptor de request: sigue añadiendo `Authorization: Bearer ${accessToken}`.
   - Interceptor de response 401:
     - Si la URL es `/auth/refresh`, `/auth/login` o `/auth/register` → propagar el error sin reintentar.
     - En otro caso → llamar `POST /api/auth/refresh { refreshToken }`. Si éxito: actualizar `accessToken` en `authStore` y reintentar la request original con el nuevo token (nueva instancia de la request).
     - Si refresh falla → `clearAuth()` + emitir evento custom `window.dispatchEvent(new CustomEvent('auth:expired'))`. Un `AuthProvider` en `App.tsx` escucha este evento y hace `navigate('/login')`. **NO usar `window.location.href`** (resuelve B-3).
   - **Concurrencia "single in-flight refresh"**: variable módulo `let refreshPromise: Promise<string> | null`. Si llegan N requests 401 simultáneas, solo se hace 1 llamada a `/auth/refresh`; las otras N-1 esperan al mismo promise.
9. **Política de password (S-6)**: añadir validación `@Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$", message = "Password debe tener mínimo 8 caracteres con al menos una letra y un número")` en `RegisterRequest.password`. Replicar el mismo regex en zod (Fase 7).
10. **Logout completo**: el botón logout en frontend debe llamar `POST /api/auth/logout { refreshToken }` antes de `clearAuth()`, asegurando revocación server-side.

### Criterios de Aceptación (QA)
- `curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{"email":"...","password":"..."}'` → response body contiene `accessToken` Y `refreshToken`.
- `curl -X POST http://localhost:8080/api/auth/refresh -H "Content-Type: application/json" -d '{"refreshToken":"..."}'` → nuevos tokens; el viejo refresh queda con `revoked_at IS NOT NULL` en BD (verificar con SELECT).
- Reusar refresh token revocado → 401 + verificar en BD que TODA la familia del usuario está revocada (defensa contra robo).
- Esperar 16 min con la app abierta, hacer click en cualquier acción → DevTools Network muestra: 401 → `/refresh` (200) → request original reintentada (200). Usuario no nota nada.
- Disparar 5 acciones en paralelo justo cuando expira el access → en Network tab solo aparece 1 llamada a `/refresh`.
- Logout → `POST /api/auth/logout` enviado, refresh marcado revocado, store limpio, redirect a `/login` sin reload de página.
- Registrar con password "abc" → 400 con mensaje claro de política.

### Punto de Control y Git Commit
```bash
git add . && git commit -m "feat(auth): implementar refresh tokens rotativos con detección de reuse y política de password"
```

---

# FASE 4 — 🟠 ALTO Endpoints Backend Faltantes y Fixes Lógicos

### Objetivo de la Fase
Cerrar gaps de API definidos en el master plan §10.5 y corregir bugs lógicos del audit: **B-1** (rate limit chat), **B-6** (N+1 query), **B-9** (paginación parámetros), **B-11** (LazyInit), **B-12** (redirección agresiva).

### Archivos Implicados
- **Modificar**:
  - [ChatService.java](backend/src/main/java/com/thalassa/backend/services/ChatService.java)
  - [AquariumService.java](backend/src/main/java/com/thalassa/backend/services/AquariumService.java)
  - [AquariumRepository.java](backend/src/main/java/com/thalassa/backend/repositories/AquariumRepository.java)
  - `WishlistController.java`, `WaterParameterController.java`, `AuthController.java`
- **Crear**:
  - `backend/src/main/java/com/thalassa/backend/entities/PasswordResetToken.java`
  - `backend/src/main/java/com/thalassa/backend/repositories/PasswordResetTokenRepository.java`
  - `backend/src/main/java/com/thalassa/backend/services/PasswordResetService.java`
  - `backend/src/main/java/com/thalassa/backend/services/EmailService.java` (stub)
  - `backend/src/main/java/com/thalassa/backend/dto/wishlist/WishlistUpdateRequest.java`
  - `backend/src/main/resources/db/migration/V4__password_reset_tokens.sql`

### Instrucciones de Ejecución
1. **B-1 (rate limit chat)** — refactor `ChatService.processChatMessage`. Patrón **"reservar y confirmar"**:
   - Antes de llamar a Python: solo VERIFICAR cuota (`SELECT COUNT(*) ...`), NO incrementar.
   - Llamar a Python con timeout (configurable, ej. 10s) y bloque try/catch.
   - **Solo en éxito**: incrementar contador en BD, idealmente en la misma transacción que persiste el mensaje.
   - Si falla Python: retornar error 503 sin incrementar. El usuario no pierde una de sus 5 consultas FREE por un fallo de infraestructura.
2. **B-6 (N+1 query)** — añadir `@EntityGraph(attributePaths = {"equipment", "livestock"})` al método `findByIdAndUserId` de `AquariumRepository`. Verificar con `show-sql: true` en dev que se ejecuta una sola query con LEFT JOIN.
3. **B-11 (LazyInitException)** — asegurar que `buildAquariumContext` en `ChatService` se invoca dentro de un método `@Transactional(readOnly = true)`. Alternativamente, materializar las colecciones explícitamente con `Hibernate.initialize(aquarium.getEquipment())` antes de salir del scope transaccional.
4. **B-9 (paginación parámetros)** — modificar `GET /api/aquariums/{id}/parameters` para aceptar query params:
   - `from` (Instant, opcional), `to` (Instant, opcional), `page` (int, default 0), `size` (int, default 50, max 200).
   - Retornar `Page<WaterParameterResponse>` (estructura `content[]`, `totalElements`, `totalPages`, `number`, `size`).
   - Repository: `findByAquariumIdAndRecordedAtBetween(Long aquariumId, Instant from, Instant to, Pageable pageable)`.
5. **`PUT /api/wishlist/{id}`** — DTO `WishlistUpdateRequest { notes: String, priority: Priority }` con `@Valid`. El controller valida ownership (que el wishlist item pertenece al usuario autenticado) antes de actualizar.
6. **Forgot/Reset password**:
   - Migración `V4__password_reset_tokens.sql`: tabla `password_reset_tokens (id, user_id, token_hash, expires_at, used_at, created_at)` con índice único en `token_hash`.
   - `POST /api/auth/forgot-password { email }` → siempre retorna 204 (no revelar si el email existe). Si existe: genera UUID, hashea, guarda con TTL 1h, llama a `EmailService.sendResetEmail()`.
   - `POST /api/auth/reset-password { token, newPassword }` → busca por hash, valida no usado y no expirado, actualiza password (BCrypt), marca `used_at = now()`, revoca todos los refresh tokens del usuario (forzar re-login). 400 si token inválido.
   - `EmailService` stub: en dev loggea el link `https://thalassa.app/reset-password?token=XXX`. En prod conectar SMTP (fuera de alcance, queda como TODO).
7. **B-12 (redirección agresiva)** — esto se mitiga en gran parte con la Fase 3 (interceptor mejorado). Adicionalmente, en `AquariumDetailPage.tsx`, el `catch` del `fetchData` debe mostrar error inline con botón "Reintentar" en lugar de `navigate('/dashboard')`. El redirect solo aplica para 404 confirmado.

### Criterios de Aceptación (QA)
- `curl -X PUT http://localhost:8080/api/wishlist/1 -H "Authorization: Bearer ..." -d '{"notes":"...","priority":"HIGH"}'` → 200 con datos actualizados.
- `curl http://localhost:8080/api/aquariums/1/parameters?page=0&size=10&from=2026-01-01T00:00:00Z` → response con `content[]`, `totalElements`, `totalPages`.
- Parar el contenedor `scraper`, enviar mensaje al chat → response 503 + verificar en BD `SELECT count FROM chat_quotas WHERE user_id = X` no se incrementó.
- Logs de backend muestran 1 sola query con LEFT JOIN al cargar `GET /aquariums/1`.
- `curl -X POST .../auth/forgot-password -d '{"email":"existing@test.com"}'` → 204; logs backend muestran link de reset.
- `curl -X POST .../auth/reset-password -d '{"token":"...","newPassword":"NewPass123"}'` → 200; intentar login con password antiguo falla; con nuevo funciona.

### Punto de Control y Git Commit
```bash
git add . && git commit -m "feat(backend): añadir endpoints faltantes (forgot/reset password, wishlist update, paginación) y corregir bugs lógicos B-1/B-6/B-9/B-11"
```

---

# FASE 5 — 🟠 ALTO Capa de UX en Frontend

### Objetivo de la Fase
Eliminar silent failures del frontend (resuelve **E-1, E-2, E-3, E-4** del audit) y dotar al usuario de feedback consistente: toasts para acciones, ErrorBoundary para crashes, ConfirmDialog para acciones destructivas, skeletons para loading states.

### Archivos Implicados
- **Modificar**:
  - [package.json](frontend/package.json)
  - `frontend/src/App.tsx` (montaje del Toaster y ErrorBoundary)
  - [axiosConfig.ts](frontend/src/api/axiosConfig.ts)
  - [DashboardView.tsx](frontend/src/features/dashboard/DashboardView.tsx)
  - [AquariumDetailPage.tsx](frontend/src/features/aquarium-detail/AquariumDetailPage.tsx) (todos los handlers de delete)
- **Crear**:
  - `frontend/src/components/shared/ErrorBoundary.tsx`
  - `frontend/src/components/shared/ConfirmDialog.tsx`
  - `frontend/src/components/shared/skeletons/DashboardCardSkeleton.tsx`
  - `frontend/src/components/shared/skeletons/ParameterChartSkeleton.tsx`
  - `frontend/src/components/shared/skeletons/LivestockListSkeleton.tsx`
  - `frontend/src/lib/toast.ts`
  - `frontend/src/pages/auth/ForgotPasswordPage.tsx`
  - `frontend/src/pages/auth/ResetPasswordPage.tsx`

### Instrucciones de Ejecución
1. **Instalar `sonner`**: `npm install sonner`. Montar `<Toaster richColors position="top-right" closeButton />` en `App.tsx` (al nivel más alto posible). Crear wrapper `lib/toast.ts` exportando `toast.success(msg)`, `toast.error(msg)`, `toast.promise(promise, { loading, success, error })`.
2. **`<ErrorBoundary>`** — class component (única necesidad legítima de class en React moderno). Captura errores con `getDerivedStateFromError` + `componentDidCatch`. Fallback UI con: título "Algo salió mal", descripción genérica, botón "Recargar" (`window.location.reload()`), botón "Volver al inicio" (`navigate('/')`). Loggear el error a `console.error` y, si `window.Sentry` existe (preparado para Fase 11), `Sentry.captureException`.
3. **`<ConfirmDialog>`** — modal accesible:
   - Props: `open: boolean`, `onOpenChange`, `title`, `description`, `confirmLabel`, `cancelLabel`, `variant: 'default' | 'destructive'`, `requireTextConfirmation?: string`, `onConfirm: () => Promise<void>`.
   - Si `requireTextConfirmation` está definido: mostrar input que obliga a tipear ese texto exacto para habilitar el botón "Confirmar". Master plan §9.6 lo exige para borrar acuario (escribir el nombre).
   - Focus trap mientras está abierto. Cierre con `Escape`. Click en overlay cierra (configurable).
4. **Sustituir silent failures**: hacer un grep `catch.*\\{\\s*\\}` o `catch.*console\\.log` y sustituir por `toast.error("Mensaje específico")`. Especialmente en handlers de delete de [AquariumDetailPage.tsx:529-537,637-645](frontend/src/features/aquarium-detail/AquariumDetailPage.tsx#L529-L645).
5. **Sustituir `setError` inline por toasts** en acciones (delete, save). Mantener `setError` inline solo para validación de formularios por campo.
6. **Skeletons específicos**: crear los 3 componentes listados. Usar Tailwind `animate-pulse` con la paleta de fondos del proyecto. Reemplazar el spinner global por skeleton específico en `DashboardView`, `AquariumDetailPage` (cards, parameters chart, livestock list).
7. **`/forgot-password` y `/reset-password`** UI:
   - `ForgotPasswordPage`: form con email, llama `POST /api/auth/forgot-password`, muestra toast verde "Si el email existe, recibirás un link". Redirige a `/login` después de 3s.
   - `ResetPasswordPage`: lee `?token=` de query string, form con `newPassword` + `confirmPassword`, llama `POST /api/auth/reset-password`, redirige a `/login` con toast.
   - Registrar ambas rutas en `AppRouter.tsx` como `<PublicOnlyRoute>`.

### Criterios de Aceptación (QA)
- Click en "Eliminar acuario" → ConfirmDialog aparece; sin escribir el nombre del acuario, botón "Confirmar" deshabilitado.
- Detener el backend (`docker compose stop backend`), intentar borrar livestock → toast rojo "No se pudo eliminar" + el item permanece visible.
- En DevTools, ejecutar `throw new Error("test")` dentro del render de un componente → ErrorBoundary captura, no hay pantalla en blanco.
- `npm run build` sin warnings.
- Visitar `/forgot-password`, enviar email → toast aparece, redirección a `/login`.
- Cambiar de tab y volver → skeletons aparecen brevemente en loading, no spinner full-screen.

### Punto de Control y Git Commit
```bash
git add . && git commit -m "feat(frontend): añadir sonner, ErrorBoundary, ConfirmDialog, skeletons y UI de password reset"
```

---

# FASE 6 — 🟠 ALTO Refactor del Chat a Drawer Global

### Objetivo de la Fase
Alinear con master plan §11.1: el chat debe ser un **drawer controlado por `uiStore`**, NO una ruta. Actualmente existe `/dashboard/chat` que viola esta convención. Resolución: convertir `ChatView` en `<ChatDrawer>` montado en `<GestorLayout>`, eliminar la ruta y los componentes obsoletos.

### Archivos Implicados
- **Modificar**:
  - [GestorLayout.tsx](frontend/src/components/layout/GestorLayout.tsx)
  - [AppRouter.tsx](frontend/src/routes/AppRouter.tsx)
  - [Sidebar.tsx](frontend/src/components/layout/Sidebar.tsx)
  - [BottomTabBar.tsx](frontend/src/components/layout/BottomTabBar.tsx)
  - [DashboardView.tsx](frontend/src/features/dashboard/DashboardView.tsx) (botón que navegaba a `/dashboard/chat`)
  - [uiStore.ts](frontend/src/store/uiStore.ts) (extender con historial de mensajes)
- **Crear**:
  - `frontend/src/features/chat/ChatDrawer.tsx`
  - `frontend/src/features/chat/components/ChatHeader.tsx`
  - `frontend/src/features/chat/components/ChatMessageList.tsx`
  - `frontend/src/features/chat/components/ChatInput.tsx`
  - `frontend/src/features/chat/components/QuestionCounter.tsx`
- **Eliminar**:
  - [ChatView.tsx](frontend/src/features/chat/ChatView.tsx)

### Instrucciones de Ejecución
1. **Crear `<ChatDrawer>`**:
   - Lee `isChatOpen`, `closeChat`, `messages`, `appendMessage` de `useUIStore`.
   - **Desktop (md+)**: drawer fijo derecho, ancho 380px, `position: fixed; right: 0; top: 0; bottom: 0; z-50`. Animación slide-in con `framer-motion`:
     - `<AnimatePresence>` envolviendo condicionalmente.
     - `motion.div` con `initial={{ x: 380 }}`, `animate={{ x: 0 }}`, `exit={{ x: 380 }}`, `transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}`.
   - **Mobile (<md)**: modal fullscreen (mismo componente, breakpoint vía Tailwind `md:w-[380px]` vs `w-full`).
   - Cierre: botón X en header, tecla `Escape` (listener `useEffect`), click fuera del drawer (overlay con `pointer-events: auto` que llama `closeChat`).
   - Focus trap mientras está abierto (puede usar `react-focus-lock` o implementación manual con `tabIndex` en primer/último elemento).
2. **Migrar lógica de `ChatView.tsx` a `ChatDrawer.tsx`**:
   - Estado de aquariumContext, sendMessage, fetchUsage → mover.
   - Subcomponentes: `ChatHeader` (título + close button + selector de acuario contexto), `ChatMessageList` (scroll automático al último mensaje), `ChatInput` (textarea con autoexpand + botón send), `QuestionCounter` (chip arriba del input).
3. **Persistir historial en `uiStore`**:
   - Estado nuevo: `messages: ChatMessage[]`.
   - Acciones: `appendMessage(msg)`, `clearMessages()`.
   - Esto evita refetch del histórico cada vez que se abre el drawer.
4. **`<QuestionCounter>`**: muestra "3 / 5 questions used today" si `plan === 'FREE'`. Color dinámico (verde 0-2, amarillo 3-4, rojo 5). Lee de `usePlan()` hook (a crear en Fase 7) o llama a `chatApi.getUsage()` directamente con `useEffect`.
5. **Montar `<ChatDrawer />`** dentro de `<GestorLayout>`, fuera del `<Outlet />` (siempre presente, no condicional al route).
6. **Sidebar y BottomTabBar**: el botón/icono "Chat" deja de ser `<NavLink to="/dashboard/chat">` y pasa a `<button onClick={() => useUIStore.getState().openChat()}>`. Mantener el ícono activo mientras `isChatOpen === true`.
7. **Eliminar la ruta `/dashboard/chat`** y la importación `lazy(() => import('../features/chat/ChatView'))` de `AppRouter.tsx`.
8. **Eliminar `ChatView.tsx`** físicamente: `git rm frontend/src/features/chat/ChatView.tsx`.

### Criterios de Aceptación (QA)
- Click en "Chat" en sidebar → drawer aparece desde la derecha con animación de 300ms; URL no cambia (sigue en `/dashboard`).
- Pulsar `Escape` → drawer se cierra suavemente.
- Click en el overlay (zona oscura fuera del drawer) → cierra.
- Navegar entre `/dashboard` y `/dashboard/profile` → si el drawer estaba abierto, sigue abierto (no se desmonta porque vive en el layout).
- `npm run typecheck` sin errores tras eliminar `ChatView`.
- Visitar `/dashboard/chat` directamente en URL → 404 (o redirect a `/dashboard` si hay catch-all).
- Enviar 2 mensajes, cerrar drawer, reabrir → historial conservado.

### Punto de Control y Git Commit
```bash
git add . && git commit -m "refactor(chat): migrar de ruta a drawer global controlado por uiStore"
```

---

# FASE 7 — 🟡 MEDIO Generación de Tipos OpenAPI + Forms (RHF + Zod)

### Objetivo de la Fase
Eliminar drift contractual entre backend y frontend (resuelve **T-1, T-2, T-3, T-4** del audit) generando tipos TypeScript desde el `openapi.yaml`. Adoptar `react-hook-form` + `zod` para formularios tipo-seguros con validación por campo.

### Archivos Implicados
- **Modificar**:
  - [package.json](frontend/package.json)
  - [pom.xml](backend/pom.xml) (verificar configuración del plugin OpenAPI)
  - `frontend/vite.config.ts`
  - Todos los formularios principales: `LoginPage`, `RegisterPage`, `CreateAquariumModal`, `LogMeasurementModal`, `AddLivestockModal`, etc.
- **Crear**:
  - `frontend/openapi-config.ts`
  - `frontend/src/api/generated/` (auto-generado por el codegen)
  - `frontend/src/lib/schemas/loginSchema.ts`, `registerSchema.ts`, `aquariumSchema.ts`, `measurementSchema.ts`
  - `frontend/src/api/equipmentApi.ts`
  - `frontend/src/api/marketApi.ts`
  - `frontend/src/api/wishlistApi.ts`
  - `frontend/src/api/inhabitantApi.ts`
- **Eliminar (gradualmente)**:
  - Tipos manuales en `frontend/src/types/api.ts`, `aquarium.ts` (sustituidos por generados)

### Instrucciones de Ejecución
1. **Verificar generación de `openapi.yaml`** desde el backend:
   - El `pom.xml` ya tiene el plugin OpenAPI Generator configurado. Confirmar que `mvn compile` produce un archivo `openapi.yaml` (o `openapi.json`) en `target/`.
   - Si no, ajustar configuración para usar `springdoc-openapi-maven-plugin`: añadir goal `generate` y `outputFileName: openapi.yaml`.
   - Crear script Maven o npm que copie el archivo generado a `docs/openapi.yaml` para que el frontend lo consuma.
2. **Instalar codegen** en frontend: `npm install -D openapi-typescript` (lightweight, solo tipos, recomendado) o `@hey-api/openapi-ts` (cliente completo). Para este proyecto: usar `openapi-typescript` por simplicidad.
3. **Script `npm run gen:api`** en `package.json`:
   ```json
   "gen:api": "openapi-typescript ../docs/openapi.yaml -o src/api/generated/schema.ts"
   ```
4. **Migrar consumos**: importar tipos de `src/api/generated/schema.ts`:
   ```ts
   import type { paths, components } from './generated/schema';
   type AquariumResponse = components['schemas']['AquariumResponse'];
   ```
   Reemplazar archivo por archivo, no en bloque (evitar PR enorme).
5. **Crear los API clients faltantes**: `equipmentApi.ts`, `marketApi.ts`, `wishlistApi.ts`, `inhabitantApi.ts`. Patrón a seguir: igual al `aquariumApi.ts` ya existente (axios + tipos generados).
6. **Instalar `react-hook-form` + `zod`**:
   ```bash
   npm install react-hook-form zod @hookform/resolvers
   ```
7. **Crear esquemas zod** en `lib/schemas/`:
   - `loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })`.
   - `registerSchema = z.object({ email: z.string().email(), password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, "Mínimo 8 chars, letra y número") })`. **Mismo regex que backend Fase 3** (mantener sincronizados).
   - `aquariumCreateSchema`, `measurementLogSchema`, etc.
8. **Migrar formularios**:
   - Empezar por Login + Register (más simples).
   - Patrón: `useForm({ resolver: zodResolver(schema) })`. Errores por campo en `formState.errors`. Submit deshabilitado si `!formState.isValid`.
   - Continuar con CreateAquariumModal, LogMeasurementModal. **Eliminar `as Record<string, number>` cast** de [AquariumDetailPage.tsx:94](frontend/src/features/aquarium-detail/AquariumDetailPage.tsx#L94) — los tipos generados deben tener la forma correcta.

### Criterios de Aceptación (QA)
- `npm run gen:api && npm run typecheck` → 0 errores.
- Tocar el `openapi.yaml` (eliminar un campo de `AquariumResponse`) → `npm run typecheck` falla en los componentes que usan ese campo. **Drift bloqueado por el compilador**.
- Login con password "abc" → error de zod inline antes de submit, sin request al backend.
- Network tab no muestra request si zod falla la validación.
- Crear acuario con datos inválidos (volumen negativo) → error inline del campo, submit deshabilitado.

### Punto de Control y Git Commit
```bash
git add . && git commit -m "feat(frontend): generar tipos desde OpenAPI y migrar formularios a react-hook-form + zod"
```

---

# FASE 8 — 🟡 MEDIO Adopción de React Query

### Objetivo de la Fase
Reemplazar el patrón manual `useState + useEffect + Promise.all` por **TanStack React Query**, que aporta cache, invalidación, retry, refetch on focus, optimistic updates y AbortController automático. Resuelve **B-5, B-10** del audit y elimina deuda técnica masiva.

### Archivos Implicados
- **Modificar**:
  - `frontend/src/main.tsx` o `App.tsx` (montar `QueryClientProvider`)
  - `frontend/package.json`
  - [DashboardView.tsx](frontend/src/features/dashboard/DashboardView.tsx)
  - [AquariumDetailPage.tsx](frontend/src/features/aquarium-detail/AquariumDetailPage.tsx)
  - Todas las páginas que actualmente hacen fetch directo
- **Crear**:
  - `frontend/src/lib/queryClient.ts`
  - `frontend/src/hooks/queries/useAquariums.ts`
  - `frontend/src/hooks/queries/useAquarium.ts`
  - `frontend/src/hooks/queries/useWaterParameters.ts`
  - `frontend/src/hooks/queries/useUserProfile.ts`
  - `frontend/src/hooks/queries/useWishlist.ts`
  - `frontend/src/hooks/queries/useEquipment.ts`
  - `frontend/src/hooks/mutations/useDeleteAquarium.ts`, `useCreateAquarium.ts`, etc.

### Instrucciones de Ejecución
1. **Instalar**: `npm install @tanstack/react-query @tanstack/react-query-devtools`.
2. **Configurar `QueryClient`** en `lib/queryClient.ts`:
   ```ts
   new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 30_000,
         retry: 2,
         retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30_000),
         refetchOnWindowFocus: false,
       },
       mutations: { retry: 1 },
     },
   });
   ```
3. **Envolver `<App>`** en `<QueryClientProvider client={queryClient}>`. Añadir `<ReactQueryDevtools initialIsOpen={false} />` solo si `import.meta.env.DEV`.
4. **Crear hooks por entidad** en `hooks/queries/`:
   - `useAquariums()` → `useQuery({ queryKey: ['aquariums'], queryFn: aquariumApi.list })`.
   - `useAquarium(id)` → `useQuery({ queryKey: ['aquariums', id], queryFn: () => aquariumApi.getById(id), enabled: !!id })`.
   - `useWaterParameters(id, { from, to, page, size })` → query con params.
5. **Crear hooks de mutación** en `hooks/mutations/`:
   - `useDeleteAquarium()` → `useMutation({ mutationFn: aquariumApi.delete, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['aquariums'] }); toast.success('Acuario eliminado'); } })`.
   - Patrón uniforme: invalidate + toast en `onSuccess`, toast en `onError`.
6. **Migrar `DashboardView`**:
   - Eliminar `useState({ aquariums, loading, error })` y todo `useEffect` con fetch.
   - Sustituir por `const { data: aquariums, isLoading, error } = useAquariums()`.
   - AbortController gestionado internamente por React Query (B-10 resuelto).
7. **Migrar `AquariumDetailPage`**:
   - Hooks `useAquariumDetail(id)`, `useWaterParameters(id, range)`.
   - Eliminar el `Promise.all` (B-5 resuelto: cada query es independiente y maneja su propio error/loading).
   - Tabs renderizan en función del `useQuery` de su entidad.
8. **Optimistic UI** en deletes (master plan UX):
   - `useMutation` con `onMutate`: snapshot del cache, actualiza optimisticamente (remueve el item).
   - `onError`: rollback al snapshot + toast rojo.
   - `onSettled`: invalidate (refetch para sincronizar con servidor).

### Criterios de Aceptación (QA)
- Abrir React Query DevTools (`<ReactQueryDevtools />`) → muestra todas las queries activas con su estado (fresh, stale, fetching, idle).
- Borrar livestock → desaparece inmediatamente del UI; si backend falla → reaparece con toast rojo "No se pudo eliminar".
- Cambiar de tab del navegador y volver → datos se sirven del cache (no hay flash de loading).
- Forzar 503 en `GET /aquariums` (mocking en MSW o parando backend) → React Query reintenta 2 veces con backoff exponencial antes de fallar.
- Navegar entre pages → no hay re-fetch innecesario (el cache responde instantáneamente).

### Punto de Control y Git Commit
```bash
git add . && git commit -m "feat(frontend): adoptar React Query para server state, optimistic UI en mutaciones y eliminar Promise.all manuales"
```

---

# FASE 9 — 🟡 MEDIO Polish UI/UX, Animaciones, Accesibilidad

### Objetivo de la Fase
Cumplir con master plan §7.2 (animaciones), §9.2 (sparklines en cards de parámetros) y mínimo WCAG AA de accesibilidad. Resuelve **T-9** del audit y la sección 3.3 completa (accesibilidad).

### Archivos Implicados
- **Modificar**:
  - [tailwind.config.ts](frontend/tailwind.config.ts) (tokens centralizados)
  - Todos los componentes con hex inline (`text-[#444]`, `bg-[rgba(...)]`)
  - [AquariumDetailPage.tsx](frontend/src/features/aquarium-detail/AquariumDetailPage.tsx)
  - `LandingPage.tsx` y secciones (Hero, Pricing, About)
  - `frontend/index.html` (skip-link, lang)
- **Crear**:
  - `frontend/src/components/shared/Sparkline.tsx`
  - `frontend/src/features/aquarium-detail/AquariumSettingsModal.tsx`

### Instrucciones de Ejecución
1. **Tokens de diseño centralizados** en `tailwind.config.ts`:
   ```ts
   theme.extend.colors = {
     accent: '#59D3FF',
     'accent-hover': '#3DC5F5',
     'bg-base': '#000',
     'bg-elevated': '#0A0A0A',
     'border-default': '#1A1A1A',
     'text-primary': '#FFF',
     'text-secondary': '#999',
     'text-muted': '#666',
   };
   ```
   - Buscar en el codebase `text-\\[#` y reemplazar masivamente con tokens (revisión componente por componente).
   - **Especial atención a `text-[#444]`**: contraste 2.7:1 sobre `#000`, **falla WCAG AA**. Reemplazar por `text-text-muted` (`#666` da 5.5:1, OK).
2. **Sparkline component** (master plan §9.2):
   - `<Sparkline data={number[]} color={string}>` usando Recharts `LineChart` minimalista (sin axes, sin grid, sin tooltip, height 40px).
   - Embebido en cards de parámetros del Overview tab mostrando tendencia de últimas 7 mediciones.
   - Si menos de 2 datos: placeholder elegante "—".
3. **AquariumSettingsModal (⚙)** — master plan §9.6:
   - Botón ⚙ en header del AquariumDetailPage abre modal.
   - Modal con form (RHF + zod): nombre, volumen, tipo. Botón "Guardar cambios".
   - Sección "Zona peligrosa" con botón rojo "Eliminar acuario" que abre `<ConfirmDialog requireTextConfirmation={aquarium.name} variant="destructive">`.
4. **Animaciones master plan §7.2** con framer-motion:
   - **Hero**: `motion.h1` con `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`, `transition={{ duration: 0.6, delay: 0.1 }}`.
   - **Pricing/HowItWorks cards**: `motion.div` con `variants` parent (`staggerChildren: 0.1`) + child (`opacity 0/1`, `y 20/0`).
   - **About Us**: `whileInView={{ opacity: 1, x: 0 }}`, `initial={{ opacity: 0, x: -50 }}`, `viewport={{ once: true }}`.
5. **Page transitions** entre rutas del gestor: envolver `<Outlet />` de `GestorLayout` en `<AnimatePresence mode="wait">` + `motion.div` con fade (`initial: opacity 0`, `animate: opacity 1`, `exit: opacity 0`, `duration: 0.2`).
6. **Accesibilidad WCAG AA mínimo**:
   - `aria-label` en TODOS los botones de solo ícono (X, trash, plus, ⚙). Buscar `<button>` sin `aria-label` ni texto interno.
   - CSS global `:focus-visible` con `outline: 2px solid theme(colors.accent); outline-offset: 2px`. Eliminar `outline: none` sin reemplazo.
   - `<html lang="en">` en `index.html` (verificar).
   - `prefers-reduced-motion`: usar Tailwind `motion-safe:` para animaciones de hero/cards y `motion-reduce:` para versiones simplificadas.
   - **Skip-to-content link**: primer elemento del `<body>` antes de `<div id="root">`, oculto visualmente, visible en focus, navega a `#main-content` (añadir `id` al main wrapper de `GestorLayout` y a `LandingPage`).
7. **Cleanup**: eliminar `cursor-pointer` redundante en `<button>` (Tailwind 4 lo aplica por defecto).

### Criterios de Aceptación (QA)
- Lighthouse Accessibility (incognito, build prod) ≥ 90.
- Instalar extension axe DevTools → escaneo de página principal → 0 violations críticos o serios.
- Tab navigation completa el dashboard → todos los focus visibles, no hay "saltos" invisibles.
- Activar "Reduce motion" en macOS/Windows → animaciones de hero se vuelven instantáneas (o duración mínima).
- Sparkline aparece en cards con 7+ mediciones; placeholder en cards con <2.
- Eliminar acuario desde Settings ⚙ → ConfirmDialog exige tipear el nombre exacto.
- Buscar `text-\\[#444\\]` en codebase → 0 ocurrencias.

### Punto de Control y Git Commit
```bash
git add . && git commit -m "feat(frontend): centralizar design tokens, sparklines, animaciones master plan §7.2 y accesibilidad WCAG AA"
```

---

# FASE 10 — 🟡 MEDIO Testing y CI/CD

### Objetivo de la Fase
Lograr coverage **60% backend / 50% frontend** (métrica de Done del audit), montar pipeline CI con GitHub Actions que bloquee merges sin tests verdes. Resuelve **T-5, T-6, T-7** del audit.

### Archivos Implicados
- **Modificar**:
  - `frontend/package.json`
  - [pom.xml](backend/pom.xml)
- **Crear**:
  - `frontend/vitest.config.ts`
  - `frontend/src/test/setup.ts`
  - `frontend/src/components/shared/__tests__/PlanGate.test.tsx`
  - `frontend/src/routes/__tests__/AppRouter.test.tsx`
  - `frontend/src/store/__tests__/authStore.test.ts`
  - `frontend/src/lib/__tests__/formatters.test.ts`
  - `backend/src/test/java/.../AuthServiceTest.java`
  - `backend/src/test/java/.../AquariumServiceTest.java`
  - `backend/src/test/java/.../ChatServiceTest.java`
  - `backend/src/test/java/.../AuthControllerIT.java` (Testcontainers)
  - `.github/workflows/ci.yml`
  - `.eslintrc.cjs`, `.prettierrc`, `frontend/.prettierignore`

### Instrucciones de Ejecución
1. **Frontend testing setup**:
   - Instalar: `npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom msw`.
   - `vitest.config.ts`: `environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']`, coverage con `v8` provider.
   - `setup.ts`: importa `@testing-library/jest-dom`, configura MSW server.
   - Scripts: `"test": "vitest"`, `"test:coverage": "vitest run --coverage"`.
2. **Tests frontend mínimos**:
   - `PlanGate.test.tsx`: render con plan FREE bloqueado, plan PRO desbloqueado.
   - `AppRouter.test.tsx`: `PrivateRoute` redirige a `/login` si no auth; `PublicOnlyRoute` redirige a `/dashboard` si sí auth.
   - `authStore.test.ts`: setAuth, clearAuth, refresh in-place.
   - `formatters.test.ts`: pH (1 decimal), salinidad (3 decimales), fechas locale.
3. **Backend testing setup**:
   - `pom.xml`: añadir `spring-boot-starter-test` (ya viene), `org.testcontainers:postgresql`, `org.testcontainers:junit-jupiter`.
   - JaCoCo plugin para coverage (`jacoco-maven-plugin`) con threshold 60%.
4. **Tests backend mínimos**:
   - `AuthServiceTest`: login OK, password incorrecto, email duplicado en register.
   - `AquariumServiceTest`: límite FREE = 1 acuario (segunda creación lanza `PlanLimitExceededException`), PRO ilimitado.
   - `ChatServiceTest`: rate limit FREE = 5/día (sexta llamada lanza `QuotaExceededException`); fallo de Python NO incrementa contador (test específico para B-1 de Fase 4).
   - `AuthControllerIT` con `@SpringBootTest` + `@Testcontainers`: integración real con Postgres efímero.
5. **Linters**:
   - **Frontend**: ESLint con `@typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`. Prettier con config compartida. Scripts `npm run lint`, `npm run format`.
   - **Backend**: Spotless plugin Maven con Google Java Format. `mvn spotless:check` (verificación) y `mvn spotless:apply` (auto-fix).
6. **CI con GitHub Actions** — `.github/workflows/ci.yml`:
   ```yaml
   on: [push, pull_request]
   jobs:
     frontend:
       runs-on: ubuntu-latest
       steps:
         - checkout
         - setup-node 20
         - cache npm
         - npm ci
         - npm run lint
         - npm run typecheck
         - npm run test:coverage
         - npm run build
     backend:
       runs-on: ubuntu-latest
       services: { postgres: { image: postgres:16, ... } }
       steps:
         - checkout
         - setup-java 21
         - cache maven
         - mvn -B verify
     docker:
       runs-on: ubuntu-latest
       steps:
         - checkout
         - docker compose build
   ```
   - Configurar branch protection rule en `main` exigiendo estos jobs verdes para merge.

### Criterios de Aceptación (QA)
- `npm run test:coverage` muestra coverage ≥ 50% líneas.
- `mvn verify` muestra coverage JaCoCo ≥ 60% líneas.
- Push a una branch dispara CI; workflow termina verde en menos de 8 minutos.
- Crear PR con violación de Spotless → CI rojo bloquea merge.
- Crear PR con typecheck error → CI rojo bloquea merge.

### Punto de Control y Git Commit
```bash
git add . && git commit -m "chore: añadir suite de tests (Vitest + JUnit + Testcontainers), linters y pipeline CI con GitHub Actions"
```

---

# FASE 11 — 🟢 PRODUCCIÓN Observabilidad y Hardening Final

### Objetivo de la Fase
Preparar el proyecto para despliegue productivo real: métricas, logging estructurado, healthchecks, multi-stage Dockerfiles, reverse proxy con HTTPS, backups automáticos. Resuelve **P-6** y la sección 2.3.5 del audit.

### Archivos Implicados
- **Modificar**:
  - `pom.xml`, `application-prod.yml`, `docker-compose.yml`
  - `Dockerfile` del backend, scraper, frontend
- **Crear**:
  - `backend/src/main/resources/logback-spring.xml`
  - `nginx/nginx.conf` (o `traefik/dynamic.yml`)
  - `scripts/backup.sh`
  - `docs/architecture-decisions/ADR-002-observability-stack.md`

### Instrucciones de Ejecución
1. **Spring Actuator**:
   - Añadir `spring-boot-starter-actuator` y `micrometer-registry-prometheus` al `pom.xml`.
   - `application-prod.yml`:
     ```yaml
     management:
       endpoints:
         web:
           exposure:
             include: health,info,prometheus
       endpoint:
         health:
           show-details: when_authorized
     ```
   - Securizar endpoints en `SecurityConfig`: `/actuator/health` y `/actuator/info` públicos; `/actuator/prometheus` con basic auth o restringido por IP allowlist.
2. **Logging estructurado JSON**:
   - Añadir `net.logstash.logback:logstash-logback-encoder` al `pom.xml`.
   - `logback-spring.xml`: appender JSON que incluye `traceId`, `spanId`, `userId` (vía MDC). En perfil `prod`, salida a `stdout` (recogido por Docker).
   - Filtro Spring que setea MDC al recibir cada request (`userId` desde `SecurityContextHolder`, `traceId` UUID generado).
3. **Healthchecks `docker-compose.yml`**:
   ```yaml
   services:
     db:
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER"]
         interval: 5s
         timeout: 3s
         retries: 5
     backend:
       depends_on:
         db: { condition: service_healthy }
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
         interval: 10s
   ```
4. **Multi-stage Dockerfiles**:
   - **Backend**: stage `builder` con `maven:3.9-eclipse-temurin-21` que ejecuta `mvn package -DskipTests`; stage final `eclipse-temurin:21-jre-alpine` que copia el JAR. Reduce de ~600MB a ~200MB.
   - **Frontend**: stage `builder` con `node:20-alpine` + `npm run build`; stage final `nginx:alpine` que sirve `dist/` con config personalizado (incluye **CSP estricta** referenciada en ADR-001 de Fase 3).
5. **Reverse proxy** con HTTPS — Traefik recomendado por simplicidad:
   - Servicio `traefik` en `docker-compose.yml` que escucha 80/443.
   - Let's Encrypt vía resolver `acme` con desafío HTTP-01.
   - Labels en backend y frontend para enrutamiento por host.
   - Forzar HTTPS (redirect 80→443).
   - Security headers vía middleware: `Strict-Transport-Security max-age=31536000`, `X-Frame-Options DENY`, `X-Content-Type-Options nosniff`, `Referrer-Policy strict-origin-when-cross-origin`, `Content-Security-Policy default-src 'self'; script-src 'self'; ...`.
6. **Backups Postgres**:
   - `scripts/backup.sh`: `pg_dump -Fc -U thalassa thalassa | gzip > /backups/thalassa-$(date +%F).sql.gz` + sync a S3/Backblaze.
   - Cron en host (`0 3 * * * /opt/thalassa/scripts/backup.sh`) o servicio dedicado en `docker-compose.yml`.
   - Retención: 7 diarios, 4 semanales, 12 mensuales.
7. **Sentry (opcional pero recomendado)**:
   - Frontend: `npm install @sentry/react`, init en `main.tsx` con `dsn` desde env, `tracesSampleRate: 0.1`.
   - Backend: dependencia `io.sentry:sentry-spring-boot-starter-jakarta`.
   - DSN en variables de entorno separadas por entorno (staging vs prod).

### Criterios de Aceptación (QA)
- `curl https://thalassa.app/actuator/health` → `{"status":"UP","components":{"db":{"status":"UP"}}}`.
- `curl -I https://thalassa.app` muestra `Strict-Transport-Security`, `X-Frame-Options`, `Content-Security-Policy`.
- `curl http://thalassa.app` → 301 redirect a `https://`.
- `docker compose up` → backend NO arranca antes de que `db` esté `healthy` (verificar logs ordenados).
- Forzar exception en endpoint (lanzar `RuntimeException` temporal) → aparece en Sentry con stack trace + traceId.
- Ejecutar `scripts/backup.sh` manualmente → archivo `.sql.gz` aparece en `/backups`.
- Imagen Docker final del backend < 250MB (`docker images thalassa-backend`).

### Punto de Control y Git Commit
```bash
git add . && git commit -m "feat(ops): añadir Actuator, logging estructurado JSON, healthchecks, multi-stage Dockerfiles, Traefik HTTPS y backups Postgres"
```

---

# FASE 12 — 🟢 NICE-TO-HAVE i18n + PWA + Funcionalidades Post-MVP

### Objetivo de la Fase
Cumplir master plan §14 (internacionalización EN/DE/ES) y §16 (PWA, notificaciones, export CSV). Estas funcionalidades son opcionales para la entrega TFG pero suman valor diferencial.

### Archivos Implicados
- **Modificar**:
  - `App.tsx`, `package.json`, `vite.config.ts`, `index.html`, `Profile` page
- **Crear**:
  - `frontend/src/i18n/index.ts`
  - `frontend/src/i18n/locales/en/common.json`, `en/dashboard.json`, etc.
  - `frontend/src/i18n/locales/{de,es}/*.json` (placeholders)
  - `frontend/public/manifest.webmanifest`
  - `frontend/public/icons/icon-192.png`, `icon-512.png`, `icon-maskable.png`
  - `frontend/src/components/shared/NotificationBell.tsx`
  - `backend/.../controllers/NotificationController.java` (stub)

### Instrucciones de Ejecución
1. **i18n**:
   - `npm install react-i18next i18next i18next-browser-languagedetector`.
   - `i18n/index.ts`: configurar fallback `en`, namespaces (`common`, `dashboard`, `auth`, ...).
   - Selector de idioma en página Profile que persiste vía `PUT /api/users/me { locale }` (añadir campo `locale` a User entity con migración Flyway `V5__add_user_locale.sql`).
   - Iniciar con EN completo. DE y ES como placeholders (mismas keys con valor TBD para no romper).
2. **PWA**:
   - `npm install -D vite-plugin-pwa`.
   - `vite.config.ts`: añadir `VitePWA({ registerType: 'autoUpdate', workbox: {...} })`.
   - `manifest.webmanifest`: name, short_name, theme_color, icons (192, 512, maskable).
   - Estrategias de cache: `staleWhileRevalidate` para assets estáticos; `networkFirst` con timeout 3s para `/api/*`.
   - Stub de push notifications (no implementar el envío, solo el setup del SW para recibirlas en el futuro).
3. **Notificaciones in-app**:
   - `NotificationController` stub: `GET /api/notifications` retorna lista mock (o real si entidad existe).
   - `<NotificationBell>` en topbar consume el endpoint, badge con contador de no leídas, dropdown con últimas 5.
4. **Export CSV de parámetros**:
   - `GET /api/aquariums/{id}/parameters/export?format=csv` retorna `text/csv` con headers `Content-Disposition: attachment; filename=...`.
   - Frontend: botón "Exportar CSV" en tab Parameters, descarga blob.

### Criterios de Aceptación (QA)
- Chrome DevTools > Application > Manifest: válido, sin errores.
- Lighthouse PWA score ≥ 90.
- Cambiar idioma en Profile a DE → toda la UI cambia (placeholders visibles), persistencia tras reload.
- Modo avión + abrir app → última versión cacheada se sirve.
- Click en "Export CSV" → descarga archivo `parameters_<aquarium-name>_<date>.csv` que abre correctamente en Excel.

### Punto de Control y Git Commit
```bash
git add . && git commit -m "feat: añadir i18n (EN/DE/ES), PWA con offline cache, NotificationBell stub y export CSV de parámetros"
```

---

# FASE 13 — Verificación Final y Definition of Done

### Objetivo de la Fase
Auditar el cumplimiento de la sección 5 ("Métricas de Done") del audit original, cerrar el ciclo, taggear release candidate y actualizar documentación.

### Archivos Implicados
- **Modificar**:
  - `README.md` (setup completo desde cero)
- **Crear**:
  - `CHANGELOG.md`
  - `docs/architecture.md` (overview de servicios y flujos)

### Instrucciones de Ejecución
1. Ejecutar `gitleaks detect --source . --no-git` → debe ser 0 leaks.
2. Lighthouse en `/` (landing) y `/dashboard` (con login mock o cuenta de test) → Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90.
3. Confirmar coverage final: `npm run test:coverage` ≥ 50%, `mvn verify` ≥ 60%.
4. Despliegue staging exitoso con HTTPS y dominio público (ver Fase 11). Smoke test manual: registro → login → crear acuario → log medición → chat IA → logout.
5. **Actualizar `README.md`**: sección setup completa con comandos paso a paso desde `git clone` hasta `docker compose up`. Incluir prerequisites (Docker, Node 20+, Java 21+, Maven).
6. **Crear `CHANGELOG.md`**: documentar cada fase ejecutada con su fecha y commit hash. Formato Keep a Changelog.
7. **Crear `docs/architecture.md`**: diagrama de servicios (Mermaid), flujos críticos (auth, chat, scraping), referencia a ADRs.
8. **Re-auditar `NEXT_STEPS_AUDIT.md`**: marcar items resueltos con ✅ o moverlos a CHANGELOG.

### Criterios de Aceptación (QA)
- Todos los items de la sección 5 del audit (`Métricas de Done`) marcados como cumplidos.
- README permite a un desarrollador nuevo levantar el proyecto en menos de 30 minutos siguiendo solo el README.
- Tag `v1.0.0-rc1` creado en git.
- Smoke test E2E manual completo sin errores.

### Punto de Control y Git Commit
```bash
git add . && git commit -m "docs: actualizar README, CHANGELOG y arquitectura; release candidate v1.0.0-rc1"
git tag -a v1.0.0-rc1 -m "Release candidate: features completos, hardening de seguridad, tests, observabilidad"
```

---

## Apéndice A — Decisiones Arquitectónicas Documentadas (ADRs)

Durante la ejecución de este plan se generarán los siguientes ADRs en `docs/architecture-decisions/`:

| ADR | Título | Fase |
|-----|--------|------|
| ADR-001 | JWT Storage Strategy (localStorage vs HttpOnly Cookie) | 3 |
| ADR-002 | Observability Stack (Actuator + Logback JSON + Sentry) | 11 |

Cada ADR sigue formato: **Context · Decision · Consequences**.

---

## Apéndice B — Mapping Audit → Fases

Trazabilidad inversa: cada hallazgo del audit asignado a la fase que lo resuelve.

| Hallazgo | Fase |
|----------|------|
| S-1, S-2, S-4, S-7, S-8, S-9 | Fase 1 |
| S-3 (mitigado) | Fase 3 (ADR-001) + Fase 11 (CSP) |
| S-5 (rate limit login) | Fase 11 (vía Traefik) |
| S-6 (password policy) | Fase 3 |
| S-10 (CSRF) | N/A (no migramos a cookies) |
| B-1 | Fase 4 |
| B-2 | Fase 2 |
| B-3 | Fase 3 (interceptor mejorado) |
| B-4, B-5 | Fase 5 + Fase 8 |
| B-6 | Fase 4 |
| B-7 | Fase 4 (validación backend ya parcial; solo se refuerza) |
| B-8 | Fase 3 |
| B-9 | Fase 4 |
| B-10 | Fase 8 |
| B-11 | Fase 4 |
| B-12 | Fase 4 + Fase 5 |
| P-1, P-2 | Fase 4 |
| P-3 | Fase 11 (Cache-Control via Nginx/Traefik) |
| P-4, P-5 | Fase 9 (lazy load Recharts) |
| P-6, P-7 | Fase 11 |
| E-1 a E-6 | Fase 5 |
| T-1 a T-4 | Fase 7 |
| T-5, T-6, T-7 | Fase 10 |
| T-8 | Fase 7 |
| T-9 | Fase 9 |

---

## Apéndice C — Cómo usar este plan con un agente Sonnet

Prompt sugerido para el agente ejecutor:

> Eres un desarrollador full-stack ejecutando el `MASTER_ACTION_PLAN.md` del proyecto Thalassa.
> Tu tarea: **ejecuta la Fase N** de forma completa. Lee el archivo `MASTER_ACTION_PLAN.md`, localiza la fase, sigue cada paso de "Instrucciones de Ejecución" en orden, valida con los "Criterios de Aceptación" y termina con el "Git Commit" exacto especificado.
> Reglas:
> 1. NO avances a la siguiente fase sin completar el commit y validar QA.
> 2. Si encuentras un blocker (dependencia incompatible, archivo no existe, test falla persistentemente), DETENTE y reporta.
> 3. Después de cada cambio significativo, ejecuta `npm run typecheck` (frontend) o `mvn compile` (backend) para detectar regresiones temprano.
> 4. Cualquier desviación del plan debe quedar documentada como ADR.

---

> **Documento vivo.** Conforme avancen las fases, mover ítems resueltos al `CHANGELOG.md` y re-auditar cada 3 fases para detectar deuda técnica nueva introducida.
