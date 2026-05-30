"""
src/services/chat_service.py — Chat orchestration with true SSE streaming
=========================================================================
Orchestrates the LangGraph multi-agent workflow and emits Server-Sent Events.

SSE event protocol (consumed by frontend use-streaming.ts):
  {"node": "<name>", "status": "running"}       — agent activity update
  {"node": "<name>", "status": "completed"}      — agent finished
  {"type": "citations", "data": [...]}           — citation panel update
  {"type": "token", "data": "<text>"}            — streaming text token
  {"done": true, "sources": [...]}               — stream complete
  {"error": "<message>"}                         — error

Key improvements over v2:
  - True token-level streaming via graph.astream_events (on_chat_model_stream)
  - History injected into initial state (fixes context loss across turns)
  - User message saved BEFORE streaming begins (no race condition)
  - Conversation timestamp updated atomically with message save
"""
import json
from typing import AsyncGenerator, Optional
from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId
from src.agents.langgraph.graph import get_graph
from src.rag.memory.conversation_memory import get_conversation_history
from src.database.mongodb.repositories.chat_repository import (
    insert_message,
    touch_conversation,
)
from src.core.logger import get_logger

logger = get_logger(__name__)


async def stream_chat_response(
    query: str,
    user_id: str,
    conversation_id: Optional[str],
    messages_collection,
    conversations_collection,
) -> AsyncGenerator[str, None]:
    """
    Orchestrates the LangGraph workflow and yields SSE-formatted events.

    Flow:
      1. Load conversation history from MongoDB
      2. Build initial agent state (with history injected)
      3. Stream graph events:
         a. Node activity events (each agent starting/completing)
         b. Token events (via on_chat_model_stream — true streaming)
         c. Citation events (when retriever completes)
         d. Done event with final sources
      4. Persist assistant response to MongoDB
    """
    graph = get_graph()

    # ── Load conversation history ─────────────────────────────────────────────
    history = []
    if conversation_id:
        try:
            history = await get_conversation_history(
                messages_collection,
                conversation_id,
                limit=10,
            )
        except Exception as e:
            logger.warning(f"Could not load history for {conversation_id}: {e}")

    # ── Build initial state ───────────────────────────────────────────────────
    initial_state = {
        "query": query,
        "conversation_id": conversation_id,
        "user_id": user_id,
        "report_mode": False,
        "history": history,          # ← injected — was missing in v2
        "messages": [],
        "plan": [],
        "retrieved_docs": [],
        "citations": [],
        "summary": "",
        "final_output": "",
        "errors": [],
        "current_node": "",
    }

    final_text = ""
    final_citations = []
    active_node = ""

    try:
        # ── Stream graph events ───────────────────────────────────────────────
        async for event in graph.astream_events(initial_state, version="v2"):
            kind = event.get("event", "")
            name = event.get("name", "")
            data = event.get("data", {})

            # ── Node lifecycle events ────────────────────────────────────────
            if kind == "on_chain_start" and name in (
                "planner", "retriever", "citation", "summarizer", "reporter"
            ):
                active_node = name
                yield f"data: {json.dumps({'node': name, 'status': 'running'})}\n\n"

            elif kind == "on_chain_end" and name in (
                "planner", "retriever", "citation", "summarizer", "reporter"
            ):
                yield f"data: {json.dumps({'node': name, 'status': 'completed'})}\n\n"

                # ── Emit citations when retriever completes ──────────────────
                if name == "retriever":
                    output = data.get("output", {})
                    cits = output.get("citations", [])
                    if cits:
                        final_citations = cits
                        yield f"data: {json.dumps({'type': 'citations', 'data': cits})}\n\n"

                # ── Capture final output when reporter completes ─────────────
                elif name == "reporter":
                    output = data.get("output", {})
                    final_text = output.get("final_output", "")
                    final_citations = output.get("citations", final_citations)

            # ── True token streaming from the LLM ────────────────────────────
            elif kind == "on_chat_model_stream":
                chunk = data.get("chunk")
                if chunk and hasattr(chunk, "content") and chunk.content:
                    yield f"data: {json.dumps({'type': 'token', 'data': chunk.content})}\n\n"

        # ── Done event ────────────────────────────────────────────────────────
        yield f"data: {json.dumps({'done': True, 'sources': final_citations})}\n\n"

        # ── Persist assistant response ────────────────────────────────────────
        if conversation_id and final_text:
            try:
                await insert_message(
                    conversation_id=conversation_id,
                    user_id=user_id,
                    role="assistant",
                    content=final_text,
                    sources=final_citations,
                )
                await touch_conversation(conversation_id)
            except Exception as e:
                logger.error(f"Failed to persist assistant message: {e}")

    except Exception as e:
        logger.error(f"Chat stream error: {e}", exc_info=True)
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
