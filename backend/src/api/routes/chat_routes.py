"""
src/api/routes/chat_routes.py — Chat endpoint with SSE streaming.
=================================================================
Accepts POST /api/chat/ with JWT authentication.
Returns a Server-Sent Events stream from the LangGraph multi-agent pipeline.
"""
from fastapi import APIRouter, Depends, HTTPException, status
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


@router.post("/", summary="Send a chat message (SSE stream)")
async def chat(
    request: QueryRequest,
    current_user=Depends(get_current_user),
):
    """
    POST /api/chat/

    Accepts a user query and returns a Server-Sent Events stream.
    The LangGraph pipeline runs 5 agents:
      Research → Retrieval (MMR) → Citation → Summary → Report

    SSE events:
      {"node": "<name>", "status": "running|completed"}
      {"type": "citations", "data": [...]}
      {"type": "token", "data": "<text>"}
      {"done": true, "sources": [...]}
      {"error": "<message>"}
    """
    user_id = str(current_user["_id"])
    db = get_database()

    # ── Input sanitization and injection guard ────────────────────────────────
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

    # ── Persist user message BEFORE streaming ─────────────────────────────────
    if request.conversation_id:
        try:
            await insert_message(
                conversation_id=request.conversation_id,
                user_id=user_id,
                role="user",
                content=query,
            )
        except Exception as e:
            logger.warning(f"Failed to save user message: {e}")

    # ── Return SSE stream ─────────────────────────────────────────────────────
    return StreamingResponse(
        stream_chat_response(
            query=query,
            user_id=user_id,
            conversation_id=request.conversation_id,
            messages_collection=db[COLLECTION_MESSAGES],
            conversations_collection=db[COLLECTION_CONVERSATIONS],
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Transfer-Encoding": "chunked",
        },
    )
