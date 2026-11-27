"""Email routes — REST API endpoints for emails management in MongoDB."""
from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Dict, List
from core.security import get_current_user
from core.limiter import limiter
from core.constants import RATE_LIMIT_DEFAULT
from database.mongodb.repositories.email_repository import (
    get_user_emails,
    create_email,
    update_email_db,
    delete_email_metadata,
)
from core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.get("", response_model=List[Dict])
@limiter.limit(RATE_LIMIT_DEFAULT)
async def list_emails(request: Request, current_user=Depends(get_current_user)):
    """Retrieve all emails for the active user."""
    user_id = str(current_user["_id"])
    return await get_user_emails(user_id)


@router.post("", response_model=Dict)
@limiter.limit(RATE_LIMIT_DEFAULT)
async def add_email(request: Request, email_data: Dict, current_user=Depends(get_current_user)):
    """Send or compose a new email."""
    user_id = str(current_user["_id"])
    folder = email_data.get("folder", "sent")
    to_email = str(email_data.get("email") or "").strip()

    if folder == "sent" and (not to_email or "@" not in to_email):
        raise HTTPException(status_code=400, detail="A valid recipient email address is required to send an email.")

    result = await create_email(user_id, email_data)

    # If the email is sent (not draft), dispatch a real email and surface accurate delivery status
    if folder == "sent":
        sent_ok = False
        try:
            from services.email_service import send_real_email
            sent_ok = await send_real_email(
                to_email=to_email,
                subject=email_data.get("subject", "(No Subject)"),
                body=email_data.get("body", "")
            )
        except Exception as e:
            logger.error(f"Failed to dispatch real SMTP email: {e}")
        result["smtp_delivered"] = bool(sent_ok)
        if not sent_ok:
            result["delivery_warning"] = "Email saved to Sent, but external SMTP delivery is unavailable or not configured."

    return result


@router.put("/{email_id}", response_model=Dict)
@limiter.limit(RATE_LIMIT_DEFAULT)
async def update_email(request: Request, email_id: str, updates: Dict, current_user=Depends(get_current_user)):
    """Update email properties (folder, favorite status, unread flag)."""
    user_id = str(current_user["_id"])
    result = await update_email_db(user_id, email_id, updates)
    if not result:
        raise HTTPException(status_code=404, detail="Email not found or updates empty")
    return result


@router.delete("/{email_id}")
@limiter.limit(RATE_LIMIT_DEFAULT)
async def remove_email(request: Request, email_id: str, current_user=Depends(get_current_user)):
    """Delete an email permanently."""
    user_id = str(current_user["_id"])
    success = await delete_email_metadata(user_id, email_id)
    if not success:
        raise HTTPException(status_code=404, detail="Email not found or could not be deleted")
    return {"message": "Email deleted successfully"}
