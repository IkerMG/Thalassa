# Segundo Feedback de Avance
## Proyecto: Thalassa — Marine Aquarium Management

**Autor:** Iker  
**Fecha:** 11 de mayo de 2026  
**Fase cubierta:** Evolución del microservicio Python, integración con el sistema completo y preparación para producción

---

## 1. Avances desde el primer feedback

### 1.1 Sustitución de scrapers: de Tiendanimal/Kiwoko a Urban Natura y Cetamar

El primer feedback documentó scrapers funcionales sobre Tiendanimal y Kiwoko (plataforma Salesforce Commerce Cloud). En esta fase, el enfoque cambió: los scrapers activos en producción son ahora **Urban Natura** y **Cetamar**, ambas tiendas sobre PrestaShop 1.7. Los archivos `kiwoko.py` y `tiendanimal.py` permanecen en el repositorio pero ya no se invocan desde el servicio de orquestación.

La decisión se justifica técnicamente: las tiendas PrestaShop presentan una estructura HTML más estable y predecible, con menor probabilidad de bloqueos por fingerprinting de cliente. Ambos scrapers (`urbannatura.py`, 291 líneas; `cetamar.py`, 288 líneas) implementan múltiples selectores CSS en cascada para mayor resiliencia ante cambios de maquetación, y manejan el lazy-loading de imágenes a través de los atributos `data-src`, `data-lazy-src` y `data-original`.

### 1.2 Consolidación del modelo de datos con Pydantic v2

En la fase anterior, los modelos de entrada y salida estaban en un único módulo. Ahora están separados en `requests.py` y `responses.py`, con validación explícita de rangos y longitudes. Destaca la introducción del tipo literal `StoreId`:

```python
# scraper/app/models/requests.py
StoreId = Literal["urbannatura", "cetamar", "all"]

class ScrapeRequest(BaseModel):
    keyword: str = Field(..., min_length=2, max_length=150)
    store: StoreId = Field(default="all")
```

Los modelos de respuesta incluyen ahora un campo `scraped_at` con timestamp UTC autogenerado, lo que permite al frontend mostrar la antigüedad del dato y al backend tomar decisiones sobre caché:

```python
# scraper/app/models/responses.py
class ProductResult(BaseModel):
    name: str
    price: float = Field(..., ge=0)
    currency: str = Field(default="EUR")
    image_url: Optional[HttpUrl] = None
    product_url: HttpUrl
    store: str
    scraped_at: datetime = Field(default_factory=datetime.utcnow)
```

### 1.3 Especificación de códigos de error estructurados

El primer feedback abordó el manejo de timeouts de forma genérica. En esta fase se formalizó un catálogo de tres códigos de error (`TIMEOUT_ERROR`, `PARSING_ERROR`, `STORE_UNAVAILABLE`) compartidos entre el scraper Python y el backend Java, permitiendo que el frontend distinga el tipo de fallo y muestre un mensaje apropiado. El campo `error` en `ScrapeResponse` y `ChatResponse` es `null` en caso de éxito, siguiendo el principio de respuesta siempre HTTP 200 con semántica de error en el cuerpo.

---

## 2. Nuevas funcionalidades implementadas

### 2.1 Sistema de prompts especializado en acuariofilia marina

La integración con Groq/Llama ya existía en el primer feedback, pero el prompt era genérico. En esta fase se desarrolló `prompts.py`, que contiene un `SYSTEM_PROMPT` especializado y una función `build_user_prompt()` que construye el contexto del acuario del usuario de forma estructurada.

El system prompt define al asistente como experto en acuariofilia marina, con conocimiento de parámetros de agua (calcio, magnesio, alcalinidad, pH, salinidad, nitratos, fosfatos), compatibilidad de fauna, tipos de coral, equipamiento (skimmers, reactores, iluminación LED), dosificación de suplementos y diagnóstico de enfermedades. También detecta el idioma del usuario y responde en consecuencia (español, inglés o alemán).

La función `build_user_prompt()` compone dinámicamente el mensaje enviado al modelo:

```python
# scraper/app/services/prompts.py (fragmento representativo)
def build_user_prompt(message: str, aquarium_context: dict | None) -> str:
    if not aquarium_context:
        return message

    parts = ["[Aquarium context]"]

    if name := aquarium_context.get("name"):
        parts.append(f"Name: {name}")
    if volume := aquarium_context.get("volume_liters"):
        parts.append(f"Volume: {volume} L")

    if livestock := aquarium_context.get("livestock"):
        parts.append(_format_livestock(livestock))
    if equipment := aquarium_context.get("equipment"):
        parts.append(_format_equipment(equipment))
    if params := aquarium_context.get("water_parameters"):
        parts.append(_format_parameters(params))

    parts.append(f"\n[User question]\n{message}")
    return "\n".join(parts)
```

Este enfoque permite que el modelo reciba el estado real del acuario (fauna, equipo, parámetros de agua actuales) junto a la pregunta del usuario, produciendo respuestas personalizadas en lugar de consejos genéricos.

### 2.2 Ejecución paralela de scrapers con gestión de fallos parciales

Se implementó en `scraper_service.py` un patrón de ejecución paralela con `asyncio.gather()` que no interrumpe la búsqueda completa cuando una tienda falla. La función `_safe_scrape()` actúa como wrapper de aislamiento de errores:

```python
# scraper/app/services/scraper_service.py
async def _safe_scrape(
    store_id: str, keyword: str
) -> tuple[list[ProductResult], ScrapeError | None]:
    try:
        results = await _SCRAPER_MAP[store_id](keyword)
        return results, None
    except httpx.TimeoutException as exc:
        return [], ScrapeError(code="TIMEOUT_ERROR", message=f"'{store_id}' no respondió a tiempo.")
    except httpx.RequestError as exc:
        return [], ScrapeError(code="TIMEOUT_ERROR", message=f"No se pudo conectar con '{store_id}'.")
    except httpx.HTTPStatusError as exc:
        return [], ScrapeError(code="PARSING_ERROR", message=f"'{store_id}' devolvió HTTP {exc.response.status_code}.")
    except Exception as exc:
        return [], ScrapeError(code="PARSING_ERROR", message=f"Error al obtener datos de '{store_id}'.")

async def search_products(keyword: str, store: str = "all") -> ScrapeResponse:
    store_ids = list(_DEFAULT_STORES) if store == "all" else [store]

    gathered = await asyncio.gather(
        *[_safe_scrape(sid, keyword) for sid in store_ids],
        return_exceptions=False,
    )
    # Si una tienda falla pero la otra tiene resultados, el error se omite del response
    results, first_error = [], None
    for sid, (store_results, store_error) in zip(store_ids, gathered):
        results.extend(store_results[:get_settings().max_results_per_store])
        if store_error and first_error is None:
            first_error = store_error

    return ScrapeResponse(
        keyword=keyword, store=store, results=results,
        total=len(results),
        error=first_error if not results else None,
    )
```

La clave del diseño es la última línea: si hay resultados de alguna tienda, el campo `error` se devuelve como `null`, evitando que un fallo parcial se propague al usuario como un error completo.

### 2.3 Proxy inteligente con seed cache fallback en el backend Java

El backend Java no actúa como simple proxy transparente: `ScraperService.java` (248 líneas) implementa un mecanismo de fallback que carga datos precargados desde `/resources/market-seed/{store}.json` cuando el microservicio Python devuelve error o una lista vacía. Esto garantiza que el marketplace siempre muestre contenido incluso si el scraping en tiempo real no está disponible.

La configuración del cliente HTTP hacia Python se define en `ScraperClientConfig.java`:

```java
// backend/.../config/ScraperClientConfig.java
@Configuration
public class ScraperClientConfig {
    @Bean
    public RestClient scraperRestClient(@Value("${python.service.url}") String baseUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(8));
        factory.setReadTimeout(Duration.ofSeconds(8));
        return RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
    }
}
```

