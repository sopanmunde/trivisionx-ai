"""
src/services/chat_service.py — Chat orchestration with SSE streaming
=====================================================================
Orchestrates both Quick Mode (direct LLM) and Agent Mode (LangGraph pipeline)
and emits Server-Sent Events for real-time frontend consumption.

SSE event protocol:
  {"node": "<name>", "status": "running"}       — agent activity update
  {"node": "<name>", "status": "completed"}      — agent finished
  {"type": "citations", "data": [...]}           — citation panel update
  {"type": "token", "data": "<text>"}            — streaming text token
  {"done": true, "sources": [...]}               — stream complete
  {"error": "<message>"}                         — error
"""
import json
from typing import AsyncGenerator, Optional
from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId
from src.agents.langgraph.graphs.factory import get_workflow_for_mode
from src.core.llm_factory import get_llm
from src.agents.langgraph.nodes.utils import extract_text
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
    mode: str = "agent",
    workflow_type: str = "research",
    model_provider: Optional[str] = None,
    model_name: Optional[str] = None,
) -> AsyncGenerator[str, None]:
    """
    Orchestrates either Quick Mode or Agent Mode and yields SSE events.

    Args:
        mode: "quick" (direct LLM) or "agent" (LangGraph)
        workflow_type: research | summary | technical | competitive | coding | data_analysis
        model_provider: openai | anthropic | google | groq | mistral | ollama | deepseek
        model_name: Specific model name override
    """
    history = []
    if conversation_id:
        try:
            history = await get_conversation_history(
                messages_collection, conversation_id, limit=10,
            )
        except Exception as e:
            logger.warning(f"Could not load history for {conversation_id}: {e}")

    final_text = ""
    streamed_text = ""
    final_citations = []
    active_node = ""

    provider = model_provider or ""
    model = model_name or ""

    # ═════════════════════════════════════════════════════════════════════
    # QUICK MODE — Direct LLM call, bypasses LangGraph entirely
    # ═════════════════════════════════════════════════════════════════════
    if mode == "quick":
        try:
            from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

            llm = get_llm(provider=provider, model_name=model, temperature=0.3)

            system_prompts = {
                "research": "You are a helpful, fast AI research assistant. Answer concisely and accurately.",
                "coding": "You are an expert software engineer. Provide clean, working code with explanations.",
                "data_analysis": "You are an expert data analyst. Provide clear analysis and insights.",
                "summary": "Provide a concise, well-structured summary.",
                "technical": "Provide detailed technical analysis with depth.",
                "competitive": "Provide comparative analysis of options.",
            }
            system_msg = system_prompts.get(workflow_type, system_prompts["research"])
            langchain_messages = [SystemMessage(content=system_msg)]

            for msg in history:
                if msg.get("role") == "user":
                    langchain_messages.append(HumanMessage(content=msg.get("content", "")))
                else:
                    langchain_messages.append(AIMessage(content=msg.get("content", "")))
            langchain_messages.append(HumanMessage(content=query))

            yield f"data: {json.dumps({'node': 'direct_llm', 'status': 'running'})}\n\n"

            try:
                async for chunk in llm.astream(langchain_messages):
                    if hasattr(chunk, "content") and chunk.content:
                        token = extract_text(chunk.content)
                        if not token:
                            continue
                        streamed_text += token
                        yield f"data: {json.dumps({'type': 'token', 'data': token, 'text': token})}\n\n"
            except Exception as e:
                error_msg = str(e)
                logger.error(f"Quick mode LLM error: {e}")
                if "429" in error_msg or "quota" in error_msg.lower():
                    err_msg = "AI quota exhausted. Please check your billing plan or switch providers."
                elif "503" in error_msg or "unavailable" in error_msg.lower():
                    err_msg = "AI provider experiencing high demand. Please try again."
                else:
                    err_msg = f"AI provider error: {str(e)[:100]}"
                streamed_text = err_msg
                yield f"data: {json.dumps({'type': 'token', 'data': err_msg, 'text': err_msg})}\n\n"

            yield f"data: {json.dumps({'node': 'direct_llm', 'status': 'completed'})}\n\n"
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
            logger.error(f"Quick mode fatal error: {e}", exc_info=True)
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            return

    # ═════════════════════════════════════════════════════════════════════
    # AGENT MODE — Full LangGraph multi-agent pipeline
    # ═════════════════════════════════════════════════════════════════════
    graph = get_workflow_for_mode(workflow_type)

    initial_state = {
        "query": query,
        "conversation_id": conversation_id,
        "user_id": user_id,
        "report_mode": False,
        "mode": mode,
        "workflow_type": workflow_type,
        "selected_llm_provider": provider or "",
        "selected_llm_model": model or "",
        "requires_context": True,
        "history": history,
        "messages": [],
        "plan": [],
        "retrieved_docs": [],
        "citations": [],
        "summary": "",
        "final_output": "",
        "generated_code": "",
        "code_review": "",
        "test_results": "",
        "analysis_results": "",
        "visualization_data": {},
        "errors": [],
        "current_node": "",
    }

    try:
        async for event in graph.astream_events(initial_state, version="v2"):
            kind = event.get("event", "")
            name = event.get("name", "")
            data = event.get("data", {})

            # Node lifecycle events
            if kind == "on_chain_start" and name in (
                "planner", "retriever", "citation", "summarizer", "reporter",
                "code_generation", "code_review", "testing", "data_analysis",
            ):
                active_node = name
                yield f"data: {json.dumps({'node': name, 'status': 'running'})}\n\n"

            elif kind == "on_chain_end" and name in (
                "planner", "retriever", "citation", "summarizer", "reporter",
                "code_generation", "code_review", "testing", "data_analysis",
            ):
                yield f"data: {json.dumps({'node': name, 'status': 'completed'})}\n\n"

                if name == "retriever":
                    output = data.get("output", {})
                    cits = output.get("citations", [])
                    if cits:
                        final_citations = cits
                        yield f"data: {json.dumps({'type': 'citations', 'data': cits})}\n\n"

                elif name == "reporter":
                    output = data.get("output", {})
                    final_text = output.get("final_output", streamed_text)
                    final_citations = output.get("citations", final_citations)

                    if not streamed_text and final_text:
                        yield f"data: {json.dumps({'type': 'token', 'data': final_text, 'text': final_text})}\n\n"

                    quality_score = output.get("quality_score")
                    if quality_score:
                        yield f"data: {json.dumps({'type': 'quality_score', 'data': quality_score})}\n\n"

            # Token-level streaming from the LLM
            elif kind == "on_chat_model_stream":
                chunk = data.get("chunk")
                if chunk and hasattr(chunk, "content") and chunk.content:
                    token = extract_text(chunk.content)
                    if not token:
                        continue
                    streamed_text += token
                    yield f"data: {json.dumps({'type': 'token', 'data': token, 'text': token})}\n\n"

        yield f"data: {json.dumps({'done': True, 'sources': final_citations})}\n\n"

        persist_text = final_text or streamed_text
        if conversation_id and persist_text:
            try:
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
        logger.error(f"Agent mode error: {e}", exc_info=True)
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
