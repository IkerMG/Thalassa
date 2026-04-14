from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl


class ProductResult(BaseModel):
    """Representa un producto encontrado en una tienda."""

    name: str = Field(..., description="Nombre completo del producto.")
    price: float = Field(..., ge=0, description="Precio en la moneda indicada.")
    currency: str = Field(default="EUR", description="Código ISO 4217 de la moneda.")
    image_url: Optional[HttpUrl] = Field(default=None, description="URL de la imagen principal del producto.")
    product_url: HttpUrl = Field(..., description="URL directa a la ficha del producto.")
    store: str = Field(..., description="Identificador de la tienda origen.")
    scraped_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp UTC en el que se obtuvo el dato.",
    )


class ScrapeError(BaseModel):
    """Detalle de un error producido durante el scraping."""

    code: str = Field(
        ...,
        description="Código de error: TIMEOUT_ERROR | PARSING_ERROR | STORE_UNAVAILABLE",
    )
    message: str = Field(..., description="Descripción legible del error.")


class ScrapeResponse(BaseModel):
    """Respuesta completa de una búsqueda de precios."""

    keyword: str = Field(..., description="Keyword de búsqueda recibida.")
    store: str = Field(..., description="Tienda(s) consultada(s).")
    results: list[ProductResult] = Field(default_factory=list)
    total: int = Field(..., ge=0, description="Número de resultados devueltos.")
    error: Optional[ScrapeError] = Field(default=None)
