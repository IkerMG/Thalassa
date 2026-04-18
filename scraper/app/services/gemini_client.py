"""
Cliente Gemini para el asistente IA de Thalassa.

Inicializa el modelo con el system prompt de experto en acuariofilia
y expone una función async para obtener respuestas del chatbot.
"""

import logging

import google.generativeai as genai

from app.config import get_settings
from app.models.responses import ChatError, ChatResponse
from app.services.prompts import SYSTEM_PROMPT, build_user_prompt

logger = logging.getLogger(__name__)

_model: genai.GenerativeModel | None = None


def _get_model() -> genai.GenerativeModel:
    """
    Inicializa (lazy) y devuelve el modelo Gemini configurado con el
    system prompt de Thalassa AI.
    """
    global _model
    if _model is None:
        settings = get_settings()
        if not settings.gemini_api_key or settings.gemini_api_key == "tu_api_key_aqui":
            raise ValueError("GEMINI_API_KEY no está configurada")
        genai.configure(api_key=settings.gemini_api_key)
        _model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            system_instruction=SYSTEM_PROMPT,
        )
        logger.info("Modelo Gemini '%s' inicializado.", settings.gemini_model)
    return _model


async def get_reply(
    message: str,
    aquarium_context: dict | None = None,
) -> ChatResponse:
    """
    Envía el mensaje al modelo Gemini y devuelve la respuesta del asistente.

    Args:
        message: Pregunta o texto del usuario.
        aquarium_context: Contexto opcional del acuario (nombre, litros, fauna…).

    Returns:
        ChatResponse con `reply` en éxito o `error` en caso de fallo.
    """
    try:
        model = _get_model()
    except ValueError:
        logger.warning("Gemini no disponible: API key ausente o placeholder.")
        return ChatResponse(
            reply="",
            error=ChatError(
                code="GEMINI_UNAVAILABLE",
                message="El servicio de IA no está configurado. Contacta al administrador.",
            ),
        )

    prompt = build_user_prompt(message, aquarium_context)

    try:
        response = await model.generate_content_async(prompt)
        return ChatResponse(reply=response.text)

    except genai.types.BlockedPromptException as exc:
        logger.warning("Prompt bloqueado por Gemini: %s", exc)
        return ChatResponse(
            reply="",
            error=ChatError(
                code="INVALID_REQUEST",
                message="El mensaje fue bloqueado por las políticas de seguridad del modelo.",
            ),
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("Error al llamar a la API de Gemini: %s", exc, exc_info=True)
        return ChatResponse(
            reply="",
            error=ChatError(
                code="GEMINI_ERROR",
                message="No se pudo obtener respuesta del asistente. Inténtalo de nuevo.",
            ),
        )
