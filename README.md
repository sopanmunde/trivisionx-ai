<p align="center">
  <img src="docs/screenshots/logo-placeholder.png" alt="AI Research Copilot" width="120" />
</p>

<h1 align="center">AI Research Copilot Platform</h1>

<p align="center">
  <strong>Enterprise-grade AI research automation with LangGraph multi-agent orchestration,<br/>
  Pinecone semantic retrieval, and real-time streaming responses.</strong>
</p>

<p align="center">
  <a href="#architecture">Architecture</a> ·
  <a href="#features">Features</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#api">API</a> ·
  <a href="#deployment">Deployment</a> ·
  <a href="#technology-evaluation">Tech Evaluation</a>
</p>

<p align="center">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.11+-blue?logo=python&logoColor=white" />
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-0.115+-green?logo=fastapi&logoColor=white" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-19-blue?logo=react" />
  <img alt="LangGraph" src="https://img.shields.io/badge/LangGraph-Multi--Agent-purple" />
  <img alt="Pinecone" src="https://img.shields.io/badge/Pinecone-Vector%20DB-teal" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Compose-blue?logo=docker" />
</p>

---

## Overview

The **AI Research Copilot** is a production-grade AI SaaS platform that transforms how researchers and knowledge workers interact with document corpora. It combines a **5-node LangGraph multi-agent pipeline** with **Pinecone MMR semantic retrieval**, **real-time SSE streaming**, and **citation-aware responses** to deliver an enterprise AI research assistant.

> *Built as a demonstration of advanced AI systems engineering — suitable for production deployment and AI engineering evaluations.*

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Next.js 16 · React 19 · Tailwind CSS 4 · Framer Motion         │
│  Chat UI · Document Workspace · Dashboard · Citations Panel      │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTPS + Server-Sent Events
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│  FastAPI Gateway  (Python 3.11, async, JWT, rate-limited)       │
│                                                                  │
│  /api/chat/ ─────► LangGraph 5-Agent Pipeline (SSE stream)     │
│  /api/documents/ ─► Ingestion Pipeline (chunk→embed→index)     │
│  /api/reports/ ──► Report Generation + Markdown Export         │
│  /api/models/ ───► Configuration Introspection                  │
│  /api/health/ ───► Dependency Status + Latency                  │
└──────────┬───────────────────────────────────────┬──────────────┘
           │                                        │
           ▼                                        ▼
┌────────────────────────┐            ┌──────────────────────────┐
│  LANGGRAPH PIPELINE    │            │  MongoDB Atlas (Motor)   │
│                        │            │                          │
│  1. Planner Agent      │            │  users, conversations,   │
│  2. Retrieval Agent    │            │  messages, documents,    │
│  3. Citation Agent     │            │  reports                 │
│  4. Summarizer Agent   │            └──────────────────────────┘
│  5. Report Agent       │
└──────────┬─────────────┘            ┌──────────────────────────┐
           │                          │  Redis Cache (optional)  │
           ▼                          │  RAG result caching      │
┌────────────────────────┐            │  TTL: 1 hour             │
│  Pinecone Vector Store │            └──────────────────────────┘
│  MMR retrieval         │
│  User-scoped filtering │
│  384-dim cosine index  │
└────────────────────────┘
```

### LangGraph Multi-Agent Workflow

Defined in `backend/src/workflows/research_workflow.py`.

```
User Query → [Planner] → conditional routing
                │
      ┌─────────┴──────────┐
      │ needs docs?        │ direct answer
      ▼ YES                ▼ NO
  [Retriever]         [Summarizer]
  Pinecone MMR             │
      │                    │
  [Citation]               │
  dedup + score            │
      │                    │
      └──────────┬─────────┘
                 ▼
          [Summarizer]
          Gemini Flash + history
                 │
                 ▼
           [Reporter]
           Final markdown + refs
                 │
                 ▼
          SSE → Frontend
