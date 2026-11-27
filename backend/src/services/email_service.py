"""
src/services/email_service.py — Service to send real emails via SMTP
===================================================================
Uses standard smtplib inside asyncio.to_thread to send emails without blocking.
"""
import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from core.config import settings
from core.logger import get_logger

logger = get_logger(__name__)


def _send_smtp_sync(to_email: str, subject: str, body: str) -> bool:
    """Synchronous SMTP email sending execution."""
    clean_to = str(to_email or "").strip()
    if not clean_to or "@" not in clean_to or "\r" in clean_to or "\n" in clean_to:
        logger.warning("Invalid recipient address provided; aborting SMTP send.")
        return False

    clean_subject = str(subject or "(No Subject)").replace("\r", " ").replace("\n", " ").strip()

    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.warning("SMTP username or password not configured in .env. Real email dispatch skipped.")
        return False

    from_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME

    msg = MIMEMultipart()
    msg["From"] = from_email
    msg["To"] = clean_to
    msg["Subject"] = clean_subject
    msg.attach(MIMEText(body or "", "plain"))

    try:
        logger.info(f"Connecting to SMTP server {settings.SMTP_HOST}:{settings.SMTP_PORT}...")
        if int(settings.SMTP_PORT) == 465:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                logger.info(f"Sending SMTP SSL email to {clean_to}...")
                server.sendmail(from_email, clean_to, msg.as_string())
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                logger.info(f"Sending SMTP email to {clean_to}...")
                server.sendmail(from_email, clean_to, msg.as_string())
        logger.info(f"Successfully sent email to {clean_to}")
        return True
    except Exception as e:
        logger.error(f"Failed to send SMTP email to {clean_to}: {e}")
        return False


async def send_real_email(to_email: str, subject: str, body: str) -> bool:
    """Asynchronous wrapper to send email via SMTP in a separate thread."""
    return await asyncio.to_thread(_send_smtp_sync, to_email, subject, body)
