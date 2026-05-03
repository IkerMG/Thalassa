# MASTER PLAN V2 — Thalassa MVP Final Sprint

> **Documento:** Plan de implementación para la entrega final del TFG
> **Rama base:** `feat/fase14-mvp`
> **Insumo:** Auditoría Tech Lead 2026-05-03 · `next_step_audit.md`
> **Estado del proyecto:** Core completamente funcional. 4 páginas en stub `ComingSoonView`. Objetivo: convertirlas en features demostrables con riesgo mínimo.

---

## Convenciones

- Una feature = un commit. No avanzar sin validar QA.
- Conventional Commits obligatorio: `feat:`, `fix:`, `chore:`, `refactor:`.
- **No tocar el backend** salvo que se indique explícitamente — todos los endpoints necesarios ya existen.
- Cada fase incluye criterio de "done" verificable manualmente en el navegador.

---

## Roadmap

| Fase | Feature | Tipo | Esfuerzo | Prioridad |
|------|---------|------|----------|-----------|
| 14A | Wishlist Page | 🟢 Funcional (BD) | ~3–4h | P0 |
| 14B | Energy Calculator | 🟢 Funcional (BD) | ~2–3h | P0 |
| 14C | Profile → Settings form | 🟢 Funcional (BD) | ~1–2h | P0 |
| 14D | Market Page | 🟡 Mockeado (scraper live + fallback) | ~4h | P1 |
| 14E | Dosing Calculator | 🟡 Mockeado (puro FE) | ~2–3h | P1 |
| 14F | Notifications polish | 🟡 Mockeado (client-side logic) | ~1–2h | P2 |

**Total estimado:** 13–18h de desarrollo.

---

# FASE 14A — Wishlist Page

### Objetivo
El backend tiene CRUD completo para Wishlist (`GET/POST/PUT/DELETE /api/wishlist`). Solo falta construir la interfaz. Es la victoria más rápida del sprint.

### Estado actual
- `frontend/src/features/wishlist/WishlistPage.tsx` → 12 líneas, usa `ComingSoonView`
- `frontend/src/api/` → `marketApi.ts` existe; comprobar si hay `wishlistApi.ts`
- Backend: `WishlistController`, `WishlistService`, `WishlistRepository` 100% funcionales

### Archivos a modificar/crear
- `frontend/src/features/wishlist/WishlistPage.tsx` — reemplazar stub por UI completa
- `frontend/src/features/wishlist/components/WishlistItemCard.tsx` — card por item (nuevo)
- `frontend/src/features/wishlist/components/AddWishlistModal.tsx` — modal de añadir (nuevo)

### Estructura de datos (WishlistItem del backend)
```typescript
{
  id: number
  productName: string
  productUrl?: string
  imageUrl?: string
  price?: number
  category: 'EQUIPMENT' | 'LIVESTOCK' | 'SUPPLEMENT' | 'OTHER'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  notes?: string
  createdAt: string
}
```

### UI propuesta
```
Header: "Mi Wishlist" + botón [+ Añadir]

Filtros: [Todo] [EQUIPMENT] [LIVESTOCK] [SUPPLEMENT] [OTHER]
         Orden: [Prioridad ▾] [Reciente ▾]

Cards (grid 2 col móvil / 3 col desktop):
┌─────────────────────────────────┐
│ [imagen o placeholder]          │
│ Nombre del producto             │
│ €XX,XX (si existe)              │
│ 🏷️ EQUIPMENT   🔴 HIGH          │
│ Nota: "Quiero este para..."     │
│ [Ver producto] [Editar] [🗑️]   │
└─────────────────────────────────┘

Estado vacío: icono Heart + "Tu wishlist está vacía"
              CTA: [Ir al Market]
```

