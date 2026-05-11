# Práctica 16 — Análisis Heurístico
## Web: Thalassa — Marine Aquarium Management

---

## DATOS DEL ANÁLISIS

| Campo | Detalle |
|---|---|
| Fecha | 11/05/2026 |
| Plataforma | GitHub Pages |
| Agente de usuario | Chrome / Desktop |
| URL analizada | https://ikermg.github.io/Thalassa/ |
| Evaluador | Iker |

---

## TAREAS ANALIZADAS

### Páginas y flujos existentes en la web

| Página / Flujo | Ruta | Descripción |
|---|---|---|
| Landing Page | `/` | Presentación del producto: hero con vídeo, características, precios, CTA |
| Registro | `/register` | Creación de cuenta con selección de plan (FREE / REEFMASTER) |
| Login | `/login` | Autenticación con email y contraseña |
| Recuperar contraseña | `/forgot-password` → `/reset-password` | Flujo de restablecimiento por email |
| Dashboard | `/dashboard` | Panel principal: rejilla de acuarios, estadísticas globales |
| Detalle de acuario | `/dashboard/aquarium/:id` | Pestañas de Parámetros, Seres Vivos y Equipamiento |
| Mercado | `/dashboard/market` | Catálogo de productos con búsqueda y filtros, enlace externo a tiendas |
| Lista de deseos | `/dashboard/wishlist` | Gestión de productos deseados con prioridad y categoría |
| Perfil | `/dashboard/profile` | Avatar, plan, selector de idioma, CTA de mejora |
| Configuración | `/dashboard/profile/settings` | Contraseña, precio luz, unidades de temperatura y volumen |
| Checkout | `/dashboard/checkout` | Simulación de pago con tarjeta |
| Calculadora de dosificación | `/dashboard/calculator/dosing` | Cálculos de KH, Ca, Mg, NO₃ |
| Calculadora energética | `/dashboard/calculator/energy` | Estimación de coste eléctrico del equipamiento |
| Asistente IA (ChatDrawer) | Drawer global | Chat de texto con límite de uso por plan |

### Tareas que ejecutará el evaluador

1. **Alta y primer acuario** — Registrarse, seleccionar plan FREE, crear el primer acuario y navegar a su detalle.
2. **Registro de parámetros y lectura de alertas** — Añadir un parámetro fuera de rango y comprobar la señalización de peligro.
3. **Búsqueda en el Mercado y lista de deseos** — Filtrar productos por categoría y añadir uno a la lista de deseos.
4. **Uso del asistente IA** — Abrir el chat, formular una pregunta sobre el acuario activo y comprobar el límite de mensajes.
5. **Actualización de plan** — Iniciar el flujo de pago (Checkout) y verificar el desbloqueo de funciones REEFMASTER.

---

## OBJETIVOS DEL ANÁLISIS

1. **Evaluar la facilidad de incorporación (onboarding):** determinar si un usuario sin conocimientos acuícolas entiende el valor del producto y completa el registro y la creación del primer acuario sin ayuda externa.
2. **Auditar la retroalimentación ante parámetros críticos:** comprobar que los indicadores de estado (verde / ámbar / rojo) y las notificaciones de alerta comunican eficazmente la situación del acuario.
3. **Verificar el cumplimiento de accesibilidad WCAG AA:** revisar contraste, navegación por teclado, textos alternativos en imágenes y soporte para movimiento reducido.

---

## TABLAS DE HEURÍSTICOS

### 1. Heurísticos Generales

| # | Punto de control | Puntuación (1–5) | Observación |
|---|---|---|---|
| 1.1 | El diseño es coherente en toda la aplicación | 5 | Sistema de diseño unificado (colores, tipografía, espaciado) en todos los componentes |
| 1.2 | Los errores se presentan de forma clara | 4 | Toasts de Sonner y mensajes inline en formularios; faltan mensajes contextuales en errores de red |
| 1.3 | El sistema proporciona retroalimentación inmediata | 4 | Skeletons de carga, spinners y toasts de confirmación bien implementados; el chat sin indicador de escritura |
| 1.4 | El usuario puede deshacer acciones destructivas | 3 | Existe `ConfirmDialog` para eliminar acuarios/elementos, pero no hay posibilidad de deshacer tras confirmar |
| 1.5 | El sistema previene errores antes de que ocurran | 4 | Validación Zod en tiempo real en formularios; sin confirmación de doble email en el registro |
| 1.6 | La interfaz sigue convenciones web estándar | 4 | Patrones reconocibles (sidebar, bottom nav, modales); el drawer de chat podría confundirse con un panel de navegación |

