"""MongoDB index definitions — separated from connection logic."""
from database.mongodb.connection import get_database
from core.constants import (
    COLLECTION_USERS,
    COLLECTION_CONVERSATIONS,
    COLLECTION_MESSAGES,
    COLLECTION_DOCUMENTS,
    COLLECTION_REPORTS,
    COLLECTION_TASKS,
    COLLECTION_EVENTS,
    COLLECTION_EMAILS,
    COLLECTION_NOTES,
    COLLECTION_PROVIDERS,
    COLLECTION_API_KEYS,
    COLLECTION_TELEMETRY,
    COLLECTION_USER_MEMORY,
    COLLECTION_AUDIT_LOGS,
    COLLECTION_WORKFLOWS,
    COLLECTION_WORKFLOW_LOGS,
    COLLECTION_INTEGRATIONS,
    COLLECTION_CONTACTS,
    COLLECTION_OAUTH_STATES,
    COLLECTION_COMPETITIVE_REPORTS,
)
from core.logger import get_logger

logger = get_logger(__name__)


async def create_indexes():
    """Create all necessary MongoDB indexes for optimal query performance."""
    db = get_database()
    try:
        await db[COLLECTION_USERS].create_index("email", unique=True)

        await db[COLLECTION_CONVERSATIONS].create_index([("user_id", 1), ("updated_at", -1)])
        await db[COLLECTION_MESSAGES].create_index([("conversation_id", 1), ("created_at", 1)])
        await db[COLLECTION_MESSAGES].create_index([("user_id", 1), ("conversation_id", 1)])

        await db[COLLECTION_DOCUMENTS].create_index([("user_id", 1), ("uploaded_at", -1)])
        await db[COLLECTION_REPORTS].create_index([("user_id", 1), ("created_at", -1)])
        await db[COLLECTION_REPORTS].create_index("conversation_id")

        await db[COLLECTION_TASKS].create_index([("user_id", 1), ("created_at", -1)])
        await db[COLLECTION_EVENTS].create_index([("user_id", 1), ("from", 1)])
        await db[COLLECTION_EMAILS].create_index([("user_id", 1), ("created_at", -1)])
        await db[COLLECTION_NOTES].create_index([("user_id", 1), ("updatedAt", -1)])

        await db[COLLECTION_PROVIDERS].create_index("user_id")
        await db[COLLECTION_API_KEYS].create_index("user_id")
        await db[COLLECTION_TELEMETRY].create_index([("user_id", 1), ("created_at", -1)])

        await db[COLLECTION_USER_MEMORY].create_index([("user_id", 1), ("created_at", -1)])
        await db[COLLECTION_AUDIT_LOGS].create_index([("user_id", 1), ("created_at", -1)])
        await db[COLLECTION_AUDIT_LOGS].create_index([("conversation_id", 1), ("user_id", 1)])

        await db[COLLECTION_WORKFLOWS].create_index([("user_id", 1), ("created_at", -1)])
        await db[COLLECTION_WORKFLOWS].create_index([("is_active", 1), ("trigger_type", 1)])
        await db[COLLECTION_WORKFLOW_LOGS].create_index([("workflow_id", 1), ("created_at", -1)])

        await db[COLLECTION_INTEGRATIONS].create_index("user_id")
        await db[COLLECTION_CONTACTS].create_index("created_at")
        await db[COLLECTION_COMPETITIVE_REPORTS].create_index([("user_id", 1), ("created_at", -1)])
        await db[COLLECTION_OAUTH_STATES].create_index("nonce", unique=True)
        await db[COLLECTION_OAUTH_STATES].create_index("expires_at", expireAfterSeconds=0)

        logger.info("All MongoDB collection indexes verified")
    except Exception as e:
        logger.warning(f"Index creation warning (non-fatal): {e}")
