"""Request/response logger pure-ASGI middleware."""
import time
from starlette.types import ASGIApp, Message, Receive, Scope, Send
from core.logger import get_logger

logger = get_logger("http")


class RequestLoggerMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        start = time.perf_counter()
        status_code = 500
        method = scope.get("method", "?")
        path = scope.get("path", "")

        async def send_wrapper(message: Message) -> None:
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = message.get("status", 500)
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        finally:
            duration_ms = round((time.perf_counter() - start) * 1000, 1)
            logger.info(f"{method} {path} -> {status_code} ({duration_ms}ms)")
