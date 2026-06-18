"""
src/main.py — FastAPI Application Factory (v3)
==============================================
Clean factory used by backend/index.py.
All routers, middleware, and lifespan events are registered here.

Architecture (matches image workflow):
  Frontend (Next.js) → JWT + SSE → FastAPI Gateway
    /api/auth     — Auth service (JWT · MongoDB Sessions)
    /api/chat     — RAG service + Agent service (LangGraph)
    /api/documents — Doc service (PDF/DOCX/TXT · Chunking)
    /api/reports  — Report service (Markdown · structured output)
    /api/conversations — Conversation history
    /api/health   — Health check
"""
print("Importing main.py... Fastapi")
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from src.middleware.fastapi_compression import CompressionMiddleware

print("Importing config...")
from src.core.config import settings
from src.core.logger import get_logger
print("Importing mongo indexes...")
from src.database.mongodb.indexes import create_indexes
from src.middleware.request_logger import RequestLoggerMiddleware

# ── Routers ───────────────────────────────────────────────────────────────────
print("Importing routers...")
from src.api.routes.auth_routes import router as auth_router
from src.api.routes.google_auth import router as google_auth_router
from src.api.routes.github_auth import router as github_auth_router
from src.api.routes.chat_routes import router as chat_router
from src.api.routes.upload_routes import router as upload_router
from src.api.routes.report_routes import router as report_router
from src.api.routes.health_routes import router as health_router
from src.api.routes.models_routes import router as models_router
from src.api.conversations import router as conversations_router

logger = get_logger(__name__)
print("main.py imports complete.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup: initialise all external connections.
    All failures are non-fatal (warnings) so the app can start degraded.
    """
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")

    # MongoDB indexes
    try:
        await create_indexes()
        logger.info("[OK] MongoDB indexes ready")
    except Exception as e:
        logger.error(f"MongoDB index creation failed: {e}")

    # Pinecone vector store
    try:
        from src.rag.vectorstores.pinecone_store import get_vector_store
        get_vector_store()
        logger.info("[OK] Pinecone vector store connected")
    except Exception as e:
        logger.warning(f"Pinecone connection failed (non-fatal): {e}")

    # LangGraph workflow pre-compilation
    try:
        from src.agents.langgraph.graph import get_graph
        get_graph()
        logger.info("[OK] LangGraph 5-agent workflow compiled")
    except Exception as e:
        logger.warning(f"LangGraph compilation failed (non-fatal): {e}")

    # Redis cache (optional)
    try:
        from src.core.cache import _get_client
        client = await _get_client()
        if client:
            logger.info("[OK] Redis cache connected")
        else:
            logger.info("Redis cache disabled (REDIS_URL not set)")
    except Exception as e:
        logger.warning(f"Redis check failed (non-fatal): {e}")

    logger.info("Application ready [OK]")
    yield
    try:
        from src.core.http import close_http_client
        await close_http_client()
        logger.info("[OK] Shared HTTP client closed")
    except Exception as e:
        logger.warning(f"Failed to close shared HTTP client: {e}")
    logger.info("Application shutdown complete")


def create_app() -> FastAPI:
    """Application factory — returns a configured FastAPI instance."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=(
            "TriVisionX — LangGraph 5-agent pipeline · "
            "Pinecone MMR retrieval · GPT-4o synthesis · MongoDB + Redis"
        ),
        version=settings.VERSION,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    origins = [
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "https://trivisionx-ai.vercel.app",
    ]
    # Deduplicate while preserving order
    origins = list(dict.fromkeys(o for o in origins if o))

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])
    app.add_middleware(RequestLoggerMiddleware)
    app.add_middleware(
        CompressionMiddleware,
        minimum_size=1000,
        exclude_paths=["/api/chat/"],
    )

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(auth_router,          prefix="/api/auth",                tags=["auth"])
    app.include_router(google_auth_router,   prefix="/api/auth/google",         tags=["auth-google"])
    app.include_router(github_auth_router,   prefix="/api/auth/github",         tags=["auth-github"])
    # Legacy alias: /api/me, /api/login, /api/register → same auth routes
    app.include_router(auth_router,          prefix="/api",                     tags=["auth-legacy"])
    app.include_router(conversations_router, prefix="/api/conversations",       tags=["conversations"])
    app.include_router(chat_router,          prefix="/api/chat",                tags=["chat"])
    app.include_router(upload_router,        prefix="/api/documents",           tags=["documents"])
    app.include_router(report_router,        prefix="/api/reports",             tags=["reports"])
    # Alias: /api/research-sessions → same data as /api/reports/history
    app.include_router(report_router,        prefix="/api/research-sessions",   tags=["research-sessions"])
    app.include_router(models_router,        prefix="/api/models",              tags=["models"])
    app.include_router(health_router,        prefix="/api/health",              tags=["health"])

    @app.get("/", tags=["root"])
    async def root():
        return {
            "message": f"{settings.PROJECT_NAME} is running",
            "version": settings.VERSION,
            "docs": "/docs",
        }

    return app
