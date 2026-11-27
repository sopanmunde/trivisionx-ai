"""
Google OAuth2 SSO routes — login redirect and callback.
========================================================
Flow:
  1. GET  /login  → returns Google authorization URL
  2. POST /callback → exchanges auth code for tokens, upserts user, returns JWT
"""
import os
import threading
import time
import urllib.parse
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, HTTPException, Request, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from jose import JWTError, jwt
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError

from core.config import settings
from core.constants import COLLECTION_OAUTH_STATES, COLLECTION_USERS
from core.http import get_http_client
from core.limiter import limiter
from core.logger import get_logger
from core.security import create_access_token, normalize_email
from database.mongodb.connection import get_database

logger = get_logger(__name__)
router = APIRouter()


class OAuthCallbackRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=4096)
    state: str = Field(..., min_length=1, max_length=4096)


class CachedGoogleRequest(google_requests.Request):
    def __init__(self, cache_timeout=86400):
        super().__init__()
        self._cache = {}
        self._cache_timeout = cache_timeout
        self._lock = threading.Lock()

    def __call__(self, url, method="GET", body=None, headers=None, timeout=None, **kwargs):
        if method == "GET" and "oauth2/v3/certs" in url:
            now = time.time()
            with self._lock:
                if url in self._cache:
                    cached_time, response = self._cache[url]
                    if now - cached_time < self._cache_timeout:
                        return response

            response = super().__call__(url, method, body, headers, timeout, **kwargs)
            with self._lock:
                self._cache[url] = (now, response)
            return response

        return super().__call__(url, method, body, headers, timeout, **kwargs)


cached_google_request = CachedGoogleRequest()

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"


def _db():
    return get_database()


def _users():
    return _db()[COLLECTION_USERS]


def _allowed_origins() -> set[str]:
    origins = {
        settings.FRONTEND_URL.rstrip("/"),
        "https://trivisionx-ai.vercel.app",
    }
    if settings.DEBUG:
        origins.update({
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        })
    return {o for o in origins if o}


def _resolve_redirect_uri(request: Request) -> str:
    redirect_uri = settings.REDIRECT_URI
    referer = request.headers.get("referer")
    if referer:
        try:
            parsed = urllib.parse.urlparse(referer)
            origin = f"{parsed.scheme}://{parsed.netloc}".rstrip("/")
            if parsed.scheme in {"http", "https"} and origin in _allowed_origins():
                redirect_uri = f"{origin}/login"
        except Exception:
            pass
    return redirect_uri


@router.get("/login")
@limiter.limit("10/minute")
async def google_login(request: Request):
    """
    Returns the Google OAuth2 authorization URL.
    The frontend should redirect the user to this URL.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured (GOOGLE_CLIENT_ID missing)",
        )

    redirect_uri = _resolve_redirect_uri(request)
    now = datetime.now(timezone.utc)
    nonce = os.urandom(16).hex()

    await _db()[COLLECTION_OAUTH_STATES].insert_one({
        "nonce": nonce,
        "provider": "google",
        "redirect_uri": redirect_uri,
        "created_at": now,
    })

    state_payload = {
        "provider": "google",
        "redirect_uri": redirect_uri,
        "exp": now + timedelta(minutes=15),
        "nonce": nonce,
    }
    signed_state = jwt.encode(state_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
        "state": signed_state,
    }
    url = f"{GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}"
    return {"authorization_url": url}


@router.post("/callback")
@limiter.limit("10/minute")
async def google_callback(request: Request, payload: OAuthCallbackRequest):
    """
    Exchanges the authorization code for tokens, verifies the ID token,
    consumes the single-use OAuth nonce, upserts the user, and returns a JWT.
    """
    code = payload.code
    state = payload.state

    try:
        decoded_state = jwt.decode(state, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if decoded_state.get("provider") != "google":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid state provider",
            )
        nonce = decoded_state.get("nonce")
        redirect_uri = decoded_state.get("redirect_uri", settings.REDIRECT_URI)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OAuth state parameter (anti-CSRF failure)",
        )

    consumed_state = await _db()[COLLECTION_OAUTH_STATES].find_one_and_delete({
        "nonce": nonce,
        "provider": "google",
    }) if nonce else None
    if not consumed_state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OAuth state has already been used or expired",
        )

    token_data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }

    client = get_http_client()
    try:
        token_response = await client.post(GOOGLE_TOKEN_URL, data=token_data)
    except httpx.HTTPError as e:
        logger.error(f"Google token exchange network error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to contact Google authentication servers",
        )

    if token_response.status_code != 200:
        logger.error(f"Google token exchange failed: {token_response.status_code}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to exchange authorization code with Google",
        )

    tokens = token_response.json()
    id_token_str = tokens.get("id_token")

    if not id_token_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No ID token received from Google",
        )

    try:
        import asyncio
        loop = asyncio.get_running_loop()
        id_info = await loop.run_in_executor(
            None,
            lambda: id_token.verify_oauth2_token(
                id_token_str,
                cached_google_request,
                settings.GOOGLE_CLIENT_ID,
            )
        )
    except Exception as e:
        logger.error(f"Google ID token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google ID token",
        )

    raw_email = id_info.get("email")
    if not raw_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not provided by Google",
        )

    if not id_info.get("email_verified"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account email is not verified",
        )

    email = normalize_email(raw_email)
    google_id = id_info.get("sub")
    first_name = id_info.get("given_name", "")
    last_name = id_info.get("family_name", "")
    avatar_url = id_info.get("picture", "")

    existing_user = await _users().find_one({"google_id": google_id}) if google_id else None
    if not existing_user:
        existing_user = await _users().find_one({"email": email})

    now = datetime.now(timezone.utc)
    if existing_user:
        if existing_user.get("google_id") and google_id and existing_user["google_id"] != google_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is already linked to another Google identity",
            )
        if not existing_user.get("google_id") and existing_user.get("hashed_password") and not existing_user.get("email_verified"):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email uses password login. Sign in with your password instead.",
            )

        update_fields = {"updated_at": now, "email_verified": True}
        if not existing_user.get("google_id") and google_id:
            update_fields["google_id"] = google_id
        if not existing_user.get("avatar_url") and avatar_url:
            update_fields["avatar_url"] = avatar_url
        if not existing_user.get("auth_provider"):
            update_fields["auth_provider"] = "google"

        await _users().update_one(
            {"_id": existing_user["_id"]},
            {"$set": update_fields},
        )
        logger.info(f"Google SSO: existing user logged in — {email}")
    else:
        new_user = {
            "email": email,
            "username": email.split("@")[0],
            "first_name": first_name,
            "last_name": last_name,
            "google_id": google_id,
            "avatar_url": avatar_url,
            "auth_provider": "google",
            "email_verified": True,
            "created_at": now,
        }
        try:
            await _users().insert_one(new_user)
        except DuplicateKeyError:
            raise HTTPException(status_code=409, detail="Email or username already exists")
        logger.info(f"Google SSO: new user created — {email}")

    access_token = create_access_token(data={"sub": email})
    return {"access_token": access_token, "token_type": "bearer"}
