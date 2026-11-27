"""
src/core/llm_factory.py — Multi-LLM Provider Factory
=====================================================
Returns the appropriate LangChain chat model based on provider string.
Supports: openai, anthropic, google, groq, mistral, cohere, ollama, lmstudio, vllm, custom
"""
from contextvars import ContextVar
from typing import Optional
import asyncio
import threading
import time
import weakref

from langchain_core.callbacks import AsyncCallbackHandler
from langchain_core.language_models.chat_models import BaseChatModel
from core.config import settings
from core.logger import get_logger

logger = get_logger(__name__)

PROVIDER_PRIORITY = ["openai", "anthropic", "google", "groq", "mistral", "cohere"]

PROVIDER_MODEL_MAP = {
    "openai":     ("OPENAI_API_KEY",     settings.OPENAI_CHAT_MODEL),
    "anthropic":  ("ANTHROPIC_API_KEY",  settings.ANTHROPIC_CHAT_MODEL),
    "google":     ("GOOGLE_API_KEY",     settings.GEMINI_MODEL),
    "groq":       ("GROQ_API_KEY",      settings.GROQ_CHAT_MODEL),
    "mistral":    ("MISTRAL_API_KEY",   settings.MISTRAL_CHAT_MODEL),
    "cohere":     ("COHERE_API_KEY",    settings.COHERE_CHAT_MODEL),
    "ollama":     ("", ""),
    "lmstudio":   ("", ""),
    "vllm":       ("", ""),
    "custom":     ("", ""),
}

current_user_keys: ContextVar[dict] = ContextVar("current_user_keys", default={})
current_user_id: ContextVar[str] = ContextVar("current_user_id", default="")


class LLMRateLimiter:
    def __init__(self):
        self.last_request_time = 0.0
        self._thread_lock = threading.Lock()
        self._loop_locks: weakref.WeakKeyDictionary[asyncio.AbstractEventLoop, asyncio.Lock] = weakref.WeakKeyDictionary()

    def _get_loop_lock(self) -> asyncio.Lock:
        loop = asyncio.get_running_loop()
        with self._thread_lock:
            lock = self._loop_locks.get(loop)
            if lock is None:
                lock = asyncio.Lock()
                self._loop_locks[loop] = lock
            return lock

    async def throttle_async(self):
        rate_limit = getattr(settings, "RATE_LIMIT_PER_MINUTE", 60)
        if rate_limit <= 0:
            return

        interval = 60.0 / rate_limit
        lock = self._get_loop_lock()
        async with lock:
            now = time.monotonic()
            next_slot = max(now, self.last_request_time + interval)
            sleep_time = max(0.0, next_slot - now)
            self.last_request_time = next_slot

        if sleep_time > 0:
            logger.info(
                f"RateLimiter: Throttling async LLM request. "
                f"Sleeping for {sleep_time:.2f}s (Rate: {rate_limit} RPM)"
            )
            await asyncio.sleep(sleep_time)


_global_limiter = LLMRateLimiter()


class RateLimitingCallbackHandler(AsyncCallbackHandler):
    async def on_llm_start(self, *args, **kwargs) -> None:
        await _global_limiter.throttle_async()

    async def on_chat_model_start(self, *args, **kwargs) -> None:
        await _global_limiter.throttle_async()


def _wrap_with_rate_limit(llm: BaseChatModel) -> None:
    llm.callbacks = (llm.callbacks or []) + [RateLimitingCallbackHandler()]


