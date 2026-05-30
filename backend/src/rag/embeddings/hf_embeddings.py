"""
src/rag/embeddings/hf_embeddings.py — HuggingFace embeddings singleton
======================================================================
Uses sentence-transformers/all-MiniLM-L12-v2
Lazy-initialised and cached via lru_cache.
"""
from functools import lru_cache
from langchain_huggingface import HuggingFaceEmbeddings
from src.core.logger import get_logger

logger = get_logger(__name__)

@lru_cache(maxsize=1)
def get_embeddings() -> HuggingFaceEmbeddings:
    """
    Returns a cached HuggingFace embeddings instance.
    Model: sentence-transformers/all-MiniLM-L12-v2
    """
    model_name = "sentence-transformers/all-MiniLM-L12-v2"
    logger.info(f"Initializing HuggingFace embeddings: {model_name}")
    return HuggingFaceEmbeddings(model_name=model_name)
