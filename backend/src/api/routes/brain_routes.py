"""Brain routes — REST API endpoints for LLM configurations, api keys, and telemetry logs in MongoDB."""
from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

from core.security import get_current_user
from core.limiter import limiter
from core.constants import RATE_LIMIT_DEFAULT
from database.mongodb.repositories.brain_repository import (
    get_user_providers,
    update_provider_db,
    get_user_keys,
    get_user_decrypted_keys,
    create_key_db,
    update_key_db,
    delete_key_db,
    log_telemetry_event_db,
    get_telemetry_logs_db,
    get_telemetry_stats_db,
)
from database.mongodb.repositories.user_memory_repository import (
    get_user_facts,
    save_user_fact,
    delete_user_fact,
)
from core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


# ─── Pydantic Request Models for Strict Validation ───

class ProviderUpdateModel(BaseModel):
    isActive: Optional[bool] = None
    endpoint: Optional[str] = None
    latency: Optional[int] = Field(None, ge=0)
    tokensPerSec: Optional[int] = Field(None, ge=0)
    status: Optional[str] = None
    usageTokens: Optional[int] = Field(None, ge=0)
    usageCost: Optional[float] = Field(None, ge=0.0)

class ApiKeyCreateModel(BaseModel):
    providerId: str = Field(..., min_length=1, max_length=100)
    label: str = Field(..., min_length=1, max_length=100)
    key: str = Field(..., min_length=1, max_length=500)
    isActive: Optional[bool] = True

class ApiKeyUpdateModel(BaseModel):
    label: Optional[str] = Field(None, min_length=1, max_length=100)
    key: Optional[str] = Field(None, min_length=1, max_length=500)
    isActive: Optional[bool] = None
    lastUsed: Optional[str] = None

class TelemetryLogModel(BaseModel):
    model: str
    provider: Optional[str] = "openai"
    tokensIn: int = Field(0, ge=0)
    tokensOut: int = Field(0, ge=0)
    latency: int = Field(0, ge=0)
    status: int = Field(200, ge=100, le=599)
    traceId: Optional[str] = None
    cost: float = Field(0.0, ge=0.0)
    cacheHit: bool = False
    error: Optional[str] = None


# ─── Providers Endpoints ───

@router.get("/providers", response_model=List[Dict])
@limiter.limit(RATE_LIMIT_DEFAULT)
async def list_providers(request: Request, current_user=Depends(get_current_user)):
    """Retrieve all LLM providers configurations for the active user."""
    user_id = str(current_user["_id"])
    return await get_user_providers(user_id)


@router.put("/providers/{provider_id}", response_model=Dict)
@limiter.limit(RATE_LIMIT_DEFAULT)
async def update_provider(
    request: Request,
    provider_id: str,
    updates: ProviderUpdateModel,
    current_user=Depends(get_current_user),
):
    """Update active status or endpoint details of a provider."""
    user_id = str(current_user["_id"])
    update_data = updates.model_dump(exclude_unset=True)
    result = await update_provider_db(user_id, provider_id, update_data)
    if not result:
        raise HTTPException(status_code=404, detail="Provider not found or updates empty")
    return result


# ─── API Keys Endpoints ───

@router.get("/keys", response_model=List[Dict])
@limiter.limit(RATE_LIMIT_DEFAULT)
async def list_keys(request: Request, current_user=Depends(get_current_user)):
    """Retrieve all registered API keys for the active user."""
    user_id = str(current_user["_id"])
    return await get_user_keys(user_id)


@router.post("/keys", response_model=Dict)
@limiter.limit(RATE_LIMIT_DEFAULT)
async def add_key(
    request: Request,
    key_data: ApiKeyCreateModel,
    current_user=Depends(get_current_user),
):
    """Add a new API key."""
    user_id = str(current_user["_id"])
    return await create_key_db(user_id, key_data.model_dump())


@router.put("/keys/{key_id}", response_model=Dict)
@limiter.limit(RATE_LIMIT_DEFAULT)
async def update_key(
    request: Request,
    key_id: str,
    updates: ApiKeyUpdateModel,
    current_user=Depends(get_current_user),
):
    """Toggle a key active status or update label."""
    user_id = str(current_user["_id"])
    update_data = updates.model_dump(exclude_unset=True)
    result = await update_key_db(user_id, key_id, update_data)
    if not result:
        raise HTTPException(status_code=404, detail="Key not found or updates empty")
    return result


