"""
src/agents/langgraph/nodes/planner_node.py — Research Agent
============================================================
Corresponds to "Research agent" in the image workflow.

Responsibilities:
  - Understand the user's query in context of conversation history
  - Decide whether document retrieval is needed
  - Generate 2–4 targeted search queries that cover different angles
"""
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from pydantic import BaseModel, Field
from typing import List
from src.agents.langgraph.state import AgentState
from src.services.llm_service import get_mini_llm
from src.core.logger import get_logger

logger = get_logger(__name__)


class ResearchPlan(BaseModel):
    needs_retrieval: bool = Field(
        description=(
            "True if the query requires retrieving documents from the vector store. "
            "False for greetings, casual questions, or simple factual queries."
        )
    )
    search_queries: List[str] = Field(
        description=(
            "2–4 specific, targeted search queries to run against the vector store. "
            "Each query should cover a different angle of the research topic. "
            "Empty list when needs_retrieval=False."
        )
    )
    rationale: str = Field(
        description="Brief explanation of the research strategy chosen."
    )


PLANNER_SYSTEM = """You are an expert AI Research Planner (Research Agent).

Your task is to analyze the user's query and design an optimal retrieval strategy.

RULES:
1. If the user is greeting, making small talk, or asking simple factual questions
   that don't require documents → set needs_retrieval=false, empty search_queries.
2. If the query requires facts, analysis, document knowledge, or research →
   set needs_retrieval=true and generate 2–4 SPECIFIC search queries.
3. Search queries must NOT be verbatim copies of the user query.
   Each should explore a different angle (e.g. definitions, evidence, comparisons).
4. Consider the conversation history to understand follow-up questions.
5. Keep search queries concise and keyword-rich for vector store retrieval.

Always respond in the specified structured JSON format."""


async def planner_node(state: AgentState) -> dict:
    """
    Research Agent — analyzes the query and generates a multi-angle research plan.
    Injects conversation history to handle follow-up queries correctly.

    When mode='simple': immediately returns empty plan → forces direct LLM path.
    When mode='research': runs full RAG-based planning as usual.
    """
    query = state.get("query", "")
    history = state.get("history", [])
    mode = state.get("mode", "research")
    logger.info(f"[Research Agent] Mode='{mode}' | Planning for: '{query[:80]}'")

    # ── Simple/Summary mode: skip RAG planning ────────────────────────────────
    if mode in ("simple", "summary"):
        logger.info(f"[Research Agent] {mode} mode — bypassing retrieval planning")
        return {
            "plan": [],
            "current_node": "planner",
            "errors": [],
        }

    # Fast-path heuristic for simple greetings to save LLM roundtrip latency
    clean_query = query.strip().lower()
    if clean_query in ("hi", "hello", "hey", "hii", "heya", "hola", "sup"):
        logger.info("[Research Agent] Fast-path routing triggered for greeting")
        return {
            "plan": [],
            "terminate": True,
            "final_output": "Hello! How can I help you with your research today?",
            "current_node": "planner",
            "errors": [],
        }

    # Use the mini model for planning (faster, cheaper — structured output)
    llm = get_mini_llm().with_structured_output(ResearchPlan)

    messages = [SystemMessage(content=PLANNER_SYSTEM)]

    # Inject recent conversation history for context-aware planning
    for turn in history[-2:]:  # last 2 turns is sufficient for planning context
        role = turn.get("role", "")
        content = turn.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))

    messages.append(HumanMessage(content=query))

    response: ResearchPlan = await llm.ainvoke(messages)
    plan = response.search_queries if response.needs_retrieval else []

    logger.info(
        f"[Research Agent] retrieval={response.needs_retrieval}, "
        f"queries={len(plan)}, rationale='{response.rationale[:60]}'"
    )

    return {
        "plan": plan,
        "current_node": "planner",
        "errors": [],
    }