El timeout de 8 segundos es deliberadamente inferior al timeout interno del scraper Python (10 segundos), garantizando que el backend Java nunca se bloquee esperando una respuesta que el scraper ya ha abandonado.

### 2.4 Rate limiting por plan de usuario en el chat

El primer feedback no contemplaba ningún sistema de monetización. En esta fase, `ChatService.java` implementa rate limiting por plan:

- **Plan FREE**: 5 mensajes diarios
- **Plan REEFMASTER**: mensajes ilimitados

El patrón seguido es "reservar y confirmar": el contador de uso solo se incrementa si la respuesta del LLM llega correctamente. Si el microservicio Python devuelve un error de infraestructura, el mensaje no se descuenta de la cuota del usuario.

### 2.5 Health check con validación de GROQ_API_KEY en Docker

El `docker-compose.yml` incluye un health check para el servicio scraper que va más allá de verificar que el proceso esté vivo: comprueba que la variable `GROQ_API_KEY` esté configurada y no sea el valor placeholder `tu_api_key_aqui`:

```yaml
# docker-compose.yml (fragmento)
scraper:
  healthcheck:
    test: >
      ["CMD-SHELL",
       "[ -n \"$$GROQ_API_KEY\" ] &&
        [ \"$$GROQ_API_KEY\" != 'tu_api_key_aqui' ] &&
        echo OK || (echo 'GROQ_API_KEY not set or placeholder' && exit 1)"]
    interval: 30s
    timeout: 5s
    retries: 3
    start_period: 10s
```

Esto hace que el backend Java no marque el scraper como `service_healthy` si la API key no está presente, evitando arranques silenciosos con el chat inoperativo.

---

## 3. Integración con el resto del sistema

### 3.1 Flujo completo: Frontend → Backend Java → Microservicio Python

El microservicio Python no es accesible directamente desde el navegador. Todas las peticiones pasan por el backend Java, que actúa como proxy autenticado:

```
Usuario (React)
  │
  ├─ GET /api/scraper/search?keyword=X
  │     → ScraperController → ScraperService
  │         → GET http://scraper:8001/scrape?keyword=X&store=all
  │             → asyncio.gather([urbannatura, cetamar])
  │         ← ScrapeResponse (JSON snake_case)
  │     ← ScraperResponse (JSON camelCase, seed fallback si vacío)
  │
  └─ POST /api/chat  { message, aquariumId }
        → ChatController → ChatService
            → checkRateLimit(user)
            → buildAquariumContext(aquariumId)  [consulta PostgreSQL]
            → POST http://scraper:8001/chat/message { message, aquarium_context }
                → groq_client.get_reply(message, context)
                → Groq API (Llama 3.3-70b)
            ← ChatResponse
        ← ChatResponse (con incremento de cuota si éxito)
```

La comunicación entre servicios se realiza por nombre de servicio Docker (`scraper:8001`) dentro de la red `thalassa-net`, sin exponerse a Internet.

### 3.2 Integración con el frontend React

El frontend llama a dos endpoints del backend Java a través de clientes Axios:

```typescript
// frontend/src/api/marketApi.ts
export const marketApi = {
  search: (keyword: string) =>
    api.get<ScraperResponse>('/scraper/search', { params: { keyword } })
       .then((r) => r.data),
};

// frontend/src/api/chatApi.ts
export const chatApi = {
  sendMessage: (data: ChatRequest) =>
    api.post<ChatResponse>('/chat', data).then((r) => r.data),
  getUsage: () =>
    api.get<ChatUsageResponse>('/chat/usage').then((r) => r.data),
};
```

El tipo `ScraperResponse` del frontend incluye el campo `error` del schema OpenAPI, por lo que el componente de marketplace puede distinguir entre resultados reales, resultados de seed fallback y errores completos.

### 3.3 Integración con PostgreSQL

El microservicio Python **no accede directamente a PostgreSQL**. La base de datos es responsabilidad exclusiva del backend Java (Spring Data JPA + Flyway). El flujo de contexto del acuario es:

