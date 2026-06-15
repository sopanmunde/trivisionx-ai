import httpx

_client = None

def get_http_client() -> httpx.AsyncClient:
    """
    Returns a shared httpx.AsyncClient instance.
    Uses lazy-loading to ensure the client is instantiated on the active event loop.
    Enables connection pooling (Keep-Alive) to significantly speed up outgoing requests.
    """
    global _client
    if _client is None:
        _client = httpx.AsyncClient(
            timeout=10.0,
            limits=httpx.Limits(max_keepalive_connections=10, max_connections=20),
        )
    return _client

async def close_http_client():
    """
    Closes the shared httpx.AsyncClient connection pool on application shutdown.
    """
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None
