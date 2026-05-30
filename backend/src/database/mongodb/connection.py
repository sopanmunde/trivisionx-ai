"""MongoDB connection — Motor async client singleton."""
from functools import lru_cache
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from src.core.config import settings
from src.core.logger import get_logger

logger = get_logger(__name__)


@lru_cache(maxsize=1)
def get_mongo_client() -> AsyncIOMotorClient:
    """
    Returns a cached Motor async client.

    Timeouts are kept short so Atlas latency does not block app startup.
    Motor is lazy — it does NOT physically connect until the first DB call.
    """
    uri = settings.MONGO_URI
    logger.info(f"Connecting to MongoDB: {uri[:40]}...")
    return AsyncIOMotorClient(
        uri,
        serverSelectionTimeoutMS=5000,   # fail fast if Atlas unreachable
        connectTimeoutMS=5000,
        socketTimeoutMS=10000,
    )


def get_database() -> AsyncIOMotorDatabase:
    return get_mongo_client()[settings.MONGO_DB_NAME]


# Convenience collection accessor
def get_collection(name: str):
    return get_database()[name]
