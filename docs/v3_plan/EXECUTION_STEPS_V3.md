# Thalassa — EXECUTION STEPS V3

> **Documento hermano:** [MASTER_PLAN_V3.md](./MASTER_PLAN_V3.md)
> **Audiencia:** modelo de código (agente automatizado).
> **Modo de uso:** ejecutar **en orden estricto, fase por fase**. NO saltar fases. NO mezclar fases. Marcar cada `[ ]` solo cuando el criterio "Hecho cuando" se cumple.

---

## Reglas para el modelo de código

1. **Una micro-tarea = un solo archivo** (en la mayoría de casos). Si toca 2 archivos por la naturaleza del cambio, se indica explícitamente.
2. **No hagas commits intermedios automáticos.** El usuario decide cuándo commitear.
3. **Tras cada fase, ejecutar `npm run typecheck` (frontend) y `mvn compile` (backend).** Si rompe → arreglar antes de pasar a la siguiente fase.
4. **i18n: las 3 lenguas en el mismo paso.** Nunca dejes `en/` actualizado y `de/`/`es/` desfasado.
5. **No introduzcas comentarios decorativos.** Solo comentarios donde el "por qué" no es obvio.
6. **No añadas código defensivo no solicitado** (try/catch envolviendo todo, validaciones redundantes, fallbacks especulativos).
7. **Si una micro-tarea falla por una asunción incorrecta, PARA y reporta.** No improvises soluciones que no estén en el plan.

---

# FASE 0 — SETUP Y PRE-FLIGHT

> **Objetivo:** dejar el entorno listo para los cambios. Cero código de feature todavía.

- [ ] **0.1** Verificar que la rama actual es `fix/qa-polish` (o crear nueva rama `feat/v3-audit` desde ella).
  - **Hecho cuando:** `git branch --show-current` devuelve la rama esperada.

- [ ] **0.2** Frontend: instalar `canvas-confetti`.
  - **Comando:** `cd frontend && npm install canvas-confetti && npm install --save-dev @types/canvas-confetti`.
  - **Archivo afectado:** [frontend/package.json](../../frontend/package.json), [frontend/package-lock.json](../../frontend/package-lock.json).
  - **Hecho cuando:** `package.json` lista `canvas-confetti` en `dependencies` y `@types/canvas-confetti` en `devDependencies`.

- [ ] **0.3** Verificar que el script OpenAPI regen del frontend funciona.
  - **Comando:** revisar `frontend/package.json` por un script tipo `"openapi:generate"` o similar. Si existe, ejecutar `npm run openapi:generate` (sin cambios todavía) y verificar que termina sin errores.
  - **Hecho cuando:** el comando termina exit 0 y no genera diff inesperado en `frontend/src/api/generated/`.

- [ ] **0.4** Verificar el build del backend Java.
  - **Comando:** `cd backend && ./mvnw compile` (o `mvnw.cmd compile` en Windows).
  - **Hecho cuando:** `BUILD SUCCESS`.

---

# FASE 1 — BACKEND JAVA (DTOs y servicios)

> **Objetivo:** dejar todos los endpoints y modelos del backend listos. **No tocar Python aún. No tocar frontend aún.**

## 1A — Energy Calculator

- [ ] **1A.1** Modificar el DTO de respuesta de energía para incluir `errorCode`.
  - **Archivo:** [backend/src/main/resources/openapi.yaml](../../backend/src/main/resources/openapi.yaml) (buscar el schema `EnergyResponse`).
  - **Cambio:** añadir campo opcional `errorCode: { type: string, nullable: true, enum: ['NO_EQUIPMENT', 'AQUARIUM_NOT_FOUND'], example: null }`.
  - **Hecho cuando:** al regenerar OpenAPI, la clase `EnergyResponse` Java tiene el getter/setter `getErrorCode()/setErrorCode()`.

- [ ] **1A.2** Actualizar `EnergyService` para devolver `errorCode = "NO_EQUIPMENT"` cuando no hay equipos.
  - **Archivo:** [backend/src/main/java/com/thalassa/backend/services/EnergyService.java](../../backend/src/main/java/com/thalassa/backend/services/EnergyService.java) (verificar nombre exacto en el repo si es distinto).
  - **Cambio:** en el método que construye `EnergyResponse`, antes del return:
    - Si `aquarium.getEquipment().isEmpty()` → `response.setErrorCode("NO_EQUIPMENT"); response.setEquipmentBreakdown(List.of()); response.setTotalMonthlyCost(0.0);`.
    - Si todo OK → `response.setErrorCode(null);`.
  - **Hecho cuando:** un test manual `curl GET /aquariums/{id}/energy` con un acuario sin equipo devuelve 200 con `"errorCode": "NO_EQUIPMENT"`.

## 1B — User entity + DTOs

- [ ] **1B.1** Añadir `displayName` al `User` entity.
  - **Archivo:** [backend/src/main/java/com/thalassa/backend/models/User.java](../../backend/src/main/java/com/thalassa/backend/models/User.java).
  - **Cambio:** añadir campo:
    ```java
    @Column(length = 50)
    private String displayName;
    ```
    (con su getter/setter, sea via Lombok `@Data` o manual según el patrón del archivo).
  - **Hecho cuando:** el archivo compila y `User#getDisplayName()` existe.

- [ ] **1B.2** Inicializar `displayName` con `username` para usuarios existentes.
  - **Archivo:** [backend/src/main/java/com/thalassa/backend/services/UserService.java](../../backend/src/main/java/com/thalassa/backend/services/UserService.java).
  - **Cambio:** en el método `getProfile()` (o el equivalente que mapea User → UserResponse), si `user.getDisplayName() == null`, devolver `user.getUsername()` como fallback en el response (sin persistirlo).
  - **Hecho cuando:** `GET /api/users/me` devuelve `displayName` no-null incluso para usuarios viejos.

- [ ] **1B.3** Ampliar `UpdateUserRequest` con `displayName`.
  - **Archivo:** [backend/src/main/resources/openapi.yaml](../../backend/src/main/resources/openapi.yaml) — schema `UpdateUserRequest`.
  - **Cambio:** añadir `displayName: { type: string, maxLength: 50, minLength: 1, nullable: true }`.
  - **Hecho cuando:** al regenerar, `UpdateUserRequest#getDisplayName()` existe.

- [ ] **1B.4** Ampliar `UserResponse` con `displayName`.
  - **Archivo:** [backend/src/main/resources/openapi.yaml](../../backend/src/main/resources/openapi.yaml) — schema `UserResponse`.
  - **Cambio:** añadir `displayName: { type: string }`.
  - **Hecho cuando:** al regenerar, `UserResponse#getDisplayName()` existe.

- [ ] **1B.5** Modificar `UserService#updateProfile()` para aceptar `displayName`.
  - **Archivo:** [backend/src/main/java/com/thalassa/backend/services/UserService.java](../../backend/src/main/java/com/thalassa/backend/services/UserService.java).
  - **Cambio:** si `request.getDisplayName() != null`, `user.setDisplayName(request.getDisplayName().trim());`.
  - **Hecho cuando:** `PUT /api/users/me` con body `{ "displayName": "Iker" }` persiste el cambio.

