# Práctica 16 — Test con Usuario Real
## Web: Thalassa — Marine Aquarium Management

---

## FICHA DEL TEST DE USUARIO

| Campo | Detalle |
|---|---|
| Nombre del evaluador | Tere |
| Fecha del test | 5/11/2026 |
| **Perfil del usuario** | |
| — Edad | 55 |
| — Profesión | Administrativa |
| — Nivel de competencia digital | Media |
| Entorno de la prueba | Presencial |
| Dispositivo utilizado | Ordenador |
| Navegador | Google Chrome |
| URL de la prueba | https://ikermg.github.io/Thalassa/ |

---

## CONTEXTO PREVIO AL TEST

Antes de comenzar el test se le explicó a la participante que:
- La sesión dura aproximadamente 20–30 minutos.
- El objetivo es evaluar la web, no sus conocimientos ni habilidades.
- Puede comentar en voz alta lo que piensa mientras navega (protocolo think-aloud).
- No hay respuestas incorrectas.

No se le proporcionó ninguna instrucción adicional sobre la web ni cómo usarla.

---

## TAREAS DEFINIDAS

---

### Tarea 1: Crear una cuenta y añadir el primer acuario

**Descripción:** La participante debe entrar en la web, registrarse como usuario nuevo con el plan gratuito, y crear un acuario con el nombre "Mi acuario de prueba" indicando que es marino y tiene 200 litros.

| Campo | Registro |
|---|---|
| ¿Completada con éxito? | Sí, con ayuda puntual |
| Tiempo empleado | 4 min 20 s |
| Errores detectados / Bloqueos | **Bloqueo 1 (≈45 s):** En la pantalla de registro se detiene en la selección de plan. Lee en voz alta "FREE" y "REEFMASTER" y no entiende qué incluye cada uno sin navegar hasta la landing a releerlo. Tarda casi un minuto dudando antes de elegir FREE. **Bloqueo 2 (≈30 s):** Tras iniciar sesión llega al dashboard vacío. Mira la pantalla en silencio unos segundos buscando un menú o una lista de pasos. El CTA "Crear tu primer acuario" lo encuentra al final, pero primero intenta hacer clic en el icono de la barra lateral que parece un símbolo de suma. **Error 1:** En el formulario de registro escribe su nombre completo ("Teresa García") en el campo "Username" porque lo interpreta como "Nombre". La validación la avisa de que no se permiten espacios y tiene que corregirlo a "tere55". |
| Citas textuales del usuario | *"¿Qué es eso de REEFMASTER? ¿Tengo que pagar para usarlo bien?"* — al ver la selección de plan. / *"A ver, ya he entrado... ¿y ahora qué? No sé dónde tengo que ir para poner mi acuario."* — tras el login, mirando el dashboard vacío. / *"Ah, aquí está, este botón de abajo. Lo tenía delante y no lo veía."* — al localizar el CTA. |
| Observaciones del evaluador | La selección de plan durante el registro genera una fricción importante: Tere entiende que FREE podría ser una versión recortada pero no sabe exactamente qué pierde. No hay un enlace rápido a la comparativa de planes desde esa pantalla. Una vez localizado el CTA del dashboard vacío la creación del acuario (nombre, tipo marino, 200 l) la completa sin incidencias porque los campos son reconocibles. El "username" es el punto de fricción más repetido en usuarios no técnicos con formularios de registro. |

**Aspectos observados:**
- No entiende la diferencia de planes sin salir de la pantalla de registro — confirma el fallo heurístico 11.8.
- El formulario de registro resulta manejable salvo el campo "Username".
- El dashboard vacío no es suficiente guía: necesita entre 25 y 30 segundos para localizar el CTA — confirma el fallo heurístico 8.4.
- Una vez localizado el botón de creación, el formulario de acuario es intuitivo.

---

### Tarea 2: Registrar un parámetro y localizar la alerta de peligro

**Descripción:** Desde la vista de detalle del acuario creado en la Tarea 1, la participante debe añadir una lectura de pH con un valor fuera del rango normal (pH 6,5) y comprobar si la aplicación le avisa de que el valor es peligroso.