**Promedio: 4,0**

---

### 2. Identidad e Información

| # | Punto de control | Puntuación (1–5) | Observación |
|---|---|---|---|
| 2.1 | El logotipo/nombre de la web es visible y claro | 5 | "Thalassa" aparece en la barra lateral, la landing y el título del documento |
| 2.2 | Se indica la naturaleza del sitio en la página principal | 5 | Tagline "Marine Aquarium Management" en hero y `<title>` |
| 2.3 | Existe información de contacto o soporte | 2 | No hay página de contacto, email de soporte ni FAQ accesibles desde la app |
| 2.4 | Se especifican los términos de uso y privacidad | 1 | No existen enlaces a términos legales ni política de privacidad — crítico para GDPR |
| 2.5 | La URL es legible y significativa | 4 | Rutas semánticas (`/dashboard/aquarium/:id`); el ID numérico no es legible para el usuario |

**Promedio: 3,4**

---

### 3. Lenguaje y Redacción

| # | Punto de control | Puntuación (1–5) | Observación |
|---|---|---|---|
| 3.1 | El lenguaje es claro y orientado al usuario | 4 | Terminología acuícola apropiada para el público objetivo; algunas etiquetas técnicas sin explicación (p. ej. "kH", "NO₃") |
| 3.2 | Se evita la jerga innecesaria | 3 | Términos como "reef-safe", "KH target" o "dosing" no tienen tooltip de ayuda para usuarios noveles |
| 3.3 | Los mensajes de error son descriptivos | 4 | "Invalid credentials", "Email already in use" son claros; algunos errores de API muestran códigos internos |
| 3.4 | El contenido está disponible en el idioma del usuario | 5 | i18n completo en EN / ES / DE con detección automática de idioma del navegador |
| 3.5 | Los textos de los botones son accionables | 4 | "Añadir acuario", "Iniciar sesión", "Ver en tienda" son claros; el botón "Premium" del chat podría ser más descriptivo |

**Promedio: 4,0**

---

### 4. Rotulado

| # | Punto de control | Puntuación (1–5) | Observación |
|---|---|---|---|
| 4.1 | Las etiquetas de navegación son descriptivas | 5 | "Dashboard", "Mercado", "Lista de deseos", "Calculadoras" — claras y coherentes |
| 4.2 | Los iconos van acompañados de texto | 4 | Sidebar: iconos + texto siempre; BottomTabBar en móvil: iconos sin texto en algunos tabs |
| 4.3 | Los formularios tienen etiquetas `<label>` asociadas | 3 | El componente `Input.tsx` usa `forwardRef` y props de error pero la asociación `htmlFor`/`id` no es sistemática en todos los campos |
| 4.4 | Los estados activos/seleccionados son distinguibles | 5 | Color cyan `#59D3FF` en elemento activo de nav; tab activo con subrayado en detalle de acuario |
| 4.5 | Los encabezados jerarquizan correctamente el contenido | 4 | H1 en páginas principales, H2/H3 en secciones; landing usa H2 para secciones que deberían ser H1 |

**Promedio: 4,2**

---

### 5. Estructura y Navegación

| # | Punto de control | Puntuación (1–5) | Observación |
|---|---|---|---|
| 5.1 | Existe una navegación global clara | 5 | Sidebar en desktop, BottomTabBar en móvil — siempre visible dentro del área protegida |
| 5.2 | El usuario siempre sabe dónde está | 4 | El ítem activo de la sidebar se resalta; faltan breadcrumbs en la vista de detalle del acuario |
| 5.3 | El flujo de registro / login es intuitivo | 4 | Pasos claros; la selección de plan en registro añade valor pero puede generar fricción |
| 5.4 | La navegación es consistente en todas las páginas | 5 | Layout idéntico en todas las páginas protegidas |
| 5.5 | Existe enlace "Volver" o navegación hacia atrás | 3 | No hay botón "Volver" explícito en detalle de acuario ni en checkout; se depende del botón del navegador |
| 5.6 | El mapa del sitio es coherente con la experiencia | 4 | Estructura lógica; los calculadores están dentro del menú de navegación pero no son visibles en la landing |