## 1C — Cambio de contraseña

- [ ] **1C.1** Crear DTO `ChangePasswordRequest` en OpenAPI.
  - **Archivo:** [backend/src/main/resources/openapi.yaml](../../backend/src/main/resources/openapi.yaml).
  - **Cambio:** añadir schema:
    ```yaml
    ChangePasswordRequest:
      type: object
      required: [currentPassword, newPassword]
      properties:
        currentPassword: { type: string, minLength: 1 }
        newPassword: { type: string, minLength: 8, maxLength: 64 }
    ```
  - **Hecho cuando:** al regenerar, la clase `ChangePasswordRequest` existe en `target/generated-sources/openapi/.../dto/`.

- [ ] **1C.2** Añadir endpoint `POST /api/users/me/password` en OpenAPI.
  - **Archivo:** [backend/src/main/resources/openapi.yaml](../../backend/src/main/resources/openapi.yaml).
  - **Cambio:** declarar el path con request body `ChangePasswordRequest` y respuestas 204 / 400.
  - **Hecho cuando:** la interfaz generada `UsersApi` (o equivalente) incluye el método `changePassword(...)`.

- [ ] **1C.3** Implementar el endpoint en `UserController`.
  - **Archivo:** [backend/src/main/java/com/thalassa/backend/controllers/UserController.java](../../backend/src/main/java/com/thalassa/backend/controllers/UserController.java).
  - **Cambio:** añadir método `changePassword(@RequestBody ChangePasswordRequest req)` que llama a `userService.changePassword(req)`.
  - **Hecho cuando:** `POST /api/users/me/password` está registrado y mapeado.

- [ ] **1C.4** Implementar `UserService#changePassword(ChangePasswordRequest req)`.
  - **Archivo:** [backend/src/main/java/com/thalassa/backend/services/UserService.java](../../backend/src/main/java/com/thalassa/backend/services/UserService.java).
  - **Cambio:** lógica:
    1. Obtener `user` actual via `getCurrentUser()` (o el patrón del repo).
    2. `if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) throw new IllegalArgumentException("INVALID_CURRENT_PASSWORD");`
    3. `user.setPassword(passwordEncoder.encode(req.getNewPassword()));`
    4. `userRepository.save(user);`
  - **Hecho cuando:** llamando con currentPassword correcto cambia el hash en DB; con incorrecto devuelve 400.

- [ ] **1C.5** Mapear `IllegalArgumentException("INVALID_CURRENT_PASSWORD")` a 400 con body `{ "errorCode": "INVALID_CURRENT_PASSWORD" }`.
  - **Archivo:** GlobalExceptionHandler (buscar `@ControllerAdvice` en `backend/src/main/java/com/thalassa/backend/`). Si no existe, crear uno mínimo o manejar dentro del controller.
  - **Hecho cuando:** `POST` con currentPassword incorrecto responde 400 con el body indicado.

## 1D — Chat context expansion

- [ ] **1D.1** Verificar/añadir el método `findFirstByAquariumIdOrderByMeasuredAtDesc` en `WaterParameterRepository`.
  - **Archivo:** `backend/src/main/java/com/thalassa/backend/repositories/WaterParameterRepository.java` (verificar ruta exacta).
  - **Cambio:** si no existe, añadir:
    ```java
    Optional<WaterParameter> findFirstByAquariumIdOrderByMeasuredAtDesc(Long aquariumId);
    ```
  - **Hecho cuando:** Spring genera la query automáticamente al arrancar (no falla en startup).

- [ ] **1D.2** Ampliar `ChatService#buildAquariumContext()` con `latestParameters`.
  - **Archivo:** [backend/src/main/java/com/thalassa/backend/services/ChatService.java](../../backend/src/main/java/com/thalassa/backend/services/ChatService.java) (líneas ~128-149).
  - **Cambio:**
    1. Inyectar `WaterParameterRepository` en el constructor del service.
    2. Crear método privado `buildLatestParameters(Long aquariumId)` que devuelve `Map<String, Object>` o `null`.
    3. En el contexto principal añadir: `context.put("latestParameters", buildLatestParameters(aquariumId));`.
  - **Hecho cuando:** logs del backend muestran el `latestParameters` no-null en la llamada al microservicio Python para un acuario con mediciones.

- [ ] **1D.3** Ampliar `livestock` en el contexto de Map<String,String> simple a Map<String, Object> rico.
  - **Archivo:** mismo `ChatService.java`.
  - **Cambio:** sustituir `livestockNames` (List<String>) por:
    ```java
    List<Map<String, Object>> livestockRich = aquarium.getLivestock().stream()
      .map(l -> Map.<String, Object>of(
        "name", l.getName(),
        "category", String.valueOf(l.getCategory()),
        "quantity", l.getQuantity(),
        "reefSafe", l.getReefSafe()
      ))
      .toList();
    context.put("livestock", livestockRich);
    ```
  - **Hecho cuando:** el log/payload muestra livestock como objetos.

- [ ] **1D.4** Ampliar `equipment` en el contexto.
  - **Archivo:** mismo `ChatService.java`.
  - **Cambio:** análogo al anterior con `name, category, powerWatts, hoursPerDay`.
  - **Hecho cuando:** el log muestra equipment como objetos.

## 1E — Scraper: seed cache + URL normalize

- [ ] **1E.1** Crear el directorio de seed.
  - **Comando:** `mkdir -p backend/src/main/resources/market-seed`.
  - **Hecho cuando:** el directorio existe.

- [ ] **1E.2** Crear `aquashop.json` con 15 productos reales (o realistas) capturados manualmente.
  - **Archivo:** `backend/src/main/resources/market-seed/aquashop.json`.
  - **Estructura:** array de `{name, price, productUrl, imgUrl, storeName}`. URLs reales con `https://`.
  - **Hecho cuando:** archivo válido JSON con length ≥ 15.

- [ ] **1E.3** Crear `icaacuarios.json` con 15 productos.
  - **Archivo:** `backend/src/main/resources/market-seed/icaacuarios.json`.
  - **Hecho cuando:** archivo válido JSON con length ≥ 15.

- [ ] **1E.4** Crear `README.md` en el seed dir documentando cómo regenerar.
  - **Archivo:** `backend/src/main/resources/market-seed/README.md`.
  - **Contenido mínimo:** "Para regenerar: navegar manualmente a la tienda, copiar 15 productos, formatear como JSON. Esto es un fallback de demo, no se actualiza automáticamente."
  - **Hecho cuando:** archivo existe.

- [ ] **1E.5** Añadir campo `fromCache` al schema `ProductsResponse` en OpenAPI.
  - **Archivo:** [backend/src/main/resources/openapi.yaml](../../backend/src/main/resources/openapi.yaml).
  - **Cambio:** añadir `fromCache: { type: boolean, default: false }` al schema de respuesta del scraper.
  - **Hecho cuando:** clase generada tiene `getFromCache()/setFromCache()`.

