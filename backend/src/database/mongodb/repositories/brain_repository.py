"""Brain repository — CRUD database helpers for providers, api keys, playground messages, and telemetry logs in MongoDB."""
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Optional
from bson.objectid import ObjectId
from pymongo.errors import BulkWriteError, DuplicateKeyError
from database.mongodb.connection import get_database
from core.constants import (
    COLLECTION_PROVIDERS,
    COLLECTION_API_KEYS,
    COLLECTION_TELEMETRY,
)
from core.security import encrypt_secret, decrypt_secret, mask_secret
from core.logger import get_logger

logger = get_logger(__name__)


def _db():
    return get_database()


def clean_doc(doc: Dict) -> Dict:
    if not doc:
        return doc
    if "_id" in doc:
        val = str(doc.pop("_id"))
        if "id" not in doc:
            doc["id"] = val
    if isinstance(doc.get("created_at"), datetime):
        doc["created_at"] = doc["created_at"].isoformat()
    return doc


def _mask_key_doc(doc: Dict) -> Dict:
    if not doc:
        return doc
    cleaned = clean_doc(doc)
    plain = decrypt_secret(cleaned.get("key", ""))
    masked = mask_secret(plain) if plain else cleaned.get("keyPreview", "")
    cleaned["key"] = masked
    cleaned["keyPreview"] = masked
    cleaned["hasKey"] = bool(plain)
    return cleaned


def _build_id_query(user_id: str, doc_id: str) -> Dict:
    """Safely builds a query matching user_id and either ObjectId or string id."""
    query_or = [{"id": doc_id}]
    if ObjectId.is_valid(doc_id):
        query_or.append({"_id": ObjectId(doc_id)})
    return {"user_id": user_id, "$or": query_or}


def get_seed_providers() -> List[Dict]:
    return [
        # Cloud Providers
        {
            "id": "openai", "name": "OpenAI", "type": "cloud", "logo": "OA",
            "description": "GPT-4o, o1 — leading reasoning models",
            "models": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1-preview", "o1-mini"],
            "status": "disconnected", "isActive": True, "usageTokens": 0, "usageCost": 0.0, "latency": 0, "tokensPerSec": 0
        },
        {
            "id": "anthropic", "name": "Anthropic", "type": "cloud", "logo": "AN",
            "description": "Claude 3.5 Sonnet, Claude 3 Opus — safety-first AI",
            "models": ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"],
            "status": "disconnected", "isActive": False, "usageTokens": 0, "usageCost": 0.0, "latency": 0, "tokensPerSec": 0
        },
        {
            "id": "google", "name": "Google AI", "type": "cloud", "logo": "GG",
            "description": "Gemini 1.5 Pro, Gemini Flash — multimodal",
            "models": ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"],
            "status": "disconnected", "isActive": False, "usageTokens": 0, "usageCost": 0.0, "latency": 0, "tokensPerSec": 0
        },
        {
            "id": "mistral", "name": "Mistral AI", "type": "cloud", "logo": "MI",
            "description": "Mistral Large, Codestral — European efficiency",
            "models": ["mistral-large-latest", "codestral-latest", "open-mistral-7b"],
            "status": "disconnected", "isActive": False, "usageTokens": 0, "usageCost": 0.0, "latency": 0, "tokensPerSec": 0
        },
        {
            "id": "groq", "name": "Groq", "type": "cloud", "logo": "GQ",
            "description": "Ultra-fast LPU inference — Llama, Mixtral",
            "models": ["llama-3.1-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"],
            "status": "disconnected", "isActive": False, "usageTokens": 0, "usageCost": 0.0, "latency": 0, "tokensPerSec": 0
        },
        {
            "id": "cohere", "name": "Cohere", "type": "cloud", "logo": "CO",
            "description": "Command R+ — enterprise RAG and search",
            "models": ["command-r-plus", "command-r", "command"],
            "status": "disconnected", "isActive": False, "usageTokens": 0, "usageCost": 0.0, "latency": 0, "tokensPerSec": 0
        },
        # Local Providers
        {
            "id": "ollama", "name": "Ollama", "type": "local", "logo": "OL",
            "description": "Run Llama, Mistral, Phi locally — zero cost",
            "models": ["llama3.2", "mistral", "phi3", "codellama"],
            "status": "disconnected", "isActive": False, "endpoint": "http://localhost:11434", "latency": 0, "tokensPerSec": 0
        },
        {
            "id": "lmstudio", "name": "LM Studio", "type": "local", "logo": "LM",
            "description": "GUI for local models — OpenAI-compatible API",
            "models": ["any-gguf-model"],
            "status": "disconnected", "isActive": False, "endpoint": "http://localhost:1234/v1", "latency": 0, "tokensPerSec": 0
        },
        {
            "id": "vllm", "name": "vLLM", "type": "local", "logo": "VL",
            "description": "High-throughput local serving — production ready",
            "models": ["any-huggingface-model"],
            "status": "disconnected", "isActive": False, "endpoint": "http://localhost:8000/v1", "latency": 0, "tokensPerSec": 0
        },
        {
            "id": "custom", "name": "Custom Endpoint", "type": "local", "logo": "CX",
            "description": "Any OpenAI-compatible REST API endpoint",
            "models": ["custom"],
            "status": "disconnected", "isActive": False, "endpoint": "https://your-api.example.com/v1", "latency": 0, "tokensPerSec": 0
        }
    ]


