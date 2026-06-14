<div align="center">
  <img src="docs/screenshots/logo-placeholder.png" alt="TriVisionX AI" width="120" />

  <h1>🚀 TriVisionX AI Platform</h1>

  <p>
    <strong>Enterprise-grade AI research automation with LangGraph multi-agent orchestration,<br/>
    Pinecone semantic retrieval, real-time streaming responses, and beautiful Magic UI animations.</strong>
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
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js" />
    <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
    <img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  </p>
</div>

---

## 🌟 Overview

The **TriVisionX AI** is a production-ready AI SaaS platform that transforms how researchers and knowledge workers interact with document corpora. It brings together a **5-node LangGraph multi-agent pipeline**, **Pinecone MMR semantic retrieval**, **real-time SSE streaming**, and **citation-aware generation** to deliver an enterprise AI assistant. 

With a newly upgraded frontend leveraging **Framer Motion**, **Magic UI components**, and full mobile responsiveness, the platform offers an unparalleled, beautiful user experience.

> *Built to demonstrate advanced AI systems engineering—suitable for production deployment and seamless scalability.*

---

## 🏗️ Architecture

```mermaid
graph TD
    UI[Next.js 15 Chat UI] -- HTTPS + SSE --> API[FastAPI Gateway]
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
- **Quality Scoring** — built-in metrics evaluating coverage, confidence, and completeness.

### 📚 Enterprise Document Intelligence
- **Multi-format Ingestion** — native support for PDF, DOCX, and TXT files.
- **Semantic Chunking** — paragraph-aware recursive splitting.
- **Metadata-Rich Vectors** — tagged with `user_id`, `filename`, `chunk_index`, and `timestamp`.

### 🎨 Stunning, Responsive UI
- **Magic UI & Framer Motion** — smooth micro-interactions, blur-in text effects, and skeleton loaders.
- **Glassmorphism & Theming** — fully supports elegant dark/light modes.
- **Mobile First** — fully responsive slide-out sidebars and dynamic composer layouts.

### 🏭 Production-Grade Backend
- **JWT Authentication** — secure registration, login, and profile management.
- **Async Architecture** — built entirely on Motor (MongoDB async) and FastAPI.
- **Automated Deployments** — `render.yaml` Blueprints and Dockerfile optimization.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Bun](https://bun.sh/) (Frontend package manager)
- Python 3.11+ (Backend)
- Google AI Studio API Key (Gemini)
- Pinecone Account & MongoDB Atlas

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/trivisionx-ai
cd trivisionx-ai
```

### 2. Configure Environment Variables
Create `.env` files in both `/backend` and `/frontend`.

**backend/.env**
```env
GOOGLE_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-2.5-flash
PINECONE_API_KEY=your_pinecone_key_here
PINECONE_INDEX_NAME=trivisionx
PINECONE_ENVIRONMENT=us-east-1
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DATABASE_NAME=trivisionx_db
SECRET_KEY=your-secret-key
FRONTEND_URL=http://localhost:3000
```

**frontend/.env**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### 3. Start the Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # (or .venv\Scripts\activate on Windows)
pip install -r requirements.txt
python index.py
```

### 4. Start the Frontend
```bash
cd frontend
bun install
bun dev
```

The Web App will be available at [http://localhost:3000](http://localhost:3000) and the API docs at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## ☁️ Deployment

### Frontend (Vercel)
The Next.js frontend is optimized for **Vercel**.
1. Import the project into Vercel.
2. Select `frontend` as your Root Directory.
3. Set the `NEXT_PUBLIC_API_BASE_URL` environment variable to your deployed Render URL (e.g., `https://trivisionx-ai.onrender.com/api`).

### Backend (Render)
The FastAPI backend is pre-configured for **Render**.
1. Create a new Blueprint on Render and connect this repository.
2. The included `render.yaml` handles the Docker build and service creation.
3. Render will use the default `CMD` in `backend/Dockerfile` automatically.
4. *(Remember to update your Backend CORS `FRONTEND_URL` in `src/main.py` or `.env` to match your Vercel URL!)*

---

## 📖 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Get JWT token |
| `POST` | `/api/chat/` | **SSE** streaming research chat |
| `POST` | `/api/documents/upload` | Ingest PDF/DOCX/TXT |
| `GET` | `/api/conversations/{id}/messages` | Fetch chat history |

*For the complete API reference, visit the auto-generated Swagger UI at `/docs` when running the backend.*

---

<p align="center">
  Released under the <a href="LICENSE">MIT License</a>.<br/>
  Built with ❤️ using LangGraph, Pinecone, Google Gemini, and Next.js.
</p>
