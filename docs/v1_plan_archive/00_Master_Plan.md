# 🌊 THALASSA — Master Plan

> **Versión:** 1.0  
> **Última actualización:** Abril 2026  
> **Estado:** Aprobado — Listo para implementación

---

## Tabla de Contenidos

 [[## 1.Visión General del Proyecto]]
[[## 2. Stack Tecnológico Completo]]
 [[## 3. Arquitectura del Sistema]]
[[## 4. Estructura de Carpetas]]
[[## 5. Sistema de Diseño]]
[[## 6. Reglas de Negocio — Planes]]
[[## 7. Landing Page (Pública)]]
[[## 8. Gestor de Acuarios (Privado)]]
[[## 9. Detalle de Acuario]]
[[## 10. Módulos Funcionales]]
[[## 11. Navegación y Responsive]]
[[#12. Flujos de Usuario]]
[[#13. Guía de Implementación Backend]]
[[#14. Internacionalización (i18n)]]
[[#15. Rendimiento y Optimización]]
[[#16. Propuestas de Mejora Adicionales]]

---

## 1. Visión General del Proyecto

**Thalassa** es una plataforma SaaS de gestión integral de acuarios marinos. Combina el tracking de parámetros del agua, inventario de fauna y equipamiento, un marketplace basado en scraping, herramientas de cálculo profesional (dosificación y consumo energético), y un asistente de IA especializado — todo bajo un modelo freemium.

### Objetivo de marca

Transmitir profundidad, elegancia, fiabilidad y calidad. La estética se construye sobre fondos completamente negros (OLED) contrastados con imágenes/videos marinos vivos, creando una experiencia visual premium e inmersiva similar a marcas como Coral Gardeners.

### Público objetivo

Acuaristas marinos de nivel intermedio a avanzado, con foco en:

- **Mercado primario:** EE.UU., Reino Unido, Australia (comunidades masivas como Reef2Reef, alto gasto por usuario).
- **Expansión 1:** Alemania (potencia europea del hobby, origen de las marcas más premium del sector: Tunze, Nyos, Royal Exclusiv, Aqua Medic).
- **Expansión 2:** España y Latinoamérica (comunidad fiel y activa, mercado emergente).

### Idioma base

Inglés. La interfaz se diseña en inglés desde el inicio con la infraestructura de i18n preparada para Alemán y Español.

---

## 2. Stack Tecnológico Completo

### Frontend (Confirmado + Adiciones recomendadas)

|Tecnología|Versión|Rol|
|---|---|---|
|Vite|8.x|Build tool y dev server|
|React|19.x|Librería de UI|
|TypeScript|5.x|Tipado estático|
|Tailwind CSS|4.x|Sistema de utilidades CSS|
|Framer Motion|12.x|Animaciones y transiciones entre secciones|
|Axios|latest|Cliente HTTP para comunicación con el backend|
|React Router DOM|latest|Enrutamiento SPA|
|Lucide React|latest|Iconografía|
|**Zustand**|latest|**Estado global ligero (auth, acuario seleccionado, tema, preferencias)**|
|**Recharts**|latest|**Gráficas de evolución temporal de parámetros del agua**|
|**react-i18next**|latest|**Internacionalización (EN base, DE, ES)**|

### Backend (Confirmado)

|Tecnología|Rol|
|---|---|
|Java + Spring Boot|API REST principal, lógica de negocio, CRUD|
|Spring Security + JWT|Autenticación y autorización|
|Python|Scraper de tiendas del sector + puente con la API de Groq (Llama 3.3)|
|Groq (Llama 3.3 70B)|Motor del asistente de IA|
|Docker / Docker Compose|Orquestación de servicios (Java, Python, BD)|
|Base de Datos (PostgreSQL / MySQL)|Persistencia de datos|

### Comunicación entre servicios

- **Frontend ↔ Java:** Axios → API REST (JWT en headers).
- **Java ↔ Python:** Comunicación interna por red Docker (el servicio Java llama al servicio Python vía HTTP interno, nunca expuesto al exterior).
- **Python ↔ Groq:** Llamada directa a la API de Groq (modelo Llama 3.3 70B Versatile) desde el servicio Python.

---

## 3. Arquitectura del Sistema

### Diagrama de flujo de alto nivel

```
┌──────────────┐     HTTPS/JWT      ┌──────────────────┐
│              │ ◄────────────────►  │                  │
│   FRONTEND   │                    │   JAVA (Spring)  │
│  React SPA   │                    │   API REST       │
│              │                    │   Auth (JWT)     │
└──────────────┘                    │   Business Logic │
                                    └────────┬─────────┘
                                             │ HTTP interno
                                             │ (red Docker)
                                    ┌────────▼─────────┐
                                    │                  │
                                    │   PYTHON         │
                                    │   Scraper        │
                                    │   Groq Bridge    │
                                    │                  │
                                    └────────┬─────────┘
                                             │
                              ┌──────────────┼──────────────┐
                              │              │              │
                       ┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼─────┐
                       │    Base     │ │  Tiendas  │ │   Groq    │
                       │   Datos    │ │  (Scrape) │ │  Llama3.3 │
                       └─────────────┘ └───────────┘ └───────────┘
```

### Modelo de datos (entidades principales)

**User:** id, email, password (hashed), username, plan (FREE/REEFMASTER), kwhPrice, locale, createdAt.

**Aquarium:** id, userId, name, volumeLiters, ecosystemType (REEF / FISH_ONLY / MIXED), createdAt.

**Inhabitant:** id, aquariumId, speciesName, category (FISH / CORAL / INVERTEBRATE), isReefSafe (boolean), imageUrl, addedAt.

**Equipment:** id, aquariumId, deviceName, powerWatts, dailyHours, category (LIGHT / PUMP / SKIMMER / HEATER / OTHER).

**WaterParameter:** id, aquariumId, temperature, salinity, ph, alkalinityDKH, calciumPPM, magnesiumPPM, nitratesPPM, phosphatesPPM, measuredAt (timestamp).

**WishlistItem:** id, userId, productName, productUrl, imageUrl, price, category (EQUIPMENT / LIVESTOCK / SUPPLEMENT / OTHER), priority (LOW / MEDIUM / HIGH), notes, addedAt.

---

## 4. Estructura de Carpetas

### Frontend (React)

```
src/
├── api/                          # Configuración de Axios e interceptors
│   ├── axiosConfig.ts            # Instancia base, JWT interceptor
│   ├── authApi.ts                # Endpoints de auth (login, register, refresh)
│   ├── aquariumApi.ts            # CRUD acuarios
│   ├── parameterApi.ts           # CRUD mediciones de agua
│   ├── inhabitantApi.ts          # CRUD fauna
│   ├── equipmentApi.ts           # CRUD equipamiento
│   ├── marketApi.ts              # Endpoints del scraper/market
│   ├── wishlistApi.ts            # CRUD wishlist
│   └── chatApi.ts                # Endpoint del chatbot IA
│
├── assets/                       # Recursos estáticos
│   ├── images/
│   ├── videos/
│   └── fonts/
│
├── components/                   # Componentes reutilizables
│   ├── ui/                       # Primitivos de UI (Button, Card, Badge, Modal, Input, Spinner...)
│   ├── layout/                   # Navbar, Sidebar, BottomTabBar, Footer, PageWrapper
│   ├── charts/                   # Wrappers de Recharts (ParameterLineChart, EnergyPieChart...)
│   └── shared/                   # ReefSafeBadge, PlanGate, AlertBanner, EmptyState...
│
├── features/                     # Módulos por feature (cada uno agrupa su lógica)
│   ├── auth/                     # Login, Register, ForgotPassword, AuthGuard
│   ├── landing/                  # Hero, AboutUs, HowItWorks, CTASection, PricingCards
│   ├── dashboard/                # DashboardView, AquariumCard, GlobalAlerts
│   ├── aquarium-detail/          # AquariumDetail, ParameterPanel, InhabitantList, EquipmentList
│   ├── calculator/               # DosageCalculator, EnergyCalculator
│   ├── market/                   # MarketSearch, ProductCard, ProductFilters
│   ├── wishlist/                 # WishlistView, WishlistItemCard, WishlistFilters
│   ├── chat/                     # ChatDrawer, ChatBubble, ChatInput, MessageList
│   └── profile/                  # ProfileView, AccountSettings, PlanManagement
│
├── hooks/                        # Custom hooks globales
│   ├── useAuth.ts                # Estado de autenticación
│   ├── useAquarium.ts            # Acuario seleccionado actualmente
│   ├── useMediaQuery.ts          # Detección responsive
│   └── usePlan.ts                # Lógica de verificación de plan (Free vs ReefMaster)
│
├── i18n/                         # Internacionalización
│   ├── config.ts                 # Configuración de react-i18next
│   └── locales/
│       ├── en/
│       │   ├── common.json
│       │   ├── landing.json
│       │   ├── dashboard.json
│       │   └── ...
│       ├── de/
│       └── es/
│
├── store/                        # Zustand stores
│   ├── authStore.ts              # Usuario, token, login/logout
│   ├── aquariumStore.ts          # Acuario seleccionado, lista de acuarios
│   └── uiStore.ts               # Sidebar abierta/cerrada, tema, chat drawer
│
├── routes/                       # Configuración de React Router
│   ├── AppRouter.tsx             # Router principal con rutas públicas y protegidas
│   ├── PublicRoute.tsx           # Wrapper para rutas públicas (landing)
│   └── ProtectedRoute.tsx        # Wrapper que verifica JWT válido
│
├── types/                        # Tipos TypeScript globales
│   ├── aquarium.ts
│   ├── user.ts
│   ├── parameter.ts
│   ├── inhabitant.ts
│   ├── equipment.ts
│   ├── wishlist.ts
│   └── api.ts                    # Tipos de respuesta/request de la API
│
├── utils/                        # Utilidades puras
│   ├── formatters.ts             # Formateo de fechas, números, moneda
│   ├── validators.ts             # Validaciones de formularios
│   ├── constants.ts              # Constantes globales (rangos de parámetros, límites de plan)
│   └── parameterRanges.ts        # Rangos óptimos de cada parámetro del agua
│
├── App.tsx
├── main.tsx
└── index.css                     # Tailwind base + variables CSS customizadas
```

### Backend — Java (Spring Boot)

```
src/main/java/com/thalassa/
├── config/
│   ├── SecurityConfig.java       # Configuración Spring Security + JWT filter
│   ├── CorsConfig.java           # Configuración CORS
│   └── WebClientConfig.java      # Cliente HTTP para comunicación con servicio Python
│
├── auth/
│   ├── AuthController.java       # POST /auth/login, /auth/register, /auth/refresh
│   ├── AuthService.java
│   ├── JwtProvider.java          # Generación y validación de tokens JWT
│   └── JwtFilter.java            # Filtro de autenticación en cada request
│
├── user/
│   ├── UserController.java       # GET/PUT /users/me (perfil, kwhPrice, locale)
│   ├── UserService.java
│   ├── User.java                 # Entidad JPA
│   └── UserRepository.java
│
├── aquarium/
│   ├── AquariumController.java   # CRUD /aquariums
│   ├── AquariumService.java      # Lógica de negocio + validación límite de plan
│   ├── Aquarium.java
│   └── AquariumRepository.java
│
├── inhabitant/
│   ├── InhabitantController.java # CRUD /aquariums/{id}/inhabitants
│   ├── InhabitantService.java    # Lógica Reef Safe warning
│   ├── Inhabitant.java
│   └── InhabitantRepository.java
│
├── equipment/
│   ├── EquipmentController.java  # CRUD /aquariums/{id}/equipment
│   ├── EquipmentService.java
│   ├── Equipment.java
│   └── EquipmentRepository.java
│
├── parameter/
│   ├── ParameterController.java  # POST /aquariums/{id}/parameters, GET historial
│   ├── ParameterService.java
│   ├── WaterParameter.java
│   └── ParameterRepository.java
│
├── wishlist/
│   ├── WishlistController.java   # CRUD /wishlist
│   ├── WishlistService.java
│   ├── WishlistItem.java
│   └── WishlistRepository.java
│
├── market/
│   ├── MarketController.java     # GET /market/search → proxy al servicio Python
│   └── MarketService.java        # Llama al scraper Python vía HTTP interno
│
├── chat/
│   ├── ChatController.java       # POST /chat → proxy al servicio Python (Groq)
│   └── ChatService.java          # Controla límite de 5 consultas/día (plan Free)
│
├── plan/
│   ├── PlanGuard.java            # Anotación/aspecto para verificar plan en endpoints protegidos
│   └── PlanService.java          # Lógica de verificación de plan
│
└── common/
    ├── dto/                      # DTOs de request/response
    ├── exception/                # Excepciones custom + GlobalExceptionHandler
    └── util/                     # Utilidades compartidas
```

### Backend — Python

```
python-service/
├── app/
│   ├── main.py                   # FastAPI/Flask entry point
│   ├── scraper/
│   │   ├── market_scraper.py     # Lógica de scraping de tiendas del sector
│   │   ├── species_scraper.py    # Scraping de base de datos de especies (peces, corales, invertebrados)
│   │   └── parsers/              # Parsers específicos por tienda/fuente
│   ├── services/
│   │   ├── groq_client.py        # Wrapper de la API de Groq (Llama 3.3 70B)
│   │   └── prompts.py            # System prompts especializados en acuariofilia marina
│   ├── routes/
│   │   ├── market_routes.py      # Endpoints: /scrape/search, /scrape/species
│   │   └── chat_routes.py        # Endpoint: /chat/message
│   └── config.py                 # Variables de entorno, API keys
├── requirements.txt
└── Dockerfile
```

### Docker Compose

```
docker-compose.yml
├── service: thalassa-api (Java)        → Puerto 8080 (expuesto)
├── service: thalassa-python (Python)   → Puerto 5000 (solo red interna)
├── service: thalassa-db (PostgreSQL)   → Puerto 5432 (solo red interna)
└── network: thalassa-net               → Red interna compartida
```

---

## 5. Sistema de Diseño

### 5.1 Paleta de colores

|Token|Valor|Uso|
|---|---|---|
|`--color-bg-primary`|`#000000`|Fondo principal (negro OLED puro)|
|`--color-bg-card`|`#000000`|Fondo de tarjetas (mismo negro, separadas por borde)|
|`--color-bg-elevated`|`#0A0A0A`|Fondos ligeramente elevados (modales, drawers, tooltips)|
|`--color-bg-input`|`#0D0D0D`|Fondo de inputs y campos de formulario|
|`--color-accent`|`#59D3FF`|Color de acento principal (botones, links, CTAs, iconos activos)|
|`--color-accent-hover`|`#3DC5F5`|Hover del acento (10% más oscuro)|
|`--color-accent-subtle`|`rgba(89, 211, 255, 0.10)`|Backgrounds sutiles de acento (badges, highlights)|
|`--color-accent-glow`|`rgba(89, 211, 255, 0.25)`|Glow/sombra para elementos destacados|
|`--color-text-primary`|`#FFFFFF`|Texto principal|
|`--color-text-secondary`|`#A0A0A0`|Texto secundario (descripciones, labels)|
|`--color-text-tertiary`|`#666666`|Texto terciario (placeholders, hints)|
|`--color-border`|`rgba(255, 255, 255, 0.08)`|Bordes por defecto de tarjetas y separadores|
|`--color-border-hover`|`rgba(255, 255, 255, 0.15)`|Bordes en hover|
|`--color-border-active`|`rgba(89, 211, 255, 0.40)`|Bordes en estado activo/focus|
|`--color-success`|`#34D399`|Estados positivos (Reef Safe ✓, parámetros en rango)|
|`--color-warning`|`#FBBF24`|Advertencias (parámetros cerca del límite)|
|`--color-danger`|`#F87171`|Errores y alertas críticas (parámetros fuera de rango, Not Reef Safe)|

### 5.2 Separación visual (sin sombras)

Al trabajar con fondo negro OLED puro, las sombras tradicionales no funcionan. La separación entre elementos se consigue exclusivamente con:

- **Bordes finos:** `border: 1px solid rgba(255, 255, 255, 0.08)` en tarjetas, inputs, y contenedores.
- **Bordes hover:** `border: 1px solid rgba(255, 255, 255, 0.15)` para feedback interactivo.
- **Bordes activos:** `border: 1px solid rgba(89, 211, 255, 0.40)` para estados seleccionados/focus.
- **Fondos sutiles:** `#0A0A0A` o `#0D0D0D` para crear capas mínimas donde sea estrictamente necesario (modales, drawers).
- **Glow de acento:** `box-shadow: 0 0 20px rgba(89, 211, 255, 0.15)` solo en elementos hero o CTAs principales para crear profundidad sin romper la estética.

### 5.3 Tipografía

|Elemento|Font|Tamaño (desktop)|Tamaño (móvil)|Peso|
|---|---|---|---|---|
|H1 (Hero)|Inter|56px / 3.5rem|36px / 2.25rem|700 (Bold)|
|H2 (Sección)|Inter|40px / 2.5rem|28px / 1.75rem|600 (Semibold)|
|H3 (Subtítulo)|Inter|24px / 1.5rem|20px / 1.25rem|600 (Semibold)|
|Body|Inter|16px / 1rem|16px / 1rem|400 (Regular)|
|Body small|Inter|14px / 0.875rem|14px / 0.875rem|400 (Regular)|
|Caption/Label|Inter|12px / 0.75rem|12px / 0.75rem|500 (Medium)|
|Botones|Inter|14-16px|14-16px|600 (Semibold)|
|Datos numéricos|JetBrains Mono|20-32px|18-24px|500 (Medium)|

**Inter** como fuente principal: limpia, moderna, altamente legible, excelente soporte multi-idioma (crucial para DE y ES). **JetBrains Mono** como fuente monoespaciada para datos numéricos de parámetros del agua — da un aspecto técnico y profesional a los valores.

### 5.4 Espaciado y grid

- **Sistema de espaciado base:** múltiplos de 4px (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80).
- **Grid máximo de contenido (landing):** `max-width: 1200px`, centrado.
- **Grid del gestor (desktop):** sidebar de 260px fijo + área de contenido fluida.
- **Padding de secciones (landing):** `padding: 80px 0` en desktop, `padding: 48px 16px` en móvil.
- **Gap entre tarjetas:** `gap: 16px` en desktop, `gap: 12px` en móvil.
- **Radius de tarjetas:** `border-radius: 12px`.
- **Radius de botones:** `border-radius: 8px`.
- **Radius de inputs:** `border-radius: 8px`.

### 5.5 Componentes UI base

#### Botón primario (CTA)

```
Fondo: #59D3FF
Texto: #000000 (negro sobre azul para máximo contraste)
Hover: #3DC5F5
Padding: 12px 24px
Font: Inter 14px Semibold
Border-radius: 8px
Transición: background 200ms ease, transform 100ms ease
Hover transform: scale(1.02)
```

#### Botón secundario (outline)

```
Fondo: transparent
Texto: #59D3FF
Borde: 1px solid rgba(89, 211, 255, 0.40)
Hover fondo: rgba(89, 211, 255, 0.08)
Padding: 12px 24px
```

#### Botón ghost

```
Fondo: transparent
Texto: #FFFFFF
Hover fondo: rgba(255, 255, 255, 0.06)
Padding: 8px 16px
```

#### Card

```
Fondo: #000000
Borde: 1px solid rgba(255, 255, 255, 0.08)
Border-radius: 12px
Padding: 20px
Hover borde: rgba(255, 255, 255, 0.15)
Transición: border-color 200ms ease
```

#### Input

```
Fondo: #0D0D0D
Borde: 1px solid rgba(255, 255, 255, 0.08)
Focus borde: rgba(89, 211, 255, 0.40)
Texto: #FFFFFF
Placeholder: #666666
Padding: 12px 16px
Border-radius: 8px
```

#### Badge Reef Safe

```
Reef Safe (true):  fondo rgba(52, 211, 153, 0.12), texto #34D399, borde 1px solid rgba(52, 211, 153, 0.25)
Not Reef Safe (false): fondo rgba(248, 113, 113, 0.12), texto #F87171, borde 1px solid rgba(248, 113, 113, 0.25)
```

#### Badge de parámetro

```
En rango: mismo estilo que Reef Safe (success)
Cercano al límite: fondo rgba(251, 191, 36, 0.12), texto #FBBF24
Fuera de rango: mismo estilo que Not Reef Safe (danger)
```

---

## 6. Reglas de Negocio — Planes

### Plan FREE (Gratuito)

|Feature|Límite|
|---|---|
|Acuarios|Máximo 1|
|Chatbot IA|5 consultas/día (reset a medianoche UTC)|
|Calculadora Energética|Bloqueada (paywall)|
|Calculadora de Dosificación|Bloqueada (paywall)|
|Inventario de fauna|Completo (sin límite de habitantes)|
|Buscador Market (scraper)|Completo|
|Alertas Reef Safe|Completas (warning proactivo + badge visual)|
|Registro de parámetros del agua|Completo (sin límite de mediciones)|
|Gráficas de evolución|Completas|
|Wishlist|Completa (con notas, categorías, prioridad)|

### Plan ReefMaster (Premium — 4,99 €/mes)

|Feature|Acceso|
|---|---|
|Acuarios|Ilimitados|
|Chatbot IA|Consultas ilimitadas|
|Calculadora Energética|Desbloqueada|
|Calculadora de Dosificación|Desbloqueada|
|Todo lo demás|Igual que Free, sin límites|

### Implementación del paywall en el frontend

Crear un componente `<PlanGate>` que envuelva cualquier feature premium:

```tsx
// components/shared/PlanGate.tsx
interface PlanGateProps {
  feature: 'calculator_energy' | 'calculator_dosage' | 'aquarium_create' | 'chat_unlimited';
  children: React.ReactNode;
}

// Si el usuario es FREE y la feature es premium:
//   → Renderiza un overlay con blur + icono de candado + CTA "Upgrade to ReefMaster"
// Si el usuario es REEFMASTER:
//   → Renderiza children normalmente
```

### Validación en el backend

- **Crear acuario:** `AquariumService` cuenta los acuarios del usuario. Si plan = FREE y count >= 1, responde `403 Forbidden` con mensaje de upgrade.
- **Chat IA:** `ChatService` lleva un contador diario por usuario. Si plan = FREE y count >= 5, responde `429 Too Many Requests`.
- **Calculadoras:** Las calculadoras son herramientas frontend puras (no requieren endpoint de backend). El bloqueo se hace en el frontend con `<PlanGate>`, pero el plan del usuario se valida contra el JWT para evitar manipulación del lado cliente.

---

## 7. Landing Page (Pública)

### 7.1 Estructura de secciones (orden de scroll)

#### Sección 1 — Navbar Superior

**Desktop:**

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo THALASSA]    Home  About  How it works    [Log in] [Sign up] │
└─────────────────────────────────────────────────────────────┘
```

- Fondo: `#000000` con `backdrop-filter: blur(12px)` al hacer scroll (se vuelve semitransparente).
- Posición: `fixed` top, z-index alto.
- Logo: Texto "THALASSA" o logotipo a la izquierda.
- Links de navegación: `color: #FFFFFF`, hover: `color: #59D3FF`.
- "Log in": botón ghost.
- "Sign up": botón primario (`#59D3FF`).

**Móvil:**

```
┌────────────────────────────────┐
│  [☰]     [Logo THALASSA]  [Log in] │
└────────────────────────────────┘
```

- Izquierda: icono hamburguesa que despliega un menú lateral (drawer) desde la izquierda con `Framer Motion` (animación slide-in suave de 300ms).
- Centro: Logo.
- Derecha: botón "Log in" compacto.
- El drawer contiene: Home, About, How it works, Sign up (como botón primario al final).

#### Sección 2 — Hero

**Contenido:**

- Fondo: Video loop de fondo marino (corales, océano, vida submarina) con overlay oscuro al `60-70% opacity` para mantener legibilidad.
- Título (H1): Frase de impacto. Ejemplo: "Your reef, perfected."
- Subtítulo: Breve descripción del valor. Ejemplo: "The all-in-one management platform for marine aquarists. Track, optimize, and master your reef ecosystem."
- CTA primario: "Get Started Free" → Si no está logueado, lleva a /register. Si está logueado, lleva a /dashboard.
- CTA secundario (outline): "See How It Works" → Scroll suave a la sección "How It Works".
- Altura: `100vh` (viewport completo).

**Transiciones:** El Hero utiliza un fade-in con slight upward movement al cargar la página (Framer Motion, `opacity: 0 → 1`, `y: 20 → 0`, duración 800ms, ease-out).

#### Sección 3 — Social Proof (Propuesta nueva)

**Contenido:**

- Contadores animados (animación de incremento numérico al entrar en viewport):
    - "X+ Aquariums Managed"
    - "X+ Parameters Tracked"
    - "X+ Species in Database"
- Fondo: `#000000`.
- Los números se muestran en `JetBrains Mono`, color `#59D3FF`, tamaño grande (40-48px).

**Nota:** Los números iniciales pueden ser un objetivo aspiracional o basados en datos de beta testers. A medida que crezca la base de usuarios, se conectan al backend real.

**Transición con la sección anterior:** Al hacer scroll, los contadores aparecen con staggered animation (cada uno aparece 150ms después del anterior, fade-in + slide-up).

#### Sección 4 — About Us

**Contenido:**

- Título (H2): "Who We Are" o "About Thalassa".
- Párrafo explicando la organización, la misión, y el impacto real que la herramienta puede tener en la salud de los ecosistemas marinos domésticos.
- Imagen o ilustración complementaria a un lado (en desktop, layout 50/50; en móvil, imagen arriba, texto debajo).
- Posible imagen: foto de un acuario de arrecife vibrante, o una imagen con tratamiento visual acorde a la marca.

**Layout desktop:**

```
┌──────────────────────────────────────────────────┐
│  [Imagen/Visual]          │   Who We Are         │
│                           │                      │
│                           │   Párrafo...         │
│                           │   Párrafo...         │
└──────────────────────────────────────────────────┘
```

**Transición:** La imagen entra desde la izquierda (slide-in) y el texto desde la derecha, encontrándose al centro del viewport (IntersectionObserver + Framer Motion).

#### Sección 5 — How It Works / Features

**Contenido:**

- Título (H2): "How It Works" o "Everything You Need".
- 3-4 bloques de features con icono (Lucide), título y descripción breve:
    - **Track:** "Log water parameters, track livestock, monitor equipment — all in one place."
    - **Analyze:** "Interactive charts show parameter trends. Know when your reef needs attention."
    - **Optimize:** "Professional dosing calculator, energy cost tracker, and AI-powered advice."
    - **Discover:** "Browse the marketplace for equipment, livestock, and supplements from top retailers."
- Cada bloque dentro de una `Card` con borde fino.

**Layout desktop:** Grid de 2x2 o fila de 4 columnas.  
**Layout móvil:** Stack vertical, una card debajo de otra.

**Transición:** Las cards aparecen con stagger (una tras otra, 100ms de delay) al entrar en viewport.

#### Sección 6 — Planes / Pricing

**Contenido:**

- Título (H2): "Choose Your Plan".
- Dos cards comparativas lado a lado:

```
┌─────────────────┐    ┌─────────────────┐
│     FREE         │    │   REEFMASTER    │
│                  │    │   $4.99/mo      │
│  1 aquarium      │    │   Unlimited     │
│  5 AI chats/day  │    │   Unlimited AI  │
│  Basic tools     │    │   All tools     │
│                  │    │   Energy calc   │
│  [Start Free]    │    │   Dosing calc   │
│                  │    │                 │
│                  │    │  [Go ReefMaster]│
└─────────────────┘    └─────────────────┘
```

- Card FREE: borde estándar (`rgba(255,255,255,0.08)`).
- Card REEFMASTER: borde de acento (`rgba(89,211,255,0.40)`) + subtle glow (`box-shadow: 0 0 30px rgba(89,211,255,0.12)`) para destacarlo como la opción recomendada. Badge "RECOMMENDED" en esquina superior.
- CTA de ambas lleva a /register (o /upgrade si ya está logueado como Free).

#### Sección 7 — CTA Final

**Contenido:**

- Fondo: Imagen marina con overlay oscuro, similar al Hero pero diferente imagen.
- Título (H2): Frase de cierre motivacional. Ejemplo: "Join the next generation of reef keeping."
- Subtítulo: "Start managing your aquarium today — completely free."
- CTA: Botón primario "Create Your Account" → /register.

**Transición:** Fade-in al entrar en viewport.

#### Sección 8 — Footer

**Contenido:**

- Fondo: `#000000`, borde superior `1px solid rgba(255,255,255,0.08)`.
- Columnas (desktop):
    - **Thalassa:** Logo + tagline breve.
    - **Product:** Dashboard, Calculator, Market, AI Assistant.
    - **Company:** About, Contact, Blog (futuro).
    - **Legal:** Terms of Service, Privacy Policy.
- Copyright: "© 2026 Thalassa. All rights reserved."
- **Móvil:** Las columnas se colapsan en acordeón o stack vertical.

### 7.2 Transiciones entre secciones (Framer Motion)

Todas las transiciones son activadas por `IntersectionObserver` (elemento entra al 20% del viewport) y ejecutadas con Framer Motion:

|Sección|Tipo de animación|Duración|Easing|
|---|---|---|---|
|Hero|Fade-in + slide-up (y: 20→0)|800ms|ease-out|
|Social Proof|Contadores con stagger (150ms delay cada uno)|600ms|ease-out|
|About Us|Imagen slide-left, texto slide-right|700ms|ease-out|
|How It Works|Cards con stagger (100ms delay)|500ms|ease-out|
|Pricing|Cards scale-in (scale: 0.95→1) + fade|600ms|ease-out|
|CTA Final|Fade-in|600ms|ease-out|

**Regla de rendimiento:** Todas las animaciones usan propiedades `transform` y `opacity` exclusivamente (GPU-accelerated). Nunca animar `width`, `height`, `margin`, `padding`, o `top/left`.

---

## 8. Gestor de Acuarios (Privado)

### 8.1 Layout general — Desktop

```
┌─────────────────────────────────────────────────────────────┐
│                        TOPBAR (opcional, mínima)            │
│  [Logo]                                     [Notificaciones] [Avatar] │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ SIDEBAR  │              ÁREA DE CONTENIDO                   │
│  260px   │                                                  │
│          │  (Aquí se renderiza cada vista según la ruta)     │
│ Dashboard│                                                  │
│ Calcul.  │                                                  │
│ Market   │                                                  │
│ Wishlist │                                                  │
│ Profile  │                                                  │
│          │                                                  │
│          ├──────────────────────────┐                        │
│          │                          │  CHAT DRAWER           │
│          │   Contenido principal    │  (se abre sobre el     │
│          │                          │   contenido, 380px)    │
│          │                          │                        │
│          │                          │                        │
│          └──────────────────────────┘                        │
└──────────┴──────────────────────────────────────────────────┘
```

**Sidebar (Desktop):**

- Ancho: 260px, fijo.
- Fondo: `#000000`.
- Borde derecho: `1px solid rgba(255,255,255,0.08)`.
- Items de navegación:
    - Icono (Lucide) + Label.
    - Estado normal: `color: #A0A0A0`.
    - Estado hover: `background: rgba(255,255,255,0.04)`, `color: #FFFFFF`.
    - Estado activo: `color: #59D3FF`, `background: rgba(89,211,255,0.08)`, barra lateral izquierda de 3px `#59D3FF`.
- Secciones del sidebar:
    1. **Dashboard** (icono: LayoutDashboard)
    2. **Dosing Calculator** (icono: FlaskConical) — badge "PRO" si es Free
    3. **Energy Calculator** (icono: Zap) — badge "PRO" si es Free
    4. **Market** (icono: ShoppingBag)
    5. **Wishlist** (icono: Heart)
    6. **AI Assistant** (icono: Bot) — abre el drawer, no navega a otra página
    7. --- separador ---
    8. **Profile** (icono: User)
- En la parte inferior del sidebar: botón de "Log out" (icono: LogOut).

**Chat Drawer (Desktop):**

- Se abre desde la derecha, ancho 380px.
- Fondo: `#0A0A0A` (ligeramente elevado).
- Borde izquierdo: `1px solid rgba(255,255,255,0.08)`.
- Overlay sobre el contenido (no empuja el layout).
- Animación: slide-in desde la derecha (Framer Motion, 300ms).
- Header: "AI Assistant" + botón de cerrar (X).
- Área de mensajes: scroll vertical.
- Input fijo en la parte inferior: campo de texto + botón enviar.
- Si plan Free: mostrar contador "X/5 questions used today" sobre el input.

### 8.2 Layout general — Móvil

```
┌────────────────────────────────┐
│          TOPBAR                │
│  [Logo]        [🔔] [Avatar]  │
├────────────────────────────────┤
│                                │
│                                │
│     ÁREA DE CONTENIDO          │
│     (100% ancho, scroll)       │
│                                │
│                                │
│                                │
│                                │
├────────────────────────────────┤
│  [Dashboard] [Calc] [Market] [AI] [Profile] │
│           BOTTOM TAB BAR       │
└────────────────────────────────┘
```

**Bottom Tab Bar (Móvil):**

- Posición: `fixed` bottom, z-index alto.
- Fondo: `#000000`.
- Borde superior: `1px solid rgba(255,255,255,0.08)`.
- 5 ítems:
    1. **Dashboard** (icono: LayoutDashboard)
    2. **Tools** (icono: Wrench) — abre un sub-menú con: Dosing Calculator, Energy Calculator
    3. **Market** (icono: ShoppingBag)
    4. **AI** (icono: Bot) — abre el chat como modal fullscreen en móvil
    5. **Profile** (icono: User) — incluye acceso a Wishlist, Settings, Log out
- Estado activo: icono color `#59D3FF`, label `#59D3FF`.
- Estado inactivo: icono color `#666666`, label `#666666`.
- Cada ítem: icono (24px) + label debajo (10px, all caps).
- Alto de la barra: 64px + safe area bottom (para dispositivos con notch).

**Chat en Móvil:**

- Se abre como **pantalla completa** (no drawer lateral).
- Header: "AI Assistant" + botón "←" para cerrar.
- Mismo layout de mensajes que desktop pero adaptado a 100% ancho.
- Input fijo en la parte inferior con respeto al safe area y al teclado virtual.

### 8.3 Dashboard (Vista fusionada)

El Dashboard es la pantalla de inicio del gestor. Se adapta dinámicamente según el número de acuarios del usuario:

#### Usuario con 1 acuario (Free)

El Dashboard muestra directamente el resumen del único acuario, sin paso intermedio innecesario:

```
┌─────────────────────────────────────────────┐
│  Dashboard                                  │
│                                             │
│  [Nombre del Acuario]    [Tipo: Reef]       │
│  Volume: 300L                               │
│                                             │
│  ┌── Últimos Parámetros ──────────────────┐ │
│  │ Temp: 25.5°C ✓  │ pH: 8.2 ✓           │ │
│  │ Ca: 420ppm ✓     │ KH: 8.5 dKH ✓      │ │
│  │ Mg: 1350ppm ✓    │ NO3: 5ppm ✓        │ │
│  │ PO4: 0.03ppm ✓   │ Sal: 1.025 ✓       │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌── Quick Stats ─────────────────────────┐ │
│  │ 🐠 12 Animals  │  🔧 6 Equipment      │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  [View Full Details →]                      │
│                                             │
└─────────────────────────────────────────────┘
```

#### Usuario con múltiples acuarios (ReefMaster)

```
┌────────────────────────────────────────────────────┐
│  Dashboard                                         │
│                                                    │
│  ┌── Global Summary ───────────────────────────┐   │
│  │ 3 Aquariums · 2 Alerts Active · $42/mo est. │   │
│  └─────────────────────────────────────────────┘   │
│                                                    │
│  ┌── Reef Paradise ────────┐ ┌── Nano Reef ──────┐ │
│  │ 500L · Reef             │ │ 60L · Reef        │ │
│  │ 🐠 18  🔧 8             │ │ 🐠 5  🔧 4        │ │
│  │ ⚠ Ca: 370ppm (bajo)    │ │ ✓ All params OK   │ │
│  │ [View →]                │ │ [View →]          │ │
│  └─────────────────────────┘ └───────────────────┘ │
│                                                    │
│  ┌── Breeding Tank ───────┐ ┌── + Add Aquarium ──┐ │
│  │ 120L · Fish Only       │ │                    │ │
│  │ 🐠 6  🔧 3              │ │  [+] New Aquarium  │ │
│  │ ✓ All params OK        │ │                    │ │
│  │ [View →]                │ │                    │ │
│  └─────────────────────────┘ └───────────────────┘ │
└────────────────────────────────────────────────────┘
```

- Cada tarjeta muestra: nombre, volumen, tipo de ecosistema, conteo de fauna y equipamiento, alerta más relevante (si existe).
- Card "+ Add Aquarium": botón de creación con icono `+` y borde dashed `rgba(89,211,255,0.30)`.
- Al hacer clic en cualquier card → navega a `/dashboard/aquarium/:id` (detalle completo).

**Móvil:** Las tarjetas se apilan verticalmente, una debajo de otra, ancho completo.

---

## 9. Detalle de Acuario

Esta es la vista más rica y compleja del producto. Se accede al hacer clic en una tarjeta del Dashboard.

### 9.1 Estructura de tabs

La vista de detalle se organiza en tabs horizontales (desktop y móvil):

```
┌──────────────────────────────────────────────────────────┐
│  ← Back to Dashboard    [Reef Paradise]    [⚙ Settings] │
├──────────────────────────────────────────────────────────┤
│  [Overview]  [Parameters]  [Livestock]  [Equipment]      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│              CONTENIDO DEL TAB ACTIVO                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Tabs:**

- Estado activo: texto `#59D3FF`, borde inferior 2px `#59D3FF`.
- Estado inactivo: texto `#A0A0A0`.
- En móvil: los tabs son horizontally scrollable si no caben.

### 9.2 Tab: Overview

Resumen visual del estado actual del acuario:

- **Header:** Nombre del acuario, volumen (L), tipo de ecosistema.
- **Panel de parámetros actuales:** Grid de cards con el último valor registrado de cada parámetro. Cada card muestra:
    - Nombre del parámetro (ej. "Calcium").
    - Valor actual (ej. "420 ppm") en `JetBrains Mono`, grande.
    - Badge de estado: ✓ verde (en rango), ⚠ amarillo (cerca del límite), ✕ rojo (fuera de rango).
    - Rango óptimo debajo en texto secundario (ej. "380–450 ppm").
- **Mini-gráfica sparkline** (opcional pero recomendada): Una línea pequeña debajo de cada valor mostrando la tendencia de las últimas 7 mediciones. Si sube, baja, o se mantiene estable.
- **Quick stats:** Conteo de fauna por categoría (peces, corales, invertebrados) y total de equipamiento.
- **Botón "Log New Measurement":** Abre un modal con formulario para registrar nuevos parámetros.

**Rangos óptimos de referencia** (para los badges y alertas):

|Parámetro|Rango óptimo|Unidad|
|---|---|---|
|Temperatura|24.0 – 26.5|°C|
|Salinidad|1.023 – 1.026|SG|
|pH|8.0 – 8.4|—|
|Alcalinidad (KH)|7.0 – 11.0|dKH|
|Calcio|380 – 450|ppm|
|Magnesio|1250 – 1400|ppm|
|Nitratos|0 – 10|ppm|
|Fosfatos|0.00 – 0.10|ppm|

Estos rangos deben almacenarse en `utils/parameterRanges.ts` como constantes, referenciados tanto en los badges como en las gráficas (para pintar zonas de rango óptimo como banda verde en el fondo de los charts).

### 9.3 Tab: Parameters

Vista completa de la evolución de parámetros del agua a lo largo del tiempo.

**Componente principal: ParameterLineChart (Recharts)**

- Gráfica de líneas temporal.
- Eje X: fechas de medición.
- Eje Y: valor del parámetro.
- Banda de fondo verde semitransparente indicando el rango óptimo.
- Línea del parámetro: color `#59D3FF`.
- Puntos de datos: dot en cada medición, tooltip al hover mostrando fecha + valor exacto.
- El usuario puede seleccionar qué parámetro visualizar (selector/tabs: Temperature, Salinity, pH, KH, Ca, Mg, NO3, PO4).

**Filtros de tiempo:** "Last 7 days", "Last 30 days", "Last 3 months", "All time".

**Tabla de historial:** Debajo de la gráfica, una tabla con todas las mediciones ordenadas por fecha descendente (más reciente primero). Cada fila muestra todos los parámetros de esa medición + fecha. Clic en una fila → highlight del punto en la gráfica.

**Botón "Log New Measurement":** Mismo modal que en Overview, siempre accesible.

### 9.4 Tab: Livestock

Inventario completo de fauna del acuario.

**Vista:**

- Grid de cards (desktop: 3-4 columnas, móvil: 2 columnas).
- Cada card:
    - Imagen de la especie (del scraper/base de datos de especies).
    - Nombre de la especie.
    - Categoría: badge "Fish" / "Coral" / "Invertebrate".
    - Badge Reef Safe (verde/rojo).
    - Botón "..." para editar o eliminar.

**Botón "Add Animal":** Abre un buscador (search input) que consulta el scraper de especies. Al seleccionar un resultado → se dispara el POST al backend. Si el acuario es tipo "Reef" y el animal tiene `isReefSafe: false`, se muestra un warning modal antes de confirmar:

```
┌──────────────────────────────────────────┐
│  ⚠ Reef Safety Warning                  │
│                                          │
│  [Nombre del animal] is NOT reef safe.   │
│  This species may harm corals or other   │
│  invertebrates in your reef aquarium.    │
│                                          │
│  [Cancel]          [Add Anyway]          │
└──────────────────────────────────────────┘
```

### 9.5 Tab: Equipment

Inventario de equipamiento del acuario.

**Vista:**

- Lista o grid de cards con cada dispositivo.
- Cada card:
    - Nombre del dispositivo.
    - Categoría (Light, Pump, Skimmer, Heater, Other).
    - Potencia: "X W".
    - Horas diarias: "X h/day".
    - Consumo diario calculado: `(W × h) / 1000 = kWh/day` (calculado en frontend).
- **Resumen energético** en la parte superior (si es ReefMaster):
    - Total watts.
    - Total kWh/mes estimado.
    - Coste mensual estimado: `kWh_total × user.kwhPrice`.
    - Si es Free: este resumen aparece con blur + overlay `<PlanGate>`.

**Botón "Add Equipment":** Formulario modal con campos: nombre, categoría (select), potencia (W), horas diarias.

### 9.6 Settings del acuario (⚙)

Accesible desde el icono de engranaje en el header del detalle:

- Editar nombre del acuario.
- Editar volumen (litros).
- Cambiar tipo de ecosistema (Reef / Fish Only / Mixed).
- **Eliminar acuario:** Botón danger con confirmación doble ("Type the aquarium name to confirm deletion").

---

## 10. Módulos Funcionales

### 10.1 Calculadora de Dosificación (Premium)

**Ruta:** `/dashboard/calculator/dosing`

**Campos del formulario:**

1. **Net Water Volume:** Input numérico (litros). Pre-rellenado con el volumen del acuario seleccionado si hay uno activo.
2. **Parameter:** Select dropdown (Calcium, Alkalinity, Magnesium, Salinity).
3. **Current Value:** Input numérico.
4. **Target Value:** Input numérico.
5. **Product:** Select dropdown con los productos químicos comunes por parámetro:
    - Calcio: Calcium Chloride (CaCl₂), Kalkwasser (Ca(OH)₂)
    - Alcalinidad: Sodium Bicarbonate (NaHCO₃), Soda Ash (Na₂CO₃)
    - Magnesio: Magnesium Chloride (MgCl₂), Magnesium Sulfate (MgSO₄)
    - Salinidad: Reef Salt Mix

**Resultado:**

- Cantidad a dosificar en gramos o mililitros.
- Warning si la dosificación requerida es muy alta (podría causar pico tóxico): "Consider splitting this dose across multiple days."

**Fórmulas de cálculo:** Almacenadas en `utils/dosageFormulas.ts`. Son cálculos puramente frontend — no requieren endpoint de backend. El cálculo se basa en constantes químicas estándar de la acuariofilia marina.

**Paywall:** Envuelto en `<PlanGate feature="calculator_dosage">`. Los usuarios Free ven la interfaz con blur y CTA de upgrade.

### 10.2 Calculadora Energética (Premium)

**Ruta:** `/dashboard/calculator/energy`

**Funcionamiento:** No tiene formulario manual. Toma automáticamente los datos del equipamiento del acuario seleccionado y calcula:

- **Por dispositivo:** kWh/día, kWh/mes, coste/mes.
- **Total acuario:** kWh/mes total, coste/mes total.
- **Gráfica:** Pie chart (Recharts) mostrando la distribución del consumo por categoría de equipamiento (Lighting, Pumps, Skimmer, Heater, Other).

**Dependencia:** Requiere que el usuario haya configurado `kwhPrice` en su perfil. Si no lo ha hecho, mostrar un aviso: "Set your electricity price in Profile to see costs."

**Selector de acuario:** Si el usuario tiene múltiples acuarios, dropdown para seleccionar cuál calcular.

**Paywall:** Envuelto en `<PlanGate feature="calculator_energy">`.

### 10.3 Market (Scraper)

**Ruta:** `/dashboard/market`

**Interfaz:**

- **Barra de búsqueda** prominente en la parte superior.
- **Filtros laterales (desktop) / filtros como bottom sheet o accordion (móvil):**
    - Categoría: Equipment, Livestock, Supplements, Other.
    - Rango de precio (min-max).
    - Tienda de origen (si hay múltiples fuentes).
- **Grid de resultados:** Cards de producto con:
    - Imagen.
    - Nombre del producto.
    - Precio.
    - Tienda de origen.
    - Botón "♡" para añadir a Wishlist.
    - Botón "View" → abre enlace externo a la tienda original en nueva pestaña.

**Backend:** El frontend envía la query a `GET /market/search?q=...&category=...&minPrice=...&maxPrice=...`. Java la proxea al servicio Python, que ejecuta el scraping y devuelve resultados normalizados.

**Nota sobre tiendas:** Actualmente las tiendas scrapeadas no son 100% del sector. Priorizar la integración de tiendas especializadas en acuariofilia marina (BulkReefSupply, Marine Depot, Coral Essentials, LiveAquaria, o equivalentes europeos como Whitecorals.com, Korallen-Zucht). El scraper debería tener parsers modulares por tienda para facilitar la adición de nuevas fuentes.

### 10.4 AI Assistant (Chat Drawer)

**Ruta:** No tiene ruta propia. Se abre como drawer/modal desde cualquier sección.

**System Prompt de Thalassa AI (Groq / Llama 3.3):** Debe estar altamente especializado en acuariofilia marina. El prompt debe incluir contexto como:

- "You are an expert marine aquarist assistant."
- Conocimiento sobre parámetros del agua, compatibilidad de especies, problemas comunes (ich, dinoflagellates, cyano, algae bloom), dosificación, equipamiento, cycling de acuarios nuevos.
- Debe ser capaz de responder en el idioma configurado por el usuario.
- Idealmente, recibe contexto del acuario activo del usuario (parámetros actuales, fauna) para dar respuestas personalizadas.

**UI:**

- Mensajes del usuario: alineados a la derecha, fondo `rgba(89,211,255,0.10)`.
- Mensajes del asistente: alineados a la izquierda, fondo `rgba(255,255,255,0.04)`.
- Typing indicator: tres dots animados.
- Historial de la sesión: persiste mientras el drawer esté abierto. Se resetea al cerrar (o persistir en Zustand store para mantenerlo durante la sesión).

**Límite Free:**

- Contador visible: "3 of 5 questions used today".
- Al llegar al límite: el input se deshabilita y aparece CTA "Upgrade to ReefMaster for unlimited AI advice".

### 10.5 Wishlist

**Ruta:** `/dashboard/wishlist`

**Interfaz:**

- **Filtros superiores:**
    - Por categoría: All, Equipment, Livestock, Supplements, Other.
    - Por prioridad: All, High, Medium, Low.
- **Lista/grid de items:**
    - Card de producto (imagen, nombre, precio, tienda).
    - Badge de prioridad (High: rojo, Medium: amarillo, Low: gris).
    - Badge de categoría.
    - Notas personales: texto expandible debajo de la card.
    - Botones: "Edit notes/priority", "Remove", "View in store →".
- **Estado vacío:** Ilustración + texto "Your wishlist is empty. Browse the Market to find gear for your reef."

**Añadir items:** Desde el Market (botón ♡ en cada producto). Al añadir, mini-modal para elegir prioridad y añadir nota opcional.

### 10.6 Perfil

**Ruta:** `/dashboard/profile`

**Secciones:**

- **Account info:** Username, email (read-only o editable), avatar (si se implementa).
- **Preferences:**
    - Electricity price (kWh): Input numérico con moneda. Necesario para la calculadora energética.
    - Language: Selector EN / DE / ES.
    - Temperature unit: °C / °F (para display, la BD siempre almacena en °C).
    - Volume unit: Liters / Gallons (para display, la BD siempre almacena en litros).
- **Plan:** Card mostrando el plan actual. Si Free → CTA de upgrade. Si ReefMaster → fecha de renovación, botón para cancelar.
- **Danger zone:**
    - Change password.
    - Delete account (con doble confirmación).
- **Log out:** Botón que limpia el JWT del store y redirige a la landing.

---

## 11. Navegación y Responsive

### 11.1 Estructura de rutas (React Router)

```
/                           → Landing Page (pública)
/login                      → Login (pública)
/register                   → Register (pública)
/forgot-password            → Recuperar contraseña (pública)

/dashboard                  → Dashboard principal (protegida)
/dashboard/aquarium/:id     → Detalle de acuario (protegida)
/dashboard/calculator/dosing   → Calculadora de dosificación (protegida + PlanGate)
/dashboard/calculator/energy   → Calculadora energética (protegida + PlanGate)
/dashboard/market           → Market / buscador scraper (protegida)
/dashboard/wishlist         → Wishlist (protegida)
/dashboard/profile          → Perfil y settings (protegida)
```

**El chat drawer NO tiene ruta.** Se controla con estado de Zustand (`uiStore.isChatOpen`).

### 11.2 Breakpoints

|Breakpoint|Ancho|Comportamiento|
|---|---|---|
|Mobile|0 – 639px|Bottom tab bar, stack vertical, chat fullscreen|
|Tablet|640 – 1023px|Bottom tab bar, grid adaptativo (2 cols), chat fullscreen|
|Desktop|1024px +|Sidebar lateral fija, grid completo, chat drawer lateral|

### 11.3 Componente ProtectedRoute

```tsx
// routes/ProtectedRoute.tsx
// 1. Verifica si hay JWT válido en el authStore.
// 2. Si no hay token → redirect a /login.
// 3. Si hay token pero ha expirado → intenta refresh.
// 4. Si refresh falla → redirect a /login.
// 5. Si todo OK → renderiza children con el layout del gestor (Sidebar/BottomTabBar).
```

### 11.4 Layout wrapper del gestor

```tsx
// components/layout/GestorLayout.tsx
// Desktop: Sidebar + contenido principal + chat drawer
// Móvil: Contenido principal + bottom tab bar + chat modal
// Usa useMediaQuery hook para determinar el layout
```

---

## 12. Flujos de Usuario

### 12.1 Registro y primer uso

```
1. Usuario llega a la Landing Page.
2. Hace clic en "Get Started Free" (Hero o CTA final).
3. → /register: Formulario con email, username, password, confirm password.
4. Submit → POST /auth/register → JWT recibido.
5. → Redirect a /dashboard.
6. Dashboard vacío: Card "+ Create Your First Aquarium".
7. Clic → Modal: nombre, volumen, tipo ecosistema.
8. Submit → POST /aquariums → acuario creado.
9. Dashboard ahora muestra el resumen del acuario (vista 1 acuario).
10. Banner sutil: "Start logging your first water parameters →".
```

### 12.2 Registro de parámetros del agua

```
1. Desde Overview o Parameters tab → clic "Log New Measurement".
2. Modal con campos: temperatura, salinidad, pH, KH, Ca, Mg, NO3, PO4.
3. Todos los campos son opcionales (el usuario puede registrar solo los que midió).
4. Submit → POST /aquariums/:id/parameters con timestamp actual.
5. Los gráficos y badges se actualizan automáticamente.
6. Si algún parámetro está fuera de rango → alerta visual inmediata.
```

### 12.3 Añadir animal al acuario

```
1. Desde Livestock tab → clic "Add Animal".
2. Se abre buscador con input de texto.
3. El usuario escribe (ej. "clownfish") → debounce 300ms → GET /market/species?q=clownfish.
4. Resultados aparecen como lista desplegable con: imagen, nombre, categoría, isReefSafe.
5. El usuario selecciona uno → POST /aquariums/:id/inhabitants.
6. Si acuario es Reef y animal es NOT reef safe:
   a. Backend responde 200 OK con warning en el body.
   b. Frontend muestra modal de warning (sección 9.4).
   c. Si el usuario confirma "Add Anyway" → el animal se añade.
   d. Si cancela → no se añade.
7. El animal aparece en el grid de Livestock con su badge Reef Safe.
```

### 12.4 Uso del AI Assistant

```
1. El usuario hace clic en "AI Assistant" (sidebar o bottom tab).
2. Se abre el chat drawer (desktop) o pantalla completa (móvil).
3. El usuario escribe una pregunta (ej. "My calcium is at 350ppm, how do I raise it?").
4. POST /chat con el mensaje + contexto del acuario activo (parámetros actuales).
5. Backend (Java) verifica límite de consultas diarias (Free: 5/día).
6. Si dentro del límite → proxea al servicio Python → Python llama a Groq (Llama 3.3) → respuesta.
7. El chat muestra la respuesta del asistente con formato adecuado.
8. Contador actualizado: "4 of 5 questions used today".
```

### 12.5 Upgrade a ReefMaster

```
1. El usuario intenta acceder a una feature premium (calculadora, crear segundo acuario).
2. <PlanGate> muestra overlay con blur + CTA "Upgrade to ReefMaster".
3. Clic → /dashboard/profile#plan (o modal de upgrade).
4. Información del plan: 4.99€/mes, beneficios listados.
5. CTA "Subscribe" → integración con pasarela de pago (Stripe recomendado).
6. Tras pago exitoso → backend actualiza plan a REEFMASTER.
7. Frontend actualiza el store → <PlanGate> desaparece → features desbloqueadas.
```

---

## 13. Guía de Implementación Backend

### 13.1 Arquitectura Docker

```yaml
# docker-compose.yml (estructura base)
version: '3.8'

services:
  thalassa-api:
    build: ./backend-java
    ports:
      - "8080:8080"
    environment:
      - DB_URL=jdbc:postgresql://thalassa-db:5432/thalassa
      - DB_USER=thalassa
      - DB_PASS=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - PYTHON_SERVICE_URL=http://thalassa-python:5000
    depends_on:
      - thalassa-db
    networks:
      - thalassa-net

  thalassa-python:
    build: ./backend-python
    # NO exponer puerto al exterior
    environment:
      - GROQ_API_KEY=${GROQ_API_KEY}
    networks:
      - thalassa-net

  thalassa-db:
    image: postgres:16-alpine
    # NO exponer puerto al exterior en producción
    environment:
      - POSTGRES_DB=thalassa
      - POSTGRES_USER=thalassa
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - thalassa-data:/var/lib/postgresql/data
    networks:
      - thalassa-net

networks:
  thalassa-net:
    driver: bridge

volumes:
  thalassa-data:
```

**Notas clave:**

- El servicio Python **no expone puertos al exterior**. Solo es accesible desde la red interna Docker (`thalassa-net`).
- Java se comunica con Python vía `http://thalassa-python:5000` (nombre del servicio Docker como hostname).
- Las variables sensibles (JWT_SECRET, DB_PASSWORD, GROQ_API_KEY) van en un archivo `.env` que **nunca se sube al repositorio**.
- En producción, el puerto de PostgreSQL tampoco se expone.

### 13.2 Comunicación Java ↔ Python

**En Java (Spring Boot):**

```java
// config/WebClientConfig.java
@Bean
public WebClient pythonServiceClient() {
    return WebClient.builder()
        .baseUrl("${PYTHON_SERVICE_URL}") // http://thalassa-python:5000
        .build();
}
```

**Endpoints internos del servicio Python:**

|Método|Endpoint|Descripción|
|---|---|---|
|GET|/scrape/search?q=...&category=...|Búsqueda en tiendas scrapeadas|
|GET|/scrape/species?q=...|Búsqueda de especies (peces, corales, invertebrados)|
|POST|/chat/message|Envía mensaje al agente Groq (Llama 3.3) y devuelve respuesta|

**Flujo de una petición de chat:**

```
Frontend (Axios)
  → POST /chat { message, aquariumContext }
  → Java (ChatController)
    → ChatService verifica límite diario
    → Si OK → WebClient POST a Python http://thalassa-python:5000/chat/message
      → Python construye prompt con contexto del acuario
      → Python llama a Groq API (Llama 3.3 70B)
      → Python devuelve respuesta
    → Java devuelve respuesta al frontend
```

### 13.3 API de Groq / Llama 3.3 (Python)

**Configuración del agente:**

```python
# services/prompts.py

SYSTEM_PROMPT = """
You are Thalassa AI, an expert marine aquarium assistant.
You specialize in:
- Reef aquarium water chemistry (calcium, alkalinity, magnesium, pH, salinity)
- Fish, coral, and invertebrate compatibility and care
- Common problems: ich, dinoflagellates, cyanobacteria, algae blooms, RTN/STN
- Equipment recommendations and troubleshooting
- Aquarium cycling and maturation
- Dosing regimens (two-part, kalkwasser, calcium reactors)

When the user provides their aquarium context (current parameters, livestock),
use that data to give personalized, actionable advice.

Always prioritize the safety of the aquarium inhabitants.
Be concise but thorough. If you're unsure, say so.
Respond in the same language the user writes in.
"""
```

**Nota:** La API gratuita de Groq tiene rate limits (aprox. 30 RPM / 6000 tokens/min en free tier con Llama 3.3 70B). Configurar retry logic con exponential backoff en el servicio Python si se necesita mayor throughput.

### 13.4 Actualizaciones necesarias en el backend

Basado en el análisis del frontend, verificar que el backend implementa:

1. **Endpoint de conteo de chat:** `GET /chat/usage` → devuelve `{ used: 3, limit: 5 }` para que el frontend muestre el contador.
2. **Endpoint de historial de parámetros:** `GET /aquariums/:id/parameters?from=...&to=...` con filtrado por rango de fechas para las gráficas.
3. **Endpoint de resumen global** (para Dashboard multi-acuario): `GET /dashboard/summary` → devuelve conteo de acuarios, alertas activas, consumo total estimado.
4. **Validación Reef Safe** en el POST de inhabitants: Devolver un campo `warning` en la respuesta cuando `isReefSafe = false` y el acuario es tipo REEF.
5. **Campo `priority` y `notes` y `category`** en la entidad Wishlist (si aún no existen).
6. **Campo `locale`** en User para la preferencia de idioma.
7. **Campo `temperatureUnit`** y **`volumeUnit`** en User para preferencias de display.

---

## 14. Internacionalización (i18n)

### 14.1 Configuración base

```typescript
// i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/common.json';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: 'en',                    // Idioma por defecto
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
```

### 14.2 Estructura de archivos de traducción

```
i18n/locales/
├── en/
│   ├── common.json       # Textos genéricos: botones, labels, errores
│   ├── landing.json      # Textos de la landing page
│   ├── dashboard.json    # Dashboard y gestor
│   ├── aquarium.json     # Detalle de acuario
│   ├── calculator.json   # Calculadoras
│   ├── market.json       # Market
│   ├── chat.json         # AI Assistant
│   └── profile.json      # Perfil y settings
├── de/                   # Mismo estructura, traducciones en alemán
└── es/                   # Mismo estructura, traducciones en español
```

### 14.3 Uso en componentes

```tsx
import { useTranslation } from 'react-i18next';

function Hero() {
  const { t } = useTranslation('landing');
  return (
    <h1>{t('hero.title')}</h1>  // "Your reef, perfected."
  );
}
```

### 14.4 Cambio de idioma

El selector de idioma en Profile actualiza:

1. `i18n.changeLanguage(locale)` en el frontend.
2. `PUT /users/me { locale: 'de' }` en el backend (para persistir la preferencia).
3. Al login, el frontend lee `user.locale` y configura i18n automáticamente.

---

## 15. Rendimiento y Optimización

### 15.1 Lazy loading de rutas

```tsx
// routes/AppRouter.tsx
const Dashboard = lazy(() => import('../features/dashboard/DashboardView'));
const AquariumDetail = lazy(() => import('../features/aquarium-detail/AquariumDetail'));
const Market = lazy(() => import('../features/market/MarketSearch'));
const Calculator = lazy(() => import('../features/calculator/DosageCalculator'));
// ... etc

// Wrap en <Suspense fallback={<Spinner />}>
```

Cada feature se carga solo cuando el usuario navega a esa ruta. Esto reduce drásticamente el bundle inicial.

### 15.2 Optimización de imágenes

- **Hero video:** Formato WebM (más ligero que MP4). Fallback a imagen estática JPG para conexiones lentas. Cargar con `<video preload="metadata" poster="hero-poster.jpg">`.
- **Imágenes de fauna del scraper:** Lazy loading con `loading="lazy"` en `<img>`. Placeholder blur mientras carga.
- **Imágenes del Market:** Mismo tratamiento de lazy loading.

### 15.3 Debouncing en búsquedas

- **Market search:** Debounce de 400ms antes de ejecutar la petición al scraper.
- **Species search (añadir animal):** Debounce de 300ms.
- Implementar con un hook `useDebounce(value, delay)`.

### 15.4 Caching con Zustand

- **Lista de acuarios:** Cachear en `aquariumStore`. Invalidar solo tras crear/editar/eliminar.
- **Datos del usuario:** Cachear en `authStore`. Invalidar tras edición de perfil.
- **Parámetros del agua:** No cachear agresivamente (datos que se actualizan). Usar SWR pattern (stale-while-revalidate) o refetch on focus.

### 15.5 Axios interceptors

```typescript
// api/axiosConfig.ts
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// Request interceptor: añade JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: maneja 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Intentar refresh token
      // Si falla → logout y redirect a /login
    }
    return Promise.reject(error);
  }
);
```

---

## 16. Propuestas de Mejora Adicionales

### 16.1 Notificaciones in-app (Recomendada)

Implementar un sistema de notificaciones dentro del gestor para:

- Alertas de parámetros fuera de rango tras registrar una medición.
- Warnings de Reef Safe al añadir animales incompatibles.
- Recordatorios de mantenimiento (ej. "It's been 7 days since your last parameter log").
- Novedades de la plataforma (nuevas features, nuevas tiendas en el Market).

**UI:** Icono de campana en el topbar con badge numérico de notificaciones no leídas. Dropdown con lista de notificaciones al hacer clic.

### 16.2 Export de datos (Futura)

Permitir a los usuarios exportar el historial de parámetros en CSV para análisis externo. Es una feature que los acuaristas avanzados valoran mucho y puede ser exclusiva de ReefMaster.

### 16.3 Modo oscuro/claro (No recomendado ahora)

La identidad de marca está profundamente vinculada al negro OLED. Implementar un modo claro diluiría la estética premium. No es prioritario y se desaconseja en esta fase. Si se implementa en el futuro, debería ser una opción secundaria.

### 16.4 PWA (Progressive Web App) (Recomendada a futuro)

Convertir la aplicación en PWA permitiría:

- Instalación en la home screen del móvil (experiencia nativa sin App Store).
- Notificaciones push (recordatorios de medición).
- Funcionamiento offline limitado (visualización de datos cacheados).

Vite tiene soporte excelente para PWA via `vite-plugin-pwa`.

### 16.5 Gamificación (Propuesta exploratoria)

Añadir un sistema de logros/achievements para incentivar el uso consistente:

- "First Measurement" — Registra tu primer parámetro.
- "Stable Reef" — 30 días con todos los parámetros en rango.
- "Full House" — 10+ animales en un acuario.
- "Power Tracker" — 7 mediciones consecutivas semanales.

Esto aumenta la retención y el engagement, especialmente en la comunidad de habla inglesa donde la gamificación funciona muy bien.

### 16.6 Comparador de parámetros entre acuarios (ReefMaster)

Para usuarios con múltiples acuarios, permitir superponer las gráficas de evolución de un mismo parámetro entre acuarios diferentes. Ejemplo: comparar la evolución del calcio en "Reef Paradise" vs "Nano Reef".

### 16.7 Scraper — Tiendas recomendadas

Para maximizar la utilidad del Market, priorizar la integración con estas tiendas (por mercado):

**EE.UU.:**

- BulkReefSupply (bulkreefsupply.com)
- Marine Depot (marinedepot.com)
- LiveAquaria (liveaquaria.com)

**Europa:**

- Whitecorals (whitecorals.com) — Alemania
- Korallen-Zucht (korallen-zucht.de) — Alemania
- AquaForest (aquaforest.eu) — Polonia, distribuye en toda Europa

**Base de datos de especies:**

- FishBase (fishbase.se) — base de datos científica de peces
- AIMS Coral Fact Sheets — corales
- WoRMS (World Register of Marine Species) — invertebrados

El scraper debería tener un sistema de parsers modulares (un parser por tienda) para facilitar la adición de nuevas fuentes sin modificar el core.

---

> **Este documento es el Master Plan completo de Thalassa.** Contiene todas las decisiones de arquitectura, diseño, flujos, reglas de negocio y propuestas de mejora acordadas. Debe servir como referencia única de verdad (single source of truth) durante toda la fase de implementación del frontend y las actualizaciones necesarias del backend.
> 
> **Próximos pasos:**
> 
> 1. Validar la estructura de carpetas contra el proyecto existente y ajustar si hay diferencias.
> 2. Implementar el sistema de diseño (tokens CSS, componentes UI base).
> 3. Configurar i18n con react-i18next (solo EN inicial).
> 4. Construir la Landing Page con las transiciones de Framer Motion.
> 5. Construir el layout del Gestor (Sidebar + BottomTabBar + ChatDrawer).
> 6. Implementar el Dashboard con la lógica adaptativa (1 acuario vs múltiples).
> 7. Construir el detalle de acuario con sus 4 tabs.
> 8. Integrar Recharts para las gráficas de evolución.
> 9. Conectar Market y AI Assistant con los endpoints del backend.
> 10. Implementar las calculadoras con el paywall `<PlanGate>`.