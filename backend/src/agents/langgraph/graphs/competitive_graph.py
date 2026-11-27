"""
src/agents/langgraph/graphs/competitive_graph.py
Competitive workflow for comparative analysis.
"""
from langgraph.graph import StateGraph, END
from agents.langgraph.state import AgentState
from agents.langgraph.nodes.planner_node import planner_node
from agents.langgraph.nodes.voice_preprocessing_node import voice_preprocessing_node
from agents.langgraph.nodes.memory_retrieval_node import memory_retrieval_node
from agents.langgraph.nodes.vision_extraction_node import vision_extraction_node
from agents.langgraph.nodes.retriever_node import retriever_node
from agents.langgraph.nodes.web_research_node import web_research_node
from agents.langgraph.nodes.citation_node import citation_node
from agents.langgraph.nodes.summarizer_node import summarizer_node
from agents.langgraph.nodes.report_node import report_node
from core.logger import get_logger

logger = get_logger(__name__)

_IMAGE_EXTS = {"png", "jpg", "jpeg", "gif", "webp", "bmp", "tiff", "svg"}


def _should_retrieve(state: AgentState) -> str:
    if state.get("terminate"):
        return "end"
    filename = state.get("filename", "") or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext in _IMAGE_EXTS:
        return "vision_extractor"
    if state.get("plan") or state.get("requires_context", False):
        return "retriever"
    return "summarizer"


def build_competitive_graph() -> StateGraph:
    workflow = StateGraph(AgentState)

    workflow.add_node("voice_preprocessor", voice_preprocessing_node)
    workflow.add_node("planner", planner_node)
    workflow.add_node("memory_retriever", memory_retrieval_node)
    workflow.add_node("vision_extractor", vision_extraction_node)
    workflow.add_node("retriever", retriever_node)
    workflow.add_node("web_researcher", web_research_node)
    workflow.add_node("citation", citation_node)
    workflow.add_node("summarizer", summarizer_node)
    workflow.add_node("reporter", report_node)

    workflow.set_entry_point("voice_preprocessor")

    workflow.add_edge("voice_preprocessor", "planner")
    workflow.add_edge("planner", "memory_retriever")

    workflow.add_conditional_edges(
        "memory_retriever",
        _should_retrieve,
        {
            "end": END,
            "vision_extractor": "vision_extractor",
            "retriever": "retriever",
            "summarizer": "summarizer",
        },
    )

    workflow.add_edge("vision_extractor", "summarizer")
    workflow.add_edge("retriever", "web_researcher")
    workflow.add_edge("web_researcher", "citation")
    workflow.add_edge("citation", "summarizer")
    workflow.add_edge("summarizer", "reporter")
    workflow.add_edge("reporter", END)

    return workflow.compile()