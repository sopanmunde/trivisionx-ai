"""
src/agents/langgraph/nodes/code_generation_node.py — Code Generation Node
=========================================================================
Generates code based on the user's query and conversation history.
Uses the dynamically selected LLM.
"""
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from src.agents.langgraph.state import AgentState
from src.core.llm_factory import get_llm
from src.agents.langgraph.nodes.utils import extract_text
from src.core.logger import get_logger

logger = get_logger(__name__)

CODE_GENERATION_SYSTEM = """You are an expert Software Engineer. Your task is to generate clean,
well-documented, production-ready code based on the user's requirements.

RULES:
1. Write complete, working code — not snippets or pseudocode.
2. Include error handling and edge cases.
3. Use appropriate design patterns and best practices.
4. Explain the architecture/approach before showing code.
5. Output the code in a single clear code block with language annotation.
6. Consider performance, security, and maintainability.
7. Reference conversation history for context.

Output format:
```[language]
[your code here]
```"""


async def code_generation_node(state: AgentState) -> dict:
    """
    Code Generation Node — generates code for the given query.
    """
    query = state.get("query", "")
    history = state.get("history", [])
    provider = state.get("selected_llm_provider", "")
    model_name = state.get("selected_llm_model", "")

    logger.info(f"[CodeGen] provider={provider}, query='{query[:60]}'")

    llm = get_llm(
        provider=provider or "openai",
        model_name=model_name or "gpt-4o-mini",
        temperature=0.2,
    )

    messages = [SystemMessage(content=CODE_GENERATION_SYSTEM)]

    for turn in history[-4:]:
        role = turn.get("role", "")
        content = turn.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))

    messages.append(HumanMessage(content=query))

    try:
        response = await llm.ainvoke(messages)
        generated_code = extract_text(response.content)
    except Exception as e:
        logger.error(f"[CodeGen] LLM error: {e}")
        generated_code = f"// Error generating code: {str(e)[:100]}"

    logger.info(f"[CodeGen] Generated {len(generated_code)} chars")

    return {
        "generated_code": generated_code,
        "current_node": "code_generation",
    }