```

---

## Features

### AI Research Capabilities
- **5-Agent LangGraph Pipeline** — planner, retriever, citation, summarizer, reporter
- **Real-time SSE Streaming** — token-level streaming via `graph.astream_events`
- **Agent Activity Panel** — live visibility into which agent is running
- **Citation-Aware Responses** — every claim traced to source document + page + confidence score
- **Conversation Memory** — last 10 turns injected into agent context
- **Research Report Generation** — structured 5-section reports with references

### Enterprise Document Intelligence
- **PDF, DOCX, TXT** ingestion with text cleaning
- **Semantic Chunking** — paragraph-aware + recursive splitting (2-stage)
- **Duplicate Detection** — filename+user_id guard prevents re-indexing
- **Metadata-Rich Vectors** — user_id, filename, chunk_index, uploaded_at
- **MMR Retrieval** — Maximal Marginal Relevance for diverse, relevant results

### Production-Grade Backend
- **JWT Authentication** — register, login, profile management
- **Prompt Injection Guard** — scans and sanitizes all user inputs
- **Rate Limiting** — per-route configurable limits
- **Async MongoDB** — Motor driver with optimized compound indexes
- **Redis Caching** — optional embedding/RAG result cache
- **Multi-stage Docker** — non-root user, gunicorn + uvicorn workers
- **OpenAPI Docs** — auto-generated at `/docs` and `/redoc`

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Google AI Studio API key (Gemini)
- Pinecone account (free tier)
- MongoDB Atlas account (free tier)

### 1. Clone

```bash
git clone https://github.com/your-org/ai-research-copilot
cd ai-research-copilot
```

### 2. Configure

```bash
cat > .env << 'EOF'
GOOGLE_API_KEY=your_gemini_key_here
PINECONE_API_KEY=your_pinecone_key_here
PINECONE_INDEX_NAME=trishul-ui
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DATABASE_NAME=trishul_db
SECRET_KEY=your-secret-256bit-key-here
FRONTEND_URL=http://localhost:3000
EOF
```

### 3. Start

```bash
docker compose up --build
```

### 4. Open

| Service | URL |
|---|---|
| **App** | http://localhost:3000 |
| **API Docs** | http://localhost:8000/docs |
| **Health** | http://localhost:8000/api/health/ |

---

## API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Get JWT token |
| `GET` | `/api/auth/me` | Current user profile |
| `POST` | `/api/chat/` | **SSE** streaming research chat |
| `POST` | `/api/documents/upload` | Ingest PDF/DOCX/TXT |
| `GET` | `/api/documents/` | List user documents |
| `POST` | `/api/reports/generate` | Generate research report |
| `GET` | `/api/reports/history` | Report history |
| `GET` | `/api/reports/{id}/export` | Download report as Markdown |
| `GET` | `/api/research-sessions` | Research session history |
| `GET` | `/api/conversations/` | List conversations |
| `POST` | `/api/conversations/` | Create conversation |
| `DELETE` | `/api/conversations/{id}` | Delete conversation |
| `GET` | `/api/models/` | AI model configuration |
| `GET` | `/api/health/` | System health + dependencies |

Full reference: [`docs/api/API_REFERENCE.md`](docs/api/API_REFERENCE.md)

---

## Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **LLM** | Google Gemini Flash | Fast, cost-effective, 1M context, strong reasoning |
| **Agent Orchestration** | LangGraph | Graph-based state machine, conditional routing, `astream_events` |
| **Vector DB** | Pinecone | Managed, serverless, MMR support, metadata filtering |
| **Embeddings** | HuggingFace MiniLM-L12 | 384-dim, high quality, runs locally (no API cost) |
| **Backend** | FastAPI + Python 3.11 | Async-first, OpenAPI docs, high throughput, entrypoint `index.py` |
| **Database** | MongoDB Atlas (Motor) | Flexible schema, async driver, free tier |
| **Cache** | Redis (optional) | RAG result caching, TTL-based invalidation |
| **Frontend** | Next.js 16 + React 19 + Tailwind 4 | App Router (`app/dashboard`, `app/login`, etc.), SSE support |
| **Streaming** | Server-Sent Events | Simple, HTTP-compatible, no WebSocket overhead |
| **Auth** | JWT (python-jose) | Stateless, scalable, 24h expiry |
| **Deployment** | Docker | Container-based, cloud-native |

---

## Project Structure

```
ai-research-copilot/
├── backend/                     # FastAPI backend
│   ├── src/
│   │   ├── workflows/           # research_workflow.py (LangGraph workflow registry)
│   │   ├── agents/langgraph/    # 5-node LangGraph pipeline nodes
│   │   │   ├── planner_node.py  # Planner agent logic
│   │   │   ├── retriever_node.py# Retrieval agent logic
│   │   │   ├── citation_node.py # Citation scoring logic
│   │   │   ├── summarizer_node.py
│   │   │   └── report_node.py   
│   │   ├── api/                 # FastAPI route handlers
│   │   ├── rag/                 # RAG pipeline (loaders, chunking, vectorstores)
│   │   ├── database/            # MongoDB setup, models
│   │   ├── services/            # Core business logic
│   │   └── core/                # Configuration and security setup
│   ├── tests/                   # Pytest test suite
│   ├── index.py                 # Uvicorn entry point (runs src.main:create_app)
│   └── requirements.txt         # Python dependencies
├── frontend/                    # Next.js frontend application
│   ├── app/                     # App router pages (dashboard, login, signup, setting)
│   ├── components/              # React UI components 
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # API clients and utilities
│   └── package.json             # NPM / Bun dependencies
├── docs/                        # Architecture and deployment documentation
├── workflows/                   # n8n workflow automation scripts
├── docker-compose.yml           # One-command full-stack deployment
└── README.md                    # Project overview
```

---

## Setup (Local Development)

### Backend
The backend uses standard `pip` or modern Python package managers like `uv`.
```bash
cd backend
python -m venv .venv
# Activate virtual environment
# Windows: .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate

pip install -r requirements.txt
# Alternatively, use uv: uv pip install -r requirements.txt

# Start the development server
python index.py
```

### Frontend
The frontend uses standard NPM, though `bun` is also supported.
```bash
cd frontend
npm install
# Alternatively: bun install

echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
npm run dev
# Or: bun run dev
```

---

## Documentation

| Document | Description |
|---|---|
| [Architecture](docs/architecture/ARCHITECTURE.md) | System design, LangGraph topology, MongoDB schema, Pinecone design |
| [API Reference](docs/api/API_REFERENCE.md) | All endpoints, request/response schemas, SSE event protocol |
| [Deployment Guide](docs/deployment/DEPLOYMENT.md) | Docker, local dev, cloud deployment, production checklist |

---

## License

MIT — see [LICENSE](LICENSE)

---

<p align="center">
  Built with ❤️ using LangGraph · Pinecone · Google Gemini · FastAPI · Next.js 16
</p>