1. El frontend envía el `aquariumId` en el body del chat.
2. `ChatService.java` consulta las entidades `Aquarium`, `Livestock`, `Equipment` y `WaterParameter` en PostgreSQL.
3. Serializa ese contexto como `Map<String, Object>` y lo incluye en el body del `POST /chat/message` a Python.
4. El microservicio Python recibe el contexto ya resuelto y lo inserta en el prompt del LLM.

Este diseño desacopla el microservicio Python de la base de datos, simplificando su mantenimiento y evitando la necesidad de gestionar credenciales de PostgreSQL en el servicio de scraping.

### 3.4 Reverse proxy Traefik con HTTPS automático

En producción, Traefik (v3.3) gestiona el enrutamiento y los certificados TLS. El dominio configurado en `DOMAIN` determina las reglas de routing:

- `Host(DOMAIN) && PathPrefix(/api)` → backend Java (puerto 8080)
- `Host(DOMAIN)` → frontend React (nginx, puerto 80)
- El scraper Python **no tiene label de Traefik**: solo es accesible dentro de `thalassa-net`

Los certificados Let's Encrypt se renuevan automáticamente via HTTP-01 challenge y se persisten en el volumen `acme_data`.

Para desarrollo local, `docker-compose.override.yml` sustituye la configuración de Traefik por `traefik-dev.yml`, que elimina el redirect HTTPS y el challenge ACME, permitiendo trabajar sin dominio real.

---

## 4. Pruebas realizadas en esta fase

### 4.1 Ausencia de tests automatizados en el microservicio Python

En esta fase no se implementaron tests formales con pytest en el scraper. El backend Java sí cuenta con tests de integración (JUnit5 + Testcontainers), pero están fuera del alcance de este feedback.

### 4.2 Pruebas manuales realizadas

**Pruebas del endpoint de scraping:**

- Se ejecutó `GET http://localhost:8001/scrape?keyword=skimmer&store=all` con el stack completo activo. Se verificó que la respuesta incluyera productos de `urbannatura` y `cetamar` en un mismo array, cada uno con nombre, precio en EUR, URL de imagen y URL de producto.
- Se forzó un timeout apagando la red del contenedor scraper y comprobando que la respuesta incluyera `"error": {"code": "TIMEOUT_ERROR", ...}` pero siguiera devolviendo HTTP 200.
- Se verificó el comportamiento con `store=urbannatura` y `store=cetamar` de forma individual, confirmando que solo se realiza una petición al scraper correspondiente.

**Pruebas del endpoint de chat:**

- Se ejecutó `POST http://localhost:8001/chat/message` con un mensaje sobre calcio y un `aquarium_context` con fauna, equipo y parámetros reales. Se verificó que la respuesta del LLM hacía referencia al contexto proporcionado.
- Se probó con `GROQ_API_KEY` ausente, confirmando que la respuesta devuelve `"error": {"code": "GROQ_UNAVAILABLE", ...}` en lugar de lanzar una excepción HTTP 500.
- Se probó el rate limiting desde el frontend: tras 5 mensajes con plan FREE, el backend Java rechaza la petición sin llegar a llamar al microservicio Python.

**Pruebas de integración del stack completo:**

- Se levantó el stack con `docker compose up` y se ejecutaron búsquedas desde el componente marketplace del frontend, verificando que los resultados del scraper aparecían correctamente renderizados.
- Se apagó el contenedor scraper mientras el stack estaba en marcha y se comprobó que el marketplace mostraba los datos del seed fallback en lugar de un error.
- Se verificó el health check del scraper: con `GROQ_API_KEY=tu_api_key_aqui`, el backend Java detecta el servicio como `unhealthy` y no arranca hasta que la variable está correctamente configurada.

---

## 5. Dificultades encontradas en esta fase

### 5.1 Mapeo de esquemas entre Python (snake_case) y Java (camelCase)

