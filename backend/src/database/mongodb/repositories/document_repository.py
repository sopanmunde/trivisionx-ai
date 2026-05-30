"""Document repository — stores metadata of indexed documents."""
from datetime import datetime, timezone
from typing import List, Dict, Optional
from src.database.mongodb.connection import get_database
from src.core.constants import COLLECTION_DOCUMENTS
from src.core.logger import get_logger

logger = get_logger(__name__)


def _db():
    return get_database()


async def save_document_metadata(
    user_id: str,
    filename: str,
    file_type: str,
    chunk_count: int,
    extra: Dict = None,
) -> str:
    result = await _db()[COLLECTION_DOCUMENTS].insert_one({
        "user_id": user_id,
        "filename": filename,
        "file_type": file_type,
        "chunk_count": chunk_count,
        "uploaded_at": datetime.now(timezone.utc),
        **(extra or {}),
    })
    logger.info(f"Saved document metadata: {filename} ({chunk_count} chunks)")
    return str(result.inserted_id)


async def get_user_documents(user_id: str, limit: int = 50) -> List[Dict]:
    docs = await _db()[COLLECTION_DOCUMENTS].find(
        {"user_id": user_id}
    ).sort("uploaded_at", -1).limit(limit).to_list(limit)
    for d in docs:
        d["id"] = str(d.pop("_id"))
        if "uploaded_at" in d and hasattr(d["uploaded_at"], "isoformat"):
            d["uploaded_at"] = d["uploaded_at"].isoformat()
    return docs
