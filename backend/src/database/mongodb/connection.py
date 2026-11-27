"""MongoDB connection — Motor async client singleton."""
import urllib.parse
from functools import lru_cache
from typing import Any, Dict
import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from core.config import settings
from core.logger import get_logger

logger = get_logger(__name__)


def _configure_srv_dns_if_needed(uri: str) -> None:
    if not uri.lower().startswith("mongodb+srv://"):
        return
    try:
        import dns.resolver
        custom_resolver = dns.resolver.Resolver()
        existing_ns = list(custom_resolver.nameservers)
        for fb in ["8.8.8.8", "1.1.1.1", "1.0.0.1", "8.8.4.4"]:
            if fb not in existing_ns:
                existing_ns.append(fb)
        custom_resolver.nameservers = existing_ns
        custom_resolver.timeout = 3.0
        custom_resolver.lifetime = 5.0
        dns.resolver.default_resolver = custom_resolver
        logger.info("DNS resolver configured for MongoDB SRV lookup")
    except Exception as e:
        logger.warning(f"Could not configure custom DNS resolver: {e}")


def _redact_mongo_uri(uri: str) -> str:
    try:
        parsed = urllib.parse.urlparse(uri)
        host = parsed.hostname or "localhost"
        port = f":{parsed.port}" if parsed.port else ""
        return f"{parsed.scheme}://{host}{port}{parsed.path or ''}"
    except Exception:
        return "<redacted>"


def _requires_tls(uri: str) -> bool:
    lower = uri.lower()
    if lower.startswith("mongodb+srv://"):
        return True
    parsed = urllib.parse.urlparse(lower)
    qs = urllib.parse.parse_qs(parsed.query)
    return (
        qs.get("tls", [""])[0] == "true"
        or qs.get("ssl", [""])[0] == "true"
    )


@lru_cache(maxsize=1)
def get_mongo_client() -> AsyncIOMotorClient:
    """
    Returns a cached Motor async client.

    Timeouts are kept short so Atlas latency does not block app startup.
    Motor is lazy — it does NOT physically connect until the first DB call.
    """
    uri = settings.MONGO_URI
    _configure_srv_dns_if_needed(uri)
    logger.info(f"Connecting to MongoDB: {_redact_mongo_uri(uri)}")

    kwargs: Dict[str, Any] = {
        "serverSelectionTimeoutMS": 5000,
        "connectTimeoutMS": 5000,
        "socketTimeoutMS": 10000,
    }
    if _requires_tls(uri):
        kwargs["tlsCAFile"] = certifi.where()

    return AsyncIOMotorClient(uri, **kwargs)


def close_mongo_client() -> None:
    """Close and clear the cached Motor client."""
    if get_mongo_client.cache_info().currsize > 0:
        get_mongo_client().close()
        get_mongo_client.cache_clear()


def get_database() -> AsyncIOMotorDatabase:
    return get_mongo_client()[settings.MONGO_DB_NAME]


def get_collection(name: str):
    return get_database()[name]
