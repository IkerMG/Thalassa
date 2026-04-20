"""
Router del chatbot IA de Thalassa.

Expone POST /chat/message — recibe el mensaje del usuario y el contexto
opcional del acuario, delega en el cliente Groq y devuelve la respuesta.
"""

from fastapi import APIRouter

from app.models.requests import ChatRequest
from app.models.responses import ChatResponse
from app.services.groq_client import get_reply

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post(
    "/message",
    response_model=ChatResponse,
    summary="Enviar mensaje al asistente IA",
    description=(
        "Recibe el mensaje del usuario y un contexto opcional del acuario. "
        "Devuelve la respuesta generada por Thalassa AI (Groq / Llama 3.3). "
        "Si el servicio no está disponible o el prompt es inválido, "
        "el campo `error` del response contendrá el código y mensaje de error."
    ),
)
async def chat_message(body: ChatRequest) -> ChatResponse:
    """Proxy entre el backend Java y la API de Groq."""
    return await get_reply(
        message=body.message,
        aquarium_context=body.aquarium_context,
    )