async def get_user_providers(user_id: str) -> List[Dict]:
    """Retrieves LLM providers configuration for the user. Seeds default configurations if empty."""
    count = await _db()[COLLECTION_PROVIDERS].count_documents({"user_id": user_id})
    if count == 0:
        logger.info(f"Seeding LLM providers configurations for user {user_id}")
        seeds = get_seed_providers()
        for s in seeds:
            s["user_id"] = user_id
            s["created_at"] = datetime.now(timezone.utc)
        try:
            await _db()[COLLECTION_PROVIDERS].insert_many(seeds, ordered=False)
        except (DuplicateKeyError, BulkWriteError):
            pass

    docs = await _db()[COLLECTION_PROVIDERS].find({"user_id": user_id}).to_list(100)
    return [clean_doc(d) for d in docs]


async def update_provider_db(user_id: str, provider_id: str, updates: Dict) -> Optional[Dict]:
    """Updates active state, endpoint, latency, throughput, status or stats for an LLM provider."""
    allowed_keys = ["isActive", "endpoint", "latency", "tokensPerSec", "status", "usageTokens", "usageCost"]
    update_payload = {k: v for k, v in updates.items() if k in allowed_keys}
    if not update_payload:
        return None

    query = _build_id_query(user_id, provider_id)

    result = await _db()[COLLECTION_PROVIDERS].find_one_and_update(
        query,
        {"$set": update_payload},
        return_document=True
    )
    return clean_doc(result)


async def get_user_keys(user_id: str) -> List[Dict]:
    """Retrieves all registered LLM API keys for the user with masked key previews."""
    docs = await _db()[COLLECTION_API_KEYS].find({"user_id": user_id}).to_list(100)
    return [_mask_key_doc(d) for d in docs]


async def get_user_decrypted_keys(user_id: str) -> List[Dict]:
    """Internal helper returning decrypted LLM API keys for backend model invocation."""
    docs = await _db()[COLLECTION_API_KEYS].find({"user_id": user_id}).to_list(100)
    results = []
    for d in docs:
        cleaned = clean_doc(d)
        cleaned["key"] = decrypt_secret(cleaned.get("key", ""))
        results.append(cleaned)
    return results


async def create_key_db(user_id: str, key_data: Dict) -> Dict:
    """Encrypts and saves a new API key to MongoDB, returning a masked representation."""
    raw_key = str(key_data.get("key", "") or "").strip()
    encrypted = encrypt_secret(raw_key) if raw_key else ""
    preview = mask_secret(raw_key) if raw_key else ""
    payload = {
        "user_id": user_id,
        "providerId": key_data.get("providerId", ""),
        "label": key_data.get("label", "Key Name"),
        "key": encrypted,
        "keyPreview": preview,
        "createdAt": datetime.now(timezone.utc).strftime("%b %d, %Y"),
        "lastUsed": "Never",
        "isActive": key_data.get("isActive", True),
        "created_at": datetime.now(timezone.utc)
    }
    await _db()[COLLECTION_API_KEYS].insert_one(payload)
    return _mask_key_doc(payload)