**Promedio: 4,2**

---

### 6. Layout de la Página

| # | Punto de control | Puntuación (1–5) | Observación |
|---|---|---|---|
| 6.1 | El diseño es responsive y funciona en móvil | 4 | Breakpoint en 768px con cambio de sidebar a bottom nav; algunas tablas de datos no hacen scroll horizontal en pantallas pequeñas |
| 6.2 | El espacio en blanco facilita la lectura | 5 | Padding y gap generosos en toda la interfaz; diseño OLED aireado |
| 6.3 | Las áreas clicables son suficientemente grandes | 4 | Botones con mínimo 44px de altura; los iconos del chat drawer son más pequeños |
| 6.4 | Los CTA están bien posicionados y son visibles | 4 | Botones primarios en cyan destacan sobre fondo negro; el CTA de upgrade en la landing podría estar más arriba del fold |
| 6.5 | El contenido importante está sobre el fold | 3 | El hero de la landing tiene un vídeo de 46,8 MB que puede tardar en cargar; el CTA principal está parcialmente bajo el fold en pantallas 768px |
| 6.6 | El layout no produce fatiga visual | 5 | Paleta oscura consistente, sin elementos parpadeantes molestos |

**Promedio: 4,2**

---

### 7. Elementos Multimedia

| # | Punto de control | Puntuación (1–5) | Observación |
|---|---|---|---|
| 7.1 | Las imágenes tienen texto alternativo | 4 | Avatares y productos con `alt` descriptivo; imagen placeholder con `alt=""` y `aria-hidden` — correcto |
| 7.2 | Los vídeos tienen subtítulos o transcripción | 2 | El vídeo del hero (`hero-bg.mp4`, 46,8 MB) no tiene subtítulos ni descripción; es decorativo pero conviene `aria-hidden` |
| 7.3 | Los recursos multimedia no se reproducen automáticamente con sonido | 5 | El vídeo es muted y autoplay solo visual — correcto |
| 7.4 | Las imágenes se cargan de forma optimizada | 3 | Imágenes de productos con `loading="lazy"`; el vídeo del hero no está optimizado (46,8 MB sin CDN ni compresión adicional) |
| 7.5 | Existen estados de carga y fallbacks para medios | 5 | `ImagePlaceholder.tsx`, `market-placeholder.svg` y fallback JSON para el mercado offline |

**Promedio: 3,8**

---

### 8. Ayuda

| # | Punto de control | Puntuación (1–5) | Observación |
|---|---|---|---|
| 8.1 | Existe un sistema de ayuda contextual | 3 | El chat IA actúa como ayuda contextual, pero está limitado a 5 mensajes/día en plan FREE |
| 8.2 | La ayuda es accesible sin abandonar la tarea | 3 | El drawer de chat se abre sin salir de la página; no hay tooltips inline en campos técnicos |
| 8.3 | Existen FAQs o documentación | 1 | No existe sección de preguntas frecuentes, guía de inicio ni documentación de usuario |
| 8.4 | Los mensajes de onboarding guían al usuario novel | 2 | Estado vacío en el dashboard con CTA para crear el primer acuario; sin tour guiado ni checklist de configuración inicial |
| 8.5 | Los errores incluyen sugerencias de resolución | 3 | Los errores de validación son claros; los errores de API no siempre sugieren qué hacer a continuación |

**Promedio: 2,4**

---

### 9. Accesibilidad

| # | Punto de control | Puntuación (1–5) | Observación |
|---|---|---|---|
| 9.1 | Contraste de texto suficiente (WCAG AA ≥ 4,5:1) | 5 | Sistema de diseño con contraste mínimo 5,5:1; colores de estado bien diferenciados |
| 9.2 | Navegación por teclado funcional | 4 | Skip-link en `index.html`, foco visible con outline cyan 2px; el drawer de chat no gestiona el foco al abrirse |
| 9.3 | Atributos ARIA correctos | 4 | `aria-hidden` en decorativos; landmarks semánticos en HTML; faltan `aria-live` en toasts |
| 9.4 | El sitio funciona sin JavaScript | 1 | SPA React: sin JS no se renderiza nada (solo `<div id="root"></div>`) — no hay fallback SSR |
| 9.5 | El tamaño de fuente base es legible | 5 | Tipografía Inter con tamaños mínimos de 14px; datos numéricos en JetBrains Mono |
| 9.6 | Se respeta `prefers-reduced-motion` | 5 | Media query implementada en `index.css` que deshabilita animaciones |
| 9.7 | Los formularios son accesibles | 3 | Validación en tiempo real con mensajes de error; asociación `label`→`input` no sistemática en todos los campos |

