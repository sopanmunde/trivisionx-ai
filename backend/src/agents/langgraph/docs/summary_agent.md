# ✨ Summary Agent

**Node:** `summarizer_node`  
**File:** [`summarizer_node.py`](../nodes/summarizer_node.py)  
**Role:** Synthesizes retrieved documents or LLM knowledge into markdown answers  

## Purpose

The core response-generation agent. It takes either retrieved document chunks (from the Retrieval Agent) or generates answers from the LLM's knowledge, producing well-structured markdown output with inline citations.

## Adaptive System Prompts

The Summary Agent selects a different system prompt based on the workflow type:

| Workflow | Prompt | Behavior |
|----------|--------|----------|
| **Research** (with docs) | `SUMMARIZER_SYSTEM_RESEARCH` | Strict grounding — only uses provided context, cites sources |
| **Research** (no docs) | `SUMMARIZER_SYSTEM_SIMPLE` | General knowledge answers, no citation enforcement |
| **Coding** | `SUMMARIZER_SYSTEM_CODING` | Expert software engineer mode with code blocks |
| **Data Analysis** | `SUMMARIZER_SYSTEM_DATA_ANALYSIS` | Data scientist mode with tables and insights |

## Conversation History

Injects the last 6 turns of conversation history for multi-turn coherence.

## Content Normalization

Uses `extract_text()` from `nodes/utils.py` to safely handle provider-specific content formats (e.g., Gemini's list-of-blocks format).

## State Updates

| Field | Value |
|-------|-------|
| `summary` | The synthesized markdown answer |
| `current_node` | `"summarizer"` |

## LLM Configuration

- **Temperature:** 0.2 (factual) or 0.3 (general)
- **Provider:** User-selected via `selected_llm_provider`
- **Coding fallback:** Defaults to `openai/gpt-4o-mini` if no provider specified
