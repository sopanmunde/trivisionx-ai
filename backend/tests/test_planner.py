"""
backend/tests/test_planner.py — Unit tests for Planner Agent
=============================================================
Tests for planner_node decision handling, structured output parsing
(both PlannerDecision instance and dict formats), fast-path routes, and failover.
"""
import pytest
import sys
import os
from unittest.mock import AsyncMock, patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))


def test_planner_decision_schema():
    from agents.langgraph.nodes.planner_node import PlannerDecision

    decision = PlannerDecision(
        requires_context=True,
        queries=["quantum computing latest", "qubit coherence times"],
        reasoning="Research query requiring factual document retrieval."
    )
    assert decision.requires_context is True
    assert len(decision.queries) == 2
    assert "Research" in decision.reasoning


@pytest.mark.asyncio
async def test_planner_fast_path_greeting():
    from agents.langgraph.nodes.planner_node import planner_node

    state = {
        "query": "hello",
        "history": [],
        "mode": "agent",
        "workflow_type": "research",
        "selected_llm_provider": "google",
        "selected_llm_model": "gemini-2.5-flash",
    }

    # pyrefly: ignore[bad-argument-type]
    res = await planner_node(state)
    assert res["requires_context"] is False
    assert res["plan"] == []
    assert res["terminate"] is True
    assert "Hello!" in res["final_output"]


@pytest.mark.asyncio
async def test_planner_bypasses_for_coding_and_data_analysis():
    from agents.langgraph.nodes.planner_node import planner_node

    state_coding = {
        "query": "Implement binary search in Rust",
        "history": [],
        "mode": "agent",
        "workflow_type": "coding",
    }
    # pyrefly: ignore[bad-argument-type]
    res_coding = await planner_node(state_coding)
    assert res_coding["requires_context"] is False
    assert res_coding["plan"] == []

    state_data = {
        "query": "Plot a histogram of column A",
        "history": [],
        "mode": "agent",
        "workflow_type": "data_analysis",
    }
    # pyrefly: ignore[bad-argument-type]
    res_data = await planner_node(state_data)
    assert res_data["requires_context"] is False
    assert res_data["plan"] == []


@pytest.mark.asyncio
async def test_planner_structured_output_as_pydantic_model():
    from agents.langgraph.nodes.planner_node import planner_node, PlannerDecision

    state = {
        "query": "What are the latest transformer developments in my uploaded paper?",
        "history": [],
        "mode": "agent",
        "workflow_type": "research",
        "selected_llm_provider": "google",
        "selected_llm_model": "gemini-2.5-flash",
        "filename": "transformers.pdf",
    }

    mock_llm = MagicMock()
    mock_structured = MagicMock()
    mock_structured.ainvoke = AsyncMock(
        return_value=PlannerDecision(
            requires_context=True,
            queries=["transformer architecture survey", "self-attention improvements"],
            reasoning="Document query requires retrieval."
        )
    )
    mock_llm.with_structured_output.return_value = mock_structured

    with patch("core.llm_factory.get_fallback_providers", return_value=["google"]), \
         patch("agents.langgraph.nodes.planner_node.get_llm", return_value=mock_llm):
        # pyrefly: ignore[bad-argument-type]
        res = await planner_node(state)

    assert res["requires_context"] is True
    assert res["plan"] == ["transformer architecture survey", "self-attention improvements"]
    assert res["current_node"] == "planner"


@pytest.mark.asyncio
async def test_planner_structured_output_as_dict():
    """Verify that if the LLM provider returns a raw dict instead of a Pydantic object, it is parsed cleanly."""
    from agents.langgraph.nodes.planner_node import planner_node

    state = {
        "query": "What are the latest transformer developments in my uploaded paper?",
        "history": [],
        "mode": "agent",
        "workflow_type": "research",
        "selected_llm_provider": "google",
        "selected_llm_model": "gemini-2.5-flash",
        "filename": "transformers.pdf",
    }

    mock_llm = MagicMock()
    mock_structured = MagicMock()
    # Return a raw dict (as some LLM providers / fallback formats do)
    mock_structured.ainvoke = AsyncMock(
        return_value={
            "requires_context": True,
            "queries": ["transformer advancements", "attention query"],
            "reasoning": "Dictionary response handled."
        }
    )
    mock_llm.with_structured_output.return_value = mock_structured

    with patch("core.llm_factory.get_fallback_providers", return_value=["google"]), \
         patch("agents.langgraph.nodes.planner_node.get_llm", return_value=mock_llm):
        # pyrefly: ignore[bad-argument-type]
        res = await planner_node(state)

    assert res["requires_context"] is True
    assert res["plan"] == ["transformer advancements", "attention query"]
    assert res["current_node"] == "planner"
