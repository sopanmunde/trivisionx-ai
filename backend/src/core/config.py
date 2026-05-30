"""
src/core/config.py — Centralised application settings
======================================================
Uses pydantic-settings for env-var validation and type coercion.
All configuration is read from the environment / .env file.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────────────────────────
    PROJECT_NAME: str = "AI Research Copilot"
    VERSION: str = "3.0.0"
    DEBUG: bool = False

    # ── MongoDB ───────────────────────────────────────────────────────────────
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "trishul_ai"

    # Aliases kept for backward compat with old env var names
    @property
    def MONGO_URI(self) -> str:  # noqa: N802
        return self.MONGODB_URL

    @property
    def MONGO_DB_NAME(self) -> str:  # noqa: N802
        return self.DATABASE_NAME

    # ── Security / JWT ────────────────────────────────────────────────────────
    SECRET_KEY: str = "fallback-secret-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 h

    # ── Pinecone ──────────────────────────────────────────────────────────────
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "trishul-ui"
    PINECONE_ENVIRONMENT: str = "us-east-1"

    # ── OpenAI ────────────────────────────────────────────────────────────────
    OPENAI_API_KEY: str = ""
    OPENAI_CHAT_MODEL: str = "gpt-4o"
    # text-embedding-3-large matches the image workflow spec (higher quality)
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-large"

    # ── Google / Gemini fallback ──────────────────────────────────────────────
    GOOGLE_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # ── Frontend ──────────────────────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:3000"

    # ── RAG settings ──────────────────────────────────────────────────────────
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    RETRIEVAL_TOP_K: int = 6

    # ── Rate limiting ─────────────────────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 60

    # ── Redis (optional) ──────────────────────────────────────────────────────
    # Leave empty to disable caching entirely (graceful fallback)
    REDIS_URL: str = ""
    REDIS_TTL_SECONDS: int = 3600  # 1 hour

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",           # ignore unknown env vars
        "case_sensitive": False,
    }


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
