"""
src/agents/langgraph/nodes/supervisor_node.py — Supervisor Agent
================================================================
Analyzes the user's query and automatically selects the best workflow
pipeline to handle it. Eliminates manual workflow selection.

Output:
  - selected_agent:   "research" | "coding" | "data_analysis" | "summary" | "technical" | "competitive"
  - trip_constraint:   key constraint driving the decision
  - reasoning:         brief explanation of the routing decision

Uses structured LLM output with fallback provider chain.
"""
from typing import Dict, Any
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage, AIMessage
from pydantic import BaseModel, Field
from typing import Literal
from agents.langgraph.state import AgentState
from core.llm_factory import get_llm, get_fallback_providers
from core.logger import get_logger

logger = get_logger(__name__)


VALID_AGENTS = [
    "research", "coding", "data_analysis",
    "summary", "technical", "competitive",
]


class SupervisorDecision(BaseModel):
    selected_agent: Literal[
        "research", "coding", "data_analysis",
        "summary", "technical", "competitive",
    ] = Field(
        description="The agent pipeline best suited to handle the user's query."
    )
    trip_constraint: str = Field(
        description=(
            "The key constraint that drives the routing decision. Examples: "
            "'needs_documents', 'needs_code_sandbox', 'general_knowledge', "
            "'needs_web_data', 'needs_data_processing', 'needs_comparison', "
            "'needs_technical_depth', 'needs_concise_summary'."
        )
    )
    reasoning: str = Field(
        description="A concise 1-2 sentence explanation of why this agent was selected."
    )


SUPERVISOR_SYSTEM_PROMPT = """You are the Supervisor Agent inside a multi-agent AI research platform.

Your ONLY job: analyze the user's query and select the single best agent pipeline to handle it.

AVAILABLE PIPELINES:

1. **research** — Deep research with document retrieval (RAG), citations, web search.
   USE WHEN: User asks about uploaded documents, needs cited research, asks factual questions that benefit from document context, wants referenced analysis, or asks about specific papers/files.

2. **coding** — Code generation, execution in sandbox, code review, testing.
   USE WHEN: User asks to write/fix/debug code, implement algorithms, create scripts, build functions, refactor code, or run code.

3. **data_analysis** — Statistical analysis, dataset processing, trend extraction.
   USE WHEN: User asks to analyze data/numbers, compute statistics, summarize datasets, find patterns in tabular data, or create data visualizations.

4. **summary** — Quick executive summary, no document retrieval needed.
   USE WHEN: User asks for a concise summary/overview of a topic answerable from LLM knowledge, wants a brief answer, or asks general knowledge questions that don't need citations.

5. **technical** — Deep technical analysis with document retrieval and citations.
   USE WHEN: User asks for in-depth technical evaluation, architecture review, engineering deep-dive, or detailed technical comparison requiring document context.

6. **competitive** — Competitive analysis, market comparison matrices.
   USE WHEN: User asks to compare products/services/tools, create comparison tables, analyze market positioning, or evaluate alternatives.

DECISION RULES:
- If the query mentions uploaded files, documents, or papers → prefer "research" or "technical"
- If the query asks to write, fix, debug, or run code → always choose "coding"
- If the query involves numbers, datasets, statistics → choose "data_analysis"
- If the query asks to compare products, tools, or solutions → choose "competitive"
- If the query asks for a quick/concise answer or general knowledge → choose "summary"
- If the query needs deep technical depth with citations → choose "technical"
- For greetings, casual chat, simple factual questions → choose "summary"
- When in doubt between "research" and "summary", choose "research" if depth matters

Return ONLY valid JSON. No markdown, no code fences, no extra text."""


async def supervisor_node(state: AgentState) -> dict:
    """
    Supervisor Agent — analyzes the user query and selects the optimal
    workflow pipeline. Runs before any workflow graph is invoked.
    """
    query = state.get("query", "")
    history = state.get("history", [])
    provider = state.get("selected_llm_provider", "")
    model_name = state.get("selected_llm_model", "")
    filename = state.get("filename", "")

    logger.info(f"[Supervisor] Analyzing query: '{query[:80]}'")

    # Fast-path: greetings → summary
    clean_query = query.strip().lower()
    if clean_query in ("hi", "hello", "hey", "hii", "heya", "hola", "sup"):
        decision = {
            "selected_agent": "summary",
            "trip_constraint": "greeting",
            "tripconstraint": "greeting",
            "reasoning": "Simple greeting detected — routing to summary for a quick response.",
        }
        logger.info(f"[Supervisor] Fast-path greeting → summary")
        return {
            "workflow_type": "summary",
            "supervisor_decision": decision,
            "current_node": "supervisor",
            "errors": [],
        }

    # If a file is attached, bias toward research/technical
    file_hint = ""
    if filename:
        file_hint = f"\n[Note: User has attached file '{filename}' to this query.]"

    # Build message chain for the supervisor LLM
    messages: list[BaseMessage] = [SystemMessage(content=SUPERVISOR_SYSTEM_PROMPT)]
    for turn in history[-4:]:
        role = turn.get("role", "")
        content = turn.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))
    messages.append(HumanMessage(content=query + file_hint))

    # Try with fallback providers
    fallback_providers = get_fallback_providers(provider)
    logger.info(f"[Supervisor] Fallback chain: {fallback_providers}")

    decision_obj = None

    for attempt_idx, attempt_provider in enumerate(fallback_providers):
        try:
            if attempt_idx > 0:
                logger.warning(
                    f"[Supervisor] Failing over: {fallback_providers[attempt_idx-1]} -> {attempt_provider}"
                )

            attempt_model = model_name if attempt_idx == 0 else ""
            llm = get_llm(
                provider=attempt_provider,
                model_name=attempt_model,
                temperature=0.0,
            )
            structured_llm = llm.with_structured_output(SupervisorDecision)
            decision_obj = await structured_llm.ainvoke(messages)
            break

        except Exception as e:
            logger.error(f"[Supervisor] Provider '{attempt_provider}' error: {e}")
            has_more = attempt_idx < len(fallback_providers) - 1
            if has_more:
                continue
            # All providers failed — default to research
            logger.warning("[Supervisor] All providers failed, defaulting to research")
            decision_obj = None

    if decision_obj:
        selected = decision_obj.selected_agent
        # Validate the selection
        if selected not in VALID_AGENTS:
            logger.warning(f"[Supervisor] Invalid agent '{selected}', defaulting to research")
            selected = "research"

        decision = {
            "selected_agent": selected,
            "trip_constraint": decision_obj.trip_constraint,
            "tripconstraint": decision_obj.trip_constraint,
            "reasoning": decision_obj.reasoning,
        }
    else:
        # Fallback decision
        selected = "research"
        decision = {
            "selected_agent": "research",
            "trip_constraint": "fallback",
            "tripconstraint": "fallback",
            "reasoning": "Supervisor could not classify — defaulting to research pipeline.",
        }

    logger.info(
        f"[Supervisor] Decision: agent={decision['selected_agent']}, "
        f"constraint={decision['trip_constraint']}, "
        f"reasoning='{decision['reasoning'][:80]}'"
    )

    return {
        "workflow_type": selected,
        "supervisor_decision": decision,
        "current_node": "supervisor",
        "errors": [],
    }
