"""
Capa de servicio del scraper.

Tiendas activas:
  - urbannatura.py  → scrape_urbannatura()  (Urban Natura)
  - cetamar.py      → scrape_cetamar()      (Cetamar)

asyncio.gather lanza ambas peticiones en paralelo cuando store="all".
Un fallo en una tienda NO cancela los resultados de la otra.
"""

from __future__ import annotations

import asyncio
import logging

import httpx

from app.models.responses import ProductResult, ScrapeError, ScrapeResponse
from app.services.urbannatura import scrape_urbannatura
from app.services.cetamar import scrape_cetamar

logger = logging.getLogger(__name__)

_SCRAPER_MAP = {
    "urbannatura": scrape_urbannatura,
    "cetamar":     scrape_cetamar,
}

# Stores included in "all"
_DEFAULT_STORES = ["urbannatura", "cetamar"]


async def _safe_scrape(store_id: str, keyword: str) -> tuple[list[ProductResult], ScrapeError | None]:
    """
    Ejecuta el scraper correspondiente y captura cualquier error,
    devolviendo siempre (resultados, error_o_None).
    """
    scraper = _SCRAPER_MAP.get(store_id)
    if scraper is None:
        return [], ScrapeError(
            code="STORE_UNAVAILABLE",
            message=f"La tienda '{store_id}' no está soportada actualmente.",
        )
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

    except httpx.RequestError as exc:
        print(f"[{store_id}] CONNECTION ERROR — {exc}")
        logger.warning("%s: connection error (DNS/network) — %s", store_id, exc)
        return [], ScrapeError(
            code="TIMEOUT_ERROR",
            message=f"No se pudo conectar con '{store_id}': {exc}",
        )

    except httpx.HTTPStatusError as exc:
        print(f"[{store_id}] HTTP {exc.response.status_code} — {exc}")
        logger.warning("%s: HTTP %s — %s", store_id, exc.response.status_code, exc)
        return [], ScrapeError(
            code="PARSING_ERROR",
            message=f"La tienda '{store_id}' devolvió HTTP {exc.response.status_code}.",
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

    - store="all"          → peticiones en paralelo a Urban Natura + Cetamar.
    - store="urbannatura"  → solo Urban Natura.
    - store="cetamar"      → solo Cetamar.

    Siempre devuelve HTTP 200. Si una tienda falla se incluye su error en `error`
    pero los resultados de la otra tienda se devuelven igualmente.
    """
    if store == "all":
        store_ids = list(_DEFAULT_STORES)
    elif store in _SCRAPER_MAP:
        store_ids = [store]
    else:
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

    gathered: list[tuple[list[ProductResult], ScrapeError | None]] = await asyncio.gather(
        *[_safe_scrape(sid, keyword) for sid in store_ids],
        return_exceptions=False,
    )

    results: list[ProductResult] = []
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
        error=first_error if not results else None,
    )