@router.delete("/keys/{key_id}")
@limiter.limit(RATE_LIMIT_DEFAULT)
async def remove_key(request: Request, key_id: str, current_user=Depends(get_current_user)):
    """Delete an API key."""
    user_id = str(current_user["_id"])
    success = await delete_key_db(user_id, key_id)
    if not success:
        raise HTTPException(status_code=404, detail="Key not found or could not be deleted")
    return {"message": "Key deleted successfully"}


# ─── Telemetry Data Tracking Endpoints ───

@router.get("/telemetry", response_model=List[Dict])
@limiter.limit(RATE_LIMIT_DEFAULT)
async def get_telemetry_logs(
    request: Request,
    limit: int = 50,
    current_user=Depends(get_current_user),
):
    """Retrieve recent telemetry logs for the active user."""
    user_id = str(current_user["_id"])
    return await get_telemetry_logs_db(user_id, limit=min(100, max(1, limit)))


@router.post("/telemetry", response_model=Dict)
@limiter.limit(RATE_LIMIT_DEFAULT)
async def log_telemetry_event(
    request: Request,
    log_data: TelemetryLogModel,
    current_user=Depends(get_current_user),
):
    """Log a custom telemetry execution event in MongoDB."""
    user_id = str(current_user["_id"])
    return await log_telemetry_event_db(user_id, log_data.model_dump())


@router.get("/telemetry/stats", response_model=Dict)
@limiter.limit(RATE_LIMIT_DEFAULT)
async def get_telemetry_stats(
    request: Request,
    current_user=Depends(get_current_user),
):
    """Retrieve aggregate telemetry metrics and performance stats from MongoDB."""
    user_id = str(current_user["_id"])
    return await get_telemetry_stats_db(user_id)


@router.post("/providers/{provider_id}/ping")
@limiter.limit(RATE_LIMIT_DEFAULT)
async def ping_provider(
    request: Request,
    provider_id: str,
    current_user=Depends(get_current_user),
):
    """Real connection ping. Instantiates the LLM, runs a probe, and logs telemetry."""
    import asyncio
    import time
    from core.llm_factory import get_llm, current_user_keys, current_user_id

    user_id = str(current_user["_id"])
    user_keys_list = await get_user_decrypted_keys(user_id)
    keys_dict = {k["providerId"]: k["key"] for k in user_keys_list if k.get("isActive") and k.get("key")}
    keys_token = current_user_keys.set(keys_dict)
    uid_token = current_user_id.set(user_id)

    try:
        llm = get_llm(
            provider=provider_id,
            temperature=0.0,
            streaming=False,
        )

        if hasattr(llm, "timeout"):
            try:
                llm.timeout = 5.0
            except Exception:
                pass

        start_time = time.monotonic()
        await asyncio.wait_for(llm.ainvoke("say ping"), timeout=15.0)
        latency_ms = int((time.monotonic() - start_time) * 1000)

        await log_telemetry_event_db(user_id, {
            "model": provider_id,
            "provider": provider_id,
            "tokensIn": 2,
            "tokensOut": 2,
            "latency": latency_ms,
            "status": 200,
            "cost": 0.000001
        })

        return {"status": "connected", "latency": latency_ms}
    except Exception as e:
        logger.error(f"Ping failed for provider {provider_id}: {e}")
        err_str = str(e)
        if "API key not valid" in err_str or "API_KEY_INVALID" in err_str or "INVALID_ARGUMENT" in err_str:
            detail_msg = f"Invalid API Key for provider '{provider_id}'. Please add a valid API key in Credentials or backend .env file."
        else:
            detail_msg = err_str

        await log_telemetry_event_db(user_id, {
            "model": provider_id,
            "provider": provider_id,
            "tokensIn": 2,
            "tokensOut": 0,
            "latency": 5000,
            "status": 400,
            "error": detail_msg,
            "cost": 0.0
        })
        return {"status": "error", "detail": detail_msg}
    finally:
        current_user_keys.reset(keys_token)
        current_user_id.reset(uid_token)


