"""
backend/tests/test_supervisor.py — Unit tests for Supervisor Agent
===================================================================
Tests for supervisor_node decision structure, fast-path greeting handling,
file attachment handling, and LLM output parsing.
"""
import pytest
import sys
import os
from unittest.mock import AsyncMock, patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))


def test_supervisor_decision_schema():
    from agents.langgraph.nodes.supervisor_node import SupervisorDecision

    decision = SupervisorDecision(
        selected_agent="coding",
        trip_constraint="needs_code_sandbox",
        reasoning="User requested writing a Python function."
    )
    assert decision.selected_agent == "coding"
    assert decision.trip_constraint == "needs_code_sandbox"
    assert "Python" in decision.reasoning


@pytest.mark.asyncio
async def test_supervisor_fast_path_greeting():
    from agents.langgraph.nodes.supervisor_node import supervisor_node

    state = {
        "query": "Hello",
        "history": [],
        "selected_llm_provider": "google",
        "selected_llm_model": "gemini-2.5-flash",
        "filename": "",
    }

    res = await supervisor_node(state)

    assert res["workflow_type"] == "summary"
    assert res["current_node"] == "supervisor"
    assert res["supervisor_decision"]["selected_agent"] == "summary"
    assert res["supervisor_decision"]["trip_constraint"] == "greeting"


@pytest.mark.asyncio
async def test_supervisor_node_classification():
    from agents.langgraph.nodes.supervisor_node import supervisor_node, SupervisorDecision

    state = {
        "query": "Write a Python script to filter JSON data",
        "history": [],
        "selected_llm_provider": "google",
        "selected_llm_model": "gemini-2.5-flash",
        "filename": "",
    }

    mock_llm = MagicMock()
    mock_structured = MagicMock()
    mock_structured.ainvoke = AsyncMock(
        return_value=SupervisorDecision(
            selected_agent="coding",
            trip_constraint="needs_code_sandbox",
            reasoning="Coding request for Python JSON filtering."
        )
    )
    mock_llm.with_structured_output.return_value = mock_structured

    with patch("agents.langgraph.nodes.supervisor_node.get_fallback_providers", return_value=["google"]), \
         patch("agents.langgraph.nodes.supervisor_node.get_llm", return_value=mock_llm):
        res = await supervisor_node(state)

    assert res["workflow_type"] == "coding"
    assert res["supervisor_decision"]["selected_agent"] == "coding"
    assert res["supervisor_decision"]["trip_constraint"] == "needs_code_sandbox"


@pytest.mark.asyncio
async def test_supervisor_node_fallback_on_error():
    from agents.langgraph.nodes.supervisor_node import supervisor_node

    state = {
        "query": "Analyze this dataset for me",
        "history": [],
        "selected_llm_provider": "google",
        "selected_llm_model": "gemini-2.5-flash",
        "filename": "",
    }

    with patch("agents.langgraph.nodes.supervisor_node.get_llm", side_effect=RuntimeError("Provider unavailable")):
        res = await supervisor_node(state)

    assert res["workflow_type"] == "research"
    assert res["supervisor_decision"]["selected_agent"] == "research"
    assert res["supervisor_decision"]["trip_constraint"] == "fallback"
