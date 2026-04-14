from fastapi import FastAPI

from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Microservicio de scraping de precios para productos de acuariofilia.",
    docs_url="/docs",
    redoc_url="/redoc",
)


@app.get("/ping", tags=["Health"])
async def ping() -> dict:
    """Health check — verifica que el servicio está activo."""
    return {"status": "ok", "service": settings.app_name}
