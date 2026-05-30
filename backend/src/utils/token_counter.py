"""Utility: tiktoken-based token counter."""
from functools import lru_cache
from typing import List
try:
    import tiktoken
    _TIKTOKEN_AVAILABLE = True
except ImportError:
    _TIKTOKEN_AVAILABLE = False


@lru_cache(maxsize=4)
def _get_encoder(model: str = "gpt-4o"):
    if not _TIKTOKEN_AVAILABLE:
        return None
    try:
        return tiktoken.encoding_for_model(model)
    except Exception:
        return tiktoken.get_encoding("cl100k_base")


def count_tokens(text: str, model: str = "gpt-4o") -> int:
    """Count tokens for a text string using tiktoken."""
    enc = _get_encoder(model)
    if enc is None:
        # Rough estimate: 1 token ≈ 4 chars
        return len(text) // 4
    return len(enc.encode(text))


def count_messages_tokens(messages: List[dict], model: str = "gpt-4o") -> int:
    """Count total tokens across a list of {role, content} messages."""
    return sum(count_tokens(m.get("content", ""), model) for m in messages)


def estimate_cost_usd(prompt_tokens: int, completion_tokens: int, model: str = "gpt-4o") -> float:
    """
    Rough cost estimate in USD.
    GPT-4o pricing (as of 2025): $2.50/1M input, $10.00/1M output
    """
    rates = {
        "gpt-4o": (2.50, 10.00),
        "gpt-4o-mini": (0.15, 0.60),
    }
    input_rate, output_rate = rates.get(model, (2.50, 10.00))
    return round(
        (prompt_tokens / 1_000_000) * input_rate +
        (completion_tokens / 1_000_000) * output_rate,
        6
    )
