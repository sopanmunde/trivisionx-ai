import asyncio
from typing import Optional
import httpx

_client: Optional[httpx.AsyncClient] = None
_client_loop: Optional[asyncio.AbstractEventLoop] = None


def get_http_client() -> httpx.AsyncClient:
    """
    Returns a shared httpx.AsyncClient instance bound to the current running event loop.
    Recreates the client cleanly if closed or called on a new event loop.
    """
    global _client, _client_loop
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if _client is None or _client.is_closed or _client_loop is not loop:
        _client = httpx.AsyncClient(
            timeout=10.0,
            limits=httpx.Limits(max_keepalive_connections=10, max_connections=20),
        )
        _client_loop = loop
    return _client


async def close_http_client():
    """
    Closes the shared httpx.AsyncClient connection pool on application shutdown.
    """
    global _client, _client_loop
    if _client is not None:
        try:
            await _client.aclose()
        finally:
            _client = None
            _client_loop = None
