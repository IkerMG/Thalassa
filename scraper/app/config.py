from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Aplicación ────────────────────────────────────────────────────────────
    app_name: str = "thalassa-scraper"
    app_version: str = "1.0.0"
    debug: bool = False

    # ── Servidor ──────────────────────────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8001

    # ── HTTP Client ───────────────────────────────────────────────────────────
    request_timeout: int = 10       # segundos antes de TimeoutError
    max_results_per_store: int = 5  # máximo de productos a devolver por tienda

    # ── Tiendas (URLs base) ───────────────────────────────────────────────────
    tiendanimal_base_url: str = "https://www.tiendanimal.es"
    kiwoko_base_url: str = "https://www.kiwoko.com"

    # ── Groq ──────────────────────────────────────────────────────────────────
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    """Devuelve la instancia de Settings cacheada (singleton)."""
    return Settings()