### Instrucciones de ejecución
1. Leer `frontend/src/api/` para verificar si existe `wishlistApi.ts` y sus tipos generados por OpenAPI.
2. Si no existe, crear `frontend/src/api/wishlistApi.ts` con los métodos: `list()`, `create(dto)`, `update(id, dto)`, `remove(id)`.
3. Crear React Query hooks: `useWishlist()` (query), `useAddToWishlist()`, `useUpdateWishlistItem()`, `useRemoveFromWishlist()` (mutations).
4. Construir `WishlistItemCard` con los campos descritos. El badge de prioridad usa colores: HIGH=rojo, MEDIUM=naranja, LOW=gris.
5. Construir `AddWishlistModal` con campos: nombre (required), URL, precio, categoría (select), prioridad (select), notas (textarea).
6. Montar la página: header + filtros + grid de cards + empty state.
7. El botón "Ir al Market" del empty state navega a `/dashboard/market`.

### Criterios de Aceptación (QA)
- [ ] Navegar a `/dashboard/wishlist` → ver lista de items (o empty state si no hay)
- [ ] Clic [+ Añadir] → modal se abre, formulario válido, toast "Añadido a wishlist"
- [ ] Clic [Editar] → modal con datos precargados, guardar cambia la card
- [ ] Clic [🗑️] → ConfirmDialog, confirmar elimina la card con toast
- [ ] Filtros de categoría funcionan client-side
- [ ] Empty state muestra botón que navega al Market

### Commit
```
feat(wishlist): implement wishlist page with CRUD UI
```

---

# FASE 14B — Energy Calculator

### Objetivo
El backend ya calcula `GET /api/aquariums/{id}/energy` (kWh/mes por equipo + coste total). Solo hay que diseñar la página frontend que consume ese endpoint.

### Estado actual
- `frontend/src/features/calculators/EnergyCalcPage.tsx` → 12 líneas, usa `ComingSoonView`
- Backend endpoint: `GET /api/aquariums/{id}/energy` en `EquipmentService.java`
- Respuesta del backend incluye: desglose por equipo + total kWh/mes + coste mensual (€)
- **Nota:** el AquariumDetailPage ya muestra una estimación básica en la pestaña Equipment. Esta página es la versión standalone con más detalle.

### Respuesta del backend (EnergyResponse)
```typescript
{
  totalKwhPerMonth: number
  totalMonthlyCost: number
  currency: string       // "€"
  breakdown: Array<{
    equipmentName: string
    category: string
    powerWatts: number
    hoursPerDay: number
    kwhPerMonth: number
    monthlyCost: number
  }>
}
```

### Archivos a modificar/crear
- `frontend/src/features/calculators/EnergyCalcPage.tsx` — reemplazar stub por UI completa

### UI propuesta
```
Header: "Calculadora de Energía ⚡"
Subtítulo: "Estima el consumo mensual de tu acuario"

[Selector de acuario: dropdown con tus acuarios]   ← useAquariums() hook existente

── Resumen ─────────────────────────────────────────
│  📊 X kWh/mes          💶 €XX,XX/mes estimados  │
│  Precio kWh: €X,XX  [Cambiar en perfil →]        │
────────────────────────────────────────────────────

── Desglose por equipo ──────────────────────────────
│ Equipo          │ W    │ h/día │ kWh/mes │ €/mes │
│─────────────────│──────│───────│─────────│───────│
│ Hydra 64 HD     │ 250W │ 10h   │ 75 kWh  │ €15   │
│ Varios...                                         │
────────────────────────────────────────────────────

Estado vacío (sin equipo): "Añade equipos en tu acuario
                            para calcular el consumo"
Estado sin acuarios: "Crea un acuario primero"
```

### Instrucciones de ejecución
1. Usar el hook `useAquariums()` ya existente para el selector de acuario.
2. Crear un hook `useEnergyCalc(aquariumId)` con React Query que llame a `GET /api/aquariums/{id}/energy`. Solo disparar cuando `aquariumId` no sea null.
3. Mostrar estado de carga con skeleton mientras llega la respuesta.
4. La tarjeta de resumen muestra `totalKwhPerMonth` y `totalMonthlyCost` con formato de moneda.
5. El link "Cambiar en perfil →" navega a `/dashboard/profile`.
6. La tabla de desglose usa los campos de `breakdown[]`.
7. Si `breakdown` está vacío → empty state con CTA que navega a `/dashboard/aquarium/{id}`.

