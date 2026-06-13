# API Reference — TriVisionX AI Platform

> **Base URL (local):** `https://trivisionx-ai-v3ot.onrender.com`  
> **Authentication:** Bearer JWT token in `Authorization` header  
> **OpenAPI UI:** `https://trivisionx-ai-v3ot.onrender.com/docs`  
> **ReDoc:** `https://trivisionx-ai-v3ot.onrender.com/redoc`

---

## Authentication

### POST /api/auth/register
Create a new user account.

**Request Body**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!"
}
```

**Response** `201 Created`
```json
{ "message": "Account created successfully" }
```

---

### POST /api/auth/login
Authenticate and receive a JWT token.

**Request Body**
```json
{ "email": "user@example.com", "password": "SecurePass123!" }
```

**Response** `200 OK`
```json
{ "access_token": "eyJ...", "token_type": "bearer" }
```

---

### GET /api/auth/me
Get current user profile. **Requires auth.**

**Response** `200 OK`
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "created_at": "2024-01-15T10:00:00"
}
```

---

## Chat (SSE Streaming)

### POST /api/chat/
Send a research query. Returns Server-Sent Events stream. **Requires auth.**

**Request Body**
```json
{
  "msg": "What are the key findings on transformer architectures?",
  "conversation_id": "65abc123def456789"  // optional
}
```

**Response** `200 OK` — `text/event-stream`

Events are emitted progressively:
```
data: {"node": "planner", "status": "running"}
data: {"node": "planner", "status": "completed"}
data: {"node": "retriever", "status": "running"}
data: {"node": "retriever", "status": "completed"}
data: {"type": "citations", "data": [{...}]}
data: {"node": "summarizer", "status": "running"}
data: {"type": "token", "data": "Based on"}
data: {"type": "token", "data": " the retrieved documents"}
data: {"node": "summarizer", "status": "completed"}
data: {"node": "reporter", "status": "completed"}
data: {"done": true, "sources": [{...}]}
```

**Citation Object Schema**
```json
{
  "index": 1,
  "rank": 1,
  "doc_id": "abc123",
  "source": "paper.pdf",
  "filename": "paper.pdf",
  "page": 3,
  "chunk_index": 5,
  "total_chunks": 42,
  "snippet": "Key finding from the document...",
  "confidence": 0.95,
  "uploaded_at": "2024-01-15T10:00:00"
}
```

---

## Documents

### POST /api/documents/upload
Upload a document for RAG ingestion. **Requires auth.**

**Request** `multipart/form-data`
- `file`: PDF, DOCX, or TXT file (max 50MB)

**Response** `200 OK`
```json
{
  "message": "Document ingested and indexed successfully",
  "filename": "research_paper.pdf",
  "chunks": 47
}
```

---

### GET /api/documents/
List all documents uploaded by the current user. **Requires auth.**

**Response** `200 OK`
```json
[
  {
    "id": "65abc...",
    "user_id": "user123",
    "filename": "research_paper.pdf",
    "file_type": "pdf",
    "chunk_count": 47,
    "uploaded_at": "2024-01-15T10:00:00"
  }
]
```

---

## Reports

### POST /api/reports/generate
Generate a structured research report. **Requires auth.**

**Request Body**
```json
{
  "query": "Summarize key findings on large language model alignment",
  "conversation_id": "65abc123",  // optional
  "top_k": 10
}
```

**Response** `200 OK`
```json
{
  "report_id": "65def...",
  "query": "Summarize key findings...",
  "report": "# Summarize key findings...\n\n## Executive Summary\n...",
  "citations": [{...}]
}
```

---

### GET /api/reports/history
Get report history for current user. **Requires auth.**

**Response** `200 OK`
```json
[
  {
    "id": "65def...",
    "user_id": "user123",
    "query": "LLM alignment research",
    "summary": "First 500 chars...",
    "created_at": "2024-01-15T10:00:00"
  }
]
```

---

### GET /api/reports/{report_id}/export
Download report as Markdown file. **Requires auth.**

**Response** `200 OK` — `text/markdown`  
Content-Disposition: `attachment; filename="report-{id}.md"`

---

### GET /api/research-sessions
Alias for `GET /api/reports/history`. **Requires auth.**