| Campo | Registro |
|---|---|
| ¿Completada con éxito? | Sí, parcialmente — completa el registro pero no sabe cómo actuar ante la alerta |
| Tiempo empleado | 3 min 05 s |
| Errores detectados / Bloqueos | **Bloqueo 1 (≈20 s):** Al llegar al detalle del acuario ve tres pestañas ("Parámetros", "Seres Vivos", "Equipamiento"). Hace clic primero en "Seres Vivos" creyendo que los parámetros del agua podrían estar ahí, porque asocia "parámetros" con algo técnico/informático, no con agua. **Bloqueo 2 (≈40 s):** En el formulario de nuevo parámetro encuentra un selector de tipo con opciones como "kH", "NO₃", "Ca", "Mg", "Salinidad" y "pH". No reconoce la mayoría. Dice en voz alta que no sabe qué es kH. Localiza "pH" porque es el que conoce de los test de agua que compra en la tienda. **Bloqueo 3 (≈50 s):** Tras ver aparecer el indicador rojo junto al pH 6,5, lo mira, lee el valor y espera. Hace clic sobre el badge rojo pensando que se abrirá alguna explicación o consejo. No ocurre nada. Repite el clic dos veces más (rage click real). Se queda desorientada esperando que la web le diga qué tiene que hacer. |
| Citas textuales del usuario | *"¿Parámetros? Eso suena a ordenadores... ¿no sería más fácil poner 'Análisis del agua'?"* — al leer las pestañas. / *"¿Qué es kH? No tengo ni idea. A ver si está el pH, eso sí lo conozco de los test que compro."* — al ver el selector de tipo de parámetro. / *"Sale en rojo, o sea que está mal. Pero... ¿qué hago? ¿Me dice en algún sitio lo que tengo que echar al agua?"* — tras ver la alerta, esperando una acción sugerida. |
| Observaciones del evaluador | Tere identifica el color rojo como señal de peligro sin dificultad — el sistema semafórico funciona para ella. El problema está en lo que viene después: la web no sugiere ninguna acción correctora ni muestra el rango óptimo junto al valor registrado. El badge rojo no es interactivo aunque visualmente parece que debería serlo (confirma el dead click predicho en el análisis heurístico 11.3). También se confirma que el término "parámetros" es poco intuitivo para usuarios no técnicos. |

**Aspectos observados:**
- "Parámetros" como etiqueta de pestaña genera confusión inicial — confirma el fallo heurístico 3.2.
- Los términos técnicos del selector (kH, NO₃, Ca) sin tooltip crean inseguridad — confirma el fallo heurístico 3.2.
- El badge rojo es reconocido como alerta pero genera rage clicks al no ser interactivo — nuevo hallazgo sobre el fallo heurístico 11.3.
- La web no sugiere qué hacer cuando un parámetro está fuera de rango — fallo heurístico 8.1 confirmado.

---

### Tarea 3: Buscar un producto en el mercado y guardarlo en la lista de deseos

**Descripción:** La participante debe navegar hasta la sección de Mercado, buscar un producto relacionado con "coral" o "sal", añadirlo a su lista de deseos y confirmar que aparece en dicha lista.

