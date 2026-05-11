# Práctica 16 — Análisis con Microsoft Clarity
## Web: Thalassa — Marine Aquarium Management

---

## ¿QUÉ ES MICROSOFT CLARITY Y POR QUÉ SE HA ELEGIDO?

### Definición

Microsoft Clarity es una herramienta gratuita de analítica de comportamiento de usuario que permite registrar sesiones de navegación reales, generar mapas de calor de clics y scroll, y detectar patrones de frustración como rage clicks o dead clicks — todo ello sin límite de sesiones, sin coste y sin muestreo de datos.

### Comparativa con Hotjar

| Criterio | Microsoft Clarity | Hotjar |
|---|---|---|
| **Precio** | Gratuito, sin límites | Plan básico gratuito con límites (35 sesiones/día); planes de pago desde 32 €/mes |
| **Grabaciones de sesión** | Ilimitadas | Limitadas en plan gratuito |
| **Mapas de calor** | Incluidos (clics, scroll, áreas) | Incluidos en plan gratuito con muestreo |
| **Detección de frustración** | Automática (rage clicks, dead clicks, JS errors, scroll de vuelta) | Solo en planes de pago |
| **Integración con herramientas MS** | Google Analytics, Azure, Bing Ads | Google Analytics, HubSpot, Segment |
| **GDPR** | Cumple (seudonimización automática, enmascaramiento de datos sensibles) | Cumple con configuración manual |
| **Facilidad de instalación** | Un snippet JS de 5 líneas | Un snippet JS de 5 líneas |
| **Dashboard** | Limpio, datos en 24–48 h | Más opciones de filtrado en planes de pago |

### Razón de la elección

Se eligió Microsoft Clarity por tres motivos concretos:

1. **Coste cero con funcionalidad completa:** Thalassa es un proyecto académico sin presupuesto; Clarity ofrece grabaciones y mapas de calor ilimitados frente a las restricciones del plan gratuito de Hotjar.
2. **Detección automática de frustración:** La identificación nativa de rage clicks y dead clicks es clave para detectar problemas de UX sin configuración adicional.
3. **Integración simple:** El snippet instalado en `frontend/index.html` (líneas 17–23) activa el tracking en todas las páginas del SPA, incluidas las rutas protegidas del dashboard, sin necesidad de configuración por ruta.

---

## CÓMO AYUDA CLARITY A DETECTAR PROBLEMAS EN ESTA WEB

Los siguientes problemas fueron identificados en el análisis heurístico (ver `informe-heuristico.md`). A continuación se vincula cada funcionalidad de Clarity con los fallos reales detectados.

---

### 1. Grabaciones de sesión → Fallos de navegación detectados

Las grabaciones capturan la sesión completa de cada usuario: movimientos de ratón, clics, scroll y navegación entre páginas.

**Fallos que Clarity ayudará a confirmar o descartar:**

- **Falta de botón "Volver" en el detalle del acuario** (heurístico 5.5, puntuación 3): Se espera observar usuarios que usan el botón Atrás del navegador o que se quedan bloqueados en la vista de detalle sin saber cómo volver al dashboard.
- **Confusión en el flujo de creación del primer acuario** (heurístico 8.4, puntuación 2): Usuarios nuevos que llegan al dashboard vacío, hacen clic en zonas no interactivas o abandonan sin crear el acuario.
- **Abandono en el checkout** (heurístico general): Las grabaciones permitirán identificar en qué campo del formulario de pago se producen más abandonos o reintentos.
- **Uso del ChatDrawer** (heurístico 11.9, puntuación 3): Se podrá observar si los usuarios intentan seguir usando el chat tras agotar la cuota diaria y qué hacen a continuación.

---

### 2. Mapas de calor de clics → Problemas de layout o CTAs

Los mapas de calor de clics muestran dónde hace clic la mayoría de los usuarios y qué elementos reciben atención inesperada o nula.

**Fallos que Clarity ayudará a confirmar o descartar:**

- **CTA de upgrade poco visible en el plan FREE** (heurístico 11.8, puntuación 4): Si el mapa de calor muestra pocos clics en el botón de "Mejora a REEFMASTER", el CTA necesita mejor posicionamiento o mayor contraste visual.
- **Iconos del BottomTabBar sin texto en móvil** (heurístico 4.2, puntuación 4): Clics distribuidos de forma inesperada entre los iconos de la barra inferior indicarán que los usuarios no asocian el icono con la función esperada.
- **Botón "Ver en tienda" en el mercado** (heurístico 11.5, puntuación 3): Un bajo ratio de clics en este botón puede indicar que los usuarios no perciben que el enlace les llevará a una tienda externa.
- **Secciones de la landing que generan mayor interés**: El mapa de clics sobre la landing revelará si los usuarios interactúan con la sección de precios o si abandonan antes de llegar a ella.

---

### 3. Mapas de calor de scroll → Problemas de longitud de página

Los mapas de scroll muestran hasta dónde llegan los usuarios antes de abandonar o dejar de hacer scroll.

**Fallos que Clarity ayudará a confirmar o descartar:**

- **CTA principal bajo el fold en tablet** (heurístico 6.5, puntuación 3): Si el scroll medio se detiene antes del botón "Empieza gratis" en la landing, confirmará que el CTA necesita subir en el layout.
- **Longitud de la página de detalle del acuario**: Determinar si los usuarios llegan a ver la sección de equipamiento (tercera pestaña) o si se quedan en la de parámetros.
- **Sección de precios en la landing**: Verificar si la mayoría de los visitantes hacen scroll hasta la tabla comparativa de planes FREE vs REEFMASTER — si no llegan, el precio nunca es un factor de conversión.
- **Wishlist con muchos elementos**: Comprobar si los usuarios hacen scroll en listas largas o si los filtros de categoría se utilizan realmente para reducir el contenido visible.

