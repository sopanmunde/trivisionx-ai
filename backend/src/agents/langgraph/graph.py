"""
src/agents/langgraph/graph.py — LangGraph multi-agent workflow
==============================================================
Compiles the 5-agent research pipeline matching the image workflow:

  Research Agent → [conditional] → Retrieval Agent → Citation Agent
                                 → Summary Agent  → Report Agent → END
                ↘ (no retrieval) → Summary Agent  → ...

Agent mapping (image label → node name):
  Research agent  → planner_node   (query analysis + search planning)
  Retrieval agent → retriever_node (MMR semantic search via Pinecone)
  Citation agent  → citation_node  (dedup + confidence scoring)
  Summary agent   → summarizer_node (GPT-4o synthesis with history)
  Report agent    → report_node    (final markdown assembly)
"""
from langgraph.graph import StateGraph, END
from src.agents.langgraph.state import AgentState
from src.agents.langgraph.nodes.planner_node import planner_node
from src.agents.langgraph.nodes.retriever_node import retriever_node
from src.agents.langgraph.nodes.summarizer_node import summarizer_node
from src.agents.langgraph.nodes.citation_node import citation_node
from src.agents.langgraph.nodes.report_node import report_node
from src.core.logger import get_logger

logger = get_logger(__name__)

# Compiled graph — rebuilt fresh on each import (no stale lru_cache)
_compiled_graph = None


def _should_retrieve(state: AgentState) -> str:
    """
    Conditional routing: if the planner generated search queries, run retrieval.
    Otherwise skip to summarizer directly (e.g. casual greetings).
    """
    plan = state.get("plan", [])
    route = "retriever" if plan else "summarizer"
    logger.debug(f"[Graph] Routing after planner → {route} (plan_len={len(plan)})")
    return route


def build_graph() -> StateGraph:
    """
    Assemble and compile the LangGraph multi-agent research workflow.

    Graph topology:
      planner → [conditional: retriever | summarizer]
      retriever → citation → summarizer → reporter → END
      summarizer → reporter → END  (when retrieval skipped)
    """
    workflow = StateGraph(AgentState)

    # ── Register nodes ────────────────────────────────────────────────────────
    workflow.add_node("planner", planner_node)      # Research Agent
    workflow.add_node("retriever", retriever_node)  # Retrieval Agent
    workflow.add_node("citation", citation_node)    # Citation Agent
    workflow.add_node("summarizer", summarizer_node)# Summary Agent
    workflow.add_node("reporter", report_node)      # Report Agent

    # ── Entry point ───────────────────────────────────────────────────────────
    workflow.set_entry_point("planner")

    # ── Conditional routing after planner ────────────────────────────────────
    workflow.add_conditional_edges(
        "planner",
        _should_retrieve,
        {
            "retriever": "retriever",
            "summarizer": "summarizer",
        },
    )

    # ── Linear edges ──────────────────────────────────────────────────────────
    # Retrieval path: retriever → citation → summarizer → reporter
    workflow.add_edge("retriever", "citation")
    workflow.add_edge("citation", "summarizer")
    workflow.add_edge("summarizer", "reporter")
    workflow.add_edge("reporter", END)

    compiled = workflow.compile()
    logger.info("LangGraph 5-agent workflow compiled successfully")
    return compiled


def get_graph():
    """
    Returns the compiled LangGraph instance.
    Rebuilds if not yet initialised (no lru_cache — avoids stale state).
    """
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph


def reset_graph():
    """Force rebuild on next get_graph() call. Useful for testing."""
    global _compiled_graph
    _compiled_graph = None