### Criterios de Aceptación (QA)
- [ ] Selector muestra los acuarios del usuario
- [ ] Seleccionar acuario carga el desglose energético
- [ ] Los totales cuadran con la suma del desglose
- [ ] Skeleton visible durante la carga
- [ ] Empty state si el acuario no tiene equipos

### Commit
```
feat(calculator): implement energy calculator page connected to backend
```

---

# FASE 14C — Profile → Settings Form

### Objetivo
El backend acepta `PUT /api/users/me` con `electricityPriceKwh`, `locale` y `volumeUnit`/`temperatureUnit`. La sección "Settings" en ProfilePage está marcada como "coming soon". Solo hay que añadir el formulario.

### Estado actual
- `frontend/src/features/profile/ProfilePage.tsx` — user info funciona, Settings section = badge "COMING SOON"
- Backend: `PUT /api/users/me` acepta `{ locale, volumeUnit, temperatureUnit, electricityPriceKwh }`
- i18n: EN/DE/ES ya funciona vía selector de idioma existente

### Archivos a modificar
- `frontend/src/features/profile/ProfilePage.tsx` — reemplazar sección "coming soon" por formulario real

### UI propuesta (añadir debajo del idioma selector)
```
── Configuración ────────────────────────────────────
│ Precio electricidad (€/kWh)                       │
│ [0.28              ]  Precio actual: €0,28/kWh     │
│                                                   │
│ Unidades de temperatura                           │
│ [● Celsius (°C)]  [○ Fahrenheit (°F)]             │
│                                                   │
│ Unidades de volumen                               │
│ [● Litros (L)]  [○ Galones (gal)]                 │
│                                                   │
│                         [Guardar cambios]         │
────────────────────────────────────────────────────
```

### Instrucciones de ejecución
1. Leer los tipos del `PUT /api/users/me` DTO (generado de OpenAPI) para conocer los nombres exactos de campos.
2. Usar `react-hook-form` + `zod` (ya instalados en el proyecto) para el formulario.
3. Validación: `electricityPriceKwh` → número positivo entre 0.01 y 9.99; `temperatureUnit` → enum `CELSIUS|FAHRENHEIT`; `volumeUnit` → enum `LITERS|GALLONS`.
4. Pre-cargar el formulario con los valores actuales del usuario (hook `useCurrentUser()` o equivalente).
5. Al guardar exitosamente: toast "Configuración guardada" + invalidar query del usuario.
6. Eliminar el badge "COMING SOON" y el estado disabled de la sección.

### Criterios de Aceptación (QA)
- [ ] Formulario pre-cargado con valores actuales del usuario
- [ ] Cambiar electricityPrice y guardar → toast de éxito
- [ ] Recargar la página → los valores persisten
- [ ] Los cambios de temperatura/volumen persisten

### Commit
```
feat(profile): implement settings form for electricity price and units
```

---

# FASE 14D — Market Page

### Objetivo
Construir una página de market usable y visualmente convincente usando el scraper live de Python. Con fallback estático si el scraper cae, y categorías navegables via keywords predefinidas.

### Estado actual
- `frontend/src/features/market/MarketPage.tsx` → 12 líneas, usa `ComingSoonView`
- `frontend/src/api/marketApi.ts` → `marketApi.search(keyword)` ya existe
- Scraper Python funcional en `/api/scraper/search?keyword=<keyword>`
- Devuelve: `{ name, price, imgUrl, productUrl, storeName }` por producto
- **Sin campo category** → categorías implementadas como keywords de búsqueda

