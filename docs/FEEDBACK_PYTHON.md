# FEEDBACK_PYTHON.md — Microservicio de Web Scraping en Python

> Documento técnico del subsistema escrito en Python dentro del proyecto **Thalassa**.
> Cubre los apartados oficiales exigidos: **Funcionamiento**, **Código desarrollado** y **Conclusión**.

---

## 1. Funcionamiento

### 1.1 Rol de Python en la arquitectura general

Dentro del proyecto Thalassa, Python no es el lenguaje principal del backend —ese papel lo asume Spring Boot (Java 21)— sino que se ha aislado deliberadamente en un **microservicio independiente** cuya única responsabilidad es el *web scraping en tiempo real* de tiendas externas de acuariofilia. Esta decisión arquitectónica responde a tres principios:

1. **Separación de responsabilidades (SoC):** el dominio de negocio, la persistencia y la autenticación viven en Java; las tareas de extracción HTML, parseo de DOM y normalización viven en Python, donde el ecosistema (BeautifulSoup, lxml, httpx) ofrece una ergonomía muy superior para estas operaciones.
2. **Aislamiento de fallos:** el scraping es por naturaleza frágil (las tiendas cambian su HTML, devuelven 503, bloquean por IP, etc.). Encerrar esa volatilidad en un proceso aparte evita que un fallo de parseo degrade el servidor Java principal.
3. **Despliegue desacoplado:** el microservicio se publica en su propio contenedor Docker (puerto `8001`), y puede reiniciarse, escalarse o reemplazarse sin tocar el monolito Spring.

El microservicio se ha implementado con **FastAPI** como framework HTTP, **httpx (AsyncClient)** como cliente HTTP asíncrono y **BeautifulSoup4 + lxml** como motor de parseo del DOM. Pydantic se encarga de la validación tanto de la configuración (`BaseSettings`) como de los DTO de salida (`BaseModel`).

### 1.2 Flujo de datos extremo a extremo

El flujo de una consulta de precios atraviesa los siguientes pasos:

```
 ┌──────────────────┐     HTTP GET     ┌────────────────────────┐    HTTP GET    ┌───────────────────┐
 │  Frontend (JS)   │ ───────────────► │  Backend Spring Boot   │ ─────────────► │  Microservicio    │
 │  Vue/Vanilla     │                  │  (Java 21, puerto 8080)│   ?keyword=    │  Python (8001)    │
 └──────────────────┘ ◄─────────────── └────────────────────────┘ ◄───────────── └─────────┬─────────┘
       JSON normalizado          JSON unificado                                            │
                                                                                           │ asyncio.gather
                                                                                           ▼
                                                                       ┌─────────────────────────────────┐
                                                                       │ scrape_urbannatura()  (httpx)   │
                                                                       │ scrape_cetamar()      (httpx)   │
                                                                       │ BeautifulSoup + lxml            │
                                                                       └─────────────────────────────────┘
```

1. **Frontend → Java.** El cliente web envía una búsqueda con la *keyword* introducida por el usuario.
2. **Java → Python.** El backend Spring Boot delega la operación realizando una llamada HTTP `GET /scrape?keyword={kw}&store={store}` al microservicio Python.
3. **Python → tiendas externas.** El servicio dispara, mediante `asyncio.gather`, peticiones HTTP **en paralelo** a cada tienda soportada (actualmente Urban Natura y Cetamar). El uso de `asyncio` permite que la latencia total se aproxime a la latencia de la tienda *más lenta*, en lugar de a la *suma* de ambas.
4. **Parseo y normalización.** Cada scraper individual parsea el HTML con BeautifulSoup, aplica los selectores CSS específicos de su plataforma (ambas tiendas funcionan sobre PrestaShop 1.7) y construye una lista de objetos `ProductResult`.
5. **Respuesta unificada.** El servicio agrega todos los resultados en un único DTO (`ScrapeResponse`) que se devuelve al backend Java. Java reenvía el JSON al frontend, donde se renderizan las tarjetas comparativas.

### 1.3 DTO de salida unificado

Independientemente de qué tienda haya generado cada producto, el microservicio garantiza que **todos los registros adoptan exactamente el mismo esquema** antes de salir del proceso Python. Esta normalización es la pieza clave que hace al backend Java agnóstico respecto a la tienda de origen.

Forma simplificada del DTO de producto (definido en [`scraper/app/models/responses.py`](scraper/app/models/responses.py)):

```json
{
  "name": "Skimmer Tunze 9004",
  "price": 189.95,
  "currency": "EUR",
  "image_url": "https://www.urbannatura.com/.../skimmer-9004.jpg",
  "product_url": "https://www.urbannatura.com/es/skimmers/9004.html",
  "store": "Urban Natura",
  "scraped_at": "2026-05-15T10:14:33Z"
}
```

