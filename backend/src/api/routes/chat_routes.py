"""
src/api/routes/chat_routes.py — Chat endpoint with SSE streaming
=================================================================
Accepts POST /api/chat/ with JWT authentication.
Returns a Server-Sent Events stream.

Supports two modes:
  - "quick": Direct LLM call (no LangGraph) for maximum speed
  - "agent": Full LangGraph multi-agent pipeline

Supports multiple model providers (anthropic, google, groq, mistral, etc.)
and multiple workflow types (research, coding, data_analysis, etc.)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from src.core.security import get_current_user
from src.schemas.chat import QueryRequest
from src.database.mongodb.connection import get_database
from src.database.mongodb.repositories.chat_repository import insert_message
from src.services.chat_service import stream_chat_response
from src.core.constants import COLLECTION_MESSAGES, COLLECTION_CONVERSATIONS
from src.middleware.prompt_injection_guard import scan_text, sanitize
from src.core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.post("", summary="Send a chat message (SSE stream)")
async def chat(
    request: QueryRequest,
    http_request: Request,
    current_user=Depends(get_current_user),
):
    """
    POST /api/chat/

    Accepts a user query and returns a Server-Sent Events stream.

    Query parameters:
      - msg: The user's message
      - conversation_id: Optional conversation ID for context
      - mode: "quick" (direct LLM) or "agent" (LangGraph pipeline) — default "agent"
      - workflow_type: "research" | "summary" | "technical" | "competitive" |
                       "coding" | "data_analysis" — default "research"
      - model_provider: "anthropic" | "google" | "groq" | "mistral" — optional, uses DEFAULT_LLM_PROVIDER
      - model_name: Specific model override — optional, uses provider default

    SSE events:
      {"node": "<name>", "status": "running|completed"}
      {"type": "citations", "data": [...]}
      {"type": "token", "data": "<text>"}
      {"done": true, "sources": [...]}
      {"error": "<message>"}
    """
    user_id = str(current_user["_id"])
    db = get_database()

    query = sanitize(request.msg)
    if scan_text(query):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Potentially harmful input detected.",
        )

    if not query.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Query cannot be empty.",
        )

    if request.conversation_id:
        try:
            await insert_message(
                conversation_id=request.conversation_id,
                user_id=user_id,
                role="user",
                content=query,
                attached_file={"name": request.filename} if request.filename else None,
            )
        except Exception as e:
            logger.warning(f"Failed to save user message: {e}")

    logger.info(
        f"[Chat] mode={request.mode}, workflow={request.workflow_type}, "
        f"provider={request.model_provider or 'default'}, "
        f"model={request.model_name or 'default'}, "
        f"query='{query[:60]}'"
    )

    return StreamingResponse(
        stream_chat_response(
            query=query,
            user_id=user_id,
            conversation_id=request.conversation_id,
            messages_collection=db[COLLECTION_MESSAGES],
            conversations_collection=db[COLLECTION_CONVERSATIONS],
            mode=request.mode,
            workflow_type=request.workflow_type,
            model_provider=request.model_provider,
            model_name=request.model_name,
            http_request=http_request,
            filename=request.filename,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Transfer-Encoding": "chunked",
        },
    )
