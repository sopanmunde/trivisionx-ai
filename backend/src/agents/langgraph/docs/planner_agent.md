# 🧠 Smart Router Agent (Planner)

**Node:** `planner_node`  
**File:** [`planner_node.py`](../nodes/planner_node.py)  
**Role:** Entry point for every Agent Mode request  

## Purpose

The Smart Router analyzes the user's query and conversation history to determine the optimal execution path through the LangGraph pipeline. It acts as a traffic controller, deciding whether the query needs external document context (vector DB retrieval) or can be answered directly from the LLM's knowledge.

## Decision Logic

```
User Query
    │
    ├── workflow_type == "coding"       → Skip retrieval → code_generation
    ├── workflow_type == "data_analysis" → Skip retrieval → data_analysis  
    ├── workflow_type == "summary"       → Skip retrieval → summarizer
    ├── Greeting detected ("hi","hello") → Fast-path greeting response
    │
    └── Research / Technical / Competitive workflows:
        │
        ├── LLM decides: requires_context = true
        │   → Generates 2-4 search queries → retriever_node
        │
        └── LLM decides: requires_context = false
            → Empty plan → summarizer_node (direct LLM answer)
```

## Structured Output

Uses Pydantic's `PlannerDecision` model with `with_structured_output()`:

```python
class PlannerDecision(BaseModel):
    requires_context: bool   # Does this need vector DB lookup?
    queries: List[str]       # 2-4 search queries (empty if no context needed)
    reasoning: str           # Brief explanation of routing decision
```

## State Updates

| Field | Value |
|-------|-------|
| `plan` | List of search queries (or empty) |
| `requires_context` | `True` / `False` |
| `current_node` | `"planner"` |

## LLM Configuration

- **Temperature:** 0.1 (deterministic routing)
- **Provider:** Uses the user-selected LLM from `selected_llm_provider`
