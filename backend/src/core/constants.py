# ─── LLM Models ────────────────────────────────────────────────────────────────

GEMINI_FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
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
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_FILE_SIZE_MB = 50
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
