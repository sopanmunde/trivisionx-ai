import base64
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
import hashlib
import logging
import secrets
from cryptography.fernet import Fernet, InvalidToken
from core.config import settings
from database.mongodb.connection import get_database
from core.constants import COLLECTION_USERS
from schemas.user import TokenData

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


_LOGIN_ATTEMPTS: dict = {}
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15
_MAX_TRACKED_ACCOUNTS = 2000
_ENC_PREFIX = "enc::"


def _fernet() -> Fernet:
    seed = (settings.ENCRYPTION_KEY or settings.SECRET_KEY).encode("utf-8")
    digest = hashlib.sha256(b"trivisionx-secret-vault:" + seed).digest()
    return Fernet(base64.urlsafe_b64encode(digest))


def encrypt_secret(plain: str) -> str:
    """Encrypt sensitive credentials before storing in MongoDB."""
    if not plain or plain.startswith(_ENC_PREFIX):
        return plain
    token = _fernet().encrypt(plain.encode("utf-8")).decode("ascii")
    return f"{_ENC_PREFIX}{token}"


def decrypt_secret(value: str) -> str:
    """Decrypt stored credentials; gracefully returns legacy unencrypted values."""
    if not value:
        return ""
    if not value.startswith(_ENC_PREFIX):
        return value
    raw = value[len(_ENC_PREFIX):]
    try:
        return _fernet().decrypt(raw.encode("ascii")).decode("utf-8")
    except InvalidToken:
        logger.warning("[Security] Failed to decrypt stored secret token")
        return ""


def mask_secret(value: str) -> str:
    """Return a non-recoverable masked representation for API responses."""
    plain = decrypt_secret(value)
    if not plain:
        return ""
    if len(plain) <= 6:
        return "•" * len(plain)
    prefix = plain[:3] if len(plain) > 10 else ""
    return f"{prefix}••••••••{plain[-4:]}"


def normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def _prune_attempts(now: datetime) -> None:
    if len(_LOGIN_ATTEMPTS) <= _MAX_TRACKED_ACCOUNTS:
        return
    expired = [
        k for k, v in _LOGIN_ATTEMPTS.items()
        if (v.get("locked_until") and now >= v["locked_until"]) or (
            not v.get("locked_until") and v.get("updated_at") and (now - v["updated_at"]).total_seconds() > LOCKOUT_DURATION_MINUTES * 60
        )
    ]
    for k in expired:
        _LOGIN_ATTEMPTS.pop(k, None)


def _get_attempt_info(email: str) -> dict:
    key = normalize_email(email)
    return _LOGIN_ATTEMPTS.setdefault(key, {"count": 0, "locked_until": None, "updated_at": datetime.now(timezone.utc)})


def _is_locked(email: str) -> tuple[bool, int]:
    """Returns (is_locked, seconds_remaining)."""
    key = normalize_email(email)
    now = datetime.now(timezone.utc)
    info = _LOGIN_ATTEMPTS.get(key)
    if not info:
        return False, 0
    if info["locked_until"] and now < info["locked_until"]:
        remaining = int((info["locked_until"] - now).total_seconds())
        return True, remaining
    if info["locked_until"] and now >= info["locked_until"]:
        _LOGIN_ATTEMPTS.pop(key, None)
    return False, 0


def _record_failed_attempt(email: str) -> int:
    """Increments fail counter. Returns remaining attempts before lockout."""
    now = datetime.now(timezone.utc)
    _prune_attempts(now)
    info = _get_attempt_info(email)
    info["count"] += 1
    info["updated_at"] = now
    if info["count"] >= MAX_FAILED_ATTEMPTS:
        info["locked_until"] = now + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
    return max(0, MAX_FAILED_ATTEMPTS - info["count"])


def _reset_attempts(email: str):
    """Clear counters on successful login."""
    _LOGIN_ATTEMPTS.pop(normalize_email(email), None)



def _users():
    return get_database()[COLLECTION_USERS]


async def get_password_hash(password: str) -> str:
    import asyncio
    def _hash():
        raw = password.encode('utf-8')
        if len(raw) > 72:
            raw = hashlib.sha256(raw).hexdigest().encode('utf-8')
        salt = bcrypt.gensalt(rounds=10)
        hashed = bcrypt.hashpw(raw, salt)
        return hashed.decode('utf-8')
    return await asyncio.to_thread(_hash)


async def verify_password(plain_password: str, hashed_password: str) -> bool:
    import asyncio
    if not hashed_password or not plain_password:
        return False
    def _verify():
        try:
            raw = plain_password.encode('utf-8')
            hashed_bytes = hashed_password.encode('utf-8')
            if len(raw) <= 72:
                return bcrypt.checkpw(raw, hashed_bytes)
            plain_password_hash = hashlib.sha256(raw).hexdigest().encode('utf-8')
            return bcrypt.checkpw(plain_password_hash, hashed_bytes)
        except ValueError:
            return False
    return await asyncio.to_thread(_verify)


async def get_user(email: str):
    import asyncio
    from pymongo.errors import PyMongoError, NetworkTimeout, ServerSelectionTimeoutError
    norm_email = normalize_email(email)
    try:
        return await _users().find_one({"email": norm_email})
    except (NetworkTimeout, ServerSelectionTimeoutError) as e:
        logger.error(f"[Security] MongoDB SSL/network timeout fetching user: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Cannot reach the database — SSL handshake timed out. "
                "Check your internet connection and MongoDB Atlas IP whitelist."
            ),
        )
    except PyMongoError as e:
        if type(e).__name__ == "_OperationCancelled":
            raise asyncio.CancelledError() from e
        logger.error(f"[Security] Database connectivity error fetching user: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database cluster unreachable. Please check your connection or MongoDB Atlas cluster whitelist.",
        )


async def authenticate_user(email: str, password: str):
    """Authenticate with lockout protection.

    Raises HTTPException (423) when the account is locked.
    Raises HTTPException (401) on invalid credentials or OAuth-only accounts without a password.
    Returns the user document on success.
    """
    norm_email = normalize_email(email)
    locked, seconds_left = _is_locked(norm_email)
    if locked:
        minutes_left = max(1, seconds_left // 60)
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=(
                f"Account temporarily locked after {MAX_FAILED_ATTEMPTS} failed attempts. "
                f"Try again in {minutes_left} minute(s)."
            ),
        )

    user = await get_user(norm_email)
    hashed_pw = user.get("hashed_password") if user else None
    if not user or not hashed_pw or not await verify_password(password, hashed_pw):
        remaining = _record_failed_attempt(norm_email)
        if remaining == 0:
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=(
                    f"Too many failed attempts. Account locked for "
                    f"{LOCKOUT_DURATION_MINUTES} minute(s)."
                ),
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Incorrect email or password. {remaining} attempt(s) remaining.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    _reset_attempts(norm_email)
    return user


def create_access_token(data: dict, expires_delta: timedelta = None):
    now = datetime.now(timezone.utc)
    to_encode = data.copy()
    if "sub" in to_encode and isinstance(to_encode["sub"], str):
        to_encode["sub"] = normalize_email(to_encode["sub"])
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({
        "exp": expire,
        "iat": now,
        "token_type": "access",
        "jti": secrets.token_hex(12),
    })
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        token_type = payload.get("token_type")
        if token_type not in (None, "access"):
            raise credentials_exception
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=normalize_email(email))
    except JWTError:
        raise credentials_exception

    try:
        user = await get_user(email=token_data.email)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Security] get_current_user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    if user is None:
        raise credentials_exception
    return user