**Promedio: 3,9**

---

### 10. Control y Retroalimentación

| # | Punto de control | Puntuación (1–5) | Observación |
|---|---|---|---|
| 10.1 | El usuario recibe confirmación de sus acciones | 5 | Toasts de Sonner en todas las mutaciones CRUD; confeti en checkout exitoso |
| 10.2 | El sistema muestra el estado de las operaciones | 4 | Skeletons de carga, spinners en botones de submit; la carga del mercado sin barra de progreso explícita |
| 10.3 | El usuario puede cancelar operaciones | 4 | Modales con botón "Cancelar" y cierre por ESC; no se puede cancelar una subida de imagen en curso |
| 10.4 | Los límites del sistema están claramente comunicados | 4 | PlanGate muestra candado y mensaje de upgrade; contador de mensajes en el chat IA; sin indicador visual del límite de acuarios en la rejilla |
| 10.5 | Las notificaciones son no intrusivas | 5 | Toasts posicionados abajo, auto-dismiss; bell de notificaciones no interrumpe el flujo |
| 10.6 | El sistema recupera el estado tras errores | 3 | React Query reintenta peticiones fallidas; sin recuperación de formularios si el usuario navega por error |

**Promedio: 4,2**

---

### 11. Heurísticos Específicos — Plataforma de mercado, Dashboard, Autenticación, Datos en tiempo real

| # | Punto de control | Puntuación (1–5) | Observación |
|---|---|---|---|
| 11.1 | **Dashboard:** Las métricas clave son visibles de un vistazo | 4 | Tarjetas de resumen (acuarios, seres vivos, equipos); faltan tendencias o comparativas temporales |
| 11.2 | **Dashboard:** El estado de salud de los acuarios es inmediatamente legible | 4 | Indicadores verde/ámbar/rojo en parámetros; sin semáforo de estado en las tarjetas de la rejilla del dashboard |
| 11.3 | **Parámetros:** Los rangos seguros están documentados | 3 | `parameterRanges.ts` define rangos internamente; no se muestran los rangos al usuario junto al valor registrado |
| 11.4 | **Mercado:** El origen de los productos está claro | 4 | Badges de tienda (Urban Natura, Cetamar) identifican la fuente; sin fecha de actualización del precio |
| 11.5 | **Mercado:** Los enlaces externos son distinguibles | 3 | Botón "Ver en tienda" abre en nueva pestaña; sin icono de enlace externo `↗` ni aviso de salida del sitio |
| 11.6 | **Autenticación:** El flujo de recuperación de contraseña es completo | 4 | Páginas ForgotPassword y ResetPassword existen; sin temporizador de expiración del token visible para el usuario |
| 11.7 | **Autenticación:** Los errores de login no revelan qué campo es incorrecto | 5 | Mensaje genérico "Invalid credentials" — correcto desde el punto de vista de seguridad |
| 11.8 | **Plan y paywall:** Las limitaciones del plan FREE son transparentes | 4 | PlanGate con candado explica el bloqueo; el límite de 1 acuario no se indica en el flujo de registro |
| 11.9 | **IA Chat:** El límite de uso es visible antes de alcanzarlo | 3 | `QuestionCounter` muestra el estado actual; sin aviso proactivo cuando quedan 1–2 mensajes |
| 11.10 | **Calculadoras:** Los resultados incluyen unidades y contexto | 4 | Valores con unidades (ml, g, kWh, €); sin explicación de la fórmula ni rango de validación de las entradas |

**Promedio: 3,8**

---

## TABLA DE CONCLUSIONES