La serialización por defecto de FastAPI usa `snake_case` (ej. `image_url`, `product_url`, `scraped_at`), mientras que Spring Boot espera y produce `camelCase`. Esto requirió implementar lógica de mapeo explícita en `ScraperService.java` para transformar los campos antes de devolverlos al frontend, añadiendo superficie de mantenimiento que deberá mantenerse sincronizada si los modelos evolucionan.

### 5.2 Health check del scraper como dependencia bloqueante

El `depends_on: scraper: condition: service_healthy` en el backend Java introdujo una dependencia de arranque inesperada: si `GROQ_API_KEY` no está configurada, el backend Java no arranca en absoluto. Aunque esto es un comportamiento correcto en producción (evita arranques silenciosos con el chat roto), en desarrollo local puede dificultar el trabajo en funcionalidades que no dependen del chat. Se mitigó con el `docker-compose.override.yml`, pero el flujo de onboarding para nuevos desarrolladores requiere atención adicional.

### 5.3 Selección de scrapers activos vs. inactivos

Los archivos `kiwoko.py` y `tiendanimal.py` permanecen en el repositorio sin ser llamados desde `scraper_service.py`. Esto puede generar confusión: el código existe y es funcional, pero no se ejecuta en producción. La decisión de mantenerlos fue pragmática (permiten reactivarlos rápidamente), pero deberían documentarse explícitamente o eliminarse antes de la entrega final.

### 5.4 Validación de URLs de imágenes en PrestaShop

Ambos scrapers PrestaShop encontraron dificultad con las imágenes: los sitios usan lazy-loading con múltiples atributos (`data-src`, `data-lazy-src`, `data-original`) y en algunos casos devuelven URLs de imagen placeholder (GIFs transparentes o SVGs genéricos). Se implementó lógica de validación para descartar estas URLs y devolver `null` en `image_url` cuando no se puede obtener una imagen real, evitando que el frontend muestre íconos rotos.

---

## 6. Estado actual y próximos pasos

### 6.1 Estado actual del microservicio Python

El microservicio está funcional y desplegable en producción. Cubre los dos casos de uso principales del proyecto:

| Funcionalidad | Estado |
|---|---|
| Scraping Urban Natura | Operativo |
| Scraping Cetamar | Operativo |
| Búsqueda paralela con `asyncio.gather` | Operativo |
| Manejo de errores por tienda (TIMEOUT, PARSING, UNAVAILABLE) | Operativo |
| Chat con Groq/Llama 3.3-70b | Operativo |
| System prompt especializado en acuariofilia | Operativo |
| Contexto del acuario en el prompt | Operativo |
| Health check Docker con validación de API key | Operativo |
| Documentación interactiva (`/docs`) | Operativo |

### 6.2 Pendiente antes de la entrega (19 de mayo)

Con cuatro días hasta la entrega, las tareas restantes identificadas son:

1. **Tests automatizados básicos con pytest**: Al menos pruebas unitarias sobre `scraper_service.py` (lógica de merge de resultados, manejo de errores) y `groq_client.py` (respuestas de error sin API key). No es necesaria cobertura completa, pero sí demostrar que existe un framework de testing.

2. **Documentar o eliminar los scrapers inactivos**: Decidir si `kiwoko.py` y `tiendanimal.py` se incluyen con una nota en el README o se eliminan del árbol de archivos para no generar confusión en la revisión.

3. **Revisión del `SYSTEM_PROMPT`**: Validar con casos reales que las respuestas del modelo en los tres idiomas (español, inglés, alemán) son correctas y no contienen alucinaciones sobre parámetros de agua o dosificaciones incorrectas.

4. **Verificación del stack completo en entorno limpio**: Ejecutar `docker compose up --build` desde cero (sin capas cacheadas ni volúmenes previos) para confirmar que el orden de arranque, las migraciones Flyway y el health check del scraper funcionan correctamente en un entorno equivalente al de evaluación.

5. **Documentación de la API en el README**: Incluir los endpoints del scraper con ejemplos de request/response para que sea evaluable sin necesidad de arrancar el stack.

---

*Documento generado el 11 de mayo de 2026 basándose en análisis del código fuente del repositorio.*
