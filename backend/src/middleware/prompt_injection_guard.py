"""Prompt injection guard — normalizes and sanitizes user input before LLM processing."""
import re
import unicodedata

INJECTION_PATTERNS = [
    r"ignore\s+(?:all\s+)?previous\s+instructions",
    r"disregard\s+all\s+prior",
    r"you\s+are\s+now\s+(?:a\s+)?(?:dan|jailbreak|evil)",
    r"system\s*:\s*you\s+are",
    r"<\s*/?system\s*>",
    r"\bact\s+as\s+if\s+you\s+have\s+no\s+restrictions\b",
    r"pretend\s+you\s+are\s+not\s+an\s+ai",
]

COMPILED = [re.compile(p, re.IGNORECASE) for p in INJECTION_PATTERNS]
_ZERO_WIDTH_RE = re.compile(r"[\u200b-\u200f\u202a-\u202e\ufeff\u00ad]")


def _normalize_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKC", text or "")
    normalized = _ZERO_WIDTH_RE.sub("", normalized)
    return normalized


def scan_text(text: str) -> bool:
    """Returns True if injection patterns are detected."""
    normalized = _normalize_text(text)
    return any(p.search(normalized) for p in COMPILED)


def sanitize(text: str) -> str:
    """Normalize unicode and remove potentially harmful control sequences."""
    text = _normalize_text(text).replace("\x00", "").strip()
    text = re.sub(r"\n{4,}", "\n\n\n", text)
    return text
