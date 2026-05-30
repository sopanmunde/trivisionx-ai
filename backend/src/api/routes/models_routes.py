"""
src/api/routes/models_routes.py — Available AI models and RAG configuration
===========================================================================
GET /api/models  — returns all configured LLM models, embeddings, and
                   current RAG pipeline settings. Used by the frontend
                   settings panel and external integrations.
"""
from fastapi import APIRouter
from src.core.config import settings

router = APIRouter()


@router.get("/", summary="List available AI models and RAG configuration")
async def get_models():
    """
    GET /api/models/

    Returns the active LLM, embedding model, and RAG configuration so the
    frontend settings panel and external tools can reflect the live state.
    """
    return {
        "llm": {
            "provider": "Google Gemini",
            "chat_model": settings.GEMINI_MODEL,
            "planning_model": settings.GEMINI_MODEL,
            "temperature": 0.2,
            "streaming": True,
        },
        "embeddings": {
            "provider": "HuggingFace",
            "model": "sentence-transformers/all-MiniLM-L12-v2",
            "dimensions": 384,
            "batch_size": 32,
        },
        "rag": {
            "chunk_size": settings.CHUNK_SIZE,
            "chunk_overlap": settings.CHUNK_OVERLAP,
            "retrieval_top_k": settings.RETRIEVAL_TOP_K,
            "retrieval_strategy": "MMR (Maximal Marginal Relevance)",
            "mmr_lambda": 0.6,
            "context_compression": True,
        },
        "vector_store": {
            "provider": "Pinecone",
            "index": settings.PINECONE_INDEX_NAME,
            "environment": settings.PINECONE_ENVIRONMENT,
            "metric": "cosine",
        },
        "agents": [
            {
                "name": "Research Planner",
                "node": "planner",
                "role": "Analyzes query intent and generates targeted search strategy",
                "model": settings.GEMINI_MODEL,
            },
            {
                "name": "Retrieval Agent",
                "node": "retriever",
                "role": "Queries Pinecone with MMR for diverse, relevant document chunks",
                "model": "Pinecone semantic search",
            },
            {
                "name": "Citation Agent",
                "node": "citation",
                "role": "De-duplicates and confidence-scores source references",
                "model": "deterministic",
            },
            {
                "name": "Summarization Agent",
                "node": "summarizer",
                "role": "Synthesizes retrieved context into cited markdown answers",
                "model": settings.GEMINI_MODEL,
            },
            {
                "name": "Report Agent",
                "node": "reporter",
                "role": "Assembles final output with formatted citations section",
                "model": "deterministic",
            },
        ],
        "pipeline": "LangGraph 5-node multi-agent research workflow",
        "version": settings.VERSION,
    }
