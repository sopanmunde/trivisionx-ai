# Contributing to TriVisionX Platform

First off, thank you for taking the time to contribute! 🎉

This document outlines the guidelines and best practices for contributing to the **TriVisionX Platform**. Following these guidelines helps ensure a smooth, efficient, and collaborative development workflow.

---

## 🗺️ Project Architecture Overview

TriVisionX is divided into two primary workspaces:
1. **Frontend (`/frontend`)**: A Next.js 15+ application styled with TailwindCSS, Framer Motion, and Magic UI, configured with Bun.
2. **Backend (`/backend`)**: A FastAPI server running a 5-node LangGraph multi-agent orchestration pipeline, utilizing MongoDB Atlas and Pinecone MMR retrieval.

For a detailed view of the architecture and data flows, check the [README.md](../README.md).
---

## 🛠️ Setting Up Your Local Environment

### Prerequisites
Before you start, make sure you have the following installed:
* **Python 3.11+**
* **Bun** (Frontend package manager) or **Node.js (v18+)**
* **Git**
* (Optional) **Docker** & **Docker Compose**

### 1. Fork & Clone
1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/sopanmunde/trivisionx-ai.git
   cd trivisionx-ai
   ```

### 2. Configure Environment Variables
You need to set up environment variables for both backend and frontend components.

* Copy [backend/.env.example](../backend/.env.example) to `backend/.env` and fill in the required keys (Google Gemini API Key, Pinecone, MongoDB connection strings, etc.).
* Copy [frontend/.env.example](../frontend/.env.example) to `frontend/.env` (and/or `.env.local`) to configure the Next.js API URL.

### 3. Run Locally

#### Option A: Unified Script (Recommended)
You can run both the frontend and backend concurrently using the provided runner scripts:
* **Linux/macOS**:
  ```bash
  chmod +x run.sh
  ./run.sh
  ```
* **Windows (PowerShell)**:
  ```powershell
  ./run.ps1
  ```

#### Option B: Run Services Separately

##### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   * **Linux/macOS**:
     ```bash
     python -m venv .venv
     source .venv/bin/activate
     ```
   * **Windows**:
     ```powershell
     python -m venv .venv
     .venv\Scripts\activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   python index.py
   ```
   The backend API will run on `http://localhost:8000`. You can access the interactive Swagger documentation at `http://localhost:8000/docs`.

##### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (Bun is recommended, but npm can be used as a fallback):
   ```bash
   bun install
   ```
3. Start the Next.js development server:
   ```bash
   bun dev
   ```
   The frontend application will be available at `http://localhost:3000`.

#### Option C: Docker Compose
If you prefer running containerized services:
```bash
docker compose up --build
```

---

## 🧪 Testing, Linting & Code Quality

Maintaining code quality is critical. Please verify that your changes pass tests and adhere to code style guidelines before submitting a pull request.

### Backend (`/backend`)
* **Linting & Formatting**: We use **Ruff** for fast Python linting and formatting. Run these commands from `/backend`:
  ```bash
  ruff check .
  ruff format .
  ```
* **Static Type Checking**: We use **Pyright**. Run from `/backend`:
  ```bash
  pyright
  ```
* **Testing**: We use **pytest**. Make sure all tests pass:
  ```bash
  pytest
  ```

### Frontend (`/frontend`)
* **Linting**: Run ESLint to check for frontend coding standards:
  ```bash
  bun run lint
  ```
* **Testing**: We use **Vitest** for frontend testing. Run tests with:
  ```bash
  bunx vitest
  ```

---

## 🌿 Git & Pull Request Workflow

1. **Branch Naming Conventions**:
   Create a branch name that reflects the nature of your changes:
   * Features: `feature/your-feature-name`
   * Bug Fixes: `bugfix/issue-description`
   * Documentation: `docs/what-you-changed`
   * Refactoring: `refactor/clean-up-code`

2. **Commit Messages**:
   * Keep commits concise and descriptive.
   * Prefer imperative style: "Add Pinecone metadata filtering support" instead of "Added some metadata features".

3. **Submitting a Pull Request**:
   * Ensure your branch is up-to-date with `master` (or target branch).
   * Double-check that all automated checks (linting, styling, tests) pass locally.
   * Open the PR and include:
     * A clear description of the problem solved.
     * Details of the changes you've made.
     * Instructions on how the reviewer can test or verify the changes.
     * Any relevant screenshots/recordings if the UI was modified.

---

## 🎨 UI/UX Guidelines
If you are contributing to the frontend, please respect the established design principles:
* **Framer Motion / Magic UI**: Ensure that UI updates feel premium, using smooth transitions, loading skeletons, and subtle micro-interactions.
* **Responsive Web Design**: All views must support full mobile layout adaptations.
* **Tailwind CSS**: Maintain consistency with the configured colors, spacing, and design tokens defined in [tailwind.config.ts](../frontend/tailwind.config.ts).

---

## 💬 Code of Conduct
We are committed to fostering a welcoming, respectful, and harassment-free community. Please review our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## 🔒 Security Policy
If you discover a security vulnerability, please do not report it publicly. Please refer to our [Security Policy](SECURITY.md) for instructions on how to report vulnerabilities.

---

Need help or have questions? Open an issue on GitHub, and we'll be happy to assist you!
