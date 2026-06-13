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
    PROJECT_NAME: str = "TriVisionX AI"
    VERSION: str = "3.0.0"
    DEBUG: bool = False
    DEFAULT_LLM_PROVIDER: str = "google"

    # ── MongoDB ───────────────────────────────────────────────────────────────
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "trivisionx_ai"

    @property
    def MONGO_URI(self) -> str:
        return self.MONGODB_URL

    @property
    def MONGO_DB_NAME(self) -> str:
        return self.DATABASE_NAME

    # ── Security / JWT ────────────────────────────────────────────────────────
    SECRET_KEY: str = "fallback-secret-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # ── Pinecone ──────────────────────────────────────────────────────────────
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "trivisionx-ui"
    PINECONE_ENVIRONMENT: str = "us-east-1"

    # ── Anthropic ─────────────────────────────────────────────────────────────
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_CHAT_MODEL: str = "claude-sonnet-4-20250514"

    # ── Google / Gemini ───────────────────────────────────────────────────────
    GOOGLE_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # ── Google OAuth2 SSO ───────────────────────────────────────────────────
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    REDIRECT_URI: str = "http://localhost:3000/login"

    # ── GitHub OAuth2 SSO ─────────────────────────────────────────────────
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    REDIRECT_URI: str = "http://localhost:3000/login"

    # ── Groq ──────────────────────────────────────────────────────────────────
    GROQ_API_KEY: str = ""
    GROQ_CHAT_MODEL: str = "llama-3.3-70b-versatile"

    # ── Mistral ───────────────────────────────────────────────────────────────
    MISTRAL_API_KEY: str = ""
    MISTRAL_CHAT_MODEL: str = "mistral-large-latest"

    # ── Embedding model ───────────────────────────────────────────────────────
    EMBEDDING_PROVIDER: str = "google"
    EMBEDDING_MODEL: str = "models/gemini-embedding-001"
    EMBEDDING_DIMENSION: int = 384

    # ── Frontend ──────────────────────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:3000"

    # ── RAG settings ──────────────────────────────────────────────────────────
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    RETRIEVAL_TOP_K: int = 6

    # ── Rate limiting ─────────────────────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 60

    # ── Redis (optional) ──────────────────────────────────────────────────────
    REDIS_URL: str = ""
    REDIS_TTL_SECONDS: int = 3600

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
        "case_sensitive": False,
    }


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