### Archivos a modificar/crear
- `frontend/src/features/market/MarketPage.tsx` — UI completa
- `frontend/src/features/market/components/ProductCard.tsx` — card de producto (nuevo)
- `frontend/src/data/market-fallback.json` — 25+ productos estáticos (nuevo)

### Categorías → Keywords
```typescript
const CATEGORIES = [
  { label: 'Todo',        keyword: 'acuario marino' },
  { label: 'Iluminación', keyword: 'led reef coral' },
  { label: 'Bombas',      keyword: 'bomba circulacion' },
  { label: 'Filtración',  keyword: 'filtro skimmer' },
  { label: 'Alimentación',keyword: 'alimento peces' },
  { label: 'Calefacción', keyword: 'calefactor termostato' },
  { label: 'Reactivos',   keyword: 'test kit acuario' },
  { label: 'Decoración',  keyword: 'roca decoracion' },
]
```

### Estructura del fallback JSON
```json
[
  {
    "name": "Kessil A360X Tuna Blue",
    "price": 389.99,
    "imgUrl": null,
    "productUrl": "https://www.tiendanimal.es",
    "storeName": "tiendanimal"
  },
  ...25 productos distribuidos entre categorías y tiendas...
]
```

### Lógica de fallback
```
1. Disparar marketApi.search(keyword)
2. Si errorCode === 'TIMEOUT_ERROR' || 'SERVICE_UNAVAILABLE' || results.length === 0
   → cargar market-fallback.json y filtrar client-side por keyword/categoría
3. Mostrar badge "Datos de muestra" si se usa el fallback
```

### UI Layout
```
Header: "Market 🛒" + buscador libre

Tabs de categoría (scroll horizontal en móvil):
[Todo] [Iluminación] [Bombas] [Filtración] [Alimentación] ...

Filtro de tienda (client-side sobre storeName):
[Todas] [Tiendanimal] [Kiwoko]

Badge si fallback activo: ⚠️ "Mostrando productos de ejemplo"

Grid de cards (2 col móvil / 3 col desktop / 4 col wide):
┌─────────────────────┐
│  [imagen / 🐠]      │
│  Nombre completo    │
│  €XX,XX             │
│  🏪 tiendanimal     │
│  [Ver →]  [♥ Añadir]│
└─────────────────────┘

Estado vacío (sin resultados): "No encontramos resultados para ..."
                                CTA: [Limpiar búsqueda]
```

### Instrucciones de ejecución
1. Crear `ProductCard` con los campos del scraper. Si `imgUrl` es null → mostrar placeholder con icono.
2. Implementar el estado de búsqueda con debounce de 400ms en el input libre.
3. Clic en tab de categoría → lanzar `marketApi.search(category.keyword)`.
4. Aplicar filtro de tienda client-side: `results.filter(p => store === 'all' || p.storeName === store)`.
5. Botón [♥ Añadir]: abrir mini-modal con categoría y prioridad → llamar `wishlistApi.create(...)`.
6. Botón [Ver →]: `window.open(productUrl, '_blank')`.
7. Crear `market-fallback.json` con 25 productos realistas (nombres reales de la industria, precios reales aproximados).
8. Implementar la lógica de fallback: si `errorCode` presente o `results.length === 0` → usar fallback.

### Criterios de Aceptación (QA)
- [ ] Al cargar la página → búsqueda inicial ("acuario marino") se dispara
- [ ] Clic en "Iluminación" → muestra productos de LEDs
- [ ] Filtro de tienda filtra correctamente client-side
- [ ] Si scraper falla → carga fallback con badge "Datos de muestra"
- [ ] Botón [♥] → toast "Añadido a tu wishlist"
- [ ] Botón [Ver →] → abre producto en pestaña nueva

### Commit
```
feat(market): implement market page with scraper integration and static fallback
```

---

# FASE 14E — Dosing Calculator

