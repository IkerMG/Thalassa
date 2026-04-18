"""
Cliente Groq para el asistente IA de Thalassa.

Usa el SDK oficial groq con AsyncGroq para integración nativa async con FastAPI.
Modelo: llama-3.3-70b-versatile.
"""

import logging

from groq import AsyncGroq, APIStatusError, APIConnectionError

from app.config import get_settings
from app.models.responses import ChatError, ChatResponse
from app.services.prompts import SYSTEM_PROMPT, build_user_prompt

logger = logging.getLogger(__name__)

_client: AsyncGroq | None = None


def _get_client() -> AsyncGroq:
    global _client
    if _client is None:
        settings = get_settings()
        if not settings.groq_api_key or settings.groq_api_key == "tu_api_key_aqui":
            raise ValueError("GROQ_API_KEY no está configurada")
        _client = AsyncGroq(api_key=settings.groq_api_key)
        logger.info("Cliente Groq inicializado (modelo: %s).", settings.groq_model)
    return _client


async def get_reply(
    message: str,
    aquarium_context: dict | None = None,
) -> ChatResponse:
    """
    Envía el mensaje al modelo Groq y devuelve la respuesta del asistente.

    Args:
        message: Pregunta o texto del usuario.
        aquarium_context: Contexto opcional del acuario (nombre, litros, fauna…).

    Returns:
        ChatResponse con `reply` en éxito o `error` en caso de fallo.
    """
    try:
        client = _get_client()
    except ValueError:
        logger.warning("Groq no disponible: API key ausente o placeholder.")
        return ChatResponse(
            reply="",
            error=ChatError(
                code="GROQ_UNAVAILABLE",
                message="El servicio de IA no está configurado. Contacta al administrador.",
            ),
        )

    settings = get_settings()
    prompt = build_user_prompt(message, aquarium_context)

    try:
        completion = await client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=1024,
        )
        reply_text = completion.choices[0].message.content or ""
        return ChatResponse(reply=reply_text)

    except APIStatusError as exc:
        if exc.status_code == 400:
            logger.warning("Solicitud bloqueada por Groq: %s", exc)
            return ChatResponse(
                reply="",
                error=ChatError(
                    code="INVALID_REQUEST",
                    message="El mensaje fue bloqueado por las políticas de seguridad del modelo.",
                ),
            )
        logger.error("Error de API Groq (%s): %s", exc.status_code, exc, exc_info=True)
        return ChatResponse(
            reply="",
            error=ChatError(
                code="GROQ_ERROR",
                message="No se pudo obtener respuesta del asistente. Inténtalo de nuevo.",
            ),
        )
    except APIConnectionError as exc:
        logger.error("Error de conexión con Groq: %s", exc, exc_info=True)
        return ChatResponse(
            reply="",
            error=ChatError(
                code="GROQ_ERROR",
                message="No se pudo conectar con el servicio de IA. Inténtalo de nuevo.",
            ),
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("Error inesperado al llamar a Groq: %s", exc, exc_info=True)
        return ChatResponse(
            reply="",
            error=ChatError(
                code="GROQ_ERROR",
                message="No se pudo obtener respuesta del asistente. Inténtalo de nuevo.",
            ),
        )
