"""
src/workflows/research_workflow.py — LangGraph workflow registry
================================================================
Provides workflow metadata, node descriptions, and configuration
for introspection, monitoring, and API documentation.

Import get_workflow_info() anywhere you need to describe the active pipeline.
"""
from typing import Dict, Any, List
from src.core.config import settings


# ── Node registry ─────────────────────────────────────────────────────────────

WORKFLOW_NODES: List[Dict[str, Any]] = [
    {
        "id": "planner",
        "name": "Research Planner Agent",
        "description": (
            "Analyzes the user query in context of conversation history. "
            "Generates 2–4 targeted search queries covering different angles. "
            "Routes to retriever if document lookup is needed, or directly "
            "to summarizer for greetings/simple questions."
        ),
        "model": settings.GEMINI_MODEL,
        "output": ["plan", "current_node"],
        "routes_to": ["retriever", "summarizer"],
        "routing": "conditional",
    },
    {
        "id": "retriever",
        "name": "Retrieval Agent",
        "description": (
            "Executes each planned search query against Pinecone using "
            "MMR (Maximal Marginal Relevance) retrieval. Deduplicates results "
            "across queries using content-hash based doc_id."
        ),
        "model": "Pinecone MMR semantic search",
        "output": ["retrieved_docs", "citations", "current_node"],
        "routes_to": ["citation"],
        "routing": "linear",
    },
    {
        "id": "citation",
        "name": "Citation Agent",
        "description": (
            "De-duplicates citations by doc_id hash. Applies confidence scoring "
            "based on retrieval rank (0.95 → 0.50 decaying). Ensures consistent "
            "citation structure for the frontend citations panel."
        ),
        "model": "deterministic",
        "output": ["citations", "current_node"],
        "routes_to": ["summarizer"],
        "routing": "linear",
    },
    {
        "id": "summarizer",
        "name": "Summarization Agent",
        "description": (
            "Synthesizes retrieved document chunks into a clear, cited "
            "markdown answer using GPT-4o / Gemini. Injects conversation "
            "history for multi-turn coherence. Enforces strict grounding rules."
        ),
        "model": settings.GEMINI_MODEL,
        "output": ["summary", "current_node"],
        "routes_to": ["reporter"],
        "routing": "linear",
    },
    {
        "id": "reporter",
        "name": "Report Agent",
        "description": (
            "Assembles final markdown output from summary + citations. "
            "Formats numbered reference list with confidence scores, page "
            "numbers, and snippet previews. Adds methodology note in report mode."
        ),
        "model": "deterministic",
        "output": ["final_output", "current_node"],
        "routes_to": ["END"],
        "routing": "linear",
    },
]

# ── Workflow topology ──────────────────────────────────────────────────────────

WORKFLOW_EDGES = [
    {"from": "planner",    "to": "retriever",   "condition": "needs_retrieval=True"},
    {"from": "planner",    "to": "summarizer",  "condition": "needs_retrieval=False"},
    {"from": "retriever",  "to": "citation",    "condition": None},
    {"from": "citation",   "to": "summarizer",  "condition": None},
    {"from": "summarizer", "to": "reporter",    "condition": None},
    {"from": "reporter",   "to": "END",         "condition": None},
]


def get_workflow_info() -> Dict[str, Any]:
    """
    Returns complete LangGraph workflow metadata for API documentation,
    monitoring dashboards, and admin panels.
    """
    return {
        "name": "AI Research Copilot — 5-Agent Pipeline",
        "framework": "LangGraph",
        "version": settings.VERSION,
        "entry_point": "planner",
        "nodes": WORKFLOW_NODES,
        "edges": WORKFLOW_EDGES,
        "streaming": "Server-Sent Events (SSE) via graph.astream_events(version='v2')",
        "state_schema": "AgentState (TypedDict with add_messages reducer)",
        "memory": "MongoDB conversation history (last 10 turns injected at runtime)",
        "retrieval": "Pinecone MMR with user-scoped metadata filtering",
    }


def get_node_names() -> List[str]:
    """Returns ordered list of node names in workflow execution order."""
    return [n["id"] for n in WORKFLOW_NODES]
