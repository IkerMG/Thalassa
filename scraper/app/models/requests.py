from typing import Any, Literal, Optional

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


class ChatRequest(BaseModel):
    """Mensaje enviado al asistente IA Thalassa."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Pregunta o mensaje del usuario.",
        examples=["My calcium is at 350 ppm, how do I raise it safely?"],
    )
    aquarium_context: Optional[dict[str, Any]] = Field(
        default=None,
        description=(
            "Contexto opcional del acuario activo (parámetros actuales, fauna, "
            "volumen…). Permite respuestas personalizadas."
        ),
    )
