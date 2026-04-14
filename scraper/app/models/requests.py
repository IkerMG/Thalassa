from typing import Literal

from pydantic import BaseModel, Field

# Tiendas soportadas — ampliar aquí cuando se añada un nuevo scraper
StoreId = Literal["tiendanimal", "kiwoko", "all"]


class ScrapeRequest(BaseModel):
    """Parámetros de entrada para una búsqueda de precios."""

    keyword: str = Field(
        ...,
        min_length=2,
        max_length=150,
        description="Término de búsqueda (nombre del producto o referencia).",
        examples=["Skimmer Tunze 9004"],
    )
    store: StoreId = Field(
        default="all",
        description="Tienda en la que buscar. 'all' busca en todas las tiendas soportadas.",
    )
