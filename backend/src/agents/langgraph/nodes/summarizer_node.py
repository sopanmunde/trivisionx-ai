"""
src/agents/langgraph/nodes/summarizer_node.py — Summary Agent
=============================================================
Corresponds to "Summary agent" in the image workflow.

Implements the "Generate — GPT-4o + context + citations" pipeline step:
  - Receives all retrieved chunks as structured context
  - Injects conversation history for multi-turn coherence
  - Uses GPT-4o to synthesize a cited, well-structured markdown answer
"""
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from src.agents.langgraph.state import AgentState
from src.services.llm_service import get_chat_llm
from src.core.logger import get_logger

logger = get_logger(__name__)

SUMMARIZER_SYSTEM = """You are an expert AI Research Analyst (Summary Agent).

Your task is to synthesize retrieved document chunks into a clear, accurate,
well-cited answer to the user's research question.

STRICT RULES:
1. Base your answer ONLY on the provided document context below.
2. NEVER hallucinate or add information not present in the documents.
3. If the context does not contain enough information, say so explicitly:
   "The provided documents do not contain sufficient information to answer this."
4. Cite sources inline using the format: [Source: filename, Page X]
5. Use proper markdown formatting:
   - Headers (##) for major sections
   - Bullet points for lists
   - **Bold** for key terms and findings
   - > Blockquotes for direct quotes from documents
6. Write for a researcher audience — precise, analytical, no fluff.
7. Consider the conversation history to maintain continuity in follow-up answers.

CONTEXT (retrieved document chunks):
{context}"""


def _build_context(docs: list) -> str:
    """Format retrieved doc dicts into a numbered, readable context block."""
    if not docs:
        return "No documents were retrieved for this query."

    parts = []
    for i, doc in enumerate(docs):
        meta = doc.get("metadata", {})
        source = meta.get("filename", meta.get("source", f"Document {i + 1}"))
        page = meta.get("page", "")
        chunk_idx = meta.get("chunk_index", "")
        header = f"[{i + 1}] {source}"
        if page not in ("", "N/A", None):
            header += f" — Page {page}"
        if chunk_idx not in ("", "N/A", None):
            header += f" (chunk {chunk_idx})"
        parts.append(f"{header}:\n{doc['page_content']}")

    return "\n\n---\n\n".join(parts)


async def summarizer_node(state: AgentState) -> dict:
    """
    Summary Agent — synthesizes retrieved documents into a high-quality answer.
    Uses GPT-4o with full conversation history for context-aware responses.
    """
    query = state.get("query", "")
    docs = state.get("retrieved_docs", [])
    history = state.get("history", [])

    context = _build_context(docs)
    logger.info(
        f"[Summary Agent] Synthesizing {len(docs)} chunks "
        f"(history={len(history)} turns) for '{query[:60]}'"
    )

    llm = get_chat_llm()

    messages = [SystemMessage(content=SUMMARIZER_SYSTEM.format(context=context))]

    # Inject conversation history — last 6 turns for GPT-4o context window efficiency
    for turn in history[-6:]:
        role = turn.get("role", "")
        content = turn.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))

    messages.append(HumanMessage(content=query))

    response = await llm.ainvoke(messages)
    logger.info(
        f"[Summary Agent] Generated {len(response.content)} char response"
    )

    return {
        "summary": response.content,
        "current_node": "summarizer",
    }
