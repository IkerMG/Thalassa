from typing import Annotated

from fastapi import APIRouter, Query

from app.models.requests import StoreId
from app.models.responses import ScrapeResponse
from app.services.scraper_service import search_products

router = APIRouter(prefix="/scrape", tags=["Scraper"])


@router.get(
    "",
    response_model=ScrapeResponse,
    summary="Buscar precio de un producto",
    description=(
        "Recibe una keyword y una tienda opcional. "
        "Devuelve una lista de productos con nombre, precio, imagen y enlace."
    ),
)
async def scrape(
    keyword: Annotated[
        str,
        Query(min_length=2, max_length=150, description="Término de búsqueda.", example="Skimmer Tunze 9004"),
    ],
    store: Annotated[
        StoreId,
        Query(description="Tienda a consultar. Por defecto busca en todas."),
    ] = "all",
) -> ScrapeResponse:
    return await search_products(keyword=keyword, store=store)
