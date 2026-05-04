# Fase 15: QA & Polish — v1.1.0

> Sprint de correcciones derivadas del QA manual sobre la rama `fix/qa-polish`.
> Metodología: ejecutar sub-fases en orden, marcar cada ítem al completarlo, y confirmar antes de avanzar.

---

## Fase 15A — Layout & Navegación

- [x] **Sidebar Desktop:** Reorganizar los enlaces agrupándolos visualmente en secciones lógicas con pequeños títulos y separadores (INICIO · HERRAMIENTAS · EXPLORAR · ASISTENTE).

- [x] **Navegación Móvil:** Añadir los accesos que faltaban a la *Calculadora de Energía* y la *Wishlist* en el `BottomTabBar`, haciéndolos accesibles desde dispositivos móviles.

- [x] **Notificaciones (Desktop):** Corregir el dropdown del `NotificationBell`. En desktop (dentro del Sidebar) se abría hacia la izquierda cortando la pantalla. Ahora se abre hacia la derecha mediante la prop `align="left"`. La vista móvil (bell fija en top-right) mantiene `align="right"` por defecto sin cambios.

---

## Fase 15B — Market Bugs

- [ ] **Botón 'Ver':** El botón de los productos no funciona. Añadir la funcionalidad para que use el campo `productUrl` y abra el enlace en una pestaña nueva.

- [ ] **Filtro Combinado:** Arreglar la lógica de filtrado en el cliente. Si se selecciona la pestaña 'Todos' debe mostrar todo, y si se cruza una búsqueda de texto con una tienda específica debe devolver resultados correctos sin romperse.

---

## Fase 15C — Profile, i18n & Premium Flow

- [ ] **Traducciones (i18n):** Revisar las nuevas vistas (Market, Calculadoras, Wishlist) y añadir los textos faltantes a los archivos de internacionalización.

- [ ] **Flujo Reef Master & Perfil:** Consolidar la configuración del usuario en el Profile. Añadir un botón *Simular Upgrade a Reef Master* con aspecto premium (gradiente ámbar-naranja, icono de corona, sombra). Al pulsarlo, actualiza el estado del usuario para desbloquear las calculadoras.