- [ ] **1E.6** Implementar fallback en `ScraperService`.
  - **Archivo:** [backend/src/main/java/com/thalassa/backend/services/ScraperService.java](../../backend/src/main/java/com/thalassa/backend/services/ScraperService.java).
  - **Cambio:**
    1. Inyectar `ResourceLoader` o `ObjectMapper`.
    2. Tras la llamada al Python, si `errorCode != null` o `products.isEmpty()`:
       - Intentar cargar `classpath:market-seed/{store}.json`.
       - Filtrar por keyword (`name.toLowerCase().contains(keyword.toLowerCase())`).
       - Devolver con `fromCache=true, errorCode=null`.
    3. Si el seed tampoco existe → devolver lista vacía con `errorCode=SERVICE_UNAVAILABLE, fromCache=false`.
  - **Hecho cuando:** apagando el servicio Python, una llamada a `GET /api/scraper/search?keyword=skimmer` devuelve productos con `fromCache: true`.

- [ ] **1E.7** Implementar `ScraperService#normalizeUrl()` y aplicar a `productUrl` e `imgUrl`.
  - **Archivo:** mismo `ScraperService.java`.
  - **Cambio:** añadir método privado:
    ```java
    private String normalizeUrl(String url) {
      if (url == null || url.isBlank()) return null;
      String t = url.trim();
      if (t.matches("^https?://.*")) return t;
      if (t.startsWith("//")) return "https:" + t;
      if (t.matches("^([a-z0-9-]+\\.)+[a-z]{2,}(/.*)?$")) return "https://" + t;
      return null;
    }
    ```
    Aplicarlo a cada producto antes del return: `product.setProductUrl(normalizeUrl(product.getProductUrl())); product.setImgUrl(normalizeUrl(product.getImgUrl()));`.
  - **Hecho cuando:** un producto que llegaba como `tiendanimal.com/x` ahora llega al frontend como `https://tiendanimal.com/x`.

## 1F — Verificación de Fase 1

- [ ] **1F.1** Compilar el backend.
  - **Comando:** `cd backend && ./mvnw compile`.
  - **Hecho cuando:** `BUILD SUCCESS`.

- [ ] **1F.2** Arrancar el backend y smoke-test los endpoints nuevos.
  - **Comando:** `./mvnw spring-boot:run`.
  - **Tests manuales con curl/Postman:**
    - `GET /api/users/me` → devuelve `displayName`.
    - `PUT /api/users/me` con `{"displayName": "Test"}` → 200, persiste.
    - `POST /api/users/me/password` con currentPassword incorrecta → 400.
    - `GET /aquariums/1/energy` con acuario sin equipos → 200 con `errorCode: "NO_EQUIPMENT"`.
  - **Hecho cuando:** los 4 tests pasan.

---

# FASE 2 — PYTHON (microservicio scraper + chat)

> **Objetivo:** adaptar el microservicio Python a las nuevas tiendas y al nuevo formato de contexto del chat.

> **Prerrequisito:** acceso al directorio `scraper/` del workspace. Si no existe, **saltar a Fase 3** y dejar Punto 6 como "best-effort sin tocar Python" — los cambios Java en Fase 1D ya envían el contexto enriquecido; Python lo ignorará si no está actualizado.

## 2A — Pivote de scrapers

- [ ] **2A.1** Crear `scraper/scrapers/aquashop.py`.
  - **Archivo:** `scraper/scrapers/aquashop.py`.
  - **Patrón:** copiar la estructura de `tiendanimal.py` o `kiwoko.py` (los que existan), adaptar selectores CSS al HTML real de aquashop.es.
  - **Contrato de salida:** `[{name, price, productUrl, imgUrl, storeName}]`. Las URLs deben llevar `https://` (mejor que dependa solo del normalize de Java).
  - **Hecho cuando:** llamando localmente al scraper devuelve productos reales.

- [ ] **2A.2** Crear `scraper/scrapers/icaacuarios.py`.
  - **Archivo:** `scraper/scrapers/icaacuarios.py`.
  - **Hecho cuando:** llamando localmente al scraper devuelve productos reales.

- [ ] **2A.3** Registrar las nuevas tiendas en el router del scraper.
  - **Archivo:** módulo principal del FastAPI (probablemente `scraper/app/main.py` o `scraper/main.py`).
  - **Cambio:** añadir las nuevas en el dispatcher; desactivar (no borrar) Tiendanimal y Kiwoko comentando su registro.
  - **Hecho cuando:** `GET /scrape?keyword=led&store=aquashop` responde productos.

- [ ] **2A.4** Documentar la decisión en `scraper/README.md`.
  - **Archivo:** `scraper/README.md`.
  - **Cambio:** añadir sección explicando por qué se pivotó y qué tiendas están activas.
  - **Hecho cuando:** archivo actualizado.

## 2B — System prompt expansion

- [ ] **2B.1** Localizar el módulo del chat en Python.
  - **Comando:** `grep -r "system" scraper/`. Buscar el archivo que construye el system prompt de Gemini (probablemente `scraper/chat/` o similar).
  - **Hecho cuando:** identificado el archivo (anotar la ruta exacta para el siguiente paso).

- [ ] **2B.2** Actualizar el template del system prompt para usar `latestParameters`, `livestock` rico y `equipment` rico.
  - **Archivo:** identificado en 2B.1.
  - **Cambio:** sustituir la plantilla actual por la de la sección 6 del MASTER_PLAN_V3 (formato sugerido). Manejar `latestParameters: null` con "(not measured yet)".
  - **Hecho cuando:** en logs de Python se ve el system prompt completo con valores reales del usuario.

## 2C — Verificación de Fase 2

- [ ] **2C.1** Smoke-test del chat end-to-end.
  - **Pasos:** abrir el frontend, abrir el ChatDrawer, seleccionar un acuario con mediciones, preguntar "¿está bien mi pH?".
  - **Hecho cuando:** la respuesta de Gemini cita el valor concreto del pH del usuario.

- [ ] **2C.2** Smoke-test del Market.
  - **Pasos:** abrir Market, buscar "skimmer".
  - **Hecho cuando:** devuelve productos de las nuevas tiendas (con URLs `https://`).

---

# FASE 3 — REGENERAR OPENAPI Y TIPOS TS

> **Objetivo:** asegurar que el frontend tenga los tipos correctos antes de tocar componentes.

- [ ] **3.1** Regenerar los DTOs Java.
  - **Comando:** `cd backend && ./mvnw clean compile` (el plugin OpenAPI suele correr en `generate-sources`).
  - **Hecho cuando:** `target/generated-sources/openapi/` contiene `ChangePasswordRequest.java` y `UserResponse.java` con `displayName`.

- [ ] **3.2** Regenerar los tipos TS del frontend.
  - **Comando:** `cd frontend && npm run openapi:generate` (verificar el script exacto en package.json).
  - **Hecho cuando:** `frontend/src/api/generated/schema.ts` (o equivalente) contiene `ChangePasswordRequest`, `displayName` en User, `errorCode` en EnergyResponse, `fromCache` en ProductsResponse.

