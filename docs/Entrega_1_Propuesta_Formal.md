# Propuesta Formal de Trabajo de Fin de Grado
## Ciclo Superior de Desarrollo de Aplicaciones Web (DAW)

---

# 1. Quién soy

Mi nombre es **[TU_NOMBRE]**, estudiante de segundo curso del Ciclo Superior de Desarrollo de Aplicaciones Web. A lo largo de estos dos años he desarrollado una visión integral del desarrollo de software, abarcando tanto la capa de servidor como la de cliente. Mi perfil se orienta hacia el desarrollo **Full-Stack**, con especial interés en el diseño de arquitecturas escalables y en la creación de aplicaciones que resuelvan problemas reales de usuarios concretos.

Mi motivación principal no es únicamente demostrar competencia técnica, sino aprovechar el TFG como oportunidad para construir un producto funcional, con viabilidad real de mercado. Considero que la mejor forma de consolidar los conocimientos adquiridos es enfrentarse a los mismos desafíos que un equipo de desarrollo profesional: modelar una base de datos robusta, diseñar una API segura, integrar servicios externos y entregar una interfaz de usuario coherente y usable. Este proyecto es la culminación de ese proceso.

---

# 2. Qué desarrollaré

## 2.1 Descripción General del Proyecto: Thalassa

**Thalassa** es una plataforma web de gestión integral para acuaristas marinos. Su propósito es actuar como asistente técnico e inteligente que centraliza, en una única interfaz, todas las necesidades del aficionado a la acuariofilia marina: la organización de su fauna y equipamiento, la verificación de compatibilidades biológicas, el cálculo de eficiencia energética y la búsqueda automatizada de materiales en el mercado.

El sector de la acuariofilia carece de herramientas especializadas accesibles. Los aficionados gestionan sus acuarios con hojas de cálculo, grupos de mensajería o, simplemente, de memoria, lo que genera pérdidas económicas y, lo que es más grave, muertes de animales por incompatibilidades evitables. Thalassa nace para resolver este vacío con tecnología moderna.

---

## 2.2 El Núcleo Funcional: el binomio Acuario → (Fauna + Equipamiento)

La entidad central de la aplicación es el **Acuario**. Cada usuario registrado puede crear y gestionar sus proyectos de acuario, y cada uno de ellos actúa como contenedor de dos inventarios diferenciados:

- **Fauna (Livestock):** Registro detallado de todos los seres vivos del acuario (peces, corales e invertebrados). Cada especie incluye nombre común, nombre científico, categoría, cantidad de ejemplares y fecha de introducción al tanque, lo que permite mantener una trazabilidad completa del ecosistema.

- **Equipamiento (Equipment):** Inventario del material técnico instalado (skimmers, bombas de circulación, pantallas LED, calefactores, etc.), con información sobre marca, modelo, potencia en vatios y horas de funcionamiento diario.

Esta estructura refleja con fidelidad la realidad de un acuario marino: no basta con saber qué animales viven en él; es igualmente crítico conocer qué tecnología lo sostiene y si esa tecnología es eficiente.

---

## 2.3 Alerta de Compatibilidad de Especies (Reef Safe)

Una de las funcionalidades de mayor valor para el usuario, y de mayor complejidad técnica, es el **sistema de alerta de compatibilidad biológica**.

La plataforma mantiene un **catálogo maestro de especies** (`species_catalog`) con datos curados, entre los que se incluye el atributo `reef_safe`. Este atributo indica si una especie es compatible con acuarios de arrecife de coral. Por ejemplo, el Pez Ballesta (*Balistidae*) es una especie que ataca y devora corales, lo que lo hace absolutamente incompatible con un acuario catalogado como `MARINO_ARRECIFE`.

Cuando un usuario intenta registrar una especie en su inventario, el backend consulta automáticamente el catálogo y verifica la compatibilidad. Si detecta una incompatibilidad, devuelve al frontend un campo `warning` con el mensaje descriptivo de la alerta. El sistema **no bloquea la acción** (respetando la autonomía del usuario) pero garantiza que la decisión sea consciente e informada, previniendo pérdidas animales y económicas.

---

## 2.4 Calculadora de Eficiencia Energética

El consumo eléctrico es uno de los principales costes operativos de un acuario marino avanzado. Thalassa incorpora una **calculadora de eficiencia energética** que procesa el inventario de equipamiento de cada acuario y calcula el gasto mensual estimado en euros.

La fórmula aplicada es la siguiente:

> **Gasto mensual (€) = (Potencia_W / 1000) × Horas_día × 30 días × Precio_kWh**

El precio del kWh es configurable por el propio usuario en su perfil, adaptándose así a las tarifas de cada país o compañía eléctrica. Esta herramienta fomenta la conciencia energética y ayuda al usuario a tomar decisiones de compra de equipamiento más informadas y sostenibles.

---

## 2.5 Modelo de Monetización: Freemium vs. ReefMaster

