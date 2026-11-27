"""
src/services/event_notification_scheduler.py — Event Email Reminder Background Scheduler
========================================================================================
Periodically checks stored calendar events for upcoming email notification triggers
(2d, 1d, 5h, 1h, 30m, 5m, start) and dispatches email notifications.
"""
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional
from bson import ObjectId
from database.mongodb.connection import get_database
from core.constants import COLLECTION_EVENTS, COLLECTION_EMAILS, COLLECTION_USERS
from core.logger import get_logger
from services.email_service import send_real_email

logger = get_logger(__name__)

NOTIFICATION_OFFSETS = {
    "2d": timedelta(days=2),
    "1d": timedelta(days=1),
    "5h": timedelta(hours=5),
    "1h": timedelta(hours=1),
    "30m": timedelta(minutes=30),
    "5m": timedelta(minutes=5),
    "start": timedelta(seconds=0),
}

OFFSET_LABELS = {
    "2d": "2 days before",
    "1d": "1 day before",
    "5h": "5 hours before",
    "1h": "1 hour before",
    "30m": "30 minutes before",
    "5m": "5 minutes before",
    "start": "Starting now",
}

_scheduler_task: Optional[asyncio.Task] = None


async def check_and_dispatch_event_notifications():
    """Scans all events and dispatches due email notifications."""
    db = get_database()
    if db is None:
        return

    now = datetime.now(timezone.utc)
    user_email_cache: Dict[str, Optional[str]] = {}
    try:
        events = await db[COLLECTION_EVENTS].find({
            "emailNotifications": {"$exists": True, "$not": {"$size": 0}}
        }).to_list(1000)

        for event in events:
            event_from_str = event.get("from")
            if not event_from_str:
                continue

            try:
                event_start = datetime.fromisoformat(event_from_str.replace("Z", "+00:00"))
                if event_start.tzinfo is None:
                    event_start = event_start.replace(tzinfo=timezone.utc)
            except Exception:
                continue

            email_notifications = event.get("emailNotifications", [])
            sent_notifications = set(event.get("sentNotifications", []))
            user_id = str(event.get("user_id") or "")
            target_email = str(event.get("notificationEmail") or "").strip()

            if not target_email and user_id and user_id != "system":
                if user_id not in user_email_cache:
                    user_email = None
                    if ObjectId.is_valid(user_id):
                        user_doc = await db[COLLECTION_USERS].find_one(
                            {"_id": ObjectId(user_id)},
                            {"email": 1},
                        )
                        if user_doc:
                            user_email = str(user_doc.get("email") or "").strip() or None
                    user_email_cache[user_id] = user_email
                target_email = user_email_cache.get(user_id) or ""

            title = event.get("title", "Upcoming Meeting")

            # Identify due notifications ordered from closest to event start backwards
            due_candidates = []
            for notif_code in email_notifications:
                if notif_code in sent_notifications:
                    continue
                offset = NOTIFICATION_OFFSETS.get(notif_code)
                if offset is None:
                    continue
                trigger_time = event_start - offset
                if trigger_time <= now <= (event_start + timedelta(minutes=30)):
                    due_candidates.append((offset, notif_code, trigger_time))

            if not due_candidates:
                continue

            # Dispatch only the most imminent due reminder and mark skipped older due offsets as claimed
            due_candidates.sort(key=lambda item: item[0])
            _, active_code, _ = due_candidates[0]
            claim_codes = [code for _, code, _ in due_candidates]

            claimed = await db[COLLECTION_EVENTS].find_one_and_update(
                {
                    "_id": event["_id"],
                    "sentNotifications": {"$ne": active_code},
                },
                {
                    "$addToSet": {"sentNotifications": {"$each": claim_codes}}
                },
            )
            if not claimed:
                continue

            label = OFFSET_LABELS.get(active_code, active_code)
            subject = f"[Reminder: {label}] {title}"
            body = (
                f"Hello,\n\n"
                f"This is an automated email reminder for your upcoming calendar event:\n\n"
                f"Event Title: {title}\n"
                f"Scheduled Start: {event_start.strftime('%B %d, %Y at %I:%M %p UTC')}\n"
                f"Reminder Timing: {label}\n"
                f"Location: {event.get('location', 'N/A')}\n"
                f"Description: {event.get('description', 'N/A')}\n\n"
                f"Best regards,\nTriVisionX AI Assistant"
            )

            email_doc = {
                "user_id": user_id or "system",
                "name": "TriVisionX Calendar Reminders",
                "email": target_email or "noreply@trivisionx.local",
                "subject": subject,
                "date": "Just now",
                "fullDate": now.strftime("%b %d, %Y, %I:%M:%S %p"),
                "snippet": f"Reminder ({label}): {title} at {event_start.strftime('%I:%M %p')}",
                "body": body,
                "tags": ["calendar", "reminder", "important"],
                "unread": True,
                "favorite": True,
                "folder": "inbox",
                "category": "updates",
                "created_at": now
            }
            await db[COLLECTION_EMAILS].insert_one(email_doc)
            logger.info(f"Dispatched in-app email reminder [{active_code}] for event '{title}'")

            if target_email and "@" in target_email:
                try:
                    await send_real_email(to_email=target_email, subject=subject, body=body)
                except Exception as email_err:
                    logger.error(f"Failed to send real SMTP email: {email_err}")
    except Exception as e:
        err_str = str(e)
        if "getaddrinfo failed" in err_str or "ServerSelectionTimeoutError" in err_str or "AutoReconnect" in err_str:
            logger.warning("MongoDB cluster unreachable for event notification check (network/DNS issue)")
        else:
            logger.error(f"Error checking event notifications: {e}")
        raise


async def _notification_loop():
    consecutive_errors = 0
    while True:
        try:
            await check_and_dispatch_event_notifications()
            consecutive_errors = 0
            sleep_time = 30
        except Exception:
            consecutive_errors += 1
            # Exponential backoff up to 2 minutes when DB is unreachable
            sleep_time = min(30 * (2 ** min(consecutive_errors - 1, 3)), 120)
        await asyncio.sleep(sleep_time)


async def start_event_scheduler():
    global _scheduler_task
    if _scheduler_task is None or _scheduler_task.done():
        _scheduler_task = asyncio.create_task(_notification_loop())
        logger.info("[OK] Event Email Notification Scheduler active (30s poll)")


async def shutdown_event_scheduler():
    global _scheduler_task
    if _scheduler_task and not _scheduler_task.done():
        _scheduler_task.cancel()
        logger.info("[OK] Event Email Notification Scheduler stopped")
