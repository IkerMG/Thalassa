"""
Scraper para Kiwoko (kiwoko.com).

Plataforma: Salesforce Commerce Cloud (misma base que Tiendanimal).

Selectores confirmados por ingeniería inversa del DOM real:
  - Contenedor:  div.isk-product-card
  - Nombre:      atributo data-product-name del div contenedor
  - Precio:      div.isk-product-card__price  →  atributo data-min-price (float)
  - URL:         atributo data-url del div contenedor
  - Imagen:      img.isk-product-card__image  →  atributo src
"""

from __future__ import annotations

import logging
from urllib.parse import quote

import httpx
from bs4 import BeautifulSoup

from app.models.responses import ProductResult

logger = logging.getLogger(__name__)

_BASE_URL = "https://www.kiwoko.com"
_SEARCH_PATH = "/busqueda"
_TIMEOUT = 15.0

# Sin 'br': evita respuestas Brotli que httpx no descomprime sin el paquete extra
_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
}


async def scrape_kiwoko(keyword: str) -> list[ProductResult]:
    """
    Realiza la búsqueda en Kiwoko y devuelve una lista de ProductResult.
    Lanza excepciones para que scraper_service las capture.
    """
    url = f"{_BASE_URL}{_SEARCH_PATH}?q={quote(keyword)}&lang=default"
    print(f"[kiwoko] GET {url}")

    async with httpx.AsyncClient(timeout=_TIMEOUT, follow_redirects=True) as client:
        response = await client.get(url, headers=_HEADERS)
        print(f"[kiwoko] status_code={response.status_code}")
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "lxml")
    cards = soup.select("div.isk-product-card")

    if not cards:
        logger.warning("Kiwoko: 0 productos encontrados para '%s'", keyword)
        return []

    results: list[ProductResult] = []

    for card in cards:
        try:
            # Nombre — atributo data-product-name limpio, sin markup
            name = card.get("data-product-name", "").strip()
            if not name:
                continue

            # Precio — data-min-price ya es un float serializado ("59.99")
            price_div = card.select_one("div.isk-product-card__price")
            raw_price = price_div.get("data-min-price") if price_div else None
            if not raw_price:
                continue
            try:
                price = float(raw_price)
            except ValueError:
                continue

            # URL del producto — absoluta directamente en data-url
            product_url = card.get("data-url", "").strip()
            if not product_url:
                continue

            # Imagen — src ya es absoluta
            img_tag = card.select_one("img.isk-product-card__image")
            image_url = img_tag.get("src") if img_tag else None

            results.append(
                ProductResult(
                    name=name,
                    price=price,
                    currency="EUR",
                    image_url=image_url,  # type: ignore[arg-type]
                    product_url=product_url,  # type: ignore[arg-type]
                    store="kiwoko",
                )
            )
        except Exception as exc:
            logger.debug("Kiwoko: error parseando un producto — %s", exc)
            continue

    print(f"[kiwoko] {len(results)} productos parseados")
    logger.info("Kiwoko: %d productos encontrados para '%s'", len(results), keyword)
    return results