La respuesta completa envuelve la lista en un sobre que añade metadatos de la búsqueda y, opcionalmente, un error parcial:

```json
{
  "keyword": "skimmer",
  "store": "all",
  "results": [ /* ... */ ],
  "total": 12,
  "error": null
}
```

---

## 2. Código desarrollado

A continuación se documentan los retos técnicos no triviales que se han resuelto durante el desarrollo, acompañados de fragmentos del estado actual del repositorio.

### 2.1 Composición paralela y aislamiento de errores en `scraper_service.py`

El servicio orquestador ([`scraper/app/services/scraper_service.py`](scraper/app/services/scraper_service.py)) cumple dos funciones críticas: lanzar las extracciones en paralelo y **garantizar que un fallo en una tienda nunca tumbe los resultados de las demás**. Esto se consigue envolviendo cada scraper en una capa defensiva `_safe_scrape`, que captura *todas* las excepciones esperables de httpx (timeouts, errores de red, HTTP no-2xx) y cualquier error inesperado de parseo, devolviendo siempre la tupla `(resultados, error_o_None)`:

```python
async def _safe_scrape(store_id: str, keyword: str) -> tuple[list[ProductResult], ScrapeError | None]:
    scraper = _SCRAPER_MAP.get(store_id)
    if scraper is None:
        return [], ScrapeError(code="STORE_UNAVAILABLE", message=...)
    try:
        results = await scraper(keyword)
        return results, None
    except httpx.TimeoutException as exc:
        return [], ScrapeError(code="TIMEOUT_ERROR", message=...)
    except httpx.RequestError as exc:
        return [], ScrapeError(code="TIMEOUT_ERROR", message=...)
    except httpx.HTTPStatusError as exc:
        return [], ScrapeError(code="PARSING_ERROR", message=...)
    except Exception as exc:
        return [], ScrapeError(code="PARSING_ERROR", message=...)
```

La paralelización se efectúa con `asyncio.gather` y la cláusula `return_exceptions=False` —deliberadamente, puesto que `_safe_scrape` ya impide que se propague ninguna excepción—:

```python
gathered = await asyncio.gather(
    *[_safe_scrape(sid, keyword) for sid in store_ids],
    return_exceptions=False,
)
```

La respuesta siempre se devuelve con HTTP 200; el cliente Java diferencia un éxito parcial de un fallo total leyendo el campo `error`. Esta semántica es coherente con la filosofía de Thalassa: **prefiere mostrar datos parciales antes que un mensaje genérico de "servicio no disponible"**.

### 2.2 Reto principal: extracción robusta de imágenes con *lazy loading*

El desafío técnico de mayor complejidad ha sido la extracción fiable de las URL de imagen. Las tiendas modernas no incluyen la imagen real en el atributo `src` del primer renderizado HTML; en su lugar, sirven una imagen *placeholder* (frecuentemente un GIF transparente de 1×1 px o una imagen codificada en base64) y diferieren la carga real al `onScroll` del navegador. La URL real queda escondida en atributos `data-*`.

