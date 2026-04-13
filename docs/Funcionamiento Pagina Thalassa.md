### 1. Onboarding y Autenticación Segura

- **Acceso inicial:** El usuario entra a la aplicación web construida en React. Se encuentra con una _Landing Page_ que explica los beneficios de Thalassa (ahorro, bienestar animal, control de consumo).
    
- **Registro/Login:** El usuario crea una cuenta. Por debajo, React envía las credenciales al backend de Java. Java encripta la contraseña, la guarda en MySQL y devuelve un **Token JWT**.
    
- **Sesión Stateless:** A partir de ese momento, el usuario navega de forma segura. El token desbloquea el acceso a sus datos privados sin necesidad de que el servidor mantenga sesiones abiertas, optimizando los recursos del sistema.
    

### 2. Panel de Control (Dashboard) y Lógica Freemium

- **Vista General:** Al entrar, el usuario visualiza un panel con tarjetas (Cards) que representan sus acuarios actuales (ej. "Arrecife Principal 300L", "Acuario Cuarentena 50L").
    
- **Aplicación del Modelo de Negocio:** Aquí entra en juego la monetización. Si el usuario intenta crear un tercer acuario, el sistema (backend) verifica su rol. Si es un usuario "Freemium", se bloquea la acción y salta un aviso para actualizar al plan "ReefMaster".
    

### 3. Ficha Técnica del Acuario y Trazabilidad

Al hacer clic en un acuario específico, el usuario accede al núcleo de la gestión, dividido en dos áreas:

- **Inventario de Habitantes (Livestock):** Un registro de los peces, corales e invertebrados. Incluye fechas de introducción al tanque y un sistema de alertas. Por ejemplo, si el usuario intenta añadir un Pez Ballesta en un acuario catalogado como "Reef Safe" (con corales), el sistema lanza una advertencia de incompatibilidad.
    
- **Inventario de Equipamiento (Equipment):** Registro de componentes técnicos como skimmers, bombas de movimiento o pantallas LED.
    
- **Calculadora de Eficiencia:** El usuario introduce los vatios (W) de cada aparato y las horas que está encendido al día. Java procesa estos datos y devuelve el consumo eléctrico mensual en euros, fomentando la optimización energética.
    

### 4. El Asistente de Compras (La "Magia" del Scraping)

Esta es la funcionalidad estrella para el ahorro y la monetización:

- **Búsqueda en Tiempo Real:** El usuario necesita comprar material nuevo (ej. "Sal Marina" o "Filtro UV") y utiliza el buscador de Thalassa.
    
- **Flujo de Microservicios:** React envía la petición a Java. Java, actuando como puente, le pide al microservicio de Python que busque ese término.
    
- **Extracción de Datos:** Python se conecta de forma invisible a tiendas externas, extrae los nombres, precios e imágenes, y prioriza mostrar opciones de segunda mano o reacondicionadas si la tienda las ofrece.
    
- **Resultados y Afiliación:** El usuario recibe una lista comparativa en su pantalla. Puede guardar los productos en su _Wishlist_ (Lista de deseos) o hacer clic en "Comprar". Ese clic lleva un parámetro de afiliado que genera ingresos pasivos para la plataforma.
    

### 5. Resumen del Valor Funcional para el Usuario

En definitiva, la web funciona como un ciclo cerrado: el usuario planifica su acuario, el sistema evalúa si los componentes son eficientes y los peces compatibles, el motor de scraping le busca las opciones más baratas para montarlo, y el panel de control le ayuda a mantenerlo estable a lo largo del tiempo.