"""
GitHub OAuth2 SSO routes — login redirect and callback.
========================================================
Flow:
  1. GET  /login  → returns GitHub authorization URL
  2. POST /callback → exchanges auth code for token, fetches user info, upserts user, returns JWT
"""
import asyncio
import os
import urllib.parse
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, HTTPException, Request, status
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

GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAILS_URL = "https://api.github.com/user/emails"


class OAuthCallbackRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=4096)
    state: str = Field(..., min_length=1, max_length=4096)


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
async def github_login(request: Request):
    """
    Returns the GitHub OAuth2 authorization URL.
    The frontend should redirect the user to this URL.
    """
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub OAuth is not configured (GITHUB_CLIENT_ID missing)",
        )

    redirect_uri = _resolve_redirect_uri(request)
    now = datetime.now(timezone.utc)
    nonce = os.urandom(16).hex()

    await _db()[COLLECTION_OAUTH_STATES].insert_one({
        "nonce": nonce,
        "provider": "github",
        "redirect_uri": redirect_uri,
        "created_at": now,
    })

    state_payload = {
        "provider": "github",
        "redirect_uri": redirect_uri,
        "exp": now + timedelta(minutes=15),
        "nonce": nonce,
    }
    signed_state = jwt.encode(state_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "scope": "read:user user:email",
        "state": signed_state,
    }
    url = f"{GITHUB_AUTH_URL}?{urllib.parse.urlencode(params)}"
    return {"authorization_url": url}


@router.post("/callback")
@limiter.limit("10/minute")
async def github_callback(request: Request, payload: OAuthCallbackRequest):
    """
    Exchanges the authorization code for an access token, fetches user info
    from GitHub API, consumes single-use nonce, upserts the user, and returns a JWT.
    """
    code = payload.code
    state = payload.state

    try:
        decoded_state = jwt.decode(state, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if decoded_state.get("provider") != "github":
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
        "provider": "github",
    }) if nonce else None
    if not consumed_state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OAuth state has already been used or expired",
        )

    token_data = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "client_secret": settings.GITHUB_CLIENT_SECRET,
        "code": code,
        "redirect_uri": redirect_uri,
    }

    client = get_http_client()
    try:
        token_response = await client.post(
            GITHUB_TOKEN_URL,
            data=token_data,
            headers={"Accept": "application/json"},
        )
    except httpx.HTTPError as e:
        logger.error(f"GitHub token exchange network error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to contact GitHub authentication servers",
        )

    if token_response.status_code != 200:
        logger.error(f"GitHub token exchange failed: {token_response.status_code}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to exchange authorization code with GitHub",
        )

    tokens = token_response.json()
    access_token = tokens.get("access_token")

    if not access_token:
        error_desc = tokens.get("error_description", "Unknown error")
        logger.error(f"GitHub token exchange error: {error_desc}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"GitHub OAuth error: {error_desc}",
        )

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
    }

    try:
        user_response, emails_response = await asyncio.gather(
            client.get(GITHUB_USER_URL, headers=headers),
            client.get(GITHUB_EMAILS_URL, headers=headers),
        )
    except httpx.HTTPError as e:
        logger.error(f"GitHub user info network error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to fetch user profile from GitHub",
        )

    if user_response.status_code != 200:
        logger.error(f"GitHub user info fetch failed: {user_response.status_code}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to fetch user info from GitHub",
        )

    github_user = user_response.json()

    raw_email = None
    if emails_response.status_code == 200:
        emails = emails_response.json()
        for e in emails:
            if e.get("primary") and e.get("verified"):
                raw_email = e["email"]
                break
        if not raw_email:
            for e in emails:
                if e.get("verified"):
                    raw_email = e["email"]
                    break

    if not raw_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not retrieve a verified email from GitHub. Please verify your email address on GitHub.",
        )

    email = normalize_email(raw_email)
    github_id = str(github_user.get("id", ""))
    username = github_user.get("login", "")
    name = github_user.get("name", "")
    avatar_url = github_user.get("avatar_url", "")

    name_parts = name.split(" ", 1) if name else ["", ""]
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    existing_user = await _users().find_one({"github_id": github_id}) if github_id else None
    if not existing_user:
        existing_user = await _users().find_one({"email": email})

    now = datetime.now(timezone.utc)
    if existing_user:
        if existing_user.get("github_id") and github_id and existing_user["github_id"] != github_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is already linked to another GitHub identity",
            )
        if not existing_user.get("github_id") and existing_user.get("hashed_password") and not existing_user.get("email_verified"):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email uses password login. Sign in with your password instead.",
            )

        update_fields = {"updated_at": now, "email_verified": True}
        if not existing_user.get("github_id") and github_id:
            update_fields["github_id"] = github_id
        if not existing_user.get("avatar_url") and avatar_url:
            update_fields["avatar_url"] = avatar_url
        if not existing_user.get("auth_provider"):
            update_fields["auth_provider"] = "github"

        await _users().update_one(
            {"_id": existing_user["_id"]},
            {"$set": update_fields},
        )
        logger.info(f"GitHub SSO: existing user logged in — {email}")
    else:
        new_user = {
            "email": email,
            "username": username or email.split("@")[0],
            "first_name": first_name,
            "last_name": last_name,
            "github_id": github_id,
            "avatar_url": avatar_url,
            "auth_provider": "github",
            "email_verified": True,
            "created_at": now,
        }
        try:
            await _users().insert_one(new_user)
        except DuplicateKeyError:
            raise HTTPException(status_code=409, detail="Email or username already exists")
        logger.info(f"GitHub SSO: new user created — {email}")

    jwt_token = create_access_token(data={"sub": email})
    return {"access_token": jwt_token, "token_type": "bearer"}