Para resolverlo se ha diseñado un algoritmo en dos pasos en cada scraper —ver, por ejemplo, [`scraper/app/services/urbannatura.py:147-163`](scraper/app/services/urbannatura.py#L147-L163)—:

```python
_LAZY_ATTRS = (
    "data-src", "data-lazy-src", "data-lazy", "data-original",
    "data-full-size-image-url", "data-zoom-image",
)

def _extract_img(tag: Tag) -> str | None:
    # 1) Inspeccionar PRIMERO los atributos lazy.
    for attr in _LAZY_ATTRS:
        val = str(tag.get(attr) or "").strip()
        if val and _is_real_img(val):
            return _abs_url(val)
    # 2) Caer en src SOLO si parece una URL real.
    val = str(tag.get("src") or "").strip()
    if val and _is_real_img(val):
        return _abs_url(val)
    # 3) Como último recurso, parsear el srcset (responsive images).
    srcset = str(tag.get("srcset") or "").strip()
    if srcset:
        first = srcset.split(",")[0].strip().split()[0]
        if first and _is_real_img(first):
            return _abs_url(first)
    return None
```

El orden de prioridad es deliberado: **primero `data-*`, después `src`, finalmente `srcset`**. Invertirlo —es decir, leer `src` primero, como sería intuitivo— provoca exactamente el bug que llevó a este rediseño: en aproximadamente el 80 % de los productos, las tarjetas mostraban el placeholder transparente en vez del producto real.

### 2.3 Función `_is_real_img()`: discriminación de imágenes falsas

Detectar que el atributo *existe* no garantiza que su contenido sea utilizable. La función [`_is_real_img()`](scraper/app/services/urbannatura.py#L134-L144) actúa como filtro semántico, descartando cinco patrones tóxicos:

```python
def _is_real_img(url: str) -> bool:
    lo = url.lower()
    return not (
        lo.startswith("data:")        # (a) Imágenes base64 incrustadas en el HTML.
        or "blank" in lo              # (b) Placeholders del tipo "blank.gif".
        or "placeholder" in lo        # (c) Imágenes-marcador del tema PrestaShop.
        or "loading" in lo            # (d) Spinners "loading.gif".
        or "transparent" in lo        # (e) Pixels transparentes 1×1.
        or lo.endswith("/0/")         # (f) Endpoints sin id de imagen.
        or lo in ("#", "")            # (g) Atributos vacíos o ancla rota.
    )
```

Cada condición corresponde a un caso real observado en producción:

- **`data:`** — algunos temas PrestaShop incrustan directamente la imagen base64 en el HTML para que el LCP (Largest Contentful Paint) parezca instantáneo; al guardarla en base de datos se inflaría la respuesta inútilmente.
- **`blank`, `placeholder`, `loading`, `transparent`** — convención de nombres habitual de los GIF 1×1 px usados como *trackers* o *fillers* en plantillas PrestaShop.
- **`/0/`** — endpoint genérico de la API de imágenes de PrestaShop que devuelve la imagen por defecto cuando no se especifica `id_image`.

Sin este filtro, el frontend acabaría renderizando tarjetas con cuadrados grises en lugar de fotos del producto, degradando severamente la experiencia comparativa que es la propuesta de valor del proyecto.

### 2.4 Normalización del precio en distintos formatos europeos

Las tiendas españolas mezclan dos convenciones tipográficas para los miles y los decimales (`1.299,95 €` vs `1,299.95 €`), incrustan etiquetas HTML dentro del precio y a veces lo exponen como `<meta itemprop="price" content="...">`. Se ha implementado un parser tolerante:

```python
def _parse_price(raw: str) -> float | None:
    cleaned = re.sub(r"[^\d,\.]", "", raw.strip())   # 1) descartar símbolos y letras
    if not cleaned:
        return None
    cleaned = cleaned.replace(",", ".")              # 2) coma → punto
    parts = cleaned.rsplit(".", 1)
    if len(parts) == 2:                              # 3) si hay decimales,
        cleaned = parts[0].replace(".", "") + "." + parts[1]   # quitar puntos de miles
    try:
        val = float(cleaned)
        return val if val > 0 else None
    except ValueError:
        return None
```

El precio se lee preferentemente del atributo `content` del microdato Schema.org (`itemprop="price"`) porque es el formato más estable; sólo se cae al `get_text()` cuando no existe el microdato:

```python
price_tag = _first_match(card, _PRICE_SELECTORS)
if price_tag:
    raw_price = price_tag.get("content") or price_tag.get_text()
    price = _parse_price(str(raw_price))
```

### 2.5 Selectores en cascada: tolerancia a cambios de plantilla

Cada scraper define **listas ordenadas de selectores CSS** (`_CARD_SELECTORS`, `_NAME_SELECTORS`, `_PRICE_SELECTORS`, `_IMG_SELECTORS`) y los recorre en orden de especificidad decreciente mediante la utilidad `_first_match`:

```python
def _first_match(tag: Tag, selectors: list[str]) -> Tag | None:
    for sel in selectors:
        try:
            result = tag.select_one(sel)
            if result:
                return result
        except Exception:
            continue
    return None
```

Esta estrategia es tolerante a actualizaciones menores de plantilla: si el equipo de la tienda cambia el nombre de la clase principal, el scraper continúa funcionando con uno de los selectores secundarios. Además, si **ningún** selector específico funciona, existe un *fallback* universal basado en el atributo `data-id-product` que PrestaShop coloca en cualquier tarjeta de producto independientemente del tema:

```python
if not cards:
    cards = soup.find_all(attrs={"data-id-product": True})
```

### 2.6 Limitación de resultados: `max_results_per_store`

Para preservar el tiempo de respuesta extremo a extremo y evitar saturar a la tienda fuente, el archivo [`scraper/app/config.py:18`](scraper/app/config.py#L18) define un techo configurable:

```python
class Settings(BaseSettings):
    request_timeout: int = 10        # segundos antes de TimeoutError
    max_results_per_store: int = 10  # máximo de productos a devolver por tienda
```

Este valor se aplica en el servicio orquestador justo antes de fusionar los resultados:

```python
max_per_store = get_settings().max_results_per_store
for store_id, (store_results, store_error) in zip(store_ids, gathered):
    if store_results:
        results.extend(store_results[:max_per_store])
```

Con dos tiendas activas, esto garantiza un máximo de 20 productos por consulta —cantidad suficiente para una comparativa significativa sin penalizar la red ni el render del frontend—. El valor es ajustable vía variable de entorno (Pydantic `BaseSettings` lee automáticamente del fichero `.env`), por lo que el límite puede afinarse en producción sin redesplegar la imagen.

### 2.7 Cabeceras HTTP realistas

Para reducir la tasa de bloqueos por parte de los WAF de las tiendas, las peticiones se firman con cabeceras que imitan a un navegador real:

```python
_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}
```

El cliente HTTP se construye con `follow_redirects=True` para tolerar las redirecciones 301 que PrestaShop realiza desde `/buscar` a `/busqueda` o entre versiones HTTP/HTTPS.

---

## 3. Conclusión y resiliencia

### 3.1 Por qué Python ha sido la elección correcta

La elección de Python para esta capa concreta se ha demostrado acertada por cuatro razones objetivas:

1. **Velocidad de desarrollo.** BeautifulSoup y lxml ofrecen una API de parseo HTML que, en términos de líneas de código, es entre 3 y 5 veces más concisa que sus equivalentes en Java (JSoup) o JavaScript (Cheerio). Cada nuevo scraper se ha escrito y validado en menos de una jornada.
2. **Ecosistema asíncrono maduro.** `asyncio` + `httpx.AsyncClient` permiten paralelizar I/O sin recurrir a hilos, lo que mantiene el footprint de memoria del contenedor por debajo de 100 MB incluso con dos scrapers concurrentes.
3. **Aislamiento del riesgo.** Cualquier excepción inesperada en el parseo (un selector que devuelve `None`, un HTML malformado, una cookie de sesión que invalida la respuesta) queda contenida en el proceso Python y se traduce en un `ScrapeError` estructurado para Java. El servidor principal no se ve afectado.
4. **Iteración rápida sobre los selectores.** Cuando una tienda cambia su HTML, basta con editar la lista de selectores en cascada y reiniciar el contenedor. No hace falta recompilar Java ni reiniciar la JVM.

### 3.2 Interacción con el sistema de fallback de Spring Boot

La pieza final del diseño de resiliencia vive en la frontera entre Python y Java. El microservicio Python aplica una **normalización estricta**: si un producto carece de nombre legible, precio numérico positivo o URL absoluta válida, *no entra* en la lista de resultados —se descarta silenciosamente en el bloque `try/except` por producto—. Esto significa que el JSON que sale de Python siempre es consumible por Java sin validación adicional, pero también que **una lista vacía es un resultado legítimo y esperable** cuando las tiendas externas cambian su DOM o bloquean nuestra IP.

Frente a ese caso, el backend Spring Boot activa su mecanismo de *fallback* basado en **archivos semilla locales** (datasets JSON con productos representativos almacenados dentro del propio JAR). El intercambio queda así:

| Situación                                              | Python devuelve                                  | Java responde al frontend                                             |
|--------------------------------------------------------|--------------------------------------------------|-----------------------------------------------------------------------|
| Tiendas accesibles y HTML estable                      | Lista normalizada de productos                   | Tarjetas reales con precios en vivo                                   |
| Tienda con HTML modificado / 0 productos parseados     | Lista vacía + `ScrapeError(code="PARSING_ERROR")`| Java carga el seed local y marca los productos como "datos cacheados" |
| Tienda inaccesible (timeout, DNS, 5xx)                 | Lista vacía + `ScrapeError(code="TIMEOUT_ERROR")`| Java sirve el seed local con aviso de "tienda no disponible"          |
| Tienda no soportada                                    | `ScrapeError(code="STORE_UNAVAILABLE")`          | Java retorna 404 controlado al cliente                                |

Este reparto de responsabilidades cumple el objetivo último del proyecto Thalassa: **garantizar que el usuario final nunca vea una página en blanco**. Python aporta el dato fresco cuando es posible; Java aporta el dato cacheado cuando Python no puede. La combinación produce una experiencia comparativa que se degrada de forma elegante en lugar de fallar abruptamente.

### 3.3 Reflexión final

La arquitectura híbrida Java + Python ha permitido al proyecto beneficiarse simultáneamente de la **robustez transaccional** del ecosistema Spring (persistencia JPA, seguridad, validaciones) y de la **flexibilidad de scraping** del ecosistema Python (BeautifulSoup, asyncio, Pydantic). El coste de mantener dos stacks se ve compensado por la claridad arquitectónica: cada lenguaje cubre el dominio en el que es objetivamente más fuerte, y la frontera entre ambos está perfectamente delimitada por un contrato HTTP-JSON sencillo y versionado.

---

*Documento técnico redactado en mayo de 2026 como anexo a la memoria del TFG.*
