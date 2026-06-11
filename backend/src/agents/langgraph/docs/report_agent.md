# 📊 Report Agent

**Node:** `report_node`  
**File:** [`report_node.py`](../nodes/report_node.py)  
**Role:** Assembles final markdown output with references and quality scores  

## Purpose

The terminal agent in every workflow. Takes the summary (and optionally code, analysis results, or citations) from upstream agents and assembles the complete markdown response sent to the frontend.

## Output Assembly by Workflow

### Research / Technical / Competitive
```
[Summary markdown]

---

## 📚 References

1. **paper.pdf** — Page 3 _(confidence: 0.95)_
   > Snippet preview...

2. **notes.pdf** _(confidence: 0.90)_ · _2024-01-15_
   > Snippet preview...
```

### Coding
```
[Summary / approach explanation]

```python
[Generated code]
```

**Code Review:**
[Review findings]

**Test Results:**
[Unit tests]
```

### Data Analysis
```
[Summary / methodology]

[Analysis results]

**Visualization data available.**
```

## Quality Score

For research workflows with citations, computes a quality score:

| Metric | Formula |
|--------|---------|
| **Coverage** | `min(100, num_citations * 15 + 40)` |
| **Confidence** | Average confidence score × 100 |
| **Completeness** | `min(100, max(40, len(summary) / 20))` |
| **Overall** | Average of all three |

## State Updates

| Field | Value |
|-------|-------|
| `final_output` | Complete markdown response |
| `quality_score` | `{coverage, confidence, completeness, overall}` |
| `current_node` | `"reporter"` |

## Model

**Deterministic** — no LLM calls. Pure string assembly.
