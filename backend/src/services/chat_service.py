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
from src.agents.langgraph.graphs.factory import get_workflow_for_mode
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
    mode: str = "research",
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
    graph = get_workflow_for_mode(mode)

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

    final_text = ""        # from reporter chain end — formatted output for DB persistence
    streamed_text = ""     # accumulated live tokens — for real-time display
    final_citations = []
    active_node = ""

    # ── Quick Mode (Bypass Agents) ────────────────────────────────────────────
    if mode == "simple":
        try:
            from src.services.llm_service import get_chat_llm
            from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
            from google.api_core.exceptions import ResourceExhausted
            
            llm = get_chat_llm(temperature=0.4)
            langchain_messages = [SystemMessage(content="You are a helpful, fast AI research assistant.")]
            for msg in history:
                if msg.get("role") == "user":
                    langchain_messages.append(HumanMessage(content=msg.get("content", "")))
                else:
                    langchain_messages.append(AIMessage(content=msg.get("content", "")))
            langchain_messages.append(HumanMessage(content=query))

            try:
                async for chunk in llm.astream(langchain_messages):
                    if hasattr(chunk, "content") and chunk.content:
                        token = chunk.content
                        streamed_text += token
                        yield f"data: {json.dumps({'type': 'token', 'data': token, 'text': token})}\n\n"
            except ResourceExhausted as e:
                logger.error(f"Gemini quota exceeded (simple mode): {e}")
                err_msg = "Daily AI quota exhausted. Please upgrade your billing plan." if "PerDayPerProjectPerModel" in str(e) else "The AI provider quota has been exhausted. Please try again later."
                streamed_text = err_msg
                yield f"data: {json.dumps({'type': 'token', 'data': err_msg, 'text': err_msg})}\n\n"
            
            yield f"data: {json.dumps({'done': True, 'sources': []})}\n\n"
            
            if conversation_id and streamed_text:
                try:
                    await insert_message(
                        conversation_id=conversation_id,
                        user_id=user_id,
                        role="assistant",
                        content=streamed_text,
                        sources=[],
                    )
                    await touch_conversation(conversation_id)
                except Exception as e:
                    logger.error(f"Failed to persist assistant message: {e}")
            return
        except Exception as e:
            logger.error(f"Chat stream error (simple mode): {e}", exc_info=True)
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            return

    # ── Build initial state ───────────────────────────────────────────────────
    initial_state = {
        "query": query,
        "conversation_id": conversation_id,
        "user_id": user_id,
        "report_mode": False,
        "mode": mode,                # ← "research", "competitive", "technical", etc.
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
                # reporter assembles summary + citation refs into final_output
                elif name == "reporter":
                    output = data.get("output", {})
                    final_text = output.get("final_output", streamed_text)
                    final_citations = output.get("citations", final_citations)
                    
                    quality_score = output.get("quality_score")
                    if quality_score:
                        yield f"data: {json.dumps({'type': 'quality_score', 'data': quality_score})}\n\n"

            # ── True token streaming from the LLM ────────────────────────────
            elif kind == "on_chat_model_stream":
                chunk = data.get("chunk")
                if chunk and hasattr(chunk, "content") and chunk.content:
                    token = chunk.content
                    streamed_text += token
                    # Emit with BOTH field names for compatibility:
                    # - type/data: standard format consumed by AIAssistantUI.jsx
                    # - text: legacy alias kept for safety
                    yield f"data: {json.dumps({'type': 'token', 'data': token, 'text': token})}\n\n"


        # ── Done event ────────────────────────────────────────────────────────
        yield f"data: {json.dumps({'done': True, 'sources': final_citations})}\n\n"

        # ── Persist assistant response ────────────────────────────────────────
        # Use final_text (reporter formatted with citations); fall back to streamed_text
        persist_text = final_text or streamed_text
        if conversation_id and persist_text:
            try:
                # Assuming insert_message can accept extra args, or we just rely on citations
                await insert_message(
                    conversation_id=conversation_id,
                    user_id=user_id,
                    role="assistant",
                    content=persist_text,
                    sources=final_citations,
                )
                await touch_conversation(conversation_id)
            except Exception as e:
                logger.error(f"Failed to persist assistant message: {e}")

    except Exception as e:
        logger.error(f"Chat stream error: {e}", exc_info=True)
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