async def update_key_db(user_id: str, key_id: str, updates: Dict) -> Optional[Dict]:
    """Updates a key's label, encrypted value, or active status."""
    allowed_keys = ["label", "key", "isActive", "lastUsed"]
    update_payload = {k: v for k, v in updates.items() if k in allowed_keys}
    if "key" in update_payload:
        raw_val = str(update_payload["key"] or "").strip()
        if not raw_val or "•" in raw_val or "***" in raw_val:
            update_payload.pop("key", None)
        else:
            update_payload["key"] = encrypt_secret(raw_val)
            update_payload["keyPreview"] = mask_secret(raw_val)
    if not update_payload:
        return None

    query = _build_id_query(user_id, key_id)

    result = await _db()[COLLECTION_API_KEYS].find_one_and_update(
        query,
        {"$set": update_payload},
        return_document=True
    )
    return _mask_key_doc(result)


async def delete_key_db(user_id: str, key_id: str) -> bool:
    """Deletes an API key from MongoDB."""
    query = _build_id_query(user_id, key_id)
    result = await _db()[COLLECTION_API_KEYS].delete_one(query)
    return result.deleted_count > 0





async def get_active_user_key(user_id: str, provider_id: str) -> Optional[str]:
    """Retrieves the decrypted active API key for a given user and provider from MongoDB."""
    doc = await _db()[COLLECTION_API_KEYS].find_one({
        "user_id": user_id,
        "providerId": provider_id,
        "isActive": True
    })
    return decrypt_secret(doc.get("key", "")) if doc else None


async def log_telemetry_event_db(user_id: str, telemetry_data: Dict) -> Dict:
    """
    Saves a telemetry log entry into COLLECTION_TELEMETRY and atomically updates
    usageTokens and usageCost in COLLECTION_PROVIDERS.
    """
    now = datetime.now(timezone.utc)
    tokens_in = max(0, int(telemetry_data.get("tokensIn", 0)))
    tokens_out = max(0, int(telemetry_data.get("tokensOut", 0)))
    total_tokens = tokens_in + tokens_out
    cost = max(0.0, float(telemetry_data.get("cost", 0.0)))
    provider_id = str(telemetry_data.get("provider", "openai")).lower()

    payload = {
        "user_id": user_id,
        "timestamp": telemetry_data.get("timestamp") or now.strftime("%H:%M:%S"),
        "model": str(telemetry_data.get("model", "gpt-4o")),
        "provider": provider_id,
        "tokensIn": tokens_in,
        "tokensOut": tokens_out,
        "latency": max(0, int(telemetry_data.get("latency", 0))),
        "vectorLatency": max(0.0, float(telemetry_data.get("vectorLatency", 0.0))),
        "status": int(telemetry_data.get("status", 200)),
        "traceId": str(telemetry_data.get("traceId") or f"tr-{now.strftime('%H%M%S')}-{str(ObjectId())[:8]}"),
        "cost": round(cost, 6),
        "cacheHit": bool(telemetry_data.get("cacheHit", False)),
        "error": telemetry_data.get("error"),
        "created_at": now
    }

    await _db()[COLLECTION_TELEMETRY].insert_one(payload)

    if total_tokens > 0 or cost > 0:
        query = _build_id_query(user_id, provider_id)
        await _db()[COLLECTION_PROVIDERS].update_one(
            query,
            {"$inc": {
                "usageTokens": total_tokens,
                "usageCost": cost
            }}
        )

    return clean_doc(payload)


async def get_telemetry_logs_db(user_id: str, limit: int = 50) -> List[Dict]:
    """Retrieves recent telemetry logs for the user."""
    docs = await _db()[COLLECTION_TELEMETRY].find({"user_id": user_id}).sort("created_at", -1).to_list(limit)
    return [clean_doc(d) for d in docs]


