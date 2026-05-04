# Thalassa — MASTER PLAN V3

> **Versión:** v3.0 (pulido pre-presentación)
> **Base:** v1.1.0 (rama `fix/qa-polish`)
> **Documento hermano:** [EXECUTION_STEPS_V3.md](./EXECUTION_STEPS_V3.md)
> **Decisiones aprobadas:** todas las propuestas recomendadas del análisis previo + Punto 8 añadido.

---

## Índice

0. [Convenciones globales](#0-convenciones-globales)
1. [Energy Calculator — discriminación de errores](#1-energy-calculator)
2. [Sidebar Desktop — reorganización en 4 grupos](#2-sidebar-desktop)
3. [Web Scraping — pivote de tiendas + seed cache](#3-web-scraping)
4. [User Settings — página dedicada + displayName + password](#4-user-settings)
5. [Checkout Flow — FakeCheckout + confetti](#5-checkout-flow)
6. [AI Chat — extensión de contexto server-side](#6-ai-chat-context)
7. [Notification Bell — posicionamiento viewport-aware](#7-notification-bell)
8. [Market URL fix — normalizeExternalUrl](#8-market-url-fix)
9. [Estrategia i18n consolidada](#9-estrategia-i18n)
10. [Riesgos cruzados y mitigaciones](#10-riesgos-cruzados)

---

## 0. Convenciones globales

### Naming
- **i18n keys**: `camelCase.dotted` (consistente con namespaces existentes).
- **Tipos TS**: `PascalCase` para tipos/interfaces.
- **Componentes nuevos**: ubicación por feature: `frontend/src/features/<feature>/<Component>.tsx`.
- **Hooks de mutación**: prefijo `use<Verb><Noun>` → `useUpdateProfile`, `useSimulateUpgrade`.

### Reglas no negociables
1. **Toda string nueva visible al usuario debe estar en `en/`, `de/` y `es/`.** Cero hardcoding.
2. **Cambios de API → regenerar OpenAPI types** (`frontend/src/api/generated/`) antes de tocar componentes.
3. **No modificar memorias o configs globales sin pasar por `EXECUTION_STEPS_V3`.**
4. **No introducir nuevas dependencias salvo `canvas-confetti`** (decisión explícita aprobada).
5. **Cero "feature flags" o "backwards-compat shims"** — esta es la versión final pre-presentación.

### Stack relevante (recordatorio)
- React 18 + TypeScript, Zustand, react-i18next, react-router-dom, sonner.
- Spring Boot 3 + JPA, RestClient, OpenAPI generator (DTOs en `backend/target/generated-sources/openapi/`).
- Microservicio Python (FastAPI) en `localhost:8001` para scraping y chat (Gemini).

---

## 1. Energy Calculator

### Goal
Cuando el usuario abre la calculadora de energía y no ha configurado el precio del kWh, mostrar un estado claro **"Configura tu precio de la luz"** en lugar del falso **"No tienes equipo en tu acuario"**.

### Non-goals
- Modificar la fórmula de cálculo.
- Tocar el flujo de añadir equipos.

### Diagnóstico (recordatorio)
- [EnergyCalcPage.tsx:288-306](../../frontend/src/features/calculators/EnergyCalcPage.tsx#L288-L306) muestra `energy.noEquipment` ante cualquier `isError`, sin discriminar la causa.
- El componente nunca lee `user.kwhPrice` del store.
- Backend usa default y devuelve 200 OK con `electricityPriceKwh = null` cuando el usuario no lo tiene → no produce error real.

### Arquitectura de la solución

```
┌─────────────────────────────────────────────────────────────┐
│  EnergyCalcPage                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. Read user.kwhPrice from useAuthStore            │   │
│  │  2. If null/0 → render <MissingKwhPriceState />     │   │
│  │  3. Else → call useEnergyCalc(aquariumId)           │   │
│  │     ↓                                                │   │
│  │  4. Match response.errorCode:                        │   │
│  │     - 'NO_EQUIPMENT'      → <NoEquipmentState />    │   │
│  │     - 'AQUARIUM_NOT_FOUND' → <NotFoundState />      │   │
│  │     - null + data         → <EnergyResults />       │   │
│  │     - default error       → <GenericErrorState />   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Cambios backend
- Archivo: `backend/src/main/java/com/thalassa/backend/services/EnergyService.java` (o equivalente que sirva `GET /aquariums/{id}/energy`).
- Modificar `EnergyResponse` (DTO OpenAPI) para incluir un campo `errorCode: string | null`:

```jsonc
// EnergyResponse — AFTER
{
  "totalMonthlyCost": 12.34,
  "currencySymbol": "€",
  "electricityPriceKwh": 0.18,
  "equipmentBreakdown": [...],
  "errorCode": null   // ← nuevo
}
```

- Lógica del service:
  - Si el acuario no existe o no pertenece al usuario → 404 (sin cambios).
  - Si el acuario no tiene equipos → respuesta 200 con `errorCode: "NO_EQUIPMENT"`, `equipmentBreakdown: []`, `totalMonthlyCost: 0`.
  - Si existe equipo pero `user.electricityPriceKwh` es null → 200 con `errorCode: null`, breakdown calculado con default (comportamiento actual). El frontend ya filtra antes este caso.

### Cambios frontend
- **Hook**: `frontend/src/hooks/queries/useEnergyCalc.ts`. Devolver el `errorCode` directamente desde `data` (no envolver). React-Query ya maneja `isError` para errores HTTP — el `errorCode` solo es para 200 OK con estado de negocio.
- **Componente**: `EnergyCalcPage.tsx`:
  - Importar `useAuthStore`.
  - Antes de renderizar resultados, comprobar `kwhPrice`. Si falta, renderizar nuevo subcomponente `<MissingKwhPriceState />` con CTA → `/dashboard/profile/settings#energy`.
  - Sustituir la rama `isError` por un switch sobre `data?.errorCode`.

### i18n keys nuevas (`calculators.json` → bloque `energy.*`)

| key | en | de | es |
|---|---|---|---|
| `energy.missingKwhPrice` | "Set your electricity price" | "Strompreis festlegen" | "Configura tu precio de la luz" |
| `energy.missingKwhPriceDesc` | "We need your €/kWh rate to estimate monthly cost. Set it in your settings." | "Wir benötigen deinen €/kWh-Tarif, um die monatlichen Kosten zu schätzen. Lege ihn in deinen Einstellungen fest." | "Necesitamos tu tarifa €/kWh para estimar el coste mensual. Configúrala en tus ajustes." |
| `energy.goToSettings` | "Go to settings →" | "Zu den Einstellungen →" | "Ir a ajustes →" |
| `energy.genericError` | "Could not calculate consumption. Try again." | "Verbrauch konnte nicht berechnet werden. Versuche es erneut." | "No se pudo calcular el consumo. Inténtalo de nuevo." |

> Las keys actuales `energy.noEquipment` y `energy.noEquipmentDesc` se conservan: ahora **solo** se mostrarán cuando el backend devuelva `errorCode === "NO_EQUIPMENT"`.

### Estados visuales

| Condición | Componente | Color/icon |
|---|---|---|
| `!user.kwhPrice` | `<MissingKwhPriceState />` | amber-400, icono `Zap` |
| `errorCode === 'NO_EQUIPMENT'` | `<NoEquipmentState />` (existente) | gris, icono `Wrench` |
| `errorCode === null && data` | `<EnergyResults />` (existente) | normal |
| `isError` HTTP genuino | `<GenericErrorState />` (nuevo) | red-400, icono `AlertTriangle` |

### Criterios de aceptación
- [ ] Usuario con `kwhPrice = null` y acuario con equipos → ve "Configura tu precio de la luz".
- [ ] Usuario con `kwhPrice = 0.18` y acuario sin equipos → ve "Este acuario no tiene equipos".
- [ ] Usuario con `kwhPrice = 0.18` y acuario con equipos → ve resultados.
- [ ] Servidor caído → ve "No se pudo calcular el consumo. Inténtalo de nuevo."
- [ ] Las 4 keys nuevas existen en `en/de/es`.

---

## 2. Sidebar Desktop

### Goal
Reorganizar el sidebar de escritorio en 4 grupos lógicos: **INICIO / HERRAMIENTAS / EXPLORAR / CONFIGURACIÓN**, moviendo el Asistente IA dentro de Herramientas y agrupando Profile + Logout bajo Configuración.

### Non-goals
- Tocar el `BottomTabBar` mobile.
- Cambiar las rutas existentes.

### Estructura final

```
┌─ Sidebar (260px) ──────────────────────┐
│ [LOGO]            [🔔 Notification]    │
├────────────────────────────────────────┤
│ INICIO                                 │
│   ▸ Dashboard                          │
│                                        │
│ HERRAMIENTAS                           │
│   ▸ Dosing Calculator     [PRO]        │
│   ▸ Energy Calculator     [PRO]        │
│   ▸ AI Assistant                       │  ← movido aquí
│                                        │
│ EXPLORAR                               │
│   ▸ Market                             │
│   ▸ Wishlist                           │
│                                        │
│ CONFIGURACIÓN                          │
│   ▸ Profile                            │
│   ▸ Settings              [nuevo]      │  ← apunta a /dashboard/profile/settings
│                                        │
├────────────────────────────────────────┤
│   ▸ Logout                             │  ← se mantiene como bloque inferior con divisor
└────────────────────────────────────────┘
```

### Cambios frontend
- Archivo: `frontend/src/components/layout/Sidebar.tsx`.
- Reordenar las secciones existentes.
- El botón "AI Assistant" se mantiene como `<button onClick={openChat}>`, pero pasa a estar dentro del bloque HERRAMIENTAS.
- Añadir nueva sección CONFIGURACIÓN con dos NavLinks: Profile (`/dashboard/profile`) y Settings (`/dashboard/profile/settings`).
- Logout queda en el bloque inferior con divisor (consistente, separa acción destructiva).

### i18n keys nuevas (`nav.json`)

| key | en | de | es |
|---|---|---|---|
| `sectionConfig` | "SETTINGS" | "EINSTELLUNGEN" | "CONFIGURACIÓN" |
| `settings` | "Settings" | "Einstellungen" | "Ajustes" |

> Las keys `sectionHome`, `sectionTools`, `sectionExplore`, `sectionAssistant`, `dashboard`, `dosingCalc`, `energyCalc`, `aiAssistant`, `market`, `wishlist`, `profile`, `logout` se conservan tal cual.
>
> La key `sectionAssistant` queda **sin uso** (Asistente movido a Herramientas) → eliminar de los 3 idiomas.

### Criterios de aceptación
- [ ] Sidebar muestra 4 títulos de sección: INICIO, HERRAMIENTAS, EXPLORAR, CONFIGURACIÓN.
- [ ] AI Assistant aparece dentro de HERRAMIENTAS, debajo de Energy Calculator.
- [ ] Settings link existe y navega a `/dashboard/profile/settings`.
- [ ] Logout aparece en el bloque inferior con divisor.
- [ ] Los 3 idiomas tienen `sectionConfig` y `settings`.
- [ ] La key `sectionAssistant` ha sido eliminada de los 3 idiomas.

---

## 3. Web Scraping

### Goal
Resolver el bloqueo de Tiendanimal/Kiwoko mediante: **(A)** pivotar el scraper Python a tiendas pequeñas sin protección anti-bot, **+** **(C)** un seed-cache local en Java como red de seguridad para la demo.

### Non-goals
- Implementar (B) "camuflaje pesado" con UA rotation y proxies.
- Reescribir el flujo del Market en frontend.

### Plan A — Pivote de tiendas (Python service)

**Tiendas objetivo (a auditar y validar `robots.txt`):**

| Store | Dominio | Notas |
|---|---|---|
| AquaShop.es | `aquashop.es` | Pequeña, HTML estático |
| ICA Acuarios | `icaacuarios.com` | Marina especializada |
| Aquariumline | `aquariumline.com` | Italiana, sin Cloudflare conocido |
| Marine Reef Spain | `marinereef.es` | Pequeña, marina |

**Recomendación final:** elegir **2 tiendas** en orden de prioridad después de validar manualmente que devuelven HTML accesible vía `curl` con UA estándar. Documentar la decisión en `scraper/README.md`.

**Cambios en Python (microservicio):**
- Modificar el módulo `scraper/scrapers/` para añadir 2 nuevos archivos `aquashop.py`, `icaacuarios.py` (o las elegidas).
- Adaptar selectores CSS/XPath a la estructura HTML de cada tienda.
- Mantener el contrato de salida: `{ products: [{name, price, productUrl, imgUrl, storeName}], errorCode: null }`.
- **Eliminar** o desactivar los scrapers de Tiendanimal y Kiwoko (no borrar archivos, solo desregistrar del router).

**Cambios en Java:**
- `backend/src/main/java/com/thalassa/backend/services/ScraperService.java` no cambia su firma.
- Añadir el campo `fromCache: boolean` al DTO `ProductsResponse` (vía OpenAPI).

### Plan C — Seed cache (Java backend)

**Estructura de archivos:**
```
backend/src/main/resources/market-seed/
├── aquashop.json          # 15 productos reales
├── icaacuarios.json       # 15 productos reales
└── README.md              # cómo regenerar el seed
```

**Contrato del seed JSON** (idéntico al `ProductsResponse.products[]`):
```json
[
  {
    "name": "Skimmer Aquatic Life 115",
    "price": 89.95,
    "productUrl": "https://aquashop.es/skimmer-aquatic-life-115",
    "imgUrl": "https://cdn.aquashop.es/products/abc.jpg",
    "storeName": "AquaShop"
  }
]
```

**Lógica del fallback en `ScraperService`:**
1. Llamar al Python como hasta ahora.
2. Si devuelve `errorCode != null` o lista vacía:
   - Cargar `market-seed/{storeKeyword}.json` desde el classpath.
   - Filtrar por `keyword` (case-insensitive contains en `name`).
   - Devolver con `fromCache: true`, `errorCode: null`.
3. Si el seed tampoco existe → devolver `[]` con `errorCode: SERVICE_UNAVAILABLE`, `fromCache: false`.

### Cambios frontend
- Tipo `Product` (vía OpenAPI regenerado): añadir `fromCache?: boolean`.
- En `MarketPage.tsx`: si la respuesta global tiene `fromCache: true`, mostrar un badge gris arriba del grid: "Mostrando datos cacheados".

### i18n keys nuevas (`market.json`)

| key | en | de | es |
|---|---|---|---|
| `cachedDataNotice` | "Showing cached demo data" | "Demo-Daten aus dem Cache" | "Mostrando datos cacheados (demo)" |
| `unavailable` | "Market temporarily unavailable" | "Markt vorübergehend nicht verfügbar" | "Tienda temporalmente no disponible" |

### Criterios de aceptación
- [ ] Python scrapea correctamente al menos 1 de las 2 tiendas pequeñas en producción.
- [ ] Si Python devuelve vacío, Java sirve seed-cache.
- [ ] El frontend muestra el badge "Mostrando datos cacheados" cuando aplica.
- [ ] El seed contiene mínimo 15 productos por tienda.

---

## 4. User Settings

### Goal
Crear una página `/dashboard/profile/settings` dedicada con todos los ajustes del usuario, ampliando los campos existentes con `displayName` y un cambio de contraseña.

### Non-goals
- Subida de avatar.
- Borrado de cuenta (queda para v3.1).
- Cambio de email (requiere flujo de verificación).

### Arquitectura

```
/dashboard/profile             (resumen + CTA "Edit settings")
/dashboard/profile/settings    (página completa con 3 secciones)
                  ├─ #account     → username readonly, email readonly, displayName editable
                  ├─ #preferences → kwh, temperatureUnit, volumeUnit, locale
                  ├─ #security    → currentPassword + newPassword + confirmNewPassword
                  └─ #plan        → badge + CTA upgrade (si FREE)
```

### Cambios backend

**1. User entity (`User.java`):**
- Añadir campo `displayName: String` (nullable, max 50 chars). Se inicializa con `username` si null.
- Migración Hibernate (`spring.jpa.hibernate.ddl-auto=update` lo maneja en dev — para producción añadir migración Flyway si existe).

**2. DTOs (regenerar OpenAPI):**
- `UpdateUserRequest`: añadir `displayName?: string`.
- `UserResponse`: añadir `displayName: string`.
- Nuevo DTO `ChangePasswordRequest`: `{ currentPassword: string, newPassword: string }`. Validaciones: newPassword min 8, max 64.

**3. Endpoints:**
- `PUT /api/users/me` (existente): aceptar también `displayName`.
- `POST /api/users/me/password` (nuevo):
  - Body: `ChangePasswordRequest`.
  - Validar `currentPassword` con `PasswordEncoder.matches`.
  - Si OK → encodear `newPassword` y guardar.
  - Errores: 400 `INVALID_CURRENT_PASSWORD`, 400 `WEAK_PASSWORD`.

### Cambios frontend

**1. Tipos** (regenerar OpenAPI):
- `User`: añadir `displayName: string`.
- `UpdateProfileRequest`: añadir `displayName?: string`.
- `ChangePasswordRequest`: nuevo tipo.

**2. Componentes nuevos:**
- `frontend/src/features/profile/SettingsPage.tsx` — layout principal con 4 secciones (`<AccountSection />`, `<PreferencesSection />`, `<SecuritySection />`, `<PlanSection />`).
- `frontend/src/features/profile/components/ChangePasswordForm.tsx`.
- `frontend/src/features/profile/components/AccountForm.tsx` (extrae los campos username/email readonly + displayName editable).

**3. Hooks:**
- `useUpdateProfile()` (existente): actualizar para incluir `displayName`.
- `useChangePassword()` (nuevo): mutación con react-query, toast en success/error.

**4. ProfilePage:**
- Reducir a tarjeta resumen con: avatar placeholder, displayName, email, plan badge, botón "Editar ajustes" → navigate `/dashboard/profile/settings`.

**5. Routing:**
- En `AppRouter.tsx`, dentro del bloque `/dashboard/*`, añadir ruta hija `profile/settings` que renderiza `<SettingsPage />`.

### i18n keys nuevas (nuevo namespace `settings.json`)

| key | en | de | es |
|---|---|---|---|
| `pageTitle` | "Settings" | "Einstellungen" | "Ajustes" |
| `account.title` | "Account" | "Konto" | "Cuenta" |
| `account.username` | "Username" | "Benutzername" | "Nombre de usuario" |
| `account.email` | "Email" | "E-Mail" | "Email" |
| `account.displayName` | "Display name" | "Anzeigename" | "Nombre para mostrar" |
| `account.displayNameHint` | "How others will see you in Thalassa" | "So wirst du in Thalassa angezeigt" | "Cómo te verán en Thalassa" |
| `preferences.title` | "Preferences" | "Präferenzen" | "Preferencias" |
| `preferences.electricityPrice` | "Electricity price (€/kWh)" | "Strompreis (€/kWh)" | "Precio de la luz (€/kWh)" |
| `preferences.temperatureUnit` | "Temperature unit" | "Temperatureinheit" | "Unidad de temperatura" |
| `preferences.volumeUnit` | "Volume unit" | "Volumeneinheit" | "Unidad de volumen" |
| `preferences.language` | "Language" | "Sprache" | "Idioma" |
| `security.title` | "Security" | "Sicherheit" | "Seguridad" |
| `security.currentPassword` | "Current password" | "Aktuelles Passwort" | "Contraseña actual" |
| `security.newPassword` | "New password" | "Neues Passwort" | "Contraseña nueva" |
| `security.confirmNewPassword` | "Confirm new password" | "Neues Passwort bestätigen" | "Confirma la nueva contraseña" |
| `security.changeButton` | "Change password" | "Passwort ändern" | "Cambiar contraseña" |
| `security.passwordChanged` | "Password updated" | "Passwort aktualisiert" | "Contraseña actualizada" |
| `security.invalidCurrent` | "Current password is wrong" | "Aktuelles Passwort ist falsch" | "La contraseña actual no es correcta" |
| `security.weakPassword` | "Password must be at least 8 characters" | "Das Passwort muss mindestens 8 Zeichen haben" | "La contraseña debe tener al menos 8 caracteres" |
| `security.mismatch` | "Passwords don't match" | "Passwörter stimmen nicht überein" | "Las contraseñas no coinciden" |
| `plan.title` | "Plan" | "Plan" | "Plan" |
| `saved` | "Settings saved" | "Einstellungen gespeichert" | "Ajustes guardados" |
| `editButton` | "Edit settings" | "Einstellungen bearbeiten" | "Editar ajustes" |

### Criterios de aceptación
- [ ] Ruta `/dashboard/profile/settings` accesible y renderiza 4 secciones.
- [ ] `displayName` se guarda y se refleja en el sidebar/header.
- [ ] Cambio de contraseña con `currentPassword` correcto → toast success.
- [ ] Cambio de contraseña con `currentPassword` incorrecto → mensaje "La contraseña actual no es correcta".
- [ ] Validación frontend: `newPassword === confirmNewPassword`, longitud mínima 8.
- [ ] ProfilePage queda como resumen + botón "Editar ajustes".
- [ ] Las 22 keys nuevas existen en los 3 idiomas.

---

## 5. Checkout Flow

### Goal
Convertir el botón "Go ReefMaster" en un flujo de checkout falso (formulario de tarjeta) que llama a `POST /api/users/me/simulate-upgrade`, actualiza el store global, redirige al dashboard, y muestra confeti + toast.

### Non-goals
- Integración real con Stripe / pasarela de pago.
- Persistir métodos de pago.

### Arquitectura

```
[Landing Pricing]                 [Dashboard PlanCard (FREE)]
   "Go ReefMaster"                    "Upgrade to ReefMaster"
        ↓                                    ↓
   if logged in?                       /dashboard/checkout
   ├─ no  → /register?next=/dashboard/checkout
   └─ yes → /dashboard/checkout

      ↓ (formulario fake)
   [FakeCheckoutPage]
   ┌──────────────────────────────┐
   │ Card number  [.... .... ...] │
   │ Cardholder   [Iker Garcia]   │
   │ Expiry       [MM/YY]         │
   │ CVV          [...]           │
   │                              │
   │ [Pay $4.99]                  │
   └──────────────────────────────┘
        ↓ click submit
   useSimulateUpgrade()
        ↓ onSuccess
   1. authStore.updateUser({ plan: 'REEFMASTER' })
   2. confetti.fire()
   3. toast.success(t('checkout.welcomeReefMaster'))
   4. navigate('/dashboard?upgraded=1')
        ↓
   [Dashboard]
   useEffect: si ?upgraded=1 → mostrar banner + remover query param
```

### Cambios backend
**Ninguno.** El endpoint `POST /api/users/me/simulate-upgrade` ya existe y funciona ([UserController.java:46](../../backend/src/main/java/com/thalassa/backend/controllers/UserController.java#L46)).

### Cambios frontend

**1. Dependencias:**
- `npm install canvas-confetti` (^1.9.x).
- `npm install --save-dev @types/canvas-confetti`.

**2. Componentes nuevos:**
- `frontend/src/features/checkout/CheckoutPage.tsx` — la página completa.
- `frontend/src/features/checkout/components/CardForm.tsx` — formulario con validaciones cosméticas.
- `frontend/src/features/checkout/components/PlanSummary.tsx` — recordatorio de qué se "está comprando" (sticky right column).

**3. Validaciones cosméticas (sin Luhn):**
- `cardNumber`: 13-19 dígitos, formato auto `1234 5678 9012 3456` (input mask).
- `cardholderName`: min 3 chars, solo letras y espacios.
- `expiry`: `MM/YY`, MM 1-12, YY > año actual % 100.
- `cvv`: 3 dígitos exactos.
- Rechazar `0000 0000 0000 0000` con mensaje "Tarjeta inválida (demo)".

**4. Lógica de submit:**
```typescript
const onSubmit = async (data: CheckoutFormData) => {
  // simular delay 1.2s para parecer real
  await new Promise(r => setTimeout(r, 1200));
  await simulateUpgrade();  // → POST /api/users/me/simulate-upgrade
  // updateUser ya lo hace el hook en onSuccess
  fireConfetti();
  toast.success(t('checkout.welcomeReefMaster'));
  navigate('/dashboard?upgraded=1', { replace: true });
};
```

**5. Hook reusado:**
- `useSimulateUpgrade()` ya existe (usado en ProfilePage). Asegurar que su `onSuccess` actualice el store con `plan: 'REEFMASTER'`.

**6. Confetti util:**
- `frontend/src/lib/confetti.ts` con función `fireConfetti()`:
```typescript
import confetti from 'canvas-confetti';
export function fireConfetti() {
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.4 } }), 250);
}
```

**7. Banner en Dashboard:**
- En `frontend/src/features/dashboard/DashboardView.tsx`, añadir `useEffect` que lea `searchParams.get('upgraded')`. Si es `'1'`, montar `<UpgradeBanner />` y limpiar el query param con `setSearchParams({}, { replace: true })`.
- El banner se cierra automáticamente a los 8s o con click en X.

**8. Routing:**
- `/dashboard/checkout` → `<CheckoutPage />`. Protegida por auth (ya está bajo el guard).
- Cambiar [LandingPage.tsx:230](../../frontend/src/features/landing/LandingPage.tsx#L230): el `<Link to="/register">` envolviendo "Go ReefMaster" se sustituye por una función que comprueba si hay user logueado:
  - Logueado → `navigate('/dashboard/checkout')`.
  - No logueado → `navigate('/register?next=/dashboard/checkout')`.
- En el dashboard (`DashboardView.tsx`), si `user.plan === 'FREE'`, mostrar un `<PlanCard />` con CTA → `/dashboard/checkout`.
- En `RegisterPage`, leer `?next=` y redirigir tras éxito.

### i18n keys nuevas (nuevo namespace `checkout.json`)

| key | en | de | es |
|---|---|---|---|
| `pageTitle` | "Complete your upgrade" | "Schließe dein Upgrade ab" | "Completa tu upgrade" |
| `subtitle` | "You're one step from ReefMaster." | "Du bist einen Schritt von ReefMaster entfernt." | "Estás a un paso de ReefMaster." |
| `cardNumber` | "Card number" | "Kartennummer" | "Número de tarjeta" |
| `cardholder` | "Cardholder name" | "Karteninhaber" | "Titular de la tarjeta" |
| `expiry` | "Expiry (MM/YY)" | "Ablauf (MM/JJ)" | "Caducidad (MM/AA)" |
| `cvv` | "CVV" | "CVV" | "CVV" |
| `payButton` | "Pay $4.99/mo" | "$4.99/Mon. zahlen" | "Pagar 4,99 $/mes" |
| `processing` | "Processing payment…" | "Zahlung wird verarbeitet…" | "Procesando pago…" |
| `welcomeReefMaster` | "Welcome to ReefMaster! 🎉" | "Willkommen bei ReefMaster! 🎉" | "¡Bienvenido a ReefMaster! 🎉" |
| `bannerTitle` | "You're a ReefMaster now" | "Du bist jetzt ReefMaster" | "Ya eres ReefMaster" |
| `bannerSubtitle` | "Unlimited aquariums, unlimited AI, all calculators unlocked." | "Unbegrenzte Aquarien, unbegrenzte KI, alle Rechner freigeschaltet." | "Acuarios ilimitados, IA ilimitada, todas las calculadoras desbloqueadas." |
| `errors.invalidCard` | "Invalid card (demo)" | "Ungültige Karte (Demo)" | "Tarjeta inválida (demo)" |
| `errors.invalidCardholder` | "Cardholder name is required" | "Karteninhaber ist erforderlich" | "El titular es obligatorio" |
| `errors.invalidExpiry` | "Invalid expiry date" | "Ungültiges Ablaufdatum" | "Caducidad inválida" |
| `errors.invalidCvv` | "CVV must be 3 digits" | "CVV muss 3 Ziffern haben" | "El CVV debe tener 3 dígitos" |
| `disclaimer` | "This is a simulated checkout. No real charge will occur." | "Dies ist ein simulierter Kauf. Es wird keine echte Zahlung erfolgen." | "Este es un pago simulado. No se realizará ningún cargo real." |
| `goReefMaster` | "Go ReefMaster" | "ReefMaster werden" | "Hazte ReefMaster" |

> Nota: `goReefMaster` reemplaza el hardcoded "Go ReefMaster" del LandingPage. La key vive en `checkout.json` por agrupación lógica (también se usa en el `<PlanCard />` del dashboard).

### Criterios de aceptación
- [ ] Click en "Go ReefMaster" del LandingPage cuando NO logueado → redirige a `/register?next=/dashboard/checkout`.
- [ ] Click en "Go ReefMaster" del LandingPage cuando SÍ logueado → redirige a `/dashboard/checkout`.
- [ ] Submit con datos válidos → confeti + toast + redirect a `/dashboard?upgraded=1`.
- [ ] Banner "You're a ReefMaster now" aparece en Dashboard tras upgrade y desaparece a los 8s.
- [ ] El `?upgraded=1` se elimina de la URL tras montar el banner.
- [ ] Submit con CVV de 2 dígitos → mensaje de error inline.
- [ ] Submit con tarjeta `0000 0000 0000 0000` → mensaje "Tarjeta inválida (demo)".
- [ ] Tras upgrade, el sidebar deja de mostrar los badges PRO en las calculadoras.
- [ ] Las 17 keys de `checkout.json` existen en los 3 idiomas.

---

## 6. AI Chat Context

### Goal
Ampliar el contexto que el backend Java envía al microservicio Python para que la IA "vea" no solo nombres de equipo y livestock, sino también **parámetros del agua actuales**, **watts/horas por equipo** y **especies por livestock**. **Opción B aprobada** — el frontend no cambia.

### Non-goals
- Cambiar el flujo de chat en el frontend.
- Modificar la lógica de rate-limiting.

### Arquitectura

```
Frontend (sin cambios)
   POST /api/chat
   { message, aquariumId }
        ↓
ChatService.sendMessage()
        ↓
buildAquariumContext(aquariumId) ← AQUÍ SE AMPLÍA
        ↓
   {
     name, liters, type,
     livestock: [...],
     equipment: [...],
     latestParameters: {...}   ← NUEVO
   }
        ↓
   POST localhost:8001/chat/message
   { message, aquarium_context }
        ↓
   Python construye system prompt con todo el contexto
        ↓
   Gemini responde
```

### Cambios backend (Java)

**Archivo:** `backend/src/main/java/com/thalassa/backend/services/ChatService.java`, método `buildAquariumContext()` (~líneas 128-149).

**Estructura actual del contexto (simplificada):**
```java
Map.of(
  "name", aquarium.getName(),
  "liters", aquarium.getLiters(),
  "type", aquarium.getType(),
  "livestock", livestockNames,    // List<String>
  "equipment", equipmentNames     // List<String>
)
```

**Estructura nueva:**
```java
Map.of(
  "name", aquarium.getName(),
  "liters", aquarium.getLiters(),
  "type", aquarium.getType(),
  "livestock", livestock.stream().map(l -> Map.of(
    "name", l.getName(),
    "category", l.getCategory(),
    "quantity", l.getQuantity(),
    "reefSafe", l.getReefSafe()
  )).toList(),
  "equipment", equipment.stream().map(e -> Map.of(
    "name", e.getName(),
    "category", e.getCategory(),
    "powerWatts", e.getPowerWatts(),
    "hoursPerDay", e.getHoursPerDay()
  )).toList(),
  "latestParameters", buildLatestParameters(aquariumId)   // NUEVO
)
```

**Nuevo método helper `buildLatestParameters(aquariumId)`:**
- Consulta `WaterParameterRepository.findFirstByAquariumIdOrderByMeasuredAtDesc(aquariumId)`.
- Si no hay registros → devuelve `null` (Python lo manejará).
- Si hay → devuelve:
```java
Map.of(
  "measuredAt", param.getMeasuredAt().toString(),
  "temperature", param.getTemperature(),
  "salinity", param.getSalinity(),
  "ph", param.getPh(),
  "alkalinityDKH", param.getAlkalinityDKH(),
  "calciumPPM", param.getCalciumPPM(),
  "magnesiumPPM", param.getMagnesiumPPM(),
  "nitratesPPM", param.getNitratesPPM(),
  "phosphatesPPM", param.getPhosphatesPPM()
)
```

**Repository:** verificar/añadir el método `findFirstByAquariumIdOrderByMeasuredAtDesc(Long aquariumId)` en `WaterParameterRepository`.

### Cambios Python (microservicio scraper/chat)

**Archivo:** módulo del chat dentro del repo Python (a confirmar — ver "Riesgos cruzados").

**Modificar el system prompt template** para usar el nuevo contexto. Plantilla sugerida:

```
You are Thalassa, an expert reef aquarium assistant.

The user is asking about THIS aquarium:
- Name: {name}
- Volume: {liters} L
- Type: {type}

Latest water parameters (measured {latestParameters.measuredAt}):
- Temperature: {latestParameters.temperature} °C
- Salinity: {latestParameters.salinity}
- pH: {latestParameters.ph}
- Alkalinity: {latestParameters.alkalinityDKH} dKH
- Calcium: {latestParameters.calciumPPM} ppm
- Magnesium: {latestParameters.magnesiumPPM} ppm
- Nitrates: {latestParameters.nitratesPPM} ppm
- Phosphates: {latestParameters.phosphatesPPM} ppm

Livestock ({livestock.length} species):
{for each livestock: "- {name} ({category}, qty {quantity}, reefSafe={reefSafe})"}

Equipment ({equipment.length} items):
{for each equipment: "- {name} ({category}, {powerWatts}W, {hoursPerDay}h/day)"}

Answer the user's question with this context. Be concise.
```

**Si los parámetros son null:** sustituir por `"(not measured yet — suggest user log them)"`.

### Cambios frontend
**Ninguno.** El componente `ChatDrawer` y el hook `useChat` no cambian. El usuario sigue viendo el chat exactamente igual; solo la calidad de las respuestas mejora.

### i18n
**Ninguna key nueva.** El system prompt está en inglés (Gemini funciona mejor en inglés y traduce internamente).

### Criterios de aceptación
- [ ] El backend Java envía un objeto `latestParameters` no-null cuando el acuario tiene mediciones.
- [ ] Si el acuario no tiene mediciones, `latestParameters: null`.
- [ ] El equipment ahora incluye `powerWatts` y `hoursPerDay`.
- [ ] El livestock ahora incluye `category`, `quantity`, `reefSafe`.
- [ ] La IA responde correctamente preguntas como "¿está bien mi pH?" — debe citar el valor concreto medido.
- [ ] Test manual: con acuario de demo con pH=7.9 → la IA debe mencionar que está bajo (objetivo 8.1-8.4).

---

## 7. Notification Bell

### Goal
Eliminar definitivamente el bug del dropdown de notificaciones que se sale de la pantalla, mediante posicionamiento **viewport-aware**.

### Non-goals
- Reescribir el sistema de notificaciones.
- Animar transiciones complejas.

### Arquitectura

Reemplazar la prop `align` (que requería que el llamador supiera la geometría) por un `useEffect` que detecta automáticamente la dirección segura tras montar el dropdown.

```
NotificationBell open
   ↓
useLayoutEffect
   ↓
panelRect = panel.getBoundingClientRect()
   ↓
if panelRect.right > viewportWidth → setSide('left')   (panel se renderiza con right-0)
else if panelRect.left < 0          → setSide('right') (panel se renderiza con left-0)
else                                  → mantiene
```

### Cambios frontend

**Archivo:** `frontend/src/components/shared/NotificationBell.tsx`.

**Cambios:**
1. **Eliminar la prop `align`.** El componente decide solo.
2. Añadir estado interno: `const [side, setSide] = useState<'left' | 'right'>('right');`
3. `useLayoutEffect` cuando `open` cambia a `true`:
   - Medir `panelRef.current.getBoundingClientRect()`.
   - Si `rect.right > window.innerWidth - 8` → `setSide('right')` (anclar a la derecha del bell).
   - Si `rect.left < 8` → `setSide('left')` (anclar a la izquierda del bell).
4. Aplicar la clase: `side === 'left' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'`.
5. Añadir `transition-all duration-150` y `transform-gpu` para suavizar.

**Llamadores** (eliminar la prop):
- `frontend/src/components/layout/Sidebar.tsx:70` → cambiar `<NotificationBell align="left" />` por `<NotificationBell />`.
- `frontend/src/components/layout/GestorLayout.tsx:41` (si pasa prop) → idem.

**Edge case — primer render:**
- En el primer render `open=true`, el panel aún no tiene rect. Usar un valor inicial razonable según la posición del **botón** (no del panel): si el botón está en el tercio derecho del viewport, `side='right'`; si está en el izquierdo, `side='left'`.

### i18n
**Ninguna key nueva.**

### Criterios de aceptación
- [ ] Bell en sidebar (lado izquierdo de la pantalla) → dropdown se abre hacia la derecha sin cortarse.
- [ ] Bell fixed mobile (esquina superior derecha) → dropdown se abre hacia la izquierda sin cortarse.
- [ ] Resize del viewport con dropdown abierto → no se sale de pantalla (recalcula al reabrir).
- [ ] La prop `align` ha sido eliminada del API del componente.
- [ ] Animación suave (no salta al cambiar de side).

---

## 8. Market URL Fix

### Goal
Que el botón "Ver producto" del Market y el icono de enlace de la Wishlist abran siempre la URL externa en una pestaña nueva, eliminando el bug de redirección a Login.

### Non-goals
- Validar que la URL externa exista (404 check).
- Acortar URLs.

### Arquitectura

Centralizar la normalización en una utilidad pura, aplicarla en todos los puntos de consumo y opcionalmente sanear también en el backend Java.

```
Scraper Python → puede devolver "tiendanimal.com/x" o "/x"
                                ↓
Backend Java (ScraperService)  ← normalizar aquí también (belt-and-suspenders)
                                ↓
Frontend (MarketPage, WishlistPage)
                                ↓
normalizeExternalUrl(url)
                                ↓
- "tiendanimal.com/x" → "https://tiendanimal.com/x"
- "//cdn.foo.com/x"   → "https://cdn.foo.com/x"
- "javascript:..."     → null (sanitización de seguridad)
- ""                   → null
- "https://x.com"      → "https://x.com"
                                ↓
<a href={normalized}> o se oculta el botón si null
```

### Cambios frontend

**1. Utilidad nueva `frontend/src/lib/url.ts`:**

```typescript
const PROTOCOL_RE = /^https?:\/\//i;
const PROTOCOL_RELATIVE_RE = /^\/\//;
const DOMAIN_LIKE_RE = /^([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i;
const DANGEROUS_RE = /^(javascript|data|vbscript|file):/i;

/**
 * Normaliza una URL externa devuelta por scrapers / APIs.
 * Devuelve null si la URL es inválida o no segura para abrir en pestaña nueva.
 */
export function normalizeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (DANGEROUS_RE.test(trimmed)) return null;
  if (PROTOCOL_RE.test(trimmed)) return trimmed;
  if (PROTOCOL_RELATIVE_RE.test(trimmed)) return 'https:' + trimmed;
  if (DOMAIN_LIKE_RE.test(trimmed)) return 'https://' + trimmed;
  return null;
}
```

**2. Aplicación en MarketPage:**
- En el `<ProductCard />`, sustituir:
  ```tsx
  {product.productUrl ? (
    <a href={product.productUrl} target="_blank" rel="noopener noreferrer">…</a>
  ) : (...)}
  ```
  por:
  ```tsx
  {(() => {
    const safeUrl = normalizeExternalUrl(product.productUrl);
    return safeUrl ? (
      <a href={safeUrl} target="_blank" rel="noopener noreferrer">…</a>
    ) : (
      <span className="...">{t('market.noUrl')}</span>
    );
  })()}
  ```
  (o un helper `useSafeUrl(url)` para evitar IIFE inline).

**3. Aplicación en WishlistPage:**
- En el icono de enlace, mismo wrapping.

**4. Tests unitarios:**
- `frontend/src/lib/url.test.ts` con casos:
  - `null`, `undefined`, `""`, `"   "` → `null`
  - `"https://x.com"` → `"https://x.com"`
  - `"http://x.com"` → `"http://x.com"`
  - `"//cdn.x.com/y"` → `"https://cdn.x.com/y"`
  - `"x.com"` → `"https://x.com"`
  - `"x.com/path?q=1"` → `"https://x.com/path?q=1"`
  - `"tiendanimal.com/p/abc"` → `"https://tiendanimal.com/p/abc"`
  - `"javascript:alert(1)"` → `null`
  - `"data:text/html,<script>"` → `null`
  - `"basura sin estructura"` → `null`

### Cambios backend (opcional pero recomendado)
- En `ScraperService`, antes de devolver productos al frontend, aplicar el mismo saneado:
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
- Aplicar a `productUrl` y `imgUrl` en cada producto antes del return.

### i18n keys nuevas (`market.json`)

| key | en | de | es |
|---|---|---|---|
| `noUrl` | "No link available" | "Kein Link verfügbar" | "Sin enlace disponible" |

### Criterios de aceptación
- [ ] Producto con `productUrl = "tiendanimal.com/x"` → abre `https://tiendanimal.com/x` en nueva pestaña.
- [ ] Producto con `productUrl = null` → muestra "Sin enlace disponible".
- [ ] Producto con `productUrl = "javascript:alert(1)"` → no muestra botón.
- [ ] Wishlist: ítem con URL relativa → mismo comportamiento.
- [ ] Tests unitarios de `normalizeExternalUrl` pasan.
- [ ] Backend Java sanea URLs antes de devolver.

---

## 9. Estrategia i18n consolidada

### Resumen de namespaces afectados

| Namespace | Acción | Keys nuevas |
|---|---|---|
| `calculators.json` | Ampliar bloque `energy` | 4 (missingKwhPrice, missingKwhPriceDesc, goToSettings, genericError) |
| `nav.json` | Ampliar | 2 (sectionConfig, settings); eliminar 1 (sectionAssistant) |
| `market.json` | Ampliar | 3 (cachedDataNotice, unavailable, noUrl) |
| `settings.json` | **CREAR** | 22 |
| `checkout.json` | **CREAR** | 17 |

**Total keys nuevas:** 48 × 3 idiomas = **144 entradas a añadir**.

### Reglas para el code model
1. **Editar los 3 idiomas en la misma micro-fase** (nunca dejar `en/` actualizado y `de/`/`es/` desfasado entre commits).
2. **Verificar que `settings.json` y `checkout.json` están registrados como namespaces** en `frontend/src/i18n/index.ts` (línea 42 — `ns: [...]`).
3. **No traducir nombres propios** (Thalassa, ReefMaster, AquaShop).
4. **Mantener el orden de keys** en los 3 idiomas (ayuda al diff y a la revisión).

### Validación final
Script mental: `cat en/checkout.json | jq 'keys' | sort` debe coincidir con `de/checkout.json` y `es/checkout.json`. Hacerlo para cada namespace tocado.

---

## 10. Riesgos cruzados

### Riesgo 1: Acceso al repo Python
**Punto 6 (chat context) y Punto 3 (scraping)** requieren editar el microservicio Python. **Asunción del plan:** tienes acceso al repo Python (carpeta `scraper/` del workspace). Si no, hay que limitar a los cambios Java + seed cache.

### Riesgo 2: Regenerar OpenAPI
Varios puntos amplían DTOs (`UpdateUserRequest`, `UserResponse`, `EnergyResponse`, `ProductsResponse`, `ChatRequest`/`ChatResponse` no, `ChangePasswordRequest` nuevo). Si el pipeline OpenAPI no regenera bien los tipos TS, todos los puntos se bloquean. **Mitigación:** la Fase 2 de EXECUTION_STEPS incluye un paso explícito de regenerar y verificar.

### Riesgo 3: Migración de DB
Añadir `displayName` al `User` requiere migración. En dev con `ddl-auto=update` es transparente. En producción (si llegara) habría que añadir Flyway. **Mitigación:** en este sprint asumimos dev only.

### Riesgo 4: Confetti en navegadores antiguos
`canvas-confetti` requiere Canvas API (universal en navegadores 2020+). **Mitigación:** ninguna — coste de oportunidad mínimo.

### Riesgo 5: Cambio del Sidebar rompe los snapshots de tests
Si hay tests que comparan el árbol del Sidebar, fallarán. **Mitigación:** actualizar snapshots en la fase de QA.

---

## Apéndice — Resumen de archivos tocados

### Backend Java (10 archivos)
- `backend/src/main/java/com/thalassa/backend/models/User.java` (añadir `displayName`)
- `backend/src/main/java/com/thalassa/backend/controllers/UserController.java` (endpoint password)
- `backend/src/main/java/com/thalassa/backend/services/UserService.java` (método changePassword)
- `backend/src/main/java/com/thalassa/backend/services/EnergyService.java` (errorCode)
- `backend/src/main/java/com/thalassa/backend/services/ChatService.java` (latestParameters)
- `backend/src/main/java/com/thalassa/backend/services/ScraperService.java` (seed-cache + normalizeUrl)
- `backend/src/main/java/com/thalassa/backend/repositories/WaterParameterRepository.java` (findFirstByAquariumIdOrderByMeasuredAtDesc)
- `backend/src/main/resources/openapi.yaml` (DTOs nuevos)
- `backend/src/main/resources/market-seed/aquashop.json` (nuevo)
- `backend/src/main/resources/market-seed/icaacuarios.json` (nuevo)

### Python (3+ archivos, depende de la estructura)
- `scraper/scrapers/aquashop.py` (nuevo)
- `scraper/scrapers/icaacuarios.py` (nuevo)
- `scraper/chat/system_prompt.py` (ampliar template) — nombre exacto a confirmar

### Frontend TypeScript (≈18 archivos)
- `frontend/package.json` (canvas-confetti)
- `frontend/src/i18n/index.ts` (registrar `settings`, `checkout`)
- `frontend/src/i18n/locales/{en,de,es}/calculators.json` (4 keys)
- `frontend/src/i18n/locales/{en,de,es}/nav.json` (2 add, 1 del)
- `frontend/src/i18n/locales/{en,de,es}/market.json` (3 keys)
- `frontend/src/i18n/locales/{en,de,es}/settings.json` (NUEVO, 22 keys)
- `frontend/src/i18n/locales/{en,de,es}/checkout.json` (NUEVO, 17 keys)
- `frontend/src/lib/url.ts` (NUEVO)
- `frontend/src/lib/url.test.ts` (NUEVO)
- `frontend/src/lib/confetti.ts` (NUEVO)
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/shared/NotificationBell.tsx`
- `frontend/src/features/calculators/EnergyCalcPage.tsx`
- `frontend/src/features/profile/ProfilePage.tsx` (reducir a resumen)
- `frontend/src/features/profile/SettingsPage.tsx` (NUEVO)
- `frontend/src/features/profile/components/AccountForm.tsx` (NUEVO)
- `frontend/src/features/profile/components/ChangePasswordForm.tsx` (NUEVO)
- `frontend/src/features/checkout/CheckoutPage.tsx` (NUEVO)
- `frontend/src/features/checkout/components/CardForm.tsx` (NUEVO)
- `frontend/src/features/checkout/components/PlanSummary.tsx` (NUEVO)
- `frontend/src/features/dashboard/DashboardView.tsx` (banner upgraded)
- `frontend/src/features/dashboard/components/PlanCard.tsx` (NUEVO o ampliado)
- `frontend/src/features/landing/LandingPage.tsx` (botón ReefMaster)
- `frontend/src/features/market/MarketPage.tsx` (URL normalize + cached badge)
- `frontend/src/features/wishlist/WishlistPage.tsx` (URL normalize)
- `frontend/src/hooks/queries/useEnergyCalc.ts` (errorCode)
- `frontend/src/hooks/queries/useChangePassword.ts` (NUEVO)
- `frontend/src/router/AppRouter.tsx` (rutas /checkout, /profile/settings)

**Total estimado:** ~30 archivos modificados, ~12 archivos nuevos.

---

> **Siguiente paso:** ejecutar [EXECUTION_STEPS_V3.md](./EXECUTION_STEPS_V3.md) en orden estricto, fase por fase.
