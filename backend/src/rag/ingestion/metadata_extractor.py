"""Metadata extractor — enriches document chunks before indexing."""
from datetime import datetime, timezone
from typing import List
from langchain_core.documents import Document


def enrich_metadata(
    chunks: List[Document],
    user_id: str,
    filename: str,
    extra: dict = None,
) -> List[Document]:
    """
    Adds standardised metadata to each chunk so it can be:
      - filtered by user_id during retrieval
      - traced back to source filename + upload timestamp
      - referenced in citation panels
    """
    upload_ts = datetime.now(timezone.utc).isoformat()
    for i, chunk in enumerate(chunks):
        chunk.metadata.update({
            "user_id": user_id,
            "filename": filename,
            "source": filename,
            "chunk_index": i,
            "total_chunks": len(chunks),
            "uploaded_at": upload_ts,
            **(extra or {}),
        })
    return chunks
