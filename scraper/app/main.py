from fastapi import FastAPI

from app.config import get_settings
from app.routers import chat_router, scraper_router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Microservicio de scraping de precios y chatbot IA para Thalassa.",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.include_router(scraper_router.router)
app.include_router(chat_router.router)


@app.get("/ping", tags=["Health"])
async def ping() -> dict:
    """Health check — verifica que el servicio está activo."""
    return {"status": "ok", "service": settings.app_name}