- [ ] **3.3** Typecheck el frontend.
  - **Comando:** `cd frontend && npm run typecheck` (o `tsc --noEmit`).
  - **Hecho cuando:** exit 0. Si hay errores en componentes existentes por los cambios de tipos, **corregir solo los que sean compatibilidad estricta** — el resto se aborda en Fase 6.

---

# FASE 4 — i18n: NAMESPACES Y KEYS

> **Objetivo:** todas las strings nuevas en los 3 idiomas (`en/`, `de/`, `es/`). NUNCA dejar 1 o 2 idiomas a medias.

> **Convención:** cada micro-tarea toca los 3 archivos a la vez. Si vas a hacer una pausa, termina los 3 antes.

## 4A — Registrar nuevos namespaces

- [ ] **4A.1** Registrar `settings` y `checkout` como namespaces.
  - **Archivo:** [frontend/src/i18n/index.ts](../../frontend/src/i18n/index.ts) (línea ~42).
  - **Cambio:** añadir `'settings'` y `'checkout'` al array `ns: [...]`.
  - **Hecho cuando:** el array contiene los 11 namespaces (los 9 existentes + 2 nuevos).

## 4B — Ampliar `calculators.json` (4 keys × 3 idiomas)

- [ ] **4B.1** Añadir `energy.missingKwhPrice`, `energy.missingKwhPriceDesc`, `energy.goToSettings`, `energy.genericError` en EN.
  - **Archivo:** [frontend/src/i18n/locales/en/calculators.json](../../frontend/src/i18n/locales/en/calculators.json).
  - **Hecho cuando:** las 4 keys existen dentro del bloque `energy: { ... }`.

- [ ] **4B.2** Mismas 4 keys en DE.
  - **Archivo:** [frontend/src/i18n/locales/de/calculators.json](../../frontend/src/i18n/locales/de/calculators.json).
  - **Hecho cuando:** las 4 keys existen.

- [ ] **4B.3** Mismas 4 keys en ES.
  - **Archivo:** [frontend/src/i18n/locales/es/calculators.json](../../frontend/src/i18n/locales/es/calculators.json).
  - **Hecho cuando:** las 4 keys existen.

> Valores en MASTER_PLAN_V3, sección 1.

## 4C — Modificar `nav.json` (2 add, 1 del × 3)

- [ ] **4C.1** EN: añadir `sectionConfig`, `settings`. Eliminar `sectionAssistant`.
  - **Archivo:** [frontend/src/i18n/locales/en/nav.json](../../frontend/src/i18n/locales/en/nav.json).
  - **Hecho cuando:** el archivo contiene las 2 keys nuevas y NO contiene `sectionAssistant`.

- [ ] **4C.2** DE: idem.
  - **Archivo:** [frontend/src/i18n/locales/de/nav.json](../../frontend/src/i18n/locales/de/nav.json).
  - **Hecho cuando:** misma condición.

- [ ] **4C.3** ES: idem.
  - **Archivo:** [frontend/src/i18n/locales/es/nav.json](../../frontend/src/i18n/locales/es/nav.json).
  - **Hecho cuando:** misma condición.

## 4D — Ampliar `market.json` (3 keys × 3)

- [ ] **4D.1** EN: añadir `cachedDataNotice`, `unavailable`, `noUrl`.
  - **Archivo:** [frontend/src/i18n/locales/en/market.json](../../frontend/src/i18n/locales/en/market.json).
  - **Hecho cuando:** las 3 keys existen.

- [ ] **4D.2** DE: idem.
  - **Archivo:** [frontend/src/i18n/locales/de/market.json](../../frontend/src/i18n/locales/de/market.json).

- [ ] **4D.3** ES: idem.
  - **Archivo:** [frontend/src/i18n/locales/es/market.json](../../frontend/src/i18n/locales/es/market.json).

## 4E — Crear `settings.json` (22 keys × 3, namespace nuevo)

- [ ] **4E.1** EN: crear el archivo con las 22 keys.
  - **Archivo:** `frontend/src/i18n/locales/en/settings.json` (NUEVO).
  - **Estructura:** ver tabla en MASTER_PLAN_V3 sección 4. Estructura sugerida:
    ```json
    {
      "pageTitle": "...",
      "account": { "title": "...", "username": "...", ... },
      "preferences": { ... },
      "security": { ... },
      "plan": { ... },
      "saved": "...",
      "editButton": "..."
    }
    ```
  - **Hecho cuando:** archivo válido JSON con todas las keys del MASTER_PLAN.

- [ ] **4E.2** DE: copiar estructura, traducir.
  - **Archivo:** `frontend/src/i18n/locales/de/settings.json` (NUEVO).
  - **Hecho cuando:** mismas keys con valores en alemán.

- [ ] **4E.3** ES: copiar estructura, traducir.
  - **Archivo:** `frontend/src/i18n/locales/es/settings.json` (NUEVO).

## 4F — Crear `checkout.json` (17 keys × 3, namespace nuevo)

- [ ] **4F.1** EN: crear archivo.
  - **Archivo:** `frontend/src/i18n/locales/en/checkout.json` (NUEVO).
  - **Hecho cuando:** las 17 keys existen.

- [ ] **4F.2** DE: idem.
  - **Archivo:** `frontend/src/i18n/locales/de/checkout.json` (NUEVO).

- [ ] **4F.3** ES: idem.
  - **Archivo:** `frontend/src/i18n/locales/es/checkout.json` (NUEVO).

## 4G — Verificación de Fase 4

- [ ] **4G.1** Verificar paridad de keys entre los 3 idiomas para cada namespace tocado.
  - **Tarea:** para cada par de namespaces (calculators, nav, market, settings, checkout) abrir los 3 archivos y confirmar que tienen exactamente el mismo set de keys (orden incluido, idealmente).
  - **Hecho cuando:** las 5 verificaciones pasan.

- [ ] **4G.2** Smoke-test de carga del namespace.
  - **Comando:** `cd frontend && npm run dev`. Abrir la app en navegador, verificar que no hay warnings tipo `i18next::translator: missingKey`.
  - **Hecho cuando:** consola limpia.

---

# FASE 5 — UTILS Y HOOKS

> **Objetivo:** crear las utilidades reutilizables y los hooks de mutación que necesitan los componentes de la Fase 6.

- [ ] **5.1** Crear `frontend/src/lib/url.ts` con `normalizeExternalUrl`.
  - **Archivo:** `frontend/src/lib/url.ts` (NUEVO).
  - **Contenido exacto:** ver MASTER_PLAN_V3 sección 8.
  - **Hecho cuando:** archivo creado, exporta la función.

- [ ] **5.2** Crear `frontend/src/lib/url.test.ts` con los 10+ casos.
  - **Archivo:** `frontend/src/lib/url.test.ts` (NUEVO).
  - **Contenido:** tests Vitest/Jest cubriendo los casos del MASTER_PLAN_V3.
  - **Comando para validar:** `cd frontend && npm run test -- url.test`.
  - **Hecho cuando:** los 10 tests pasan.