La viabilidad económica de Thalassa se sustenta en un **modelo Freemium** con dos niveles de servicio bien diferenciados:

| Característica | Plan **FREE** | Plan **ReefMaster** |
|---|---|---|
| Acuarios gestionables | **1** | **Ilimitados** |
| Calculadora energética | No disponible | Disponible |
| Motor de búsqueda (Scraper) | Disponible | Disponible |
| Precio | Gratuito | 4,99 €/mes |

La lógica de restricción del plan FREE está implementada directamente en el backend: si un usuario con `subscription_plan = 'FREE'` intenta crear un segundo acuario, la API devuelve un `403 Forbidden`. El frontend, por su parte, intercepta este estado y muestra un modal de llamada a la acción para la actualización de plan.

Como segunda vía de ingresos, la plataforma integra un modelo de **marketing de afiliación**: los resultados del motor de búsqueda incluyen parámetros de afiliado en sus URLs, de modo que cada compra que el usuario realice a través de Thalassa genera una comisión pasiva para la plataforma (entre un 3% y un 5% por transacción).

---

# 3. Cómo lo haré

Thalassa se construye sobre una **arquitectura de microservicios** con tres capas bien diferenciadas: un backend principal en Java, un microservicio auxiliar en Python y un frontend en React. Esta separación de responsabilidades garantiza la escalabilidad y facilita el mantenimiento independiente de cada componente.

---

## 3.1 Backend: Java Spring Boot (API REST + Seguridad + Persistencia)

El núcleo de la aplicación es una **API REST** desarrollada con **Spring Boot**, que expone todos los endpoints de negocio y gestiona la persistencia de datos.

- **API REST:** Conjunto de controladores organizados por dominio (`AuthController`, `AquariumController`, `LivestockController`, `EquipmentController`, `ScraperController`, etc.) que siguen los principios REST (verbos HTTP semánticos, respuestas estandarizadas, separación de DTOs y entidades).

- **Seguridad con JWT:** La autenticación se implementa de forma **stateless** mediante **Spring Security** y tokens **JWT (JSON Web Tokens)**. Al hacer login, el servidor valida las credenciales, encripta la contraseña con **BCrypt** y emite un token firmado criptográficamente. El cliente incluye este token en la cabecera `Authorization: Bearer <token>` en cada petición, y un filtro personalizado (`JwtAuthFilter`) lo valida antes de procesar la solicitud. Esta arquitectura elimina la dependencia de sesiones de servidor, haciéndola más escalable.

- **Base de Datos:** Se utiliza **MySQL** como sistema gestor relacional. La persistencia se gestiona a través de **Spring Data JPA con Hibernate**, que mapea las entidades Java al esquema relacional (`users`, `aquariums`, `livestock`, `equipment`, `wishlist`, `species_catalog`) y gestiona las relaciones con cascada y eliminación de huérfanos de forma declarativa.

---

## 3.2 Frontend: React + TypeScript (Mobile First + Tailwind CSS)

La interfaz de usuario se desarrolla con **React** y **TypeScript**, utilizando **Vite** como bundler para un entorno de desarrollo ágil.

- **TypeScript:** El uso de tipos estáticos garantiza la coherencia de datos entre el frontend y la API, ya que los DTOs de TypeScript espejean directamente los DTOs del backend, eliminando errores de integración en tiempo de ejecución.

- **Diseño Mobile First:** La maquetación sigue una estrategia *mobile first* con **Tailwind CSS**, asegurando que la aplicación sea plenamente funcional y estética tanto en dispositivos móviles como en escritorio. Esto es especialmente relevante dado que gran parte de los usuarios de acuariofilia consultan información desde el teléfono mientras están trabajando en el acuario.

- **Routing y Estado:** La navegación entre vistas (Login, Dashboard, Detalle de Acuario, Buscador, Wishlist, Perfil) se gestiona con **React Router**. Las llamadas a la API se realizan con **Axios**, y el token JWT se persiste en `localStorage` para mantener la sesión activa entre visitas.

- **Lógica Freemium en el Cliente:** El frontend no delega ciegamente en el backend para las restricciones de plan. Si el estado del usuario es `FREE`, se ocultan o deshabilitan proactivamente los elementos de UI restringidos (botón de crear segundo acuario, panel de calculadora), mejorando la experiencia de usuario y reduciendo llamadas innecesarias a la API.

---

## 3.3 Microservicio de Scraping: Python + FastAPI (Arquitectura Asíncrona)

El motor de búsqueda de precios es un **microservicio independiente** desarrollado en **Python con FastAPI**.

- **Funcionamiento:** Recibe un parámetro `keyword` (término de búsqueda), accede de forma programática a tiendas especializadas del sector (como Kiwoko o Tiendanimal) utilizando las librerías **Requests** y **BeautifulSoup4**, extrae los datos estructurados (nombre, precio, imagen, URL de producto y nombre de tienda) y devuelve una lista JSON estandarizada.

