"""
src/agents/langgraph/nodes/retriever_node.py — Retrieval Agent
===============================================================
Corresponds to "Retrieval agent" in the image workflow.

Implements the "Retrieve — Semantic MMR rerank" pipeline step:
  - Executes each planned search query against Pinecone
  - Uses MMR (Maximal Marginal Relevance) for diversity-aware reranking
  - Deduplicates results across multiple queries
  - Attaches structured citation metadata
"""
from typing import List, Dict
from src.agents.langgraph.state import AgentState
from src.rag.vectorstores.pinecone_store import get_mmr_retriever
from src.rag.retrieval.citation_retriever import format_citation
from src.core.constants import DEFAULT_TOP_K
from src.core.logger import get_logger

logger = get_logger(__name__)


async def retriever_node(state: AgentState) -> dict:
    """
    Retrieval Agent — queries Pinecone with MMR for diverse, relevant chunks.

    For each query in the research plan:
      1. Run MMR retrieval (semantic + diversity rerank)
      2. Collect docs + format citations
      3. Cross-query deduplication by doc_id (content hash)
    """
    plan = state.get("plan", [])
    query = state.get("query", "")
    user_id = state.get("user_id")

    # Fallback: if planner produced no plan, use original query directly
    search_queries = plan if plan else [query]
    user_filter = {"user_id": user_id} if user_id else None

    logger.info(
        f"[Retrieval Agent] Running {len(search_queries)} queries "
        f"(user_filter={'set' if user_filter else 'none'})"
    )

    # Use MMR retriever directly — this is the 'Semantic MMR rerank' step
    retriever = get_mmr_retriever(top_k=DEFAULT_TOP_K, filter=user_filter)

    all_docs: List[Dict] = []
    all_citations: List[Dict] = []
    seen_doc_ids: set = set()

    import asyncio
    import hashlib
    
    # Run all queries concurrently to reduce latency
    async def fetch_docs(sq: str):
        try:
            return await retriever.ainvoke(sq)
        except Exception as e:
            logger.warning(f"[Retrieval Agent] Query failed: '{sq[:60]}' — {e}")
            return []

    results = await asyncio.gather(*(fetch_docs(sq) for sq in search_queries))

    for docs in results:
        for i, doc in enumerate(docs):
            # Compute content-based ID for cross-query dedup
            raw = (
                doc.metadata.get("filename", "")
                + str(doc.metadata.get("chunk_index", ""))
                + doc.page_content[:100]
            )
            doc_id = hashlib.sha1(raw.encode()).hexdigest()[:12]

            if doc_id in seen_doc_ids:
                continue
            seen_doc_ids.add(doc_id)

            all_docs.append({
                "page_content": doc.page_content,
                "metadata": doc.metadata,
                "doc_id": doc_id,
            })
            all_citations.append(format_citation(doc, len(all_citations)))

    logger.info(
        f"[Retrieval Agent] {len(all_docs)} unique chunks, "
        f"{len(all_citations)} citations (from {len(search_queries)} queries)"
    )

    return {
        "retrieved_docs": all_docs,
        "citations": all_citations,
        "current_node": "retriever",
    }