- [ ] **5.3** Crear `frontend/src/lib/confetti.ts`.
  - **Archivo:** `frontend/src/lib/confetti.ts` (NUEVO).
  - **Contenido:** función `fireConfetti()` del MASTER_PLAN_V3 sección 5.
  - **Hecho cuando:** archivo creado, exporta la función.

- [ ] **5.4** Crear hook `useChangePassword`.
  - **Archivo:** `frontend/src/hooks/queries/useChangePassword.ts` (NUEVO).
  - **Patrón:** seguir el estilo de `useUpdateProfile` (mutación react-query, toast.success en onSuccess, toast.error con i18n key en onError mapeando el `errorCode` del backend).
  - **API:** `POST /api/users/me/password` (usar el cliente OpenAPI generado).
  - **Hecho cuando:** el hook compila y `.mutate({ currentPassword, newPassword })` invoca el endpoint correcto.

- [ ] **5.5** Actualizar el hook `useEnergyCalc` para exponer `errorCode`.
  - **Archivo:** [frontend/src/hooks/queries/useEnergyCalc.ts](../../frontend/src/hooks/queries/useEnergyCalc.ts).
  - **Cambio:** la `data` retornada ya contiene `errorCode` por el cambio de tipo OpenAPI. Verificar que el hook no lo está descartando en un mapeo intermedio.
  - **Hecho cuando:** `data?.errorCode` está disponible en el componente consumidor.

- [ ] **5.6** Verificar que `useUpdateProfile` puede aceptar `displayName` en el payload.
  - **Archivo:** [frontend/src/hooks/queries/useUpdateProfile.ts](../../frontend/src/hooks/queries/useUpdateProfile.ts) (verificar nombre exacto).
  - **Cambio:** si el tipo del payload está hardcodeado, ampliarlo. Si usa el tipo OpenAPI, ya está cubierto por la regeneración.
  - **Hecho cuando:** `updateProfile({ displayName: "Iker" })` typechequea sin errores.

---

# FASE 6 — COMPONENTES UI

> **Objetivo:** todos los cambios visuales y de estado.

> **Orden interno:** primero componentes de bajo nivel (NotificationBell), luego páginas existentes modificadas, luego páginas nuevas. Dentro de cada bloque, una task por archivo.

## 6A — NotificationBell viewport-aware

- [ ] **6A.1** Eliminar la prop `align` y añadir detección viewport-aware.
  - **Archivo:** [frontend/src/components/shared/NotificationBell.tsx](../../frontend/src/components/shared/NotificationBell.tsx).
  - **Cambio:**
    1. Eliminar `interface NotificationBellProps { align?: ... }`.
    2. Eliminar la prop `align` del export default.
    3. Añadir `const [side, setSide] = useState<'left' | 'right'>('right');`.
    4. Añadir `const panelRef = useRef<HTMLDivElement>(null);`.
    5. Añadir `useLayoutEffect` que se dispara al cambiar `open` a true:
       ```tsx
       useLayoutEffect(() => {
         if (!open || !panelRef.current) return;
         const rect = panelRef.current.getBoundingClientRect();
         const vw = window.innerWidth;
         if (rect.right > vw - 8) setSide('right');
         else if (rect.left < 8) setSide('left');
       }, [open]);
       ```
    6. Setear estado inicial de `side` en función de la posición del **botón** al abrir (medir `ref.current.getBoundingClientRect()` en un `useEffect(() => { if (!open) return; const r = ref.current?.getBoundingClientRect(); if (!r) return; setSide(r.left > window.innerWidth / 2 ? 'right' : 'left'); }, [open]);`).
    7. En el panel, añadir `ref={panelRef}` y reemplazar la clase de align por `side === 'left' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'`.
    8. Añadir clases de animación: `transition-transform duration-150 transform-gpu`.
  - **Hecho cuando:** typechequea, abre el dropdown sin salirse en sidebar y en mobile.

- [ ] **6A.2** Eliminar la prop `align` de los call-sites.
  - **Archivo 1:** [frontend/src/components/layout/Sidebar.tsx](../../frontend/src/components/layout/Sidebar.tsx) línea ~70 → cambiar `<NotificationBell align="left" />` por `<NotificationBell />`. Eliminar el comentario obsoleto sobre `align`.
  - **Archivo 2:** [frontend/src/components/layout/GestorLayout.tsx](../../frontend/src/components/layout/GestorLayout.tsx) — buscar `<NotificationBell` y limpiar prop si la pasa.
  - **Hecho cuando:** no quedan call-sites con `align=...`.

## 6B — Sidebar reorganización

- [ ] **6B.1** Reorganizar el Sidebar a la estructura del MASTER_PLAN_V3 sección 2.
  - **Archivo:** [frontend/src/components/layout/Sidebar.tsx](../../frontend/src/components/layout/Sidebar.tsx).
  - **Cambios concretos:**
    1. Mover el botón "AI Assistant" (líneas ~136-150) DENTRO del bloque HERRAMIENTAS, después de Energy Calculator.
    2. Eliminar el bloque `{/* ── ASISTENTE ── */}` y su `<NavSection label={t('sectionAssistant')} />`.
    3. Añadir nuevo bloque `{/* ── CONFIGURACIÓN ── */}` con `<NavSection label={t('sectionConfig')} />`.
    4. Mover el `<NavLink to="/dashboard/profile">` DENTRO de ese bloque.
    5. Añadir un nuevo `<NavLink to="/dashboard/profile/settings">` con icono `Settings` (lucide-react) y label `t('settings')`.
    6. Mantener el separador y el bloque inferior de Logout intactos.
  - **Hecho cuando:** la pantalla muestra los 4 títulos de sección y los items en el orden correcto.

## 6C — EnergyCalcPage

- [ ] **6C.1** Añadir validación de `kwhPrice` y discriminación de errorCode.
  - **Archivo:** [frontend/src/features/calculators/EnergyCalcPage.tsx](../../frontend/src/features/calculators/EnergyCalcPage.tsx).
  - **Cambios:**
    1. Importar `useAuthStore`.
    2. En el componente principal, leer `const kwhPrice = useAuthStore(s => s.user?.kwhPrice);`.
    3. Tras el selector de acuario, antes del bloque de resultados, añadir:
       ```tsx
       {selectedId !== null && (!kwhPrice || kwhPrice <= 0) && (
         <MissingKwhPriceState />
       )}
       ```
    4. Crear componente local `<MissingKwhPriceState />` que use las nuevas keys `energy.missingKwhPrice`, `energy.missingKwhPriceDesc`, `energy.goToSettings` y un botón → `navigate('/dashboard/profile/settings#energy')`.
    5. Reemplazar el bloque `isError` por un switch sobre `data?.errorCode`:
       - `errorCode === 'NO_EQUIPMENT'` → componente actual con `t('energy.noEquipment')`.
       - `errorCode == null && data` → `<EnergyResults />`.
       - Otherwise → `<GenericErrorState />` con `t('energy.genericError')`.
    6. Solo mostrar resultados si `kwhPrice > 0` Y selectedId no es null.
  - **Hecho cuando:** los 4 estados visuales del MASTER_PLAN_V3 sección 1 funcionan.