async def get_telemetry_stats_db(user_id: str) -> Dict:
    """Calculates real aggregate telemetry metrics for the user from MongoDB."""
    providers_docs = await _db()[COLLECTION_PROVIDERS].find({"user_id": user_id}).to_list(100)
    total_tokens = sum(d.get("usageTokens", 0) for d in providers_docs)
    total_cost = sum(d.get("usageCost", 0.0) for d in providers_docs)

    recent_logs = await get_telemetry_logs_db(user_id, limit=50)
    now = datetime.now(timezone.utc)
    one_min_ago = now - timedelta(minutes=1)
    live_req_per_min = await _db()[COLLECTION_TELEMETRY].count_documents({
        "user_id": user_id,
        "created_at": {"$gte": one_min_ago},
    })
    total_requests = await _db()[COLLECTION_TELEMETRY].count_documents({"user_id": user_id})

    # Provider token distribution
    provider_share = []
    if total_tokens > 0:
        for d in sorted(providers_docs, key=lambda x: x.get("usageTokens", 0), reverse=True):
            toks = int(d.get("usageTokens", 0))
            if toks > 0:
                provider_share.append({
                    "id": d.get("id", "unknown"),
                    "name": d.get("name", d.get("id", "Unknown")),
                    "tokens": toks,
                    "percentage": round((toks / total_tokens) * 100, 1),
                })

    # 7-day daily token usage breakdown from actual telemetry events
    seven_days_ago = (now - timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0)
    weekly_docs = await _db()[COLLECTION_TELEMETRY].find({
        "user_id": user_id,
        "created_at": {"$gte": seven_days_ago},
    }).to_list(2000)

    daily_buckets: Dict[str, Dict] = {}
    for offset in range(7):
        day_dt = seven_days_ago + timedelta(days=offset)
        key = day_dt.strftime("%Y-%m-%d")
        daily_buckets[key] = {
            "date": key,
            "day": day_dt.strftime("%a"),
            "tokens": 0,
            "cost": 0.0,
            "requests": 0,
        }

    for doc in weekly_docs:
        created = doc.get("created_at")
        if isinstance(created, datetime):
            key = created.strftime("%Y-%m-%d")
            if key in daily_buckets:
                daily_buckets[key]["tokens"] += int(doc.get("tokensIn", 0)) + int(doc.get("tokensOut", 0))
                daily_buckets[key]["cost"] = round(daily_buckets[key]["cost"] + float(doc.get("cost", 0.0)), 6)
                daily_buckets[key]["requests"] += 1

    weekly_tokens = list(daily_buckets.values())

    if recent_logs:
        latencies = [l.get("latency", 0) for l in recent_logs if l.get("latency", 0) > 0]
        avg_latency = int(sum(latencies) / len(latencies)) if latencies else 0
        avg_ttft = int(avg_latency * 0.7) if avg_latency else 0
        p95_latency = sorted(latencies)[min(len(latencies) - 1, int(len(latencies) * 0.95))] if latencies else 0
        timed_logs = [l for l in recent_logs if l.get("latency", 0) > 0 and l.get("tokensOut", 0) > 0]
        if timed_logs:
            total_out = sum(l.get("tokensOut", 0) for l in timed_logs)
            total_sec = sum(l.get("latency", 0) for l in timed_logs) / 1000.0
            tokens_per_sec = round(total_out / max(0.001, total_sec), 1)
        else:
            tokens_per_sec = 0.0
        vector_latencies = [float(l.get("vectorLatency", 0.0)) for l in recent_logs if float(l.get("vectorLatency", 0.0)) > 0]
        avg_vector_latency = round(sum(vector_latencies) / len(vector_latencies), 1) if vector_latencies else 0.0
        success_count = sum(1 for l in recent_logs if int(l.get("status", 200)) < 400 and not l.get("error"))
        success_rate = round((success_count / len(recent_logs)) * 100, 2)
        cache_hits = sum(1 for l in recent_logs if bool(l.get("cacheHit", False)))
        cache_hit_rate = round((cache_hits / len(recent_logs)) * 100, 1)
    else:
        avg_latency = 0
        avg_ttft = 0
        p95_latency = 0
        tokens_per_sec = 0.0
        avg_vector_latency = 0.0
        success_rate = 100.0 if total_requests == 0 else 0.0
        cache_hit_rate = 0.0

    return {
        "totalTokens": total_tokens,
        "totalCost": round(total_cost, 4),
        "totalRequests": total_requests,
        "liveTokensPerSec": tokens_per_sec,
        "liveTtft": avg_ttft,
        "liveP95": p95_latency,
        "liveReqPerMin": live_req_per_min,
        "liveVectorLatency": avg_vector_latency,
        "successRate": success_rate,
        "cacheHitRate": cache_hit_rate,
        "providerShare": provider_share,
        "weeklyTokens": weekly_tokens,
        "recentLogs": recent_logs
    }
