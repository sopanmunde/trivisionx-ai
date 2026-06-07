"""LLM Service — centralized factory for Gemini models."""
from functools import lru_cache
from langchain_google_genai import ChatGoogleGenerativeAI
from src.core.config import settings
from src.core.logger import get_logger

logger = get_logger(__name__)


@lru_cache(maxsize=4)
def get_chat_llm(model_name: str = None, temperature: float = 0.2) -> ChatGoogleGenerativeAI:
    """
    Returns a cached ChatGoogleGenerativeAI instance.
    """
    if not settings.GOOGLE_API_KEY:
        raise RuntimeError("GOOGLE_API_KEY is not set. Add it to your .env file.")

    logger.info(f"LLM: Google Gemini {model_name or settings.GEMINI_MODEL}")
    return ChatGoogleGenerativeAI(
        model=model_name or settings.GEMINI_MODEL,
        temperature=temperature,
        streaming=True,
        google_api_key=settings.GOOGLE_API_KEY,
        max_output_tokens=1024,  # Cap token output for speed
        max_retries=1,  # Fail fast on rate limits instead of hanging
    )


def get_mini_llm() -> ChatGoogleGenerativeAI:
    """Returns a faster model for lightweight planning tasks."""
    # Use gemini-2.5-flash (same as main LLM) but with minimal tokens for speed
    return ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,  # gemini-2.5-flash — has quota
        temperature=0.1,
        streaming=False,  # No streaming needed for structured planner output
        google_api_key=settings.GOOGLE_API_KEY,
        max_output_tokens=256,  # Planner only needs short structured output
        max_retries=1,  # Fail fast on rate limits instead of hanging
    )