## 6D — ProfilePage (reducir a resumen)

- [ ] **6D.1** Convertir ProfilePage en un resumen + CTA "Editar ajustes".
  - **Archivo:** [frontend/src/features/profile/ProfilePage.tsx](../../frontend/src/features/profile/ProfilePage.tsx).
  - **Cambios:**
    1. Eliminar el `<SettingsForm />` embebido.
    2. Mostrar tarjeta resumen con: avatar placeholder (icono User), `displayName` (fallback `username`), `email`, `plan` badge.
    3. Añadir botón principal `<Button>Editar ajustes</Button>` → `navigate('/dashboard/profile/settings')`. Usar `t('settings:editButton')`.
    4. Mantener el botón "Go ReefMaster" si `plan === 'FREE'`, redirigiendo ahora a `/dashboard/checkout`.
  - **Hecho cuando:** la página muestra un resumen compacto y el CTA navega a settings.

## 6E — SettingsPage (NUEVO) y subcomponentes

- [ ] **6E.1** Crear el layout principal `SettingsPage`.
  - **Archivo:** `frontend/src/features/profile/SettingsPage.tsx` (NUEVO).
  - **Estructura:**
    ```tsx
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-8">
      <h1>{t('pageTitle')}</h1>
      <AccountForm />
      <PreferencesForm /> {/* extraer del antiguo SettingsForm */}
      <ChangePasswordForm />
      <PlanSection />
    </div>
    ```
  - **Hecho cuando:** la página renderiza las 4 secciones (con secciones placeholder si los subcomponentes no están listos).

- [ ] **6E.2** Crear `AccountForm`.
  - **Archivo:** `frontend/src/features/profile/components/AccountForm.tsx` (NUEVO).
  - **Contenido:**
    - Campos readonly: username, email.
    - Campo editable: `displayName` con `useUpdateProfile` y toast en success.
    - Validación: min 1, max 50 chars.
  - **Hecho cuando:** edita y persiste `displayName`.

- [ ] **6E.3** Extraer `PreferencesForm` desde el antiguo `SettingsForm`.
  - **Archivo:** `frontend/src/features/profile/components/PreferencesForm.tsx` (NUEVO).
  - **Contenido:** los 4 campos actuales (electricityPriceKwh, temperatureUnit, volumeUnit, locale) usando las keys del namespace `settings.preferences.*`.
  - **Hecho cuando:** funciona igual que antes pero leyendo las keys del nuevo namespace.

- [ ] **6E.4** Crear `ChangePasswordForm`.
  - **Archivo:** `frontend/src/features/profile/components/ChangePasswordForm.tsx` (NUEVO).
  - **Contenido:**
    - 3 inputs type=password: currentPassword, newPassword, confirmNewPassword.
    - Validaciones frontend: newPassword === confirmNewPassword (error key `security.mismatch`), newPassword.length >= 8 (key `security.weakPassword`).
    - Submit → `useChangePassword().mutate({ currentPassword, newPassword })`.
    - On success: toast con `security.passwordChanged`, limpiar el formulario.
    - On error con `errorCode === 'INVALID_CURRENT_PASSWORD'` → toast con `security.invalidCurrent`.
  - **Hecho cuando:** los 3 paths (success, mismatch, invalid current) funcionan.

- [ ] **6E.5** Crear `PlanSection`.
  - **Archivo:** `frontend/src/features/profile/components/PlanSection.tsx` (NUEVO).
  - **Contenido:** badge del plan + CTA "Hazte ReefMaster" si FREE → `navigate('/dashboard/checkout')`.
  - **Hecho cuando:** muestra el plan y el CTA condicional.

## 6F — CheckoutPage (NUEVO)

- [ ] **6F.1** Crear `CheckoutPage`.
  - **Archivo:** `frontend/src/features/checkout/CheckoutPage.tsx` (NUEVO).
  - **Estructura:**
    ```tsx
    <div className="max-w-4xl mx-auto p-6 grid lg:grid-cols-[1fr_320px] gap-8">
      <CardForm onSuccess={handleSuccess} />
      <PlanSummary />
    </div>
    ```
    Donde `handleSuccess` ejecuta: `fireConfetti()`, `toast.success(t('welcomeReefMaster'))`, `navigate('/dashboard?upgraded=1', { replace: true })`.
  - **Hecho cuando:** la página renderiza ambos subcomponentes.

- [ ] **6F.2** Crear `CardForm`.
  - **Archivo:** `frontend/src/features/checkout/components/CardForm.tsx` (NUEVO).
  - **Contenido:**
    - 4 inputs: cardNumber, cardholder, expiry, cvv.
    - Input mask: cardNumber con espacios cada 4 dígitos, expiry como MM/YY automático, cvv solo dígitos.
    - Validaciones cosméticas según MASTER_PLAN_V3 sección 5.
    - Submit handler:
      ```ts
      setSubmitting(true);
      await new Promise(r => setTimeout(r, 1200));
      try {
        await simulateUpgrade();
        onSuccess();
      } catch (e) {
        toast.error(t('errors.invalidCard'));
        setSubmitting(false);
      }
      ```
    - Botón con estado `processing` que muestra spinner.
  - **Hecho cuando:** validación visible inline, submit dispara success path.

- [ ] **6F.3** Crear `PlanSummary`.
  - **Archivo:** `frontend/src/features/checkout/components/PlanSummary.tsx` (NUEVO).
  - **Contenido:** lateral sticky mostrando: nombre del plan ("ReefMaster"), precio ($4.99/mo), lista de features incluidas (reusar la lista del LandingPage), disclaimer `t('disclaimer')`.
  - **Hecho cuando:** se renderiza correctamente y es responsive.

## 6G — DashboardView (banner de upgrade)

- [ ] **6G.1** Añadir banner "You're a ReefMaster now" cuando `?upgraded=1`.
  - **Archivo:** [frontend/src/features/dashboard/DashboardView.tsx](../../frontend/src/features/dashboard/DashboardView.tsx).
  - **Cambios:**
    1. Importar `useSearchParams` de react-router-dom.
    2. `const [params, setParams] = useSearchParams();`
    3. `const [showBanner, setShowBanner] = useState(params.get('upgraded') === '1');`
    4. `useEffect` al montar: si `showBanner`, llamar `setParams({}, { replace: true })` para limpiar el query param. Auto-cerrar el banner a los 8s con `setTimeout`.
    5. Renderizar banner en la parte superior del dashboard cuando `showBanner` con título `t('checkout:bannerTitle')`, subtítulo `t('checkout:bannerSubtitle')`, y botón X para cerrarlo.
  - **Hecho cuando:** tras checkout exitoso, se ve el banner; desaparece a los 8s o con click en X; el query param se limpia.