def get_llm(
    provider: str = "",
    model_name: str = "",
    temperature: float = 0.2,
    streaming: bool = True,
    api_key: Optional[str] = None,
) -> BaseChatModel:
    """
    Factory: returns a LangChain chat model for the given provider.

    Args:
        provider:  'anthropic' | 'google' | 'groq' | 'mistral' | 'openai' | 'cohere' | ...
        model_name: Override the default model for the provider.
        temperature: LLM temperature (0.0 - 1.0).
        streaming: Enable token-level streaming.
        api_key: Optional custom API key.

    Returns:
        A BaseChatModel instance.

    Raises:
        ValueError: If the provider is unknown.
        RuntimeError: If the required API key is missing.
    """
    raw_provider = (provider or "").lower().strip()
    model = (model_name or "").strip()
    provider = _resolve_provider(raw_provider, model)

    if not api_key:
        keys_dict = current_user_keys.get()
        if keys_dict and provider in keys_dict:
            api_key = keys_dict[provider]

    logger.info(f"LLM Factory: provider={provider}, model={model or 'default'}, temp={temperature}")

    if provider == "openai":
        llm = _build_openai(model, temperature, streaming, api_key)
    elif provider == "anthropic":
        llm = _build_anthropic(model, temperature, streaming, api_key)
    elif provider == "google":
        llm = _build_google(model, temperature, streaming, api_key)
    elif provider == "groq":
        llm = _build_groq(model, temperature, streaming, api_key)
    elif provider == "mistral":
        llm = _build_mistral(model, temperature, streaming, api_key)
    elif provider == "cohere":
        llm = _build_cohere(model, temperature, streaming, api_key)
    elif provider == "ollama":
        llm = _build_ollama(model, temperature, streaming, api_key)
    elif provider == "lmstudio":
        llm = _build_lmstudio(model, temperature, streaming, api_key)
    elif provider == "vllm":
        llm = _build_vllm(model, temperature, streaming, api_key)
    elif provider == "custom":
        llm = _build_custom(model, temperature, streaming, api_key)
    else:
        raise ValueError(f"Unknown LLM provider: '{provider}'. "
                         f"Supported: {', '.join(PROVIDER_MODEL_MAP)}")

    _wrap_with_rate_limit(llm)
    return llm


def _resolve_provider(provider: str, model: str) -> str:
    """Auto-detect provider from model name if provider is not explicitly set."""
    if provider and provider != "default":
        return provider
    if not model:
        return settings.DEFAULT_LLM_PROVIDER
    model_lower = model.lower()
    if model_lower.startswith(("gpt", "o1", "o3", "o4")):
        return "openai"
    if model_lower.startswith("claude"):
        return "anthropic"
    if model_lower.startswith("gemini"):
        return "google"
    if model_lower.startswith(("llama", "gemma")) or "mixtral" in model_lower:
        return "groq"
    if model_lower.startswith(("mistral", "codestral", "open-mistral")):
        return "mistral"
    if model_lower.startswith("command"):
        return "cohere"
    return settings.DEFAULT_LLM_PROVIDER


def _require_api_key(env_var: str, provider_name: str, api_key: Optional[str] = None) -> str:
    if api_key:
        return api_key
    key = getattr(settings, env_var, "") or ""
    if not key:
        raise RuntimeError(
            f"{env_var} is not set. "
            f"Add it to your .env file to use {provider_name}."
        )
    return key


def _build_openai(model: str, temperature: float, streaming: bool, api_key: Optional[str] = None) -> BaseChatModel:
    from langchain_openai import ChatOpenAI
    key = _require_api_key("OPENAI_API_KEY", "OpenAI", api_key)
    return ChatOpenAI(
        model=model or settings.OPENAI_CHAT_MODEL,
        temperature=temperature,
        streaming=streaming,
        api_key=key,
    )


def _build_anthropic(model: str, temperature: float, streaming: bool, api_key: Optional[str] = None) -> BaseChatModel:
    from langchain_anthropic import ChatAnthropic
    key = _require_api_key("ANTHROPIC_API_KEY", "Anthropic", api_key)
    return ChatAnthropic(
        model=model or settings.ANTHROPIC_CHAT_MODEL,
        temperature=temperature,
        streaming=streaming,
        api_key=key,
    )


def _build_google(model: str, temperature: float, streaming: bool, api_key: Optional[str] = None) -> BaseChatModel:
    from langchain_google_genai import ChatGoogleGenerativeAI
    key = _require_api_key("GOOGLE_API_KEY", "Google Gemini", api_key)
    return ChatGoogleGenerativeAI(
        model=model or settings.GEMINI_MODEL,
        temperature=temperature,
        streaming=streaming,
        google_api_key=key,
        max_output_tokens=4096,
        max_retries=1,
    )


def _build_groq(model: str, temperature: float, streaming: bool, api_key: Optional[str] = None) -> BaseChatModel:
    from langchain_groq import ChatGroq
    key = _require_api_key("GROQ_API_KEY", "Groq", api_key)
    return ChatGroq(
        model=model or settings.GROQ_CHAT_MODEL,
        temperature=temperature,
        streaming=streaming,
        api_key=key,
    )


def _build_mistral(model: str, temperature: float, streaming: bool, api_key: Optional[str] = None) -> BaseChatModel:
    from langchain_mistralai import ChatMistralAI
    key = _require_api_key("MISTRAL_API_KEY", "Mistral", api_key)
    return ChatMistralAI(
        model=model or settings.MISTRAL_CHAT_MODEL,
        temperature=temperature,
        streaming=streaming,
        api_key=key,
    )


