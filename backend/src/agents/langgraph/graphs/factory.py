"""
src/agents/langgraph/graphs/factory.py
Factory for loading the correct LangGraph workflow based on research mode.
"""
from langgraph.graph import StateGraph
from src.core.logger import get_logger

from .research_graph import build_research_graph
from .summary_graph import build_summary_graph
from .competitive_graph import build_competitive_graph
from .technical_graph import build_technical_graph

logger = get_logger(__name__)

# Cache the compiled graphs
_compiled_graphs = {}

def get_workflow_for_mode(mode: str) -> StateGraph:
    """
    Returns the appropriate compiled LangGraph workflow for the given mode.
    Modes: "research", "summary", "competitive", "technical".
    """
    if mode in _compiled_graphs:
        return _compiled_graphs[mode]

    logger.info(f"Compiling LangGraph workflow for mode: {mode}")

    if mode == "summary":
        workflow = build_summary_graph()
    elif mode == "competitive":
        workflow = build_competitive_graph()
    elif mode == "technical":
        workflow = build_technical_graph()
    else:
        # Default is "research" (Deep)
        workflow = build_research_graph()

    _compiled_graphs[mode] = workflow
    return workflow