- [ ] **6G.2** Mostrar `PlanCard` con CTA si el usuario es FREE.
  - **Archivo:** mismo `DashboardView.tsx` (o crear `frontend/src/features/dashboard/components/PlanCard.tsx`).
  - **Cambios:** si `user.plan === 'FREE'`, mostrar una tarjeta lateral o destacada con título "Hazte ReefMaster" + botón → `/dashboard/checkout`.
  - **Hecho cuando:** la tarjeta solo se ve cuando el plan es FREE.

## 6H — LandingPage (botón ReefMaster)

- [ ] **6H.1** Cambiar la lógica del botón "Go ReefMaster" del bloque pricing.
  - **Archivo:** [frontend/src/features/landing/LandingPage.tsx](../../frontend/src/features/landing/LandingPage.tsx) (función `Pricing`, líneas ~210-233).
  - **Cambios:**
    1. Importar `useAuthStore` y `useNavigate`.
    2. Sustituir `<Link to="/register">` envolviendo el botón "Go ReefMaster" por un `<Button onClick={...}>` que:
       - Si `useAuthStore.getState().user` existe → `navigate('/dashboard/checkout')`.
       - Si no → `navigate('/register?next=/dashboard/checkout')`.
    3. Cambiar el texto del botón a `t('checkout:goReefMaster')`.
  - **Hecho cuando:** las 2 ramas funcionan según logueo.

- [ ] **6H.2** Hacer que `RegisterPage` honre el query param `next`.
  - **Archivo:** buscar el RegisterPage (probablemente `frontend/src/features/auth/RegisterPage.tsx`).
  - **Cambios:** tras un registro exitoso, leer `searchParams.get('next')` y redirigir allí en vez de al dashboard genérico. Si no hay `next`, comportamiento actual.
  - **Hecho cuando:** registrarse desde `/register?next=/dashboard/checkout` lleva a checkout tras success.

## 6I — MarketPage (URL normalize + cached badge)

- [ ] **6I.1** Aplicar `normalizeExternalUrl` al productUrl.
  - **Archivo:** [frontend/src/features/market/MarketPage.tsx](../../frontend/src/features/market/MarketPage.tsx) líneas ~99-116.
  - **Cambios:**
    1. Importar `normalizeExternalUrl` de `@/lib/url`.
    2. En el `<ProductCard />`, antes del JSX del botón, calcular `const safeUrl = normalizeExternalUrl(product.productUrl);`.
    3. Cambiar la condición de renderizado a `{safeUrl ? <a href={safeUrl} ...>...</a> : <span>{t('noUrl')}</span>}`.
  - **Hecho cuando:** producto con URL relativa abre `https://...` en pestaña nueva.

- [ ] **6I.2** Mostrar badge "Mostrando datos cacheados" cuando `fromCache === true`.
  - **Archivo:** mismo `MarketPage.tsx`.
  - **Cambios:**
    1. Leer `fromCache` de la respuesta del scraper.
    2. Si true, mostrar un banner gris arriba del grid con `t('cachedDataNotice')`.
  - **Hecho cuando:** apagando el Python service, el badge aparece.

## 6J — WishlistPage (URL normalize)

- [ ] **6J.1** Aplicar `normalizeExternalUrl` en el icono de enlace.
  - **Archivo:** [frontend/src/features/wishlist/WishlistPage.tsx](../../frontend/src/features/wishlist/WishlistPage.tsx) líneas ~88-95.
  - **Cambios:** mismo patrón que MarketPage. Si `safeUrl == null`, ocultar el icono completamente (no mostrar fallback porque es solo un icono, no un botón principal).
  - **Hecho cuando:** items con URL inválida no muestran el icono; items con URL válida abren en pestaña nueva.

## 6K — Verificación de Fase 6

- [ ] **6K.1** Typecheck completo.
  - **Comando:** `cd frontend && npm run typecheck`.
  - **Hecho cuando:** exit 0.

- [ ] **6K.2** Lint.
  - **Comando:** `cd frontend && npm run lint`.
  - **Hecho cuando:** exit 0 (warnings aceptables, errores no).

---

# FASE 7 — ROUTING

> **Objetivo:** registrar las nuevas rutas.

- [ ] **7.1** Registrar `/dashboard/profile/settings`.
  - **Archivo:** `frontend/src/router/AppRouter.tsx` (verificar nombre exacto).
  - **Cambio:** dentro del bloque `<Route path="/dashboard/*" ...>`, añadir `<Route path="profile/settings" element={<SettingsPage />} />`. Asegurar que el orden permite el match correcto (más específico primero si hace falta).
  - **Hecho cuando:** navegar a `/dashboard/profile/settings` renderiza la página.

- [ ] **7.2** Registrar `/dashboard/checkout`.
  - **Archivo:** mismo router.
  - **Cambio:** añadir `<Route path="checkout" element={<CheckoutPage />} />` dentro del dashboard guard.
  - **Hecho cuando:** navegar a `/dashboard/checkout` renderiza CheckoutPage; si no hay sesión, redirige a login.

---

# FASE 8 — QA MANUAL

> **Objetivo:** validar end-to-end cada uno de los 8 puntos. **No skipear ninguno.**

## 8A — Energy Calculator

- [ ] **8A.1** Login con usuario que tiene `kwhPrice = null`. Ir a Energy Calc, seleccionar un acuario con equipos. **Esperado:** ve "Configura tu precio de la luz" con CTA a settings.

- [ ] **8A.2** Login con usuario que tiene `kwhPrice = 0.18`. Seleccionar acuario sin equipos. **Esperado:** ve "Este acuario no tiene equipos".

- [ ] **8A.3** Mismo usuario, seleccionar acuario CON equipos. **Esperado:** ve los resultados normales.

- [ ] **8A.4** Apagar backend, recargar la calculadora. **Esperado:** ve "No se pudo calcular el consumo. Inténtalo de nuevo." (no "no tienes equipo").

## 8B — Sidebar

- [ ] **8B.1** Abrir el dashboard en desktop ≥768px. **Esperado:** ver 4 títulos `INICIO / HERRAMIENTAS / EXPLORAR / CONFIGURACIÓN`.

- [ ] **8B.2** Click en "AI Assistant" dentro de Herramientas. **Esperado:** se abre el chat drawer.

- [ ] **8B.3** Click en "Settings". **Esperado:** navega a `/dashboard/profile/settings`.

- [ ] **8B.4** Cambiar idioma a `de` y `es`. **Esperado:** los 4 títulos están traducidos.

## 8C — Scraping

- [ ] **8C.1** Con Python service ON, buscar "skimmer" en Market. **Esperado:** ver productos de las nuevas tiendas, sin badge de cache.

- [ ] **8C.2** Con Python service OFF, buscar "skimmer". **Esperado:** ver productos del seed con badge "Mostrando datos cacheados".

- [ ] **8C.3** Click en "Ver producto" de cualquier card. **Esperado:** abre el sitio externo en pestaña nueva.

