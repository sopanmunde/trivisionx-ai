"""Pinecone vector store — upgraded with MMR, metadata filtering, and namespaces.

Uses the dynamic embeddings provider from settings.EMBEDDING_PROVIDER."""
from functools import lru_cache
import hashlib
from typing import List, Optional, Dict, Any
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document
from rag.embeddings.google_embeddings import get_embeddings
from core.config import settings
from core.logger import get_logger

logger = get_logger(__name__)


def user_namespace(user_id: Optional[str]) -> Optional[str]:
    return f"user:{user_id}" if user_id else None


def memory_namespace(user_id: str) -> str:
    return f"memory:{user_id}"


def make_chunk_ids(documents: List[Document], namespace_hint: str = "") -> List[str]:
    ids: List[str] = []
    for idx, doc in enumerate(documents):
        meta = doc.metadata or {}
        uid = str(meta.get("user_id") or namespace_hint or "anon")
        fname = str(meta.get("filename") or meta.get("source") or "doc")
        fhash = hashlib.sha1(fname.encode("utf-8")).hexdigest()[:10]
        cidx = meta.get("chunk_index", idx)
        ids.append(f"{uid}:{fhash}:{cidx}:{idx}")
    return ids


@lru_cache(maxsize=1)
def get_vector_store() -> PineconeVectorStore:
    """Returns a cached Pinecone vector store instance with dynamic embeddings."""
    logger.info(
        f"Connecting to Pinecone index: {settings.PINECONE_INDEX_NAME} "
        f"(embedding_provider={settings.EMBEDDING_PROVIDER})"
    )
    import os
    if settings.PINECONE_API_KEY:
        os.environ["PINECONE_API_KEY"] = settings.PINECONE_API_KEY

    return PineconeVectorStore.from_existing_index(
        index_name=settings.PINECONE_INDEX_NAME,
        embedding=get_embeddings(),
    )


def get_semantic_retriever(
    top_k: int = None,
    filter: Optional[Dict] = None,
    namespace: Optional[str] = None,
):
    """Standard semantic similarity retriever with optional metadata filter and namespace."""
    from core.constants import DEFAULT_TOP_K
    k = top_k or DEFAULT_TOP_K
    store = get_vector_store()
    search_kwargs: Dict[str, Any] = {"k": k}
    if filter:
        search_kwargs["filter"] = filter
    if namespace:
        search_kwargs["namespace"] = namespace
    return store.as_retriever(search_type="similarity", search_kwargs=search_kwargs)


def get_mmr_retriever(
    top_k: int = None,
    filter: Optional[Dict] = None,
    namespace: Optional[str] = None,
):
    """
    MMR (Maximal Marginal Relevance) retriever — balances relevance and diversity.
    Reduces redundancy in retrieved chunks.
    """
    from core.constants import DEFAULT_TOP_K, MMR_LAMBDA
    k = top_k or DEFAULT_TOP_K
    store = get_vector_store()
    search_kwargs: Dict[str, Any] = {
        "k": k,
        "fetch_k": k * 3,
        "lambda_mult": MMR_LAMBDA,
    }
    if filter:
        search_kwargs["filter"] = filter
    if namespace:
        search_kwargs["namespace"] = namespace
    return store.as_retriever(search_type="mmr", search_kwargs=search_kwargs)


def add_documents(documents: List[Document], namespace: Optional[str] = None) -> None:
    """Index new documents into Pinecone with optional user namespace isolation."""
    store = get_vector_store()
    ids = make_chunk_ids(documents, namespace_hint=namespace or "")
    kwargs: Dict[str, Any] = {"ids": ids}
    if namespace:
        kwargs["namespace"] = namespace
    store.add_documents(documents, **kwargs)
    logger.info(f"Indexed {len(documents)} chunks into Pinecone (namespace={namespace or 'default'})")


def delete_namespace(namespace: str) -> bool:
    """Delete an entire user/memory namespace from Pinecone."""
    store = get_vector_store()
    try:
        store.index.delete(delete_all=True, namespace=namespace)
        logger.info(f"Deleted Pinecone namespace={namespace}")
        return True
    except Exception as e:
        logger.warning(f"Failed deleting Pinecone namespace={namespace}: {e}")
        return False


def delete_by_filename(user_id: str, filename: str) -> bool:
    """Delete all chunks for a specific user and filename (serverless + pod safe)."""
    store = get_vector_store()
    index = store.index
    ns = user_namespace(user_id)
    fhash = hashlib.sha1(filename.encode("utf-8")).hexdigest()[:10]
    prefix = f"{user_id}:{fhash}:"
    deleted_any = False

    for target_ns in [ns, ""]:
        if target_ns:
            try:
                id_batches = list(index.list(prefix=prefix, namespace=target_ns))
                flat_ids = []
                for batch in id_batches:
                    if isinstance(batch, (list, tuple)):
                        flat_ids.extend(batch)
                    else:
                        flat_ids.append(batch)
                if flat_ids:
                    for i in range(0, len(flat_ids), 100):
                        index.delete(ids=flat_ids[i:i + 100], namespace=target_ns)
                    deleted_any = True
                    continue
            except Exception:
                pass
        try:
            del_kwargs: Dict[str, Any] = {"filter": {"user_id": user_id, "filename": filename}}
            if target_ns:
                del_kwargs["namespace"] = target_ns
            index.delete(**del_kwargs)
            deleted_any = True
        except Exception as e:
            logger.debug(f"Pinecone filter delete skipped for ns='{target_ns}': {e}")

    if deleted_any:
        logger.info(f"Deleted chunks from Pinecone for user={user_id}, filename={filename}")
    return deleted_any