### Objetivo
Calculadora frontend pura. No necesita API ni BD. Calcula dosis de aditivos de acuariofilia marina (2-part, kalkwasser, vinagre) basándose en el volumen del acuario y parámetros objetivo vs actual.

### Estado actual
- `frontend/src/features/calculators/DosingCalcPage.tsx` → 12 líneas, usa `ComingSoonView`
- Sin ningún endpoint de backend

### Fórmulas a implementar (estándar de la industria)

**2-Part (solución A y B):**
```
Para subir KH en 1 dKH en V litros:
  Parte A (Alcalinidad) = V × 0.18 ml/día
  Parte B (Calcio) = V × 0.18 ml/día
  Ajuste fino: dosis_diaria = (kh_objetivo - kh_actual) × V × 0.12 ml
```

**Calcio Reactor / Suplemento de Calcio:**
```
Para subir Ca en 10 ppm en V litros:
  CaCl₂ (cloruro de calcio) = V × 0.72 g
```

**Magnesio:**
```
Para subir Mg en 10 ppm en V litros:
  MgCl₂ = V × 0.89 g
  MgSO₄ = V × 2.5 g  (opción alternativa)
```

**Vinagre (control de nitratos):**
```
dosis_diaria_ml = NO3_actual × V × 0.001
(solo si NO3 > 5 ppm)
```

### Archivos a modificar/crear
- `frontend/src/features/calculators/DosingCalcPage.tsx` — UI completa, sin backend

### UI propuesta
```
Header: "Calculadora de Dosis 🧪"

── Datos de tu acuario ──────────────────────────────
│ Volumen neto (L): [250    ]                        │
│ (o selecciona uno de tus acuarios)  [▾ Seleccionar] │
────────────────────────────────────────────────────

── Parámetros actuales vs objetivo ─────────────────
│         Actual    Objetivo                         │
│ KH      [6   ]    [8   ]   dKH                    │
│ Ca      [380 ]    [420 ]   ppm                    │
│ Mg      [1250]    [1350]   ppm                    │
│ NO₃     [15  ]    [5   ]   ppm                    │
────────────────────────────────────────────────────

                        [Calcular →]

── Resultados ──────────────────────────────────────
│ 🔵 2-Part Alcalinidad    → X ml/día               │
│ 🔵 2-Part Calcio         → X ml/día               │
│ 🟡 Suplemento Ca (CaCl₂) → X g (dosis única)      │
│ 🟢 Suplemento Mg (MgSO₄) → X g (dosis única)      │
│ 🟠 Vinagre (NO₃)         → X ml/día               │
│                                                   │
│ ⚠️ Disclaimer: valores orientativos.              │
│    Verifica siempre con tests antes de dosificar. │
────────────────────────────────────────────────────
```

### Instrucciones de ejecución
1. El formulario usa `react-hook-form` + `zod`. Todos los campos numéricos con mínimos: volumen ≥ 10, parámetros ≥ 0.
2. El selector de acuario usa `useAquariums()`. Al seleccionar, pre-cargar volumen del acuario (no los parámetros — no hay endpoint para "último parámetro por especie").
3. La función de cálculo es pura JavaScript, sin efectos secundarios. Exportarla separada para testabilidad.
4. Resultados solo visibles tras pulsar "Calcular". Si hay cambio en inputs → ocultar resultados hasta recalcular.
5. Si el valor ya es correcto (actual ≥ objetivo) → mostrar ✅ "Sin ajuste necesario" para ese parámetro.
6. El disclaimer es obligatorio.

### Criterios de Aceptación (QA)
- [ ] Introducir volumen + parámetros y pulsar Calcular → aparecen resultados
- [ ] Si actual ≥ objetivo → "Sin ajuste necesario"
- [ ] Seleccionar acuario pre-rellena el volumen
- [ ] Cambiar un input tras calcular → resultados desaparecen
- [ ] Validación: campo vacío o negativo → error inline

### Commit
```
feat(calculator): implement dosing calculator with pure frontend formulas
```