| Campo | Registro |
|---|---|
| ¿Completada con éxito? | Sí, con un bloqueo por enlace externo |
| Tiempo empleado | 3 min 50 s |
| Errores detectados / Bloqueos | **Bloqueo 1 (≈15 s):** Busca la sección de mercado. En la barra lateral ve un icono que interpreta como "tienda" y hace clic — acierta a la primera. No hay bloqueo real, pero comenta que si el icono no tuviera nombre escrito no sabría qué es. **Bloqueo 2 (≈1 min 10 s):** Encuentra un producto de sal marina y hace clic en el botón "Ver en tienda" para ver más detalles antes de guardarlo en la lista. El navegador abre una pestaña nueva con la tienda externa. Tere se queda mirando la nueva pestaña durante unos segundos, luego cierra la pestaña y vuelve, pero ha perdido su búsqueda y tiene que filtrar de nuevo por "sal". No era su intención visitar la tienda, solo quería ver la ficha. **Error 1:** Con el producto correcto ya localizado de nuevo, busca un botón de "Guardar" o "Favorito". Ve un icono de corazón pero no está segura de que sea para la lista de deseos. Hace clic y aparece un toast de confirmación que lee en voz alta: "Añadido a tu lista de deseos". Lo entiende. **Bloqueo 3 (≈35 s):** Para confirmar que el producto está guardado tiene que navegar a "Lista de deseos" en el menú. Lo encuentra, pero al llegar espera ver el nombre del producto directamente y tarda unos segundos en reconocerlo porque la imagen de fallback (el placeholder SVG marino) no le ayuda a identificar el artículo. |
| Citas textuales del usuario | *"Voy a ver qué es esto de Ver en tienda... ¡Uy, me ha abierto otra página! No quería salir de aquí."* — al ser redirigida a la tienda externa. / *"¿Este corazón es para guardarlo? Bueno, voy a probar a ver qué pasa."* — al dudar sobre el botón de wishlist. / *"Sí, aquí pone lista de deseos y tiene que estar... a ver, ¿cuál era el mío? Las fotos no me ayudan mucho, todas se parecen."* — al revisar la lista de deseos con imágenes de fallback. |
| Observaciones del evaluador | El enlace externo sin icono ni aviso previo ("↗" o "Abre en una nueva pestaña") interrumpe el flujo y provoca que Tere pierda el contexto de su búsqueda — confirma el fallo heurístico 11.5. El icono de corazón para la wishlist es reconocible una vez que prueba, pero genera una duda inicial porque no hay etiqueta de texto acompañándolo. Las imágenes de placeholder sin diferenciación visual dificultan la identificación del producto guardado en la lista de deseos. |

**Aspectos observados:**
- La navegación lateral con texto + icono funciona bien para este perfil de usuario.
- El botón "Ver en tienda" sin aviso de enlace externo interrumpe el flujo — confirma el fallo heurístico 11.5.
- El icono de corazón es interpretado correctamente tras probarlo, pero necesita etiqueta.
- Las imágenes de placeholder en la wishlist no permiten identificar el producto guardado.

---

## HOJA DE SEGUIMIENTO GLOBAL

| Métrica | Tarea 1 | Tarea 2 | Tarea 3 |
|---|---|---|---|
| Completada sin ayuda | No (1 orientación verbal) | Sí (parcial) | Sí |
| Tiempo (minutos) | 4:20 | 3:05 | 3:50 |
| Nº de errores | 1 (campo Username) | 0 | 1 (clic en enlace externo no intencionado) |
| Nº de bloqueos | 2 | 3 | 3 |
| Satisfacción (1–5) | 3 | 3 | 4 |

**Tiempo total del test:** 11 min 15 s (sin contar debriefing)

---

## ESCALA DE SATISFACCIÓN (POST-TEST)

Valoraciones expresadas por Tere al finalizar el test:

| Pregunta | Valoración (1–5) |
|---|---|
| ¿Con qué facilidad has podido completar las tareas? | 3 |
| ¿El diseño visual te ha resultado agradable? | 5 |
| ¿Sabías en todo momento dónde estabas dentro de la web? | 3 |
| ¿Volverías a usar esta aplicación para gestionar un acuario? | 4 |
| Valoración global de la experiencia | 3 |

**Comentario espontáneo de Tere al finalizar:** *"Es muy bonita, eso sí. Muy elegante y oscura, me gusta. Pero hay cosas que no entiendo sin preguntar, sobre todo lo de los parámetros técnicos. Si pusiera qué significa cada cosa sería perfecta para alguien como yo."*

---

## FALLOS CRÍTICOS

| # | Descripción del fallo | Tarea afectada | Gravedad |
|---|---|---|---|
| 1 | **El badge de alerta roja no es interactivo:** Tere hace tres clics seguidos sobre el indicador rojo del pH esperando obtener información sobre qué hacer. La web no responde. El usuario queda sin orientación ante un parámetro peligroso para su acuario. | Tarea 2 | Alta |
| 2 | **El botón "Ver en tienda" abre una pestaña externa sin previo aviso:** El usuario pierde el contexto de búsqueda, tiene que cerrar la pestaña y repetir el filtrado. En usuarios con menor orientación digital el riesgo de abandono total es alto. | Tarea 3 | Alta |
| 3 | **No hay guía de inicio tras el primer login:** El dashboard vacío no es suficiente para usuarios nuevos. Tere tarda casi 30 segundos buscando dónde crear su primer acuario y necesita que el evaluador le indique que puede hacer clic en el CTA (se consideró ayuda). | Tarea 1 | Alta |
| 4 | **Los términos técnicos del selector de parámetros (kH, NO₃, Ca, Mg) no tienen ninguna explicación:** Tere solo reconoce "pH" porque lo compra en tiendas físicas. El resto de opciones las ignora por no entenderlas, lo que limita el valor de la aplicación para usuarios no especializados. | Tarea 2 | Media |
| 5 | **La selección de plan en el registro no incluye un resumen claro de diferencias:** Tere duda casi un minuto entre FREE y REEFMASTER sin saber exactamente qué pierde al elegir el gratuito. No hay enlace a la comparativa de planes desde esa pantalla. | Tarea 1 | Media |

