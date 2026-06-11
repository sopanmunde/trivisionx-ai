# Agent Architecture Documentation

> AI Research Copilot — LangGraph Multi-Agent System

This directory contains the documentation for all agents in the LangGraph workflow system.

## Agent Index

| Agent | Node Function | File | Purpose |
|-------|--------------|------|---------|
| **Smart Router** | `planner_node` | [planner_node.py](./nodes/planner_node.py) | Analyzes queries and routes to the appropriate pipeline |
| **Retrieval Agent** | `retriever_node` | [retriever_node.py](./nodes/retriever_node.py) | MMR-based semantic search against Pinecone |
| **Citation Agent** | `citation_node` | [citation_node.py](./nodes/citation_node.py) | Deduplicates and scores citations |
| **Summary Agent** | `summarizer_node` | [summarizer_node.py](./nodes/summarizer_node.py) | Synthesizes context into markdown answers |
| **Report Agent** | `report_node` | [report_node.py](./nodes/report_node.py) | Assembles final output with references |
| **Code Generation** | `code_generation_node` | [code_generation_node.py](./nodes/code_generation_node.py) | Generates production-ready code |
| **Code Review** | `code_review_node` | [code_review_node.py](./nodes/code_review_node.py) | Reviews code for bugs and best practices |
| **Testing** | `testing_node` | [testing_node.py](./nodes/testing_node.py) | Generates unit tests for code |
| **Data Analysis** | `data_analysis_node` | [data_analysis_node.py](./nodes/data_analysis_node.py) | Performs data analysis and insights |

## Workflow Graphs

| Workflow | Entry | Pipeline | Graph File |
|----------|-------|----------|------------|
| **Research** | `research` | planner → retriever → citation → summarizer → reporter | [research_graph.py](./graphs/research_graph.py) |
| **Summary** | `summary` | planner → summarizer → reporter | [summary_graph.py](./graphs/summary_graph.py) |
| **Technical** | `technical` | planner → retriever → citation → summarizer → reporter | [technical_graph.py](./graphs/technical_graph.py) |
| **Competitive** | `competitive` | planner → retriever → citation → summarizer → reporter | [competitive_graph.py](./graphs/competitive_graph.py) |
| **Coding** | `coding` | planner → code_generation → code_review → testing → reporter | [coding_graph.py](./graphs/coding_graph.py) |
| **Data Analysis** | `data_analysis` | planner → data_analysis → summarizer → reporter | [data_analysis_graph.py](./graphs/data_analysis_graph.py) |

## Dual Mode System

The system supports two modes selected at the API level:

- **Quick Mode** (`mode=quick`): Bypasses LangGraph entirely. Calls the LLM directly via `llm.astream()` for maximum speed.
- **Agent Mode** (`mode=agent`): Full LangGraph multi-agent pipeline with node transitions streamed to the frontend.

## Multi-LLM Factory

All agents use `src/core/llm_factory.py` to dynamically select the LLM provider. Supported providers:
`openai` · `anthropic` · `google` · `groq` · `mistral` · `ollama` · `deepseek`

## Content Safety

All agent nodes use `src/agents/langgraph/nodes/utils.py:extract_text()` to normalize LLM response content. This handles edge cases where providers return structured content blocks instead of plain strings.