- **Integración con Spring Boot:** El backend de Java actúa como orquestador. Cuando el usuario realiza una búsqueda, Spring Boot llama al microservicio Python mediante **WebClient** (cliente HTTP reactivo y no bloqueante), con un timeout configurado de 8 segundos. La URL del servicio Python se inyecta como variable de entorno (`PYTHON_SERVICE_URL`), nunca como valor hardcodeado, para garantizar la portabilidad entre entornos (local, staging, producción).

- **Gestión de Errores:** El microservicio maneja de forma explícita los escenarios de error (`TimeoutError`, `ParsingError`) devolviendo una lista vacía con un `error_code` descriptivo, en lugar de propagar excepciones que romperían la experiencia del usuario.

---

## 3.4 Despliegue

La aplicación está diseñada para ser desplegada en servicios de nube modernos con configuración mínima:

- **Backend (Spring Boot) y Microservicio (Python/FastAPI):** Desplegados en **Railway** o **Render**, plataformas que admiten contenedores Docker directamente desde un repositorio GitHub. El proyecto incluirá un `docker-compose.yml` con los tres servicios (`mysql`, `spring-boot`, `python-fastapi`) para garantizar la reproducibilidad del entorno tanto en local como en producción.
- **Frontend (React):** Desplegado en **Vercel**, que ofrece integración continua con GitHub y despliegues automáticos ante cada push a la rama principal.
- **Variables de entorno:** Todas las credenciales sensibles (contraseña de base de datos, secreto JWT, URL del microservicio Python) se gestionan como variables de entorno en los paneles de configuración de cada plataforma, nunca en el código fuente.

---

# 4. Cuándo lo haré

El desarrollo de Thalassa se organiza en **4 sprints de trabajo intensivo** repartidos en 27 días naturales, desde el inicio del proyecto hasta la congelación del código. La planificación es deliberadamente conservadora en cuanto al alcance de cada sprint, dejando margen para la resolución de imprevistos técnicos.

---

## Sprint 1 — Cimientos del Backend (13 – 19 de abril)

El primer sprint tiene un único objetivo verificable: **el sistema de autenticación funciona de extremo a extremo**. Durante esta semana se configura el proyecto Spring Boot con todas sus dependencias, se diseña y crea el esquema completo de la base de datos MySQL, y se implementa el sistema de seguridad JWT. El sprint finaliza cuando es posible realizar un login con éxito en Postman y obtener un token JWT válido. En paralelo, se inicializa también el proyecto FastAPI de Python con sus dependencias base.

## Sprint 2 — Lógica de Negocio Core (20 – 26 de abril)

El segundo sprint es el corazón técnico del proyecto. Se implementan los CRUDs completos de acuarios, fauna y equipamiento, y sobre ellos se construye la lógica de negocio diferenciadora: la **restricción del plan Freemium** en el servicio de creación de acuarios, la **alerta de compatibilidad reef safe** en el servicio de gestión de fauna, y el **endpoint de la calculadora energética**, accesible únicamente para usuarios con plan ReefMaster. El sprint concluye con una colección de Postman que cubre todos los casos de negocio relevantes.

## Sprint 3 — Integración Python + Frontend Base (27 de abril – 3 de mayo)

El tercer sprint tiene una dualidad clara. Por un lado, se completa el microservicio Python con la lógica de scraping real y su integración con Spring Boot a través de WebClient. Por otro, se construye el frontend React desde cero: configuración del proyecto, sistema de rutas, y las vistas principales conectadas al backend (Login, Dashboard y Detalle de Acuario). El sprint concluye cuando el flujo completo `login → dashboard → detalle de acuario` funciona en el navegador con datos reales del backend.

## Sprint 4 — Frontend Completo + Tests + Cierre (4 – 10 de mayo)

El sprint final completa todas las vistas pendientes del frontend (ScraperPage, WishlistPage, ProfilePage y EnergyCalculatorPanel), integra visualmente todas las lógicas de negocio (modal de upgrade freemium, visualización de alertas de compatibilidad), y prepara el proyecto para su entrega. Se desarrollan los tests de integración del backend, se dockeriza la aplicación y se realiza el despliegue en los servicios de nube.

**El día 10 de mayo se congela el código.** A partir de esta fecha no se integra ningún cambio funcional en la rama principal.

---

## Fase Final — Memoria y Defensa (11 – 18 de mayo)

Los siete días posteriores al freeze se dedican íntegramente a la redacción de la memoria técnica del TFG, a la preparación de la presentación (máximo 10 diapositivas) y al ensayo cronometrado de la defensa. Como medida de contingencia, se grabará un vídeo de demostración funcional de la aplicación.

**La defensa está prevista para el 18 de mayo de 2026.**

---

*Documento redactado como Entrega 1 — Propuesta Formal del TFG.*
*Ciclo Superior de Desarrollo de Aplicaciones Web.*
