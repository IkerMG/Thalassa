# Market Seed Cache

Static product data used as fallback when the Python scraper microservice is unavailable.

## Purpose

`ScraperService.loadFromSeedCache()` reads these files when the scraper returns an error or empty results. Responses are tagged with `fromCache: true` so the frontend can display a "Demo data" badge.

## Files

| File | Store | Products |
|------|-------|----------|
| `aquashop.json` | AquaShop.es | 15 |
| `icaacuarios.json` | ICA Acuarios | 15 |

## Schema

Each product must match the `ScraperProductResult` DTO (snake_case keys):

```json
{
  "name": "string",
  "price": 0.00,
  "product_url": "https://...",
  "img_url": "https://...",
  "store_name": "string"
}
```

## Updating

Capture real product pages manually, paste ~15 entries per store, and rebuild the backend. URLs must be absolute (`https://`).
