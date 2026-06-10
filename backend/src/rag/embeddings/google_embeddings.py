"""
src/rag/embeddings/google_embeddings.py — Google GenAI embeddings singleton
======================================================================
Uses Google Generative AI Embeddings (models/embedding-001).
Lazy-initialised and cached via lru_cache.
"""
from functools import lru_cache
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from src.core.logger import get_logger
from src.core.config import settings

logger = get_logger(__name__)

@lru_cache(maxsize=1)
def get_embeddings() -> GoogleGenerativeAIEmbeddings:
    """
    Returns a cached Google Generative AI Embeddings instance.
    Model: models/embedding-001
    """
    if not settings.GOOGLE_API_KEY:
        raise RuntimeError("GOOGLE_API_KEY is not set. Add it to your .env file.")

    model_name = "models/embedding-001"
    logger.info(f"Initializing Google GenAI embeddings: {model_name}")
    return GoogleGenerativeAIEmbeddings(
        model=model_name,
        google_api_key=settings.GOOGLE_API_KEY
    )
