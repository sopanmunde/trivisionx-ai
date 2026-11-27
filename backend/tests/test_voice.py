"""
backend/tests/test_voice.py — Unit tests for the Voice features (STT, TTS, Preprocessing node)
=============================================================================================
Run: pytest backend/tests/test_voice.py -v
"""
import sys
import os
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import UploadFile, HTTPException
from starlette.requests import Request

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from agents.langgraph.nodes.voice_preprocessing_node import voice_preprocessing_node
from api.routes.audio_routes import transcribe, text_to_speech


def _make_request(path: str = "/api/audio/transcribe", method: str = "POST") -> Request:
    return Request({
        "type": "http",
        "method": method,
        "path": path,
        "headers": [],
        "query_string": b"",
        "client": ("127.0.0.1", 12345),
    })


@pytest.mark.asyncio
async def test_voice_preprocessor_skips_when_is_voice_false(sample_agent_state):
    state = sample_agent_state.copy()
    state["is_voice"] = False
    state["query"] = "uh hello there"
    
    result = await voice_preprocessing_node(state)
    assert result.get("current_node") == "voice_preprocessor"
    assert "query" not in result or result["query"] == "uh hello there"


@pytest.mark.asyncio
async def test_voice_preprocessor_cleans_query_when_is_voice_true(sample_agent_state):
    state = sample_agent_state.copy()
    state["is_voice"] = True
    state["query"] = "um write a python function please"
    
    # Mock LLM response
    mock_response = MagicMock()
    mock_response.content = "Write a python function."
    
    with patch("agents.langgraph.nodes.voice_preprocessing_node.get_llm") as mock_get_llm:
        mock_llm = MagicMock()
        mock_llm.ainvoke = AsyncMock(return_value=mock_response)
        mock_get_llm.return_value = mock_llm
        
        result = await voice_preprocessing_node(state)
        
        assert result.get("current_node") == "voice_preprocessor"
        assert result.get("query") == "Write a python function."


@pytest.mark.asyncio
@patch("api.routes.audio_routes.get_active_user_key", new_callable=AsyncMock, return_value=None)
@patch("httpx.AsyncClient.post")
async def test_api_transcribe_google_llm(mock_post, _mock_user_key):
    mock_file = MagicMock(spec=UploadFile)
    mock_file.filename = "test_audio.webm"
    mock_file.content_type = "audio/webm"
    mock_file.read = AsyncMock(side_effect=[b"audio bytes", b""])

    # Mock Gemini response
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": "Hello world transcription"
                        }
                    ]
                }
            }
        ]
    }
    mock_post.return_value = mock_response

    with patch("api.routes.audio_routes.settings") as mock_settings:
        mock_settings.GOOGLE_API_KEY = "mock_google_key"
        mock_settings.DEBUG = True

        res = await transcribe(
            request=_make_request("/api/audio/transcribe", "POST"),
            file=mock_file,
            current_user={"_id": "user123"},
        )

        assert res == {"text": "Hello world transcription"}
        assert mock_post.called
        call_headers = mock_post.call_args.kwargs.get("headers", {})
        assert call_headers.get("x-goog-api-key") == "mock_google_key"
        assert "key=" not in str(mock_post.call_args.args[0])


@pytest.mark.asyncio
async def test_api_tts_fails_when_upstream_fails():
    mock_response = MagicMock()
    mock_response.status_code = 503
    mock_response.content = b""

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock, return_value=mock_response):
        with pytest.raises(HTTPException) as exc_info:
            await text_to_speech(
                request=_make_request("/api/audio/tts", "GET"),
                text="test text",
                current_user={"_id": "user123"},
            )

        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "google_tts_disabled"


@pytest.mark.asyncio
async def test_api_tts_returns_audio_when_upstream_succeeds():
    audio_payload = b"google synthesized audio " * 10
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.content = audio_payload

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock, return_value=mock_response) as mock_get:
        response = await text_to_speech(
            request=_make_request("/api/audio/tts", "GET"),
            text="test text",
            current_user={"_id": "user123"},
        )

        assert response.media_type == "audio/mpeg"

        chunks = []
        async for chunk in response.body_iterator:
            chunks.append(chunk)

        full_content = b"".join(chunks)
        assert full_content == audio_payload
        assert mock_get.called
