"""
Capa de servicio del scraper.

Fase 2: datos mockeados.
Fase 3: sustituir _mock_tiendanimal / _mock_kiwoko por scrapers reales con HTTPX + BS4.
"""

from app.models.responses import ProductResult, ScrapeError, ScrapeResponse

# ── Fixtures ──────────────────────────────────────────────────────────────────

_MOCK_TIENDANIMAL = [
    ProductResult(
        name="Tunze Comline DOC Skimmer 9004",
        price=89.99,
        currency="EUR",
        image_url="https://www.tiendanimal.es/img/tunze-9004.jpg",  # type: ignore[arg-type]
        product_url="https://www.tiendanimal.es/tunze-comline-doc-skimmer-9004",  # type: ignore[arg-type]
        store="tiendanimal",
    ),
    ProductResult(
        name="Tunze Comline DOC Skimmer 9004.040",
        price=112.50,
        currency="EUR",
        image_url="https://www.tiendanimal.es/img/tunze-9004-040.jpg",  # type: ignore[arg-type]
        product_url="https://www.tiendanimal.es/tunze-comline-doc-skimmer-9004-040",  # type: ignore[arg-type]
        store="tiendanimal",
    ),
]

_MOCK_KIWOKO = [
    ProductResult(
        name="Tunze 9004 Skimmer Interno",
        price=94.95,
        currency="EUR",
        image_url="https://www.kiwoko.com/img/tunze-9004.jpg",  # type: ignore[arg-type]
        product_url="https://www.kiwoko.com/tunze-9004-skimmer-interno",  # type: ignore[arg-type]
        store="kiwoko",
    ),
    ProductResult(
        name="Tunze DOC Skimmer 9004 - Edición especial",
        price=99.00,
        currency="EUR",
        image_url="https://www.kiwoko.com/img/tunze-9004-especial.jpg",  # type: ignore[arg-type]
        product_url="https://www.kiwoko.com/tunze-doc-skimmer-9004-especial",  # type: ignore[arg-type]
        store="kiwoko",
    ),
]

# ── Servicio ──────────────────────────────────────────────────────────────────


async def search_products(keyword: str, store: str = "all") -> ScrapeResponse:
    """
    Busca productos por keyword en la(s) tienda(s) indicada(s).

    Fase 2: devuelve datos estáticos (mock).
    Fase 3: sustituir el cuerpo de _fetch_* por scrapers reales.
    """
    results: list[ProductResult] = []

    if store in ("tiendanimal", "all"):
        results.extend(_MOCK_TIENDANIMAL)

    if store in ("kiwoko", "all"):
        results.extend(_MOCK_KIWOKO)

    # Si la tienda solicitada no existe en el registro anterior
    if not results and store not in ("all", "tiendanimal", "kiwoko"):
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

    return ScrapeResponse(
        keyword=keyword,
        store=store,
        results=results,
        total=len(results),
        error=None,
    )
