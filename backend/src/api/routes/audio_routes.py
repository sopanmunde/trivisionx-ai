"""
src/api/routes/audio_routes.py — Audio processing routes (transcribe & TTS)
==========================================================================
Accepts audio recording uploads and returns transcribed text using Google Gemini LLM.
Synthesizes and streams text-to-speech outputs using Google Cloud TTS.
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, Request
from fastapi.responses import StreamingResponse
import httpx
import base64
import io
import re
import urllib.parse
from core.security import get_current_user
from core.limiter import limiter
from core.constants import RATE_LIMIT_DEFAULT
from core.config import settings
from core.logger import get_logger
from database.mongodb.repositories.brain_repository import get_active_user_key

router = APIRouter()
logger = get_logger(__name__)

_MAX_AUDIO_BYTES = 20 * 1024 * 1024  # 20 MB


@router.post("/transcribe", summary="Transcribe spoken audio from microphone using Google LLM")
@limiter.limit(RATE_LIMIT_DEFAULT)
async def transcribe(
    request: Request,
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    """
    Uploads a voice recording and transcribes it using Google Gemini (gemini-2.5-flash) multimodal capabilities.
    """
    user_id = str(current_user["_id"])
    user_google_key = await get_active_user_key(user_id, "google")
    api_key = user_google_key or settings.GOOGLE_API_KEY

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google API Key is not configured for audio transcription.",
        )

    logger.info(f"[Audio] Transcribing file={file.filename}, type={file.content_type} using Google LLM")

    try:
        chunks = []
        total = 0
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            total += len(chunk)
            if total > _MAX_AUDIO_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="Audio recording exceeds the 20 MB limit.",
                )
            chunks.append(chunk)

        file_bytes = b"".join(chunks)
        if not file_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audio file is empty.",
            )

        audio_base64 = base64.b64encode(file_bytes).decode("utf-8")

        # Mime type normalization: if webm, use audio/webm, or audio/mp3 etc.
        mime_type = file.content_type or "audio/webm"
        if "octet-stream" in mime_type:
            mime_type = "audio/webm"

        # Pass Gemini API key via header rather than URL query string
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": audio_base64
                            }
                        },
                        {
                            "text": "Transcribe this audio precisely. Output ONLY the transcription text, do not add any comments, notes or extra words."
                        }
                    ]
                }
            ]
        }

        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": api_key,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers=headers,
                json=payload,
                timeout=30.0
            )

        if response.status_code != 200:
            logger.error(f"[Audio] Gemini transcription API error: {response.status_code} - {response.text[:300]}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Upstream transcription service error."
            )

        result = response.json()
        try:
            transcript = result["candidates"][0]["content"]["parts"][0]["text"].strip()
        except (KeyError, IndexError) as parse_err:
            logger.error(f"[Audio] Failed to parse Gemini response: {parse_err}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to parse transcription from upstream audio response."
            )

        logger.info(f"[Audio] Transcription success: '{transcript[:60]}'")
        return {"text": transcript}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Audio] Transcription failed: {e}", exc_info=True)
        detail = f"Transcription failed: {str(e)}" if settings.DEBUG else "Audio transcription failed."
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail
        )


@router.get("/tts", summary="Convert text to speech stream")
@limiter.limit(RATE_LIMIT_DEFAULT)
async def text_to_speech(
    request: Request,
    text: str = Query(..., max_length=2000),
    current_user=Depends(get_current_user),
):
    """
    Converts assistant text into spoken audio stream using Google Translate TTS service.
    If TTS fails or is disabled, returns 400 so the browser can fall back to Web Speech Synthesis.
    """
    logger.info(f"[Audio] Converting text to speech, length={len(text)}")

    # Clean Markdown links, formatting and citations for speech synthesis
    clean_text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    clean_text = re.sub(r'\[\d+\]', '', clean_text)
    clean_text = re.sub(r'[*_`#~>]', '', clean_text).strip()

    if not clean_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="tts_empty_text",
        )

    # Limit chunk to 500 chars for fast playback
    chunk = clean_text[:500]

    try:
        encoded_text = urllib.parse.quote(chunk)
        tts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q={encoded_text}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(tts_url, headers=headers, timeout=10.0)

        if response.status_code == 200 and len(response.content) > 100:
            return StreamingResponse(io.BytesIO(response.content), media_type="audio/mpeg")
        logger.warning(f"[Audio] Google Translate TTS failed status={response.status_code}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="google_tts_disabled",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"[Audio] TTS conversion failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="google_tts_disabled",
        )
