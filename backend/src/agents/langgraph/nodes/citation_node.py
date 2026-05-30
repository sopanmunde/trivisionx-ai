"""
src/agents/langgraph/nodes/citation_node.py — Citation Agent
============================================================
Corresponds to "Citation agent" in the image workflow.

Responsibilities:
  - De-duplicate citations by doc_id (content hash)
  - Apply confidence scoring based on retrieval rank
  - Ensure consistent citation structure for the frontend panel
"""
from src.agents.langgraph.state import AgentState
from src.core.logger import get_logger

logger = get_logger(__name__)


def citation_node(state: AgentState) -> dict:
    """
    Citation Agent — enriches, deduplicates, and ranks citation metadata.

    Priority: uses citations already built by the Retrieval Agent (with doc_id
    hashes). Falls back to extracting from raw docs if citations are empty.
    """
    existing_citations = state.get("citations", [])
    docs = state.get("retrieved_docs", [])

    if existing_citations:
        # Deduplicate by doc_id (content hash — set by retriever_node)
        seen_ids: set = set()
        enriched: list = []
        for cit in existing_citations:
            doc_id = cit.get("doc_id", cit.get("source", "") + str(cit.get("page", "")))
            if doc_id in seen_ids:
                continue
            seen_ids.add(doc_id)
            rank = len(enriched) + 1
            enriched.append({
                **cit,
                "rank": rank,
                "confidence": round(max(0.95 - (rank - 1) * 0.05, 0.50), 2),
            })

        logger.info(
            f"[Citation Agent] {len(enriched)} citations "
            f"(from {len(existing_citations)} raw, {len(existing_citations) - len(enriched)} dupes removed)"
        )
        return {"citations": enriched, "current_node": "citation"}

    # Fallback: extract citations from raw docs
    citations: list = []
    seen: set = set()
    for i, doc in enumerate(docs):
        meta = doc.get("metadata", {})
        source = meta.get("filename", meta.get("source", "Unknown"))
        page = meta.get("page", "N/A")
        doc_id = doc.get("doc_id", f"{source}::{page}::{i}")

        if doc_id in seen:
            continue
        seen.add(doc_id)

        rank = len(citations) + 1
        citations.append({
            "index": rank,
            "rank": rank,
            "doc_id": doc_id,
            "source": source,
            "filename": source,
            "page": page,
            "chunk_index": meta.get("chunk_index", "N/A"),
            "total_chunks": meta.get("total_chunks", "N/A"),
            "uploaded_at": meta.get("uploaded_at", ""),
            "snippet": doc["page_content"][:200].strip(),
            "confidence": round(max(0.95 - (rank - 1) * 0.05, 0.50), 2),
        })

    logger.info(f"[Citation Agent] Generated {len(citations)} citations from docs (fallback path)")
    return {"citations": citations, "current_node": "citation"}