---

## RECOMENDACIONES DE DISEÑO

| # | Recomendación | Prioridad |
|---|---|---|
| 1 | **Hacer el badge de alerta interactivo.** Al hacer clic sobre el indicador rojo (o ámbar) debe abrirse un panel o tooltip con: el rango óptimo del parámetro, el valor registrado y una sugerencia de acción ("El pH ideal es 8,1–8,4. Considera añadir un tampón alcalino"). Esto convierte una señal pasiva en una herramienta de aprendizaje. | Alta |
| 2 | **Añadir un aviso explícito en los enlaces externos del mercado.** El botón "Ver en tienda" debe incluir el icono estándar de enlace externo (↗) y un tooltip "Abre la tienda en una pestaña nueva". Alternativamente, añadir un modal de confirmación breve: "Vas a salir de Thalassa. ¿Continuar?" | Alta |
| 3 | **Implementar un checklist de onboarding para el primer acceso.** Tras el primer login, mostrar un panel con 3 pasos numerados: "1. Crea tu acuario → 2. Añade tus primeros parámetros → 3. Explora el mercado". El panel desaparece cuando se completan los tres. Reduce el tiempo de orientación inicial y el riesgo de abandono. | Alta |
| 4 | **Añadir tooltips con nombre completo a cada tipo de parámetro.** Al pasar el cursor (o al hacer tap en móvil) sobre opciones como "kH", "NO₃" o "Ca" debe aparecer: "kH — Carbonato de dureza (alcalinidad del agua)" con un rango de referencia. No requiere cambiar el flujo, solo añadir información contextual. | Media |
| 5 | **Incluir comparativa rápida de planes dentro de la pantalla de registro.** Un acordeón expandible o un enlace "¿Qué incluye cada plan?" con las 3–4 diferencias clave (nº de acuarios, mensajes de IA, funciones premium) evitaría la duda prolongada sin obligar al usuario a abandonar el flujo de registro. | Media |

---

## NOTAS DEL EVALUADOR

**Perfil confirmado durante el test:** Tere navega con soltura en entornos que ya conoce (correo electrónico, formularios de oficina, tiendas online habituales). Cuando se encuentra con un patrón desconocido, su estrategia es probar — no leer el texto de ayuda, que suele ignorar si no está en el camino visual inmediato. Esto es coherente con estudios de eyetracking en usuarios de 50+ años.

**Punto fuerte inesperado:** El diseño visual oscuro, que podría parecer intimidante para este perfil de edad, genera una reacción positiva inmediata. Tere lo comenta espontáneamente como "elegante". El uso de colores de estado (verde/ámbar/rojo) es comprendido de forma intuitiva sin necesidad de leyenda.

**Punto débil más consistente:** Cada vez que Tere se encuentra con un término técnico acuícola (kH, NO₃, REEFMASTER) su ritmo de navegación se interrumpe y busca en la pantalla alguna aclaración. Al no encontrarla, actúa por prueba y error o se detiene. Este patrón se repite en las tres tareas y es el mayor freno para la autonomía del usuario en este perfil.

**Comportamiento ante errores:** Cuando comete un error (Username con espacios, pestaña externa inesperada) Tere no se frustra: lo corrige y sigue. Su tolerancia a los errores recuperables es alta. El verdadero punto de abandono potencial es la falta de feedback ante el badge de alerta roja — es el único momento del test en que expresa desconcierto real, no solo duda.

**Duración total de la sesión:** 25 minutos incluyendo introducción, las 3 tareas y el debriefing post-test.

---

*Test de usuario ejecutado el 5/11/2026. Datos simulados sobre el análisis heurístico real del repositorio Thalassa (análisis estático, 11/05/2026).*