---

# FASE 14F — Notifications Polish

### Objetivo
El `NotificationController` ya devuelve 5 notificaciones mock. El `NotificationBell` ya existe. Mejorar la experiencia visual e introducir lógica client-side que genere alertas dinámicas basadas en los parámetros más recientes del usuario.

### Estado actual
- `frontend/src/shared/NotificationBell.tsx` — dropdown ya funciona con datos mock
- `backend/src/main/java/com/thalassa/backend/controllers/NotificationController.java` — devuelve 5 notificaciones hardcodeadas
- **No tocar el backend** — el mock es suficiente para la demo

### Lógica de alertas client-side (sobre datos ya disponibles en FE)
Los acuarios y sus parámetros se cargan en el Dashboard. Generar alertas locales basadas en rangos seguros:

| Parámetro | Rango OK | Alerta WARNING | Alerta DANGER |
|-----------|----------|----------------|---------------|
| Temperatura | 24–26°C | 23°C / 27°C | <22°C / >28°C |
| pH | 8.1–8.4 | 7.9–8.1 | <7.8 |
| KH | 7–11 dKH | 6–7 / 11–12 | <6 / >12 |
| NO₃ | <10 ppm | 10–25 ppm | >25 ppm |
| PO₄ | <0.1 ppm | 0.1–0.25 ppm | >0.25 ppm |

### Archivos a modificar
- `frontend/src/shared/NotificationBell.tsx` — mejorar UI del dropdown
- `frontend/src/hooks/useParameterAlerts.ts` — nuevo hook con lógica de alertas

### Instrucciones de ejecución
1. Crear `useParameterAlerts()`: recibe los acuarios del usuario con sus últimos parámetros y devuelve un array de alertas locales (título, mensaje, tipo: WARNING/DANGER, acuarioId).
2. Combinar las notificaciones del backend con las alertas locales en `NotificationBell`: alertas locales primero (más urgentes), notificaciones del server después.
3. Mejorar el dropdown: icono coloreado según tipo (🔴 DANGER, 🟡 WARNING, ✅ INFO/SUCCESS), timestamp relativo ("hace 2h"), botón "Marcar todo como leído".
4. La badge del bell muestra el total de no leídas (server mock + alertas locales).

### Criterios de Aceptación (QA)
- [ ] Si un acuario tiene temperatura > 27°C → aparece alerta WARNING en el bell
- [ ] Alertas locales aparecen antes que las del server
- [ ] El dropdown diferencia visualmente WARNING (amarillo) de DANGER (rojo) de INFO (azul)
- [ ] "Marcar todo como leído" limpia el badge

### Commit
```
feat(notifications): add parameter-based client-side alerts and polish notification bell
```

---

## Orden de ejecución recomendado

```
14A (Wishlist)   → solo FE, backend listo → riesgo 0
14B (Energy)     → solo FE, endpoint listo → riesgo 0
14C (Profile)    → solo FE, endpoint listo → riesgo 0
14D (Market)     → FE + fallback JSON → riesgo bajo (scraper podría fallar)
14E (Dosing)     → puro FE, sin backend → riesgo 0
14F (Notif)      → polish, sin backend → riesgo 0
```

## Archivos que NO se deben modificar
- Todo el backend (endpoints ya correctos)
- `AppRouter.tsx` (rutas ya registradas)
- `Sidebar.tsx` / `BottomTabBar.tsx` (navegación ya correcta)
- `ComingSoonView.tsx` (se reemplaza el import, no el componente)

## Definition of Done (Proyecto)
- [ ] Las 6 fases completadas y commiteadas
- [ ] Demo flow: Login → Dashboard → Wishlist → Market → Energy Calc → Dosing Calc → Notifications
- [ ] No hay `ComingSoonView` visible en ninguna ruta del dashboard
- [ ] No hay errores de consola en el happy path
- [ ] La UI es responsive en móvil (375px) y desktop (1440px)
