"""
src/core/cache.py — Optional Redis cache layer
===============================================
Provides a thin async cache wrapper for RAG query results.
If Redis is unavailable or REDIS_URL is empty, all operations
are silent no-ops — the pipeline continues without caching.

Usage:
    from core.cache import cache_get, cache_set

    hit = await cache_get(key)
    if hit:
        return hit
    result = await expensive_operation()
    await cache_set(key, result, ttl=3600)
"""
import asyncio
import json
import hashlib
import time
import urllib.parse
from typing import Any, Optional
from core.logger import get_logger

logger = get_logger(__name__)

_redis_client = None
_client_lock: Optional[asyncio.Lock] = None
_client_lock_loop: Optional[asyncio.AbstractEventLoop] = None
_last_failure_ts: float = 0.0
_RETRY_COOLDOWN_SECONDS = 60.0


def _get_lock() -> asyncio.Lock:
    global _client_lock, _client_lock_loop
    loop = asyncio.get_running_loop()
    if _client_lock is None or _client_lock_loop is not loop:
        _client_lock = asyncio.Lock()
        _client_lock_loop = loop
    return _client_lock


def _redact_uri(uri: str) -> str:
    try:
        parsed = urllib.parse.urlparse(uri)
        host = parsed.hostname or "unknown"
        port = f":{parsed.port}" if parsed.port else ""
        return f"{parsed.scheme}://{host}{port}{parsed.path or ''}"
    except Exception:
        return "<redacted>"


async def _get_client():
    """Return cached Redis client or None if Redis is disabled/unavailable."""
    global _redis_client, _last_failure_ts
    if _redis_client is not None:
        return _redis_client

    from core.config import settings
    if not settings.REDIS_URL:
        return None

    now = time.monotonic()
    if _last_failure_ts and (now - _last_failure_ts) < _RETRY_COOLDOWN_SECONDS:
        return None

    async with _get_lock():
        if _redis_client is not None:
            return _redis_client
        now = time.monotonic()
        if _last_failure_ts and (now - _last_failure_ts) < _RETRY_COOLDOWN_SECONDS:
            return None

        try:
            import redis.asyncio as aioredis  # type: ignore
            client = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=2,
            )
            await client.ping()
            _redis_client = client
            _last_failure_ts = 0.0
            logger.info(f"Redis cache connected: {_redact_uri(settings.REDIS_URL)}")
            return _redis_client
        except Exception as e:
            logger.warning(f"Redis unavailable — caching paused for {_RETRY_COOLDOWN_SECONDS:.0f}s: {e}")
            _redis_client = None
            _last_failure_ts = time.monotonic()
            return None


async def close_cache_client() -> None:
    global _redis_client
    if _redis_client is not None:
        try:
            await _redis_client.close()
        finally:
            _redis_client = None


def make_cache_key(prefix: str, *parts: str) -> str:
    """
    Build a deterministic cache key from a prefix and variable parts.
    """
    raw = json.dumps([str(p) for p in parts], separators=(",", ":"))
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    return f"{prefix}{digest}"


async def cache_get(key: str) -> Optional[Any]:
    """
    Retrieve a cached value by key.
    Returns the deserialized Python object, or None on miss/error.
    """
    client = await _get_client()
    if client is None:
        return None
    try:
        raw = await client.get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except Exception as e:
        logger.debug(f"Cache GET error for '{key}': {e}")
        return None


async def cache_set(key: str, value: Any, ttl: int = 3600) -> bool:
    """
    Store a value in cache with a TTL (seconds).
    Returns True on success, False on error/disabled.
    """
    client = await _get_client()
    if client is None:
        return False
    try:
        await client.setex(key, ttl, json.dumps(value, default=str))
        return True
    except Exception as e:
        logger.debug(f"Cache SET error for '{key}': {e}")
        return False


async def cache_delete(key: str) -> bool:
    """Invalidate a single cache entry."""
    client = await _get_client()
    if client is None:
        return False
    try:
        await client.delete(key)
        return True
    except Exception as e:
        logger.debug(f"Cache DELETE error for '{key}': {e}")
        return False