| Categoría | Puntuación promedio | Puntos débiles detectados |
|---|---|---|
| 1. Heurísticos Generales | 4,0 | Sin opción real de deshacer tras confirmar eliminación |
| 2. Identidad e Información | 3,4 | Ausencia total de términos legales y política de privacidad (GDPR) |
| 3. Lenguaje y Redacción | 4,0 | Términos técnicos acuícolas sin tooltips para usuarios noveles |
| 4. Rotulado | 4,2 | Asociación label→input no sistemática; iconos sin texto en mobile nav |
| 5. Estructura y Navegación | 4,2 | Sin breadcrumbs en detalle de acuario; sin botón "Volver" explícito |
| 6. Layout de la Página | 4,2 | Vídeo hero de 46,8 MB sin lazy o compresión; CTA bajo el fold en tablet |
| 7. Elementos Multimedia | 3,8 | Vídeo hero sin `aria-hidden` ni descripción; sin optimización CDN |
| 8. Ayuda | **2,4** | Sin FAQ, sin tour guiado, sin documentación de usuario — categoría más débil |
| 9. Accesibilidad | 3,9 | Sin fallback sin JS; gestión de foco incompleta en el drawer del chat |
| 10. Control y Retroalimentación | 4,2 | Sin recuperación de formularios tras navegación accidental |
| 11. Heurísticos Específicos | 3,8 | Rangos de parámetros no mostrados al usuario; enlaces externos sin icono ↗ |
| **MEDIA GLOBAL** | **3,83** | |

---

## PROPUESTAS DE SOLUCIÓN

1. **CLAVE — Añadir política de privacidad y términos de uso.** La aplicación recoge datos personales y de salud de mascotas; es obligatorio por GDPR incluir enlaces a estos documentos en el footer y en el formulario de registro (checkbox de aceptación).

2. **CLAVE — Optimizar el vídeo del hero.** El archivo `hero-bg.mp4` pesa 46,8 MB y bloquea el LCP (Largest Contentful Paint). Convertirlo a WebM/H.265 con resolución máxima 1080p debería reducirlo por debajo de 5 MB. Añadir `aria-hidden="true"` y `<track kind="descriptions">` o un `<title>` descriptivo para accesibilidad.

3. **CLAVE — Crear una sección de ayuda / FAQ.** La categoría de Ayuda obtiene 2,4 sobre 5. Como mínimo: una página `/ayuda` con preguntas frecuentes sobre parámetros y una guía de inicio rápido accesible desde el dashboard.

4. **CLAVE — Implementar tour guiado en el primer acceso.** Añadir un checklist de onboarding (crear acuario → añadir parámetro → explorar mercado) que desaparezca una vez completado. Reducirá el abandono temprano de usuarios nuevos.

5. **CLAVE — Añadir enlaces a Términos y Privacidad en el registro.** El checkbox de aceptación es requisito legal; sin él la recogida de datos no es consentida.

6. Mostrar los rangos seguros de cada parámetro junto al valor registrado en la vista de detalle (p. ej. "pH: 8,2 · Rango óptimo: 8,1–8,4"). Actualmente los rangos están en código pero no se exponen al usuario.

7. Añadir breadcrumbs en la vista de detalle del acuario: `Dashboard > [Nombre acuario] > Parámetros`. Mejora la orientación sin cambiar el layout.

8. Añadir un botón "Volver al dashboard" visible en la cabecera de la página de detalle del acuario y en el checkout.

9. Mostrar un aviso proactivo en el chat IA cuando quede 1 mensaje de cuota diaria ("Te queda 1 pregunta hoy — actualiza a REEFMASTER para acceso ilimitado").

10. Añadir el icono de enlace externo `↗` junto al botón "Ver en tienda" en el mercado y un tooltip "Abre en una nueva pestaña" para que el usuario sepa que abandona el sitio.

11. Añadir un semáforo de estado de salud (verde/ámbar/rojo) visible directamente en las tarjetas del dashboard, calculado a partir del último parámetro registrado con alertas activas.

12. Mejorar la gestión de foco en el ChatDrawer: al abrirse, el foco debe moverse al campo de input; al cerrarse, debe volver al botón que lo abrió.

13. Añadir `aria-live="polite"` a los contenedores de toast de Sonner para que los lectores de pantalla los anuncien automáticamente.

14. Incluir la fecha de última actualización junto a los precios del mercado ("Datos actualizados: 08/05/2026") para gestionar la expectativa del usuario sobre la fiabilidad del precio.

15. Indicar de forma visible el límite de 1 acuario en plan FREE durante el registro, no solo cuando el usuario intenta crear el segundo.

---

*Informe generado el 11/05/2026 mediante análisis estático del código fuente del repositorio Thalassa.*
