"""
src/api/conversations.py — Conversation management routes
=========================================================
CRUD operations for user conversations and their message history.

Migrated from legacy database/mongo.py shim to direct get_database() calls
using the same pattern as all other v3 routes. No behaviour changes.
"""
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime, timezone
from core.security import get_current_user
from database.mongodb.connection import get_database
from core.constants import COLLECTION_CONVERSATIONS, COLLECTION_MESSAGES
from schemas.conversation import ConversationCreate, ConversationUpdate

router = APIRouter()


def _convs():
    return get_database()[COLLECTION_CONVERSATIONS]


def _msgs():
    return get_database()[COLLECTION_MESSAGES]


def _to_id(conversation_id: str) -> ObjectId:
    """Parse conversation_id string to ObjectId, raising 400 on invalid format."""
    try:
        return ObjectId(conversation_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid conversation ID format")


def _serialize(doc: dict) -> dict:
    """Replace MongoDB _id with string id field and ISO-encode timestamps."""
    doc["id"] = str(doc.pop("_id"))
    for key in ("created_at", "updated_at"):
        val = doc.get(key)
        if isinstance(val, datetime):
            doc[key] = val.isoformat()
    return doc


@router.get("", summary="List user conversations")
async def get_conversations(current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    convs = await _convs().find({"user_id": user_id}).sort("updated_at", -1).to_list(200)
    if not convs:
        return []

    conv_ids = [str(c["_id"]) for c in convs]
    stats_pipeline = [
        {"$match": {"conversation_id": {"$in": conv_ids}, "user_id": user_id}},
        {"$sort": {"created_at": 1}},
        {
            "$group": {
                "_id": "$conversation_id",
                "messageCount": {"$sum": 1},
                "lastContent": {"$last": "$content"},
            }
        },
    ]
    stats_docs = await _msgs().aggregate(stats_pipeline).to_list(len(conv_ids))
    stats_by_conv = {d["_id"]: d for d in stats_docs}

    result = []
    for c in convs:
        conv_id = str(c["_id"])
        serialized = _serialize(c)
        stat = stats_by_conv.get(conv_id)
        serialized["messageCount"] = stat["messageCount"] if stat else 0
        serialized["preview"] = (stat.get("lastContent") or "")[:120] if stat else ""
        result.append(serialized)

    return result


@router.post("", status_code=201, summary="Create a new conversation")
async def create_conversation(
    conv: ConversationCreate,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["_id"])
    now = datetime.now(timezone.utc)
    doc = {
        **conv.model_dump(),
        "user_id": user_id,
        "created_at": now,
        "updated_at": now,
    }
    result = await _convs().insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return doc


@router.put("/{conversation_id}", summary="Update conversation title")
async def update_conversation(
    conversation_id: str,
    conv_update: ConversationUpdate,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["_id"])
    obj_id = _to_id(conversation_id)

    update_data = {k: v for k, v in conv_update.model_dump(exclude_unset=True).items() if v is not None}
    if not update_data:
        return {"message": "Nothing to update"}

    update_data["updated_at"] = datetime.now(timezone.utc)
    result = await _convs().update_one(
        {"_id": obj_id, "user_id": user_id},
        {"$set": update_data},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation updated"}


@router.delete("/{conversation_id}", summary="Delete a conversation and its messages")
async def delete_conversation(
    conversation_id: str,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["_id"])
    obj_id = _to_id(conversation_id)

    result = await _convs().delete_one({"_id": obj_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")

    deleted_msgs = await _msgs().delete_many({"conversation_id": conversation_id, "user_id": user_id})
    return {
        "message": "Conversation deleted",
        "messages_deleted": deleted_msgs.deleted_count,
    }


@router.get("/{conversation_id}/messages", summary="Get messages in a conversation")
async def get_conversation_messages(
    conversation_id: str,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["_id"])
    obj_id = _to_id(conversation_id)

    conv = await _convs().find_one({"_id": obj_id, "user_id": user_id})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = await _msgs().find(
        {"conversation_id": conversation_id, "user_id": user_id}
    ).sort("created_at", 1).to_list(500)

    for m in messages:
        _serialize(m)

    return messages
