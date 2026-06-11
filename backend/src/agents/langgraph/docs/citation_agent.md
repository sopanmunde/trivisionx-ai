# 📝 Citation Agent

**Node:** `citation_node`  
**File:** [`citation_node.py`](../nodes/citation_node.py)  
**Role:** Deduplicates, ranks, and enriches citation metadata  

## Purpose

Processes raw citation data from the Retrieval Agent, applying deduplication, confidence scoring, and consistent formatting for the frontend citations panel.

## How It Works

1. Receives citations from the Retriever (or raw docs as fallback)
2. Deduplicates by `doc_id` hash
3. Assigns rank-based confidence scores: `0.95 → 0.50` (decaying by 0.05 per rank)
4. Ensures consistent citation structure with all required fields

## Confidence Scoring

```
Rank 1 → 0.95
Rank 2 → 0.90
Rank 3 → 0.85
...
Rank 10+ → 0.50 (floor)
```

## Citation Structure

```json
{
  "rank": 1,
  "doc_id": "abc123def456",
  "source": "research_paper.pdf",
  "filename": "research_paper.pdf",
  "page": "3",
  "chunk_index": 2,
  "total_chunks": 15,
  "uploaded_at": "2024-01-15T10:30:00Z",
  "snippet": "First 200 chars of the document chunk...",
  "confidence": 0.95
}
```

## Workflow Awareness

- **Coding / Data Analysis** workflows: Returns empty citations (no document retrieval)
- **Research / Technical / Competitive** workflows: Full citation processing

## State Updates

| Field | Value |
|-------|-------|
| `citations` | Enriched, deduplicated citation list |
| `current_node` | `"citation"` |

## Model

**Deterministic** — no LLM calls. Pure algorithmic processing.
