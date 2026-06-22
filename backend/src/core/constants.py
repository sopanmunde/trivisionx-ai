# ─── LLM Models ────────────────────────────────────────────────────────────────

GEMINI_FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
]

ANTHROPIC_FALLBACK_MODELS = [
    "claude-sonnet-4-20250514",
    "claude-3-5-haiku-latest",
    "claude-3-opus-latest",
]

GROQ_FALLBACK_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
]

MISTRAL_FALLBACK_MODELS = [
    "mistral-large-latest",
    "mistral-small-latest",
    "open-mistral-nemo",
]

SUPPORTED_PROVIDERS = [
    "anthropic", "google", "groq", "mistral",
]

DEFAULT_MODEL_MAP = {
    "anthropic": "claude-sonnet-4-20250514",
    "google":    "gemini-2.5-flash",
    "groq":      "llama-3.3-70b-versatile",
    "mistral":   "mistral-large-latest",
}

# ─── Workflow Types ────────────────────────────────────────────────────────────

WORKFLOW_TYPES = [
    "research",
    "summary",
    "technical",
    "competitive",
    "coding",
    "data_analysis",
]

# ─── RAG Chunking ───────────────────────────────────────────────────────────────
DEFAULT_CHUNK_SIZE = 1000
DEFAULT_CHUNK_OVERLAP = 200
LARGE_CHUNK_SIZE = 2000
LARGE_CHUNK_OVERLAP = 400
SMALL_CHUNK_SIZE = 512
SMALL_CHUNK_OVERLAP = 64

# ─── Retrieval ──────────────────────────────────────────────────────────────────
DEFAULT_TOP_K = 6
MAX_TOP_K = 20
# MMR diversity vs relevance: 0.0 = pure diversity, 1.0 = pure relevance
MMR_LAMBDA = 0.6

# ─── File upload ────────────────────────────────────────────────────────────────
ALLOWED_EXTENSIONS = {
    # Documents
    ".pdf", ".docx", ".doc", ".txt", ".rtf", ".odt",
    # Spreadsheets
    ".xlsx", ".xls", ".csv",
    # Presentations
    ".pptx", ".ppt",
    # Web / markup
    ".html", ".htm", ".md", ".mdx", ".rst",
    # Data
    ".json", ".jsonl", ".xml", ".yaml", ".yml",
    # Code
    ".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".cpp", ".c", ".cs",
    ".go", ".rs", ".rb", ".php", ".sh", ".sql",
    # Images (OCR-capable or passthrough)
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tiff", ".svg",
    # Archives (metadata stored but not deep-parsed)
    ".zip",
}
MAX_FILE_SIZE_MB = 5
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

# ─── Streaming ──────────────────────────────────────────────────────────────────
SSE_RETRY_MS = 3000

# ─── Rate limiting ──────────────────────────────────────────────────────────────
RATE_LIMIT_CHAT = "30/minute"
RATE_LIMIT_UPLOAD = "10/minute"
RATE_LIMIT_REPORT = "5/minute"
RATE_LIMIT_DEFAULT = "60/minute"

# ─── Collections ────────────────────────────────────────────────────────────────
COLLECTION_USERS = "users"
COLLECTION_CONVERSATIONS = "conversations"
COLLECTION_MESSAGES = "messages"
COLLECTION_DOCUMENTS = "documents"
COLLECTION_REPORTS = "reports"

# ─── Cache ──────────────────────────────────────────────────────────────────────
REDIS_TTL_SECONDS = 3600          # 1 hour default TTL for RAG query cache
CACHE_RAG_PREFIX = "rag:query:"
CACHE_REPORT_PREFIX = "rag:report:"
