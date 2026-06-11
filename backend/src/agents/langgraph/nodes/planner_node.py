"""
src/agents/langgraph/nodes/planner_node.py — Smart Router Agent
===============================================================
Analyzes the user query and decides:
  1. Does this require vector DB / document context?  → route to retriever_node
  2. Is this general reasoning/coding/planning?       → route to summarizer (no retrieval)
  3. Is this a coding workflow?                       → route to code_generation
  4. Is this a data analysis workflow?                → route to data_analysis

Uses the dynamically selected LLM from the factory.
"""
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from pydantic import BaseModel, Field
from typing import List
from src.agents.langgraph.state import AgentState
from src.core.llm_factory import get_llm
from src.core.logger import get_logger

logger = get_logger(__name__)


class PlannerDecision(BaseModel):
    requires_context: bool = Field(
        description="True if answering requires external documents/context from the vector DB. "
                    "False for general reasoning, greetings, or questions answerable from LLM knowledge."
    )
    queries: List[str] = Field(
        description="2-4 targeted search queries for the vector store if requires_context=True. "
                    "Empty list otherwise."
    )
    reasoning: str = Field(
        description="Brief explanation of the routing decision."
    )


PLANNER_SYSTEM_V2 = """You are a Smart Routing Planner inside a multi-agent AI system.

Your job: analyze the user's query and decide the best execution path.

DECISION RULES:

1. **requires_context = true** — Route to document retrieval when the query asks about:
   - Specific documents, research papers, uploaded files
   - Technical details that need factual grounding
   - Questions referencing prior conversation context or specific data
   - Scientific, academic, or research topics needing citations

2. **requires_context = false** — Skip retrieval for:
   - General conversation, greetings, casual chat
   - Coding questions, debugging, architecture advice
   - Mathematical reasoning, logic puzzles
   - Creative writing, brainstorming
   - Questions answerable from the LLM's training knowledge
   - "What is X", "Explain Y", "How does Z work" — general knowledge

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON. No markdown, no code fences, no extra text.
- When requires_context=true, generate 2-4 diverse search queries.
- When requires_context=false, return an empty queries list.

Examples:
Q: "What are the latest findings on transformer architectures in my uploaded papers?"
→ {"requires_context": true, "queries": ["transformer architecture key findings", "attention mechanism advancements", "transformer model comparisons"], "reasoning": "Research question requiring document retrieval for cited answers."}

Q: "Write a Python function to sort a list of dictionaries by a key"
→ {"requires_context": false, "queries": [], "reasoning": "General coding task answerable from LLM knowledge."}

Q: "Hello, how are you?"
→ {"requires_context": false, "queries": [], "reasoning": "Greeting, no retrieval needed."}

Q: "What's the capital of France?"
→ {"requires_context": false, "queries": [], "reasoning": "Simple factual query answerable from LLM knowledge."}
"""


async def planner_node(state: AgentState) -> dict:
    """
    Smart Router — analyzes query, decides if context retrieval is needed.
    Routes differently based on workflow_type:
      - research/technical/competitive: decide between retriever or summarizer
      - coding: always route to code_generation (no retrieval)
      - data_analysis: always route to data_analysis (no retrieval)
      - summary: skip retrieval, go directly to summarizer
    """
    query = state.get("query", "")
    history = state.get("history", [])
    mode = state.get("mode", "agent")
    workflow_type = state.get("workflow_type", "research")
    provider = state.get("selected_llm_provider", "")
    model_name = state.get("selected_llm_model", "")

    logger.info(
        f"[Planner] workflow={workflow_type}, mode={mode}, "
        f"provider={provider}, query='{query[:60]}'"
    )

    # Quick mode → skip LangGraph entirely (handled at service level)
    if mode == "quick":
        return {
            "plan": [],
            "requires_context": False,
            "current_node": "planner",
            "errors": [],
        }

    # Workflow-type routing
    if workflow_type == "coding":
        logger.info("[Planner] Routing to coding workflow (no retrieval)")
        return {
            "plan": [],
            "requires_context": False,
            "current_node": "planner",
            "errors": [],
        }

    if workflow_type == "data_analysis":
        logger.info("[Planner] Routing to data_analysis workflow (no retrieval)")
        return {
            "plan": [],
            "requires_context": False,
            "current_node": "planner",
            "errors": [],
        }

    if workflow_type == "summary":
        logger.info("[Planner] Summary mode — bypassing retrieval")
        return {
            "plan": [],
            "requires_context": False,
            "current_node": "planner",
            "errors": [],
        }

    # Fast-path for greetings
    clean_query = query.strip().lower()
    if clean_query in ("hi", "hello", "hey", "hii", "heya", "hola", "sup"):
        logger.info("[Planner] Fast-path greeting detected")
        return {
            "plan": [],
            "requires_context": False,
            "terminate": True,
            "final_output": "Hello! How can I help you with your research today?",
            "current_node": "planner",
            "errors": [],
        }

    # Use the dynamically selected LLM with structured output
    llm = get_llm(provider=provider, model_name=model_name, temperature=0.1)
    structured_llm = llm.with_structured_output(PlannerDecision)

    messages = [SystemMessage(content=PLANNER_SYSTEM_V2)]
    for turn in history[-2:]:
        role = turn.get("role", "")
        content = turn.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))
    messages.append(HumanMessage(content=query))

    decision = None
    try:
        decision = await structured_llm.ainvoke(messages)
        plan = decision.queries if decision.requires_context else []
        requires_context = decision.requires_context
    except Exception as e:
        logger.error(f"[Planner] LLM call failed: {e}")
        plan = []
        requires_context = False

    reasoning = (decision.reasoning[:60] if decision and hasattr(decision, 'reasoning') else 'fallback')
    logger.info(
        f"[Planner] requires_context={requires_context}, "
        f"queries={len(plan)}, reasoning='{reasoning}'"
    )

    return {
        "plan": plan,
        "requires_context": requires_context,
        "current_node": "planner",
        "errors": [],
    }