---

### 4. Métricas de frustración → Rage clicks, dead clicks

Clarity detecta automáticamente:
- **Rage click:** el usuario hace clic varias veces rápidamente sobre el mismo elemento (señal de que espera una respuesta que no llega).
- **Dead click:** el usuario hace clic en un elemento que no es interactivo (señal de que parece un botón o enlace pero no lo es).
- **Scroll de vuelta (excessive scroll):** el usuario sube y baja repetidamente en la misma zona (señal de desorientación).
- **Quick back:** el usuario navega a una página y vuelve inmediatamente (señal de que el contenido no es lo que esperaba).

**Fallos que Clarity ayudará a confirmar o descartar:**

- **Indicadores de estado de los parámetros** (heurístico 11.2, puntuación 4): Si los badges de color verde/ámbar/rojo en el detalle del acuario generan rage clicks, los usuarios esperan que sean interactivos (p. ej. que abran un detalle o una explicación).
- **PlanGate con candado** (heurístico 11.8): Dead clicks sobre funciones bloqueadas podrían indicar que el candado no es suficientemente claro como señal de bloqueo.
- **Tarjetas del dashboard** (heurístico 11.1): Si las tarjetas de acuario generan rage clicks en zonas sin acción definida, el área clicable debería expandirse o el feedback visual mejorar.
- **Imagen de producto en el mercado sin clic** (heurístico 11.5): Dead clicks sobre las imágenes de productos indicarían que los usuarios esperan ampliarlas, función que actualmente no existe.

---

## CAPTURAS DEL DASHBOARD

> **[SECCIÓN A RELLENAR MANUALMENTE]**
> Las capturas deben tomarse tras un mínimo de 48–72 horas de datos reales en Clarity.
> Acceder en: https://clarity.microsoft.com → Proyecto "Thalassa" (ID: wp4aqb0xbi)

---

**Captura 1: Vista general del dashboard de Clarity**

*Pie de foto:* Vista general del panel de Microsoft Clarity para Thalassa. Se observan las sesiones totales, usuarios únicos, tasa de páginas por sesión y tiempo medio de sesión durante el período de análisis [FECHA INICIO] – [FECHA FIN].

![Captura 1 — Dashboard general Clarity](capturas/clarity-01-dashboard.png)

---

**Captura 2: Mapa de calor de clics — Página principal (Landing)**

*Pie de foto:* Mapa de calor de clics sobre la landing page de Thalassa. Las zonas de mayor actividad se concentran en [DESCRIBIR]. Se aprecia [DESCRIBIR fallo o comportamiento inesperado].

![Captura 2 — Mapa de calor de clics](capturas/clarity-02-heatmap-clics.png)

---

**Captura 3: Grabación de sesión destacada**

*Pie de foto:* Grabación de sesión seleccionada por Clarity como representativa de [frustración / abandono / flujo completo]. El usuario tarda [X] segundos en localizar [ELEMENTO] y realiza [N] rage clicks sobre [ZONA].

![Captura 3 — Grabación de sesión](capturas/clarity-03-sesion.png)

---

**Captura 4: Métricas de frustración — Rage clicks y dead clicks**

*Pie de foto:* Panel de métricas de frustración de Clarity. Se registran [N] rage clicks en [ZONA] y [N] dead clicks en [ELEMENTO]. Estos datos confirman / contradicen las hipótesis del análisis heurístico sobre [FALLO CONCRETO].

![Captura 4 — Métricas de frustración](capturas/clarity-04-frustracion.png)

---

## CONCLUSIONES

Los datos que Clarity recopile durante las primeras semanas de funcionamiento permitirán **validar o refutar** las hipótesis planteadas en el informe heurístico. A continuación se recogen los vínculos directos entre ambos análisis:

| Hipótesis del informe heurístico | Métrica de Clarity que la verificará | Propuesta activada si se confirma |
|---|---|---|
| El CTA "Empieza gratis" queda bajo el fold en tablet (6.5, 3/5) | Mapa de scroll en la landing | Subir el CTA a la primera sección visible |
| Los iconos sin texto del BottomTabBar confunden a usuarios móviles (4.2, 4/5) | Mapa de clics en móvil + rage clicks en nav bar | Añadir etiquetas de texto bajo cada icono |
| Los usuarios no saben volver al dashboard desde el detalle (5.5, 3/5) | Grabaciones: uso del botón "Atrás" del navegador | Añadir breadcrumbs y botón "Volver" explícito |
| Las imágenes de producto en el mercado parecen clicables (11.5, 3/5) | Dead clicks sobre imágenes de producto | Añadir enlace a la ficha de producto o lightbox |
| El PlanGate no es suficientemente claro (11.8, 4/5) | Dead clicks sobre funciones bloqueadas | Rediseñar el bloqueo con mensaje más explícito |
| Los parámetros en rojo no sugieren acción (11.3, 3/5) | Rage clicks sobre badges de estado | Convertir el badge en enlace a documentación de corrección |
| Los usuarios abandonan el chat tras agotar la cuota (11.9, 3/5) | Quick backs tras el mensaje de límite | Añadir aviso proactivo antes de alcanzar el límite |

La integración de Microsoft Clarity con el análisis heurístico convierte las hipótesis cualitativas en datos cuantitativos accionables, permitiendo priorizar las mejoras de UX con evidencia real de comportamiento de usuario.

---

*Informe generado el 11/05/2026 para el proyecto Thalassa.*
*Snippet de Clarity instalado en `frontend/index.html`, líneas 17–23. ID del proyecto: wp4aqb0xbi.*