def _build_cohere(model: str, temperature: float, streaming: bool, api_key: Optional[str] = None) -> BaseChatModel:
    from langchain_cohere import ChatCohere
    key = _require_api_key("COHERE_API_KEY", "Cohere", api_key)
    return ChatCohere(
        model=model or settings.COHERE_CHAT_MODEL,
        temperature=temperature,
        streaming=streaming,
        cohere_api_key=key,
    )


def _require_endpoint(env_var: str, provider_name: str) -> str:
    endpoint = (getattr(settings, env_var, "") or "").strip()
    if not endpoint:
        raise RuntimeError(f"{env_var} is not configured for {provider_name}.")
    return endpoint


def _build_ollama(model: str, temperature: float, streaming: bool, api_key: Optional[str] = None) -> BaseChatModel:
    from langchain_openai import ChatOpenAI
    base_url = _require_endpoint("OLLAMA_ENDPOINT", "Ollama")
    if not base_url.endswith("/v1"):
        base_url = f"{base_url.rstrip('/')}/v1"
    return ChatOpenAI(
        model=model or "llama3.2",
        temperature=temperature,
        streaming=streaming,
        base_url=base_url,
        api_key=api_key or "ollama",
    )


def _build_lmstudio(model: str, temperature: float, streaming: bool, api_key: Optional[str] = None) -> BaseChatModel:
    from langchain_openai import ChatOpenAI
    base_url = _require_endpoint("LMSTUDIO_ENDPOINT", "LM Studio")
    return ChatOpenAI(
        model=model or "any-gguf-model",
        temperature=temperature,
        streaming=streaming,
        base_url=base_url,
        api_key=api_key or "lmstudio",
    )


def _build_vllm(model: str, temperature: float, streaming: bool, api_key: Optional[str] = None) -> BaseChatModel:
    from langchain_openai import ChatOpenAI
    base_url = _require_endpoint("VLLM_ENDPOINT", "vLLM")
    return ChatOpenAI(
        model=model or "any-huggingface-model",
        temperature=temperature,
        streaming=streaming,
        base_url=base_url,
        api_key=api_key or "vllm",
    )


def _build_custom(model: str, temperature: float, streaming: bool, api_key: Optional[str] = None) -> BaseChatModel:
    from langchain_openai import ChatOpenAI
    base_url = _require_endpoint("CUSTOM_ENDPOINT", "Custom Endpoint")
    return ChatOpenAI(
        model=model or "custom",
        temperature=temperature,
        streaming=streaming,
        base_url=base_url,
        api_key=api_key or "custom",
    )


def get_available_providers() -> dict:
    """Return which providers are configured (env or active user BYOK key)."""
    user_keys = current_user_keys.get() or {}
    return {
        "openai":    bool(settings.OPENAI_API_KEY or user_keys.get("openai")),
        "anthropic": bool(settings.ANTHROPIC_API_KEY or user_keys.get("anthropic")),
        "google":    bool(settings.GOOGLE_API_KEY or user_keys.get("google")),
        "groq":      bool(settings.GROQ_API_KEY or user_keys.get("groq")),
        "mistral":   bool(settings.MISTRAL_API_KEY or user_keys.get("mistral")),
        "cohere":    bool(settings.COHERE_API_KEY or user_keys.get("cohere")),
        "ollama":    bool(settings.OLLAMA_ENDPOINT),
        "lmstudio":  bool(settings.LMSTUDIO_ENDPOINT),
        "vllm":      bool(settings.VLLM_ENDPOINT),
        "custom":    bool(settings.CUSTOM_ENDPOINT),
    }


def get_fallback_providers(primary_provider: str) -> list[str]:
    """
    Return ordered list of providers to try, starting with the primary.

    On quota failure the caller should iterate through this list and
    emit a *provider_switch* SSE event on each retry.
    """
    configured = get_available_providers()
    result: list[str] = []
    primary = primary_provider.lower().strip() if primary_provider else settings.DEFAULT_LLM_PROVIDER

    if configured.get(primary, False):
        result.append(primary)

    for p in PROVIDER_PRIORITY:
        if p != primary and configured.get(p, False):
            result.append(p)

    return result


def is_quota_error(exc: Exception) -> bool:
    """Detect quota / rate-limit / resource-exhausted errors across providers."""
    msg = str(exc).lower()
    return any(kw in msg for kw in ("429", "quota", "resource_exhausted", "rate_limit", "rate limit"))
