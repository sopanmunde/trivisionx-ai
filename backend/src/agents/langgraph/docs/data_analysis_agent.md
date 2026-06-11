# 📈 Data Analysis Agent

**Node:** `data_analysis_node`  
**File:** [`data_analysis_node.py`](../nodes/data_analysis_node.py)  
**Role:** Analyzes data, generates insights, and produces structured analysis  

## Purpose

Handles data-centric queries within the **Data Analysis Workflow**. Provides structured analysis output with methodology explanations, key insights, code implementations, and visualization suggestions.

## Pipeline Position

```
planner → data_analysis → summarizer → reporter
```

## Output Structure

```markdown
## Analysis Approach
[Methodology explanation]

## Key Insights
[Data findings]

## Code / Implementation
[Relevant analysis code]

## Visualization Suggestions
[Chart and visualization recommendations]
```

## System Prompt Capabilities

1. Dataset analysis methodology recommendations
2. Specific analysis techniques (regression, clustering, etc.)
3. Code snippets for implementation
4. Markdown tables for summary statistics
5. Visualization recommendations (chart types, axes)
6. Clear methodology and assumptions

## State Updates

| Field | Value |
|-------|-------|
| `analysis_results` | The structured analysis output |
| `current_node` | `"data_analysis"` |

## LLM Configuration

- **Temperature:** 0.2
- **Default provider:** `openai/gpt-4o-mini`
- **History:** Last 4 conversation turns
