"""
Capa de servicio del scraper.

Fase 3: scrapers reales con HTTPX + BeautifulSoup.
  - tiendanimal.py → scrape_tiendanimal()
  - kiwoko.py      → scrape_kiwoko()
  - asyncio.gather lanza ambas peticiones en paralelo cuando store="all".
  - Un fallo en una tienda NO cancela los resultados de la otra.
"""

from __future__ import annotations

import asyncio
import logging

import httpx

from app.models.responses import ProductResult, ScrapeError, ScrapeResponse
from app.services.tiendanimal import scrape_tiendanimal
from app.services.kiwoko import scrape_kiwoko

logger = logging.getLogger(__name__)


async def _safe_scrape(store_id: str, keyword: str) -> tuple[list[ProductResult], ScrapeError | None]:
    """
    Ejecuta el scraper correspondiente y captura cualquier error,
    devolviendo siempre (resultados, error_o_None).
    Un error en esta función nunca se propaga hacia arriba.
    """
    scraper = scrape_tiendanimal if store_id == "tiendanimal" else scrape_kiwoko
    try:
        results = await scraper(keyword)
        return results, None

    except httpx.TimeoutException as exc:
        print(f"[{store_id}] TIMEOUT — {exc}")
        logger.warning("%s: timeout — %s", store_id, exc)
        return [], ScrapeError(
            code="TIMEOUT_ERROR",
            message=f"La tienda '{store_id}' no respondió a tiempo.",
        )

    except httpx.HTTPStatusError as exc:
        print(f"[{store_id}] HTTP {exc.response.status_code} — {exc}")
        logger.warning("%s: HTTP %s — %s", store_id, exc.response.status_code, exc)
        return [], ScrapeError(
            code="PARSING_ERROR",
            message=f"La tienda '{store_id}' devolvió el código HTTP {exc.response.status_code}.",
        )

    except Exception as exc:
        print(f"[{store_id}] ERROR inesperado — {exc}")
        logger.exception("%s: error inesperado — %s", store_id, exc)
        return [], ScrapeError(
            code="PARSING_ERROR",
            message=f"Error al obtener datos de '{store_id}': {exc}",
        )


async def search_products(keyword: str, store: str = "all") -> ScrapeResponse:
    """
    Busca productos por keyword en la(s) tienda(s) indicada(s).

    - store="all"         → peticiones en paralelo a Tiendanimal + Kiwoko.
    - store="tiendanimal" → solo Tiendanimal.
    - store="kiwoko"      → solo Kiwoko.

    Siempre devuelve HTTP 200. Si una tienda falla, se incluye su error
    en el campo `errors` pero los resultados de la otra tienda se devuelven
    igualmente en `results`.
    """
    if store not in ("all", "tiendanimal", "kiwoko"):
        return ScrapeResponse(
            keyword=keyword,
            store=store,
            results=[],
            total=0,
            error=ScrapeError(
                code="STORE_UNAVAILABLE",
                message=f"La tienda '{store}' no está soportada actualmente.",
            ),
        )

    # Construir corutinas según la tienda solicitada
    store_ids: list[str] = []
    if store in ("tiendanimal", "all"):
        store_ids.append("tiendanimal")
    if store in ("kiwoko", "all"):
        store_ids.append("kiwoko")

    # _safe_scrape nunca lanza: return_exceptions no es necesario, pero
    # lo añadimos como red de seguridad extra.
    gathered: list[tuple[list[ProductResult], ScrapeError | None]] = await asyncio.gather(
        *[_safe_scrape(sid, keyword) for sid in store_ids],
        return_exceptions=False,
    )

    results: list[ProductResult] = []
    # Guardamos solo el primer error para el campo `error` del modelo,
    # pero siempre acumulamos TODOS los resultados exitosos.
    first_error: ScrapeError | None = None

    for store_id, (store_results, store_error) in zip(store_ids, gathered):
        if store_results:
            results.extend(store_results)
        if store_error:
            print(f"[service] {store_id} reportó error: {store_error.code} — {store_error.message}")
            if first_error is None:
                first_error = store_error

    return ScrapeResponse(
        keyword=keyword,
        store=store,
        results=results,
        total=len(results),
        # error=None si todos los scrapers funcionaron, aunque results esté vacío.
        # error=ScrapeError solo si TODAS las tiendas fallaron o ninguna devolvió productos.
        error=first_error if not results else None,
    )