---

## Conversations

### GET /api/conversations/
List all conversations for current user. **Requires auth.**

**Response** `200 OK`
```json
[
  {
    "id": "65abc...",
    "user_id": "user123",
    "title": "LLM Research Session",
    "messageCount": 12,
    "preview": "Last message preview...",
    "created_at": "2024-01-15T10:00:00",
    "updated_at": "2024-01-15T11:30:00"
  }
]
```

---

### POST /api/conversations/
Create a new conversation. **Requires auth.**

**Request Body**
```json
{ "title": "New Research Session" }
```

**Response** `201 Created`
```json
{
  "id": "65abc...",
  "user_id": "user123",
  "title": "New Research Session",
  "created_at": "2024-01-15T10:00:00",
  "updated_at": "2024-01-15T10:00:00"
}
```

---

### GET /api/conversations/{id}/messages
Get all messages in a conversation. **Requires auth.**

**Response** `200 OK`
```json
[
  {
    "id": "65msg...",
    "conversation_id": "65abc...",
    "role": "user",
    "content": "What are the key LLM findings?",
    "sources": [],
    "created_at": "2024-01-15T10:00:00"
  },
  {
    "id": "65msg2...",
    "conversation_id": "65abc...",
    "role": "assistant",
    "content": "## Key Findings\n\n...",
    "sources": [{...}],
    "created_at": "2024-01-15T10:00:05"
  }
]
```

---

### DELETE /api/conversations/{id}
Delete a conversation and all its messages. **Requires auth.**

**Response** `200 OK`
```json
{ "message": "Conversation deleted", "messages_deleted": 12 }
```

---

## Models

### GET /api/models/
Get active AI model configuration and agent descriptions.

**Response** `200 OK`
```json
{
  "llm": {
    "provider": "Google Gemini",
    "chat_model": "gemini-2.5-flash",
    "streaming": true
  },
  "embeddings": {
    "provider": "HuggingFace",
    "model": "sentence-transformers/all-MiniLM-L12-v2",
    "dimensions": 384
  },
  "rag": {
    "chunk_size": 1000,
    "retrieval_top_k": 6,
    "retrieval_strategy": "MMR"
  },
  "vector_store": {
    "provider": "Pinecone",
    "index": "trivisionx-ui"
  },
  "agents": [
    { "name": "Research Planner", "node": "planner", "role": "..." },
    { "name": "Retrieval Agent", "node": "retriever", "role": "..." },
    { "name": "Citation Agent", "node": "citation", "role": "..." },
    { "name": "Summarization Agent", "node": "summarizer", "role": "..." },
    { "name": "Report Agent", "node": "reporter", "role": "..." }
  ],
  "pipeline": "LangGraph 5-node multi-agent research workflow",
  "version": "3.0.0"
}
```

---

## Health

### GET /api/health/
Comprehensive dependency health check.

**Response** `200 OK`
```json
{
  "status": "healthy",
  "version": "3.0.0",
  "project": "TriVisionX AI",
  "total_check_ms": 45.2,
  "dependencies": {
    "mongodb": { "status": "healthy", "latency_ms": 12.3 },
    "pinecone": { "status": "healthy", "index": "trivisionx-ui", "latency_ms": 8.1 },
    "langgraph": { "status": "healthy", "nodes": ["planner","retriever","citation","summarizer","reporter"], "latency_ms": 0.3 },
    "redis": { "status": "disabled", "note": "REDIS_URL not configured" }
  }
}
```

**Status values**
| Value | Meaning |
|---|---|
| `healthy` | All core dependencies reachable |
| `degraded` | One or more core services unhealthy |
| `disabled` | Optional service (Redis) not configured |

---

## Error Responses

All errors follow this shape:
```json
{ "detail": "Human-readable error message" }
```

| Code | Meaning |
|---|---|
| 400 | Bad request (prompt injection detected, invalid format) |
| 401 | Missing or invalid JWT token |
| 403 | Access forbidden |
| 404 | Resource not found |
| 409 | Conflict (email already registered) |
| 422 | Validation error (empty query, oversized file) |
| 500 | Internal server error (RAG or LLM failure) |
| 503 | External service unavailable (Pinecone, LLM) |
