<div align="center">
  <img src="docs/screenshots/logo-placeholder.png" alt="TriVisionX AI" width="120" />

  <h1>🚀 TriVisionX AI Platform</h1>

  <p>
    <strong>Enterprise-grade AI research automation with LangGraph multi-agent orchestration,<br/>
    Pinecone semantic retrieval, and real-time streaming responses.</strong>
  </p>

  <p>
    <a href="#architecture">Architecture</a> ·
    <a href="#features">Features</a> ·
    <a href="#quick-start">Quick Start</a> ·
    <a href="#api">API</a> ·
    <a href="#deployment">Deployment</a>
  </p>

  <p>
    <img alt="Python" src="https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge&logo=python&logoColor=white" />
    <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js" />
    <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
    <img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  </p>
</div>

---

## 🌟 Overview

The **TriVisionX AI** is a production-ready AI SaaS platform that transforms how researchers and knowledge workers interact with document corpora. It brings together a **5-node LangGraph multi-agent pipeline**, **Pinecone MMR semantic retrieval**, **real-time SSE streaming**, and **citation-aware generation** to deliver an enterprise AI assistant.

> *Built to demonstrate advanced AI systems engineering—suitable for production deployment and seamless scalability.*

---

## 🏗️ Architecture

```mermaid
graph TD
    UI[Next.js 16 Chat UI] -- HTTPS + SSE --> API[FastAPI Gateway]
    API -- /api/documents --> DB[(MongoDB Atlas)]
    API -- /api/chat --> Graph[LangGraph 5-Agent Pipeline]
    
    subgraph LangGraph Pipeline
        Planner --> Retriever
        Retriever --> Citation
        Citation --> Summarizer
        Summarizer --> Reporter
    end
    
    Retriever -- MMR Search --> PC[(Pinecone Vector DB)]
```

### 🧠 LangGraph Multi-Agent Workflow
1. **Planner Agent**: Analyzes the query and routes it.
2. **Retrieval Agent**: Fetches context using Pinecone MMR.
3. **Citation Agent**: Deduplicates, scores, and injects references.
4. **Summarizer Agent**: Generates accurate summaries using Gemini 2.5 Flash.
5. **Reporter Agent**: Compiles Markdown with rich formatting and references.

---

## ✨ Features

### 🔬 AI Research Capabilities
- **5-Agent Pipeline** — specialized LangGraph nodes for reliable outputs.
- **Real-time SSE Streaming** — token-level streaming directly to the UI.
- **Citation-Aware** — every claim is traced back to a specific source document + page.
- **Research Reports** — generates structured 5-section reports exportable to Markdown.

### 📚 Enterprise Document Intelligence
- **Multi-format Ingestion** — native support for PDF, DOCX, and TXT files.
- **Semantic Chunking** — paragraph-aware recursive splitting.
- **Metadata-Rich Vectors** — tagged with `user_id`, `filename`, `chunk_index`, and `timestamp`.
- **Duplicate Prevention** — guards against re-indexing identical documents per user.

### 🏭 Production-Grade Backend
- **JWT Authentication** — secure registration, login, and profile management.
- **Rate Limiting** — customizable limits per endpoint.
- **Async Architecture** — built entirely on Motor (MongoDB async) and FastAPI.
- **Multi-stage Docker Builds** — non-root users, gunicorn workers, and optimized images.

---

## 🚀 Quick Start (Docker Compose)

The easiest way to get started is using the pre-configured `docker-compose.yml`.

### Prerequisites
- Docker & Docker Compose
- Google AI Studio API Key (Gemini)
- Pinecone Account (Free Tier)
- MongoDB Atlas URL (Free Tier)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/trivisionx-ai
cd trivisionx-ai
```

### 2. Configure Environment Variables
Create a `.env` file in the root of the project:
```env
# AI Providers
GOOGLE_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-2.5-flash

# Vector DB
PINECONE_API_KEY=your_pinecone_key_here
PINECONE_INDEX_NAME=trivisionx-ui
PINECONE_ENVIRONMENT=us-east-1

# Database
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DATABASE_NAME=trivisionx_db

# Security & App
SECRET_KEY=your-secret-256bit-key-here
FRONTEND_URL=http://localhost:3000
```

### 3. Spin Up the Stack
```bash
docker-compose up --build -d
```

### 4. Access the Application
| Service | URL |
|---|---|
| **Web App** | [http://localhost:3000](http://localhost:3000) |
| **API Docs (Swagger)** | [https://trivisionx-ai-v3ot.onrender.com/docs](https://trivisionx-ai-v3ot.onrender.com/docs) |
| **System Health** | [https://trivisionx-ai-v3ot.onrender.com/api/health/](https://trivisionx-ai-v3ot.onrender.com/api/health/) |

---

## ☁️ Deployment

This project is built to deploy natively to the cloud using robust CI/CD integration.

### Vercel (Frontend)
The Next.js frontend is optimized for **Vercel**.
1. Import the project into Vercel.
2. Select `frontend` as your Root Directory.
3. The included `vercel.json` will automatically proxy `/api/*` requests to your backend.

### Render (Backend)
The FastAPI backend is pre-configured for **Render**.
1. Create a new Web Service on Render and point it to your repository.
2. The included `render.yaml` blueprint will handle the build and deployment automatically.
3. Add your secrets (`MONGODB_URL`, `GOOGLE_API_KEY`, etc.) in the Render dashboard.

---

## 📖 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Get JWT token |
| `POST` | `/api/chat/` | **SSE** streaming research chat |
| `POST` | `/api/documents/upload` | Ingest PDF/DOCX/TXT |
| `GET` | `/api/reports/{id}/export` | Download report as Markdown |

*For the complete API reference, visit the auto-generated Swagger UI at `/docs` when running the backend.*

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **LLM** | Google Gemini 2.5 Flash |
| **Orchestration** | LangGraph |
| **Vector DB** | Pinecone |
| **Backend** | FastAPI (Python 3.11) |
| **Database** | MongoDB Atlas (Motor) |
| **Frontend** | Next.js 16 + React 19 + Tailwind CSS 4 |
| **Deployment** | Docker Compose |

---

<p align="center">
  Released under the <a href="LICENSE">MIT License</a>.<br/>
  Built with ❤️ using LangGraph, Pinecone, Google Gemini, and Next.js.
</p>