@router.post("/providers/{provider_id}/benchmark")
@limiter.limit(RATE_LIMIT_DEFAULT)
async def benchmark_provider(
    request: Request,
    provider_id: str,
    current_user=Depends(get_current_user),
):
    """Runs a real latency and throughput speed test using a sample prompt."""
    import asyncio
    import time
    from agents.langgraph.nodes.utils import extract_text
    from core.llm_factory import get_llm, current_user_keys, current_user_id
    from database.mongodb.repositories.brain_repository import update_provider_db

    user_id = str(current_user["_id"])
    user_keys_list = await get_user_decrypted_keys(user_id)
    keys_dict = {k["providerId"]: k["key"] for k in user_keys_list if k.get("isActive") and k.get("key")}
    keys_token = current_user_keys.set(keys_dict)
    uid_token = current_user_id.set(user_id)

    try:
        llm = get_llm(
            provider=provider_id,
            temperature=0.2,
            streaming=True,
        )

        prompt = "Write a 3-sentence description of the solar system."

        start_time = time.monotonic()

        async def _stream_benchmark():
            first_ttft = None
            count = 0
            async for chunk in llm.astream(prompt):
                if first_ttft is None:
                    first_ttft = int((time.monotonic() - start_time) * 1000)
                if hasattr(chunk, "content") and chunk.content:
                    txt = extract_text(chunk.content)
                    if txt:
                        count += len(txt.split()) + 1
            return first_ttft, count

        ttft, token_count = await asyncio.wait_for(_stream_benchmark(), timeout=30.0)

        total_time = time.monotonic() - start_time
        if total_time <= 0:
            total_time = 0.01

        tokens_per_sec = int(token_count / total_time)
        latency = ttft if ttft is not None else int(total_time * 1000)
        latency = max(1, latency)

        await update_provider_db(user_id, provider_id, {
            "latency": latency,
            "tokensPerSec": tokens_per_sec
        })

        await log_telemetry_event_db(user_id, {
            "model": provider_id,
            "provider": provider_id,
            "tokensIn": 10,
            "tokensOut": token_count,
            "latency": latency,
            "status": 200,
            "cost": 0.00005
        })

        return {"latency": latency, "tokensPerSec": tokens_per_sec}
    except Exception as e:
        logger.error(f"Benchmark failed for provider {provider_id}: {e}")
        err_str = str(e)
        if "API key not valid" in err_str or "API_KEY_INVALID" in err_str or "INVALID_ARGUMENT" in err_str:
            detail_msg = f"Invalid API Key for provider '{provider_id}'. Please enter a valid API key in the Credentials section or update your backend .env file."
        else:
            detail_msg = f"Benchmark speed test failed: {err_str}"

        await log_telemetry_event_db(user_id, {
            "model": provider_id,
            "provider": provider_id,
            "tokensIn": 10,
            "tokensOut": 0,
            "latency": 1000,
            "status": 400,
            "error": detail_msg,
            "cost": 0.0
        })
        raise HTTPException(
            status_code=400,
            detail=detail_msg
        )
    finally:
        current_user_keys.reset(keys_token)
        current_user_id.reset(uid_token)


class MemoryCreateModel(BaseModel):
    fact: str = Field(..., min_length=1, max_length=2000)


@router.get("/memories")
@limiter.limit(RATE_LIMIT_DEFAULT)
async def list_memories(
    request: Request,
    limit: int = 50,
    current_user=Depends(get_current_user),
):
    """Retrieve persisted long-term memory facts for the current user."""
    user_id = str(current_user["_id"])
    return await get_user_facts(user_id, limit=min(max(1, limit), 200))


@router.post("/memories")
@limiter.limit(RATE_LIMIT_DEFAULT)
async def create_memory(
    request: Request,
    payload: MemoryCreateModel,
    current_user=Depends(get_current_user),
):
    """Persist a user memory fact in MongoDB."""
    user_id = str(current_user["_id"])
    clean_fact = payload.fact.strip()
    if not clean_fact:
        raise HTTPException(status_code=400, detail="Fact cannot be empty")
    fact_id = await save_user_fact(user_id, clean_fact)
    return {"id": fact_id, "fact": clean_fact}


@router.delete("/memories/{fact_id}")
@limiter.limit(RATE_LIMIT_DEFAULT)
async def remove_memory(
    request: Request,
    fact_id: str,
    current_user=Depends(get_current_user),
):
    """Delete a user memory fact by ID."""
    user_id = str(current_user["_id"])
    deleted = await delete_user_fact(user_id, fact_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Memory fact not found")
    return {"deleted": True, "id": fact_id}
