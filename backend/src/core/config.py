"""
src/core/config.py — Centralised application settings
======================================================
Uses pydantic-settings for env-var validation and type coercion.
All configuration is read from the environment / .env file.
"""
import os
import secrets
from functools import lru_cache
from pathlib import Path
from pydantic import model_validator
from pydantic_settings import BaseSettings

_BACKEND_ENV_FILE = str(Path(__file__).resolve().parents[2] / ".env")


class Settings(BaseSettings):
    PROJECT_NAME: str = "TriVisionX"
    VERSION: str = "3.0.0"
    DEBUG: bool = False
    DEFAULT_LLM_PROVIDER: str = "google"

    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "trivisionx_ai"

    @property
    def MONGO_URI(self) -> str:
        return self.MONGODB_URL

    @property
    def MONGO_DB_NAME(self) -> str:
        return self.DATABASE_NAME

    SECRET_KEY: str = ""
    ENCRYPTION_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    @model_validator(mode="after")
    def _validate_and_populate_secrets(self) -> "Settings":
        import sys

        insecure_literals = {
            "fallback-secret-change-in-production",
            "secret",
            "changeme",
            "change-me",
        }
        secret = self.SECRET_KEY.strip()
        if secret.lower() in insecure_literals:
            raise ValueError("SECRET_KEY uses a known insecure placeholder value.")

        is_test = bool(os.getenv("PYTEST_CURRENT_TEST") or "pytest" in sys.modules)
        if not secret:
            if self.DEBUG or is_test:
                self.SECRET_KEY = secrets.token_urlsafe(48)
                self._ephemeral_secret_generated = True  # type: ignore[attr-defined]
            else:
                raise ValueError(
                    "SECRET_KEY must be set to a strong non-empty value (>= 32 chars) when DEBUG=False."
                )
        elif not (self.DEBUG or is_test) and len(secret) < 32:
            raise ValueError(
                "SECRET_KEY must be at least 32 characters long when DEBUG=False."
            )
        else:
            self.SECRET_KEY = secret
            self._ephemeral_secret_generated = False  # type: ignore[attr-defined]
        return self

    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "trivisionx-ui"
    PINECONE_ENVIRONMENT: str = "us-east-1"

    TAVILY_API_KEY: str = ""
    SERPAPI_API_KEY: str = ""
    BRAVE_API_KEY: str = ""
    FIRECRAWL_API_KEY: str = ""
    JINA_API_KEY: str = ""  # optional — Jina Reader works without a key
    GITHUB_TOKEN: str = ""
    CODE_EXECUTION_TIMEOUT_SECONDS: int = 30
    CODE_EXECUTION_WORKSPACE: str = "./workspace"
    ELEVENLABS_API_KEY: str = ""

    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_CHAT_MODEL: str = "claude-sonnet-4-20250514"

    GOOGLE_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    REDIRECT_URI: str = "http://localhost:3000/login"

    GROQ_API_KEY: str = ""
    GROQ_CHAT_MODEL: str = "llama-3.3-70b-versatile"

    MISTRAL_API_KEY: str = ""
    MISTRAL_CHAT_MODEL: str = "mistral-large-latest"

    OPENAI_API_KEY: str = ""
    OPENAI_CHAT_MODEL: str = "gpt-4o"

    COHERE_API_KEY: str = ""
    COHERE_CHAT_MODEL: str = "command-r-plus"

    OLLAMA_ENDPOINT: str = ""
    LMSTUDIO_ENDPOINT: str = ""
    VLLM_ENDPOINT: str = ""
    CUSTOM_ENDPOINT: str = ""

    EMBEDDING_PROVIDER: str = "google"
    EMBEDDING_MODEL: str = "models/gemini-embedding-001"
    EMBEDDING_DIMENSION: int = 384

    FRONTEND_URL: str = "http://localhost:3000"

    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    RETRIEVAL_TOP_K: int = 6

    RATE_LIMIT_PER_MINUTE: int = 60

    REDIS_URL: str = ""
    REDIS_TTL_SECONDS: int = 3600

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""

    model_config = {
        "env_file": _BACKEND_ENV_FILE,
        "env_file_encoding": "utf-8",
        "extra": "ignore",
        "case_sensitive": False,
    }


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