## 8D — User Settings

- [ ] **8D.1** En `/dashboard/profile/settings`, cambiar `displayName` a "Tester". **Esperado:** toast success, sidebar/header reflejan el cambio.

- [ ] **8D.2** Cambiar electricityPrice a 0.20. **Esperado:** Energy Calc usa 0.20 en el siguiente cálculo.

- [ ] **8D.3** Cambiar password con currentPassword incorrecta. **Esperado:** toast "La contraseña actual no es correcta".

- [ ] **8D.4** Cambiar password con currentPassword correcta + newPassword 8+ chars. **Esperado:** toast "Contraseña actualizada". Logout y login con la nueva password funciona.

- [ ] **8D.5** Cambiar password con newPassword < 8 chars. **Esperado:** error inline "al menos 8 caracteres", no llega al backend.

## 8E — Checkout

- [ ] **8E.1** En LandingPage SIN sesión, click "Go ReefMaster". **Esperado:** redirige a `/register?next=/dashboard/checkout`.

- [ ] **8E.2** En LandingPage CON sesión FREE, click "Go ReefMaster". **Esperado:** redirige a `/dashboard/checkout`.

- [ ] **8E.3** En CheckoutPage, submit con tarjeta `1234 5678 9012 3456`, cardholder "Test User", expiry "12/30", cvv "123". **Esperado:** spinner 1.2s → confeti → toast → redirige a `/dashboard?upgraded=1`.

- [ ] **8E.4** Tras la redirección, el banner "You're a ReefMaster now" aparece. **Esperado:** desaparece a los 8s o al click en X.

- [ ] **8E.5** El query param `?upgraded=1` se limpia de la URL. **Esperado:** URL = `/dashboard`.

- [ ] **8E.6** Recargar el dashboard. **Esperado:** plan badge muestra REEFMASTER, calculadoras sin PRO badge.

- [ ] **8E.7** Submit con CVV de 2 dígitos. **Esperado:** error inline.

- [ ] **8E.8** Submit con tarjeta `0000 0000 0000 0000`. **Esperado:** error "Tarjeta inválida (demo)".

## 8F — AI Chat

- [ ] **8F.1** Abrir un acuario con mediciones (pH, salinidad…). Abrir el chat. Preguntar "¿está bien mi pH?". **Esperado:** respuesta concreta citando el valor del usuario.

- [ ] **8F.2** Abrir un acuario sin mediciones. Preguntar lo mismo. **Esperado:** la IA sugiere registrar mediciones primero.

- [ ] **8F.3** Preguntar "¿qué equipo tengo?". **Esperado:** lista los equipos con sus watts y horas.

## 8G — Notification Bell

- [ ] **8G.1** En desktop, click en la campana del sidebar. **Esperado:** dropdown se abre hacia la derecha sin cortarse.

- [ ] **8G.2** En mobile (DevTools 375px), click en la campana fixed. **Esperado:** dropdown se abre hacia la izquierda sin cortarse.

- [ ] **8G.3** Resize del viewport con dropdown abierto, cerrar y reabrir. **Esperado:** se recalcula la dirección.

## 8H — Market URL fix

- [ ] **8H.1** Buscar productos. Click en "Ver producto" de cualquier card. **Esperado:** se abre el sitio en pestaña nueva (NO redirige a login).

- [ ] **8H.2** En la wishlist, click en el icono de enlace. **Esperado:** se abre en pestaña nueva.

- [ ] **8H.3** Inspeccionar un producto cuya URL es relativa. **Esperado:** el `<a href>` tiene `https://` prepended.

---

# FASE 9 — CIERRE

- [ ] **9.1** Final typecheck + build.
  - **Comandos:**
    - `cd frontend && npm run typecheck && npm run build`.
    - `cd backend && ./mvnw clean package`.
  - **Hecho cuando:** ambos exit 0.

- [ ] **9.2** Actualizar el `CHANGELOG.md`.
  - **Archivo:** [CHANGELOG.md](../../CHANGELOG.md).
  - **Cambio:** añadir sección `## v3.0.0 - YYYY-MM-DD` con los 8 puntos resumidos en bullets.
  - **Hecho cuando:** archivo actualizado.

- [ ] **9.3** Reportar al usuario qué se hizo y qué quedó pendiente.
  - **Tarea:** generar un mensaje de resumen con: features completadas, tests manuales pasados, archivos críticos modificados, cualquier punto donde se haya tenido que improvisar (con justificación).
  - **Hecho cuando:** mensaje entregado.

---

# Apéndice — Mapa de archivos por fase

| Fase | Archivos modificados | Archivos creados |
|---|---|---|
| 0 | `frontend/package.json` | — |
| 1A | `EnergyService.java`, `openapi.yaml` | — |
| 1B | `User.java`, `UserService.java`, `openapi.yaml` | — |
| 1C | `UserController.java`, `UserService.java`, `openapi.yaml` | (GlobalExceptionHandler si no existe) |
| 1D | `ChatService.java`, `WaterParameterRepository.java` | — |
| 1E | `ScraperService.java`, `openapi.yaml` | `market-seed/aquashop.json`, `market-seed/icaacuarios.json`, `market-seed/README.md` |
| 2A | `scraper/main.py` (o equivalente), `scraper/README.md` | `scraper/scrapers/aquashop.py`, `scraper/scrapers/icaacuarios.py` |
| 2B | (system prompt module Python) | — |
| 3 | (regenerados) | — |
| 4 | `i18n/index.ts`, `en/de/es/calculators.json`, `en/de/es/nav.json`, `en/de/es/market.json` | `en/de/es/settings.json`, `en/de/es/checkout.json` |
| 5 | `useEnergyCalc.ts`, `useUpdateProfile.ts` | `lib/url.ts`, `lib/url.test.ts`, `lib/confetti.ts`, `useChangePassword.ts` |
| 6A | `NotificationBell.tsx`, `Sidebar.tsx`, `GestorLayout.tsx` | — |
| 6B | `Sidebar.tsx` | — |
| 6C | `EnergyCalcPage.tsx` | — |
| 6D | `ProfilePage.tsx` | — |
| 6E | — | `SettingsPage.tsx`, `AccountForm.tsx`, `PreferencesForm.tsx`, `ChangePasswordForm.tsx`, `PlanSection.tsx` |
| 6F | — | `CheckoutPage.tsx`, `CardForm.tsx`, `PlanSummary.tsx` |
| 6G | `DashboardView.tsx` | (`PlanCard.tsx` si se extrae) |
| 6H | `LandingPage.tsx`, `RegisterPage.tsx` | — |
| 6I | `MarketPage.tsx` | — |
| 6J | `WishlistPage.tsx` | — |
| 7 | `AppRouter.tsx` | — |
| 9 | `CHANGELOG.md` | — |

**Total:** ~30 archivos modificados, ~17 archivos creados.

---

> **Documento sellado.** No editar durante la ejecución. Si surge una desviación obligada, anotarla en una sección "Desviaciones" al final de este archivo y pedir aprobación.
