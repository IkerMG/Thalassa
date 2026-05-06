"""
Scraper para Urban Natura (urbannatura.com) — tienda de acuariofilia y mascotas.

Plataforma: PrestaShop 1.7
URL de búsqueda: /es/buscar?controller=search&search_query={keyword}
"""

from __future__ import annotations

import logging
import re
from urllib.parse import quote

import httpx
from bs4 import BeautifulSoup, Tag

from app.models.responses import ProductResult

logger = logging.getLogger(__name__)

_BASE_URL = "https://www.urbannatura.com"
_SEARCH_URL = "/es/buscar?controller=search&search_query={kw}"
_TIMEOUT = 15.0

_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}

_CARD_SELECTORS = [
    "article.product-miniature",
    "article[data-id-product]",
    ".js-product-miniature",
    "div.product-miniature",
    "li.ajax_block_product",
    ".product-container",
    "li.product_item",
    ".product-item",
    "div[class*='product-miniature']",
    "li[class*='product-miniature']",
    ".products-grid .item",
    ".products-list .item",
    "[class*='product'][data-id-product]",
]

_NAME_SELECTORS = [
    ".product-title a",
    "h1.product-title a",
    "h2.product-title a",
    "h3.product-title a",
    "h2.h3.product-title a",
    ".h3.product-title a",
    ".product_name a",
    ".product-name a",
    "a.product-thumbnail",
    "a.product_img_link",
    ".s_title_block a",
    ".product-title",
    "h3 a",
    "h2 a",
    ".product a[href]",
]

_PRICE_SELECTORS = [
    ".product-price-and-shipping .price",
    ".product-price-and-shipping span.price",
    "span[itemprop='price']",
    ".current-price span.price",
    ".current-price .price",
    "span.current-price",
    ".price span",
    "span.price",
    ".product-price",
    ".price",
    ".regular-price",
    "[itemprop='price']",
    "meta[itemprop='price']",
]

_IMG_SELECTORS = [
    ".product-thumbnail img",
    ".img-product img",
    ".product-cover img",
    ".product_desc img",
    ".product-image-container img",
    ".product-image img",
    "img.img-thumbnail",
    "img.img-responsive",
    "img[loading='lazy']",
    "img[data-src]",
    "img",
]


def _parse_price(raw: str) -> float | None:
    cleaned = re.sub(r"[^\d,\.]", "", raw.strip())
    if not cleaned:
        return None
    cleaned = cleaned.replace(",", ".")
    parts = cleaned.rsplit(".", 1)
    if len(parts) == 2:
        cleaned = parts[0].replace(".", "") + "." + parts[1]
    try:
        val = float(cleaned)
        return val if val > 0 else None
    except ValueError:
        return None


def _abs_url(href: str | None) -> str | None:
    if not href:
        return None
    href = href.strip()
    if href.startswith("http"):
        return href
    if href.startswith("//"):
        return "https:" + href
    if href.startswith("/"):
        return _BASE_URL + href
    return None


def _extract_img(tag: Tag) -> str | None:
    for attr in ("src", "data-src", "data-lazy-src", "data-original", "data-full-size-image-url"):
        val = tag.get(attr, "")
        if val and not val.endswith(("placeholder", "blank.gif", "loading.gif")):
            return _abs_url(val)
    srcset = tag.get("srcset", "")
    if srcset:
        first = srcset.split(",")[0].strip().split(" ")[0]
        return _abs_url(first)
    return None


def _first_match(tag: Tag, selectors: list[str]) -> Tag | None:
    for sel in selectors:
        try:
            result = tag.select_one(sel)
            if result:
                return result
        except Exception:
            continue
    return None


async def scrape_urbannatura(keyword: str) -> list[ProductResult]:
    kw_encoded = quote(keyword)
    url = _BASE_URL + _SEARCH_URL.format(kw=kw_encoded)
    print(f"[urbannatura] GET {url}")

    async with httpx.AsyncClient(timeout=_TIMEOUT, follow_redirects=True) as client:
        try:
            resp = await client.get(url, headers=_HEADERS)
            print(f"[urbannatura] status={resp.status_code} len={len(resp.text)}")
            resp.raise_for_status()
            html = resp.text
        except httpx.HTTPStatusError as exc:
            logger.warning("urbannatura: HTTP %s — %s", exc.response.status_code, exc)
            return []
        except httpx.RequestError as exc:
            logger.warning("urbannatura: connection error — %s", exc)
            raise

    soup = BeautifulSoup(html, "lxml")

    # Remove script/style noise
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    cards: list[Tag] = []
    matched_sel = ""
    for sel in _CARD_SELECTORS:
        try:
            found = soup.select(sel)
            if found:
                cards = found
                matched_sel = sel
                logger.debug("urbannatura: selector '%s' → %d cards", sel, len(found))
                break
        except Exception:
            continue

    if not cards:
        # Last-resort: any element with a data-id-product attribute
        cards = soup.find_all(attrs={"data-id-product": True})
        if cards:
            matched_sel = "[data-id-product]"
            logger.debug("urbannatura: fallback data-id-product → %d cards", len(cards))

    if not cards:
        logger.warning("urbannatura: 0 tarjetas encontradas para '%s'. HTML snippet: %s",
                       keyword, html[:500])
        return []

    print(f"[urbannatura] {len(cards)} tarjetas con selector '{matched_sel}'")

    results: list[ProductResult] = []
    for card in cards:
        try:
            # ── Name ─────────────────────────────────────────────────────────
            name_tag = _first_match(card, _NAME_SELECTORS)
            if not name_tag:
                for a in card.find_all("a", href=True):
                    text = a.get_text(strip=True)
                    if len(text) > 4:
                        name_tag = a
                        break
            if not name_tag:
                continue
            name = name_tag.get_text(strip=True)
            if not name or len(name) < 3:
                continue

            # ── Product URL ───────────────────────────────────────────────────
            product_url: str | None = None
            link_tag = card.find("a", href=True)
            if link_tag:
                product_url = _abs_url(link_tag["href"])
            if not product_url:
                product_url = _abs_url(name_tag.get("href", ""))
            if not product_url:
                continue

            # ── Price ─────────────────────────────────────────────────────────
            price: float | None = None
            price_tag = _first_match(card, _PRICE_SELECTORS)
            if price_tag:
                raw_price = price_tag.get("content") or price_tag.get_text()
                price = _parse_price(str(raw_price))
            if price is None:
                continue

            # ── Image ─────────────────────────────────────────────────────────
            image_url: str | None = None
            img_tag = card.find("img")
            if img_tag:
                image_url = _extract_img(img_tag)
            if not image_url:
                img_tag2 = _first_match(card, _IMG_SELECTORS)
                if img_tag2:
                    image_url = _extract_img(img_tag2)

            results.append(
                ProductResult(
                    name=name,
                    price=price,
                    currency="EUR",
                    image_url=image_url,  # type: ignore[arg-type]
                    product_url=product_url,  # type: ignore[arg-type]
                    store="Urban Natura",
                )
            )
        except Exception as exc:
            logger.debug("urbannatura: error parseando producto — %s", exc)
            continue

    print(f"[urbannatura] {len(results)} productos parseados")
    logger.info("urbannatura: %d productos para '%s'", len(results), keyword)
    return results
