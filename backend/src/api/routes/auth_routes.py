"""Auth routes — register, login, profile management."""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends, Request
from pymongo.errors import DuplicateKeyError
from core.security import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    get_current_user,
    normalize_email,
)
from schemas.user import UserCreate, UserLogin, UserUpdate, Token
from database.mongodb.connection import get_database
from core.constants import (
    COLLECTION_USERS,
    COLLECTION_CONVERSATIONS,
    COLLECTION_MESSAGES,
    COLLECTION_DOCUMENTS,
    COLLECTION_TASKS,
    COLLECTION_EVENTS,
    COLLECTION_EMAILS,
    COLLECTION_NOTES,
    COLLECTION_API_KEYS,
    COLLECTION_PROVIDERS,
    COLLECTION_TELEMETRY,
    COLLECTION_INTEGRATIONS,
    COLLECTION_WORKFLOWS,
    COLLECTION_WORKFLOW_LOGS,
    COLLECTION_AUDIT_LOGS,
    COLLECTION_USER_MEMORY,
    COLLECTION_REPORTS,
    COLLECTION_COMPETITIVE_REPORTS,
)
from core.limiter import limiter
from core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


def _users():
    return get_database()[COLLECTION_USERS]


@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, user: UserCreate):
    normalized_email = normalize_email(user.email)
    if await _users().find_one({"email": normalized_email}):
        raise HTTPException(status_code=409, detail="Email already registered")

    user_dict = user.model_dump()
    user_dict.pop("password")
    user_dict.pop("confirm_password")
    user_dict["email"] = normalized_email
    user_dict["email_verified"] = False
    user_dict["auth_provider"] = "password"
    user_dict["hashed_password"] = await get_password_hash(user.password)
    user_dict["created_at"] = datetime.now(timezone.utc)

    try:
        await _users().insert_one(user_dict)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Email already registered")
    return {"message": "Account created successfully"}


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, user: UserLogin):
    authenticated_user = await authenticate_user(normalize_email(user.email), user.password)
    token = create_access_token(data={"sub": authenticated_user["email"]})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    created_at = current_user.get("created_at")
    first_name = current_user.get("first_name", "")
    last_name = current_user.get("last_name", "")
    full_name = f"{first_name} {last_name}".strip()
    return {
        "id": str(current_user.get("_id", "")),
        "email": current_user.get("email"),
        "username": current_user.get("username"),
        "first_name": first_name,
        "last_name": last_name,
        "name": full_name or current_user.get("username") or (current_user.get("email", "").split("@")[0] if current_user.get("email") else "User"),
        "avatar_url": current_user.get("avatar_url"),
        "bio": current_user.get("bio", ""),
        "timezone": current_user.get("timezone", "UTC"),
        "plan": current_user.get("plan", "Free"),
        "email_verified": bool(current_user.get("email_verified", False)),
        "auth_provider": current_user.get("auth_provider", "password"),
        "created_at": created_at.isoformat() if isinstance(created_at, datetime) else None,
    }


@router.put("/me")
async def update_me(user_update: UserUpdate, current_user=Depends(get_current_user)):
    update_data = {k: v for k, v in user_update.model_dump(exclude_unset=True).items() if v is not None}
    if "email" in update_data:
        update_data["email"] = normalize_email(update_data["email"])
    if not update_data:
        return {"message": "Nothing to update"}
    update_data["updated_at"] = datetime.now(timezone.utc)
    try:
        result = await _users().update_one(
            {"_id": current_user["_id"]},
            {"$set": update_data},
        )
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Email or username already in use")
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Profile updated successfully"}


@router.delete("/me")
async def delete_me(current_user=Depends(get_current_user)):
    """Deletes the authenticated user's account and purges their workspace data."""
    user_oid = current_user["_id"]
    user_id = str(user_oid)
    db = get_database()

    user_collections = (
        COLLECTION_CONVERSATIONS,
        COLLECTION_MESSAGES,
        COLLECTION_DOCUMENTS,
        COLLECTION_TASKS,
        COLLECTION_EVENTS,
        COLLECTION_EMAILS,
        COLLECTION_NOTES,
        COLLECTION_API_KEYS,
        COLLECTION_PROVIDERS,
        COLLECTION_TELEMETRY,
        COLLECTION_INTEGRATIONS,
        COLLECTION_WORKFLOWS,
        COLLECTION_WORKFLOW_LOGS,
        COLLECTION_AUDIT_LOGS,
        COLLECTION_USER_MEMORY,
        COLLECTION_REPORTS,
        COLLECTION_COMPETITIVE_REPORTS,
    )
    for col in user_collections:
        try:
            await db[col].delete_many({"user_id": user_id})
        except Exception as e:
            logger.warning(f"Failed deleting {col} docs for user {user_id}: {e}")

    try:
        import asyncio
        from rag.vectorstores.pinecone_store import delete_namespace
        for ns in (f"user:{user_id}", f"memory:{user_id}"):
            try:
                await asyncio.to_thread(delete_namespace, ns)
            except Exception:
                pass
    except Exception:
        pass

    result = await _users().delete_one({"_id": user_oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Account and workspace data permanently deleted"}
