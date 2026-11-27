"""
src/api/routes/tools_routes.py — Tool Execution API
====================================================
Exposes REST endpoints so the frontend can:
  1. POST /api/tools/execute        — run Python code in sandbox
  2. POST /api/tools/fetch-url      — fetch a webpage's content
  3. POST /api/tools/search         — run a web search query
  4. GET  /api/tools/github/repo    — get GitHub repo context
  5. POST /api/tools/github/issue   — create a GitHub issue

All endpoints require a valid JWT token (current_user dependency).
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator
from typing import Optional
import os
import re
from core.security import get_current_user
from core.limiter import limiter
from core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["tools"])

_SLUG_RE = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$")


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class CodeExecuteRequest(BaseModel):
    code: str = Field(..., description="Python code to execute")
    timeout: int = Field(30, ge=1, le=60, description="Execution timeout in seconds")


class CodeExecuteResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: int
    execution_time_ms: int
    success: bool


class FetchUrlRequest(BaseModel):
    url: str = Field(..., description="Full URL to fetch content from")


class FetchUrlResponse(BaseModel):
    url: str
    content: str
    success: bool
    error: Optional[str] = None


class WebSearchRequest(BaseModel):
    query: str = Field(..., description="Search query")
    max_results: int = Field(5, ge=1, le=10)


class WebSearchResponse(BaseModel):
    query: str
    results: str
    success: bool


class GitHubRepoRequest(BaseModel):
    owner: str
    repo: str
    include_tree: bool = True

    @field_validator("owner", "repo")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        if not _SLUG_RE.match(v):
            raise ValueError("Invalid GitHub owner or repository name")
        return v


class GitHubIssueRequest(BaseModel):
    owner: str
    repo: str
    title: str = Field(..., min_length=1, max_length=256)
    body: str = Field(..., max_length=20000)
    labels: str = ""

    @field_validator("owner", "repo")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        if not _SLUG_RE.match(v):
            raise ValueError("Invalid GitHub owner or repository name")
        return v


def _safe_subprocess_env(tmpdir: str) -> dict[str, str]:
    env = {"PYTHONPATH": "", "HOME": tmpdir, "TMP": tmpdir, "TEMP": tmpdir}
    for key in ("PATH", "SYSTEMROOT", "WINDIR"):
        if os.environ.get(key):
            env[key] = os.environ[key]
    return env


# ---------------------------------------------------------------------------
# 1. POST /api/tools/execute — Python code execution
# ---------------------------------------------------------------------------

@router.post("/execute", response_model=CodeExecuteResponse)
@limiter.limit("10/minute")
async def execute_code(
    request: Request,
    payload: CodeExecuteRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Execute Python code in a restricted subprocess.
    Returns stdout, stderr, exit_code, and execution_time_ms.
    """
    import asyncio
    import sys
    import tempfile

    from tools.code_tools import _is_safe_code

    user_id = str(current_user.get("_id", ""))
    logger.info(
        f"[tools/execute] user={user_id}, "
        f"code_len={len(payload.code)}, timeout={payload.timeout}"
    )

    is_safe, reason = _is_safe_code(payload.code)
    if not is_safe:
        raise HTTPException(status_code=400, detail=f"Blocked: {reason}")

    code_to_run = payload.code
    timeout = min(30, payload.timeout)

    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".py", delete=False, encoding="utf-8"
    ) as tmp:
        tmp.write(code_to_run)
        tmp_path = tmp.name

    stdout_output = ""
    stderr_output = ""
    exit_code = -1
    start = asyncio.get_running_loop().time()

    try:
        proc = await asyncio.create_subprocess_exec(
            sys.executable, tmp_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=_safe_subprocess_env(tempfile.gettempdir()),
        )
        try:
            raw_out, raw_err = await asyncio.wait_for(proc.communicate(), timeout=float(timeout))
            stdout_output = raw_out.decode("utf-8", errors="replace").strip()
            stderr_output = raw_err.decode("utf-8", errors="replace").strip()
            exit_code = proc.returncode or 0
        except asyncio.TimeoutError:
            proc.kill()
            await proc.communicate()
            stderr_output = f"TimeoutError: Execution exceeded {timeout}s"
            exit_code = -1
    except Exception as e:
        stderr_output = str(e)
        exit_code = -1
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass

    elapsed_ms = int((asyncio.get_running_loop().time() - start) * 1000)

    return CodeExecuteResponse(
        stdout=stdout_output,
        stderr=stderr_output,
        exit_code=exit_code,
        execution_time_ms=elapsed_ms,
        success=(exit_code == 0),
    )


# ---------------------------------------------------------------------------
# 2. POST /api/tools/fetch-url — webpage content fetcher
# ---------------------------------------------------------------------------

@router.post("/fetch-url", response_model=FetchUrlResponse)
@limiter.limit("20/minute")
async def fetch_url(
    request: Request,
    payload: FetchUrlRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Fetch the readable markdown content of a webpage via Jina Reader or Firecrawl.
    """
    from tools.web_tools import fetch_webpage_content

    user_id = str(current_user.get("_id", ""))
    logger.info(f"[tools/fetch-url] user={user_id}, url={payload.url[:80]}")

    if not payload.url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Invalid URL — must start with http:// or https://")

    try:
        content = await fetch_webpage_content.ainvoke({"url": payload.url})
        return FetchUrlResponse(
            url=payload.url,
            content=content,
            success=not content.startswith(("Failed to fetch", "Blocked")),
        )
    except Exception as e:
        logger.error(f"[tools/fetch-url] Error: {e}")
        return FetchUrlResponse(url=payload.url, content="", success=False, error=str(e)[:200])


# ---------------------------------------------------------------------------
# 3. POST /api/tools/search — live web search
# ---------------------------------------------------------------------------

@router.post("/search", response_model=WebSearchResponse)
@limiter.limit("20/minute")
async def web_search_endpoint(
    request: Request,
    payload: WebSearchRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Run a live web search via Tavily, SerpAPI, or Brave Search.
    Returns formatted results with titles, URLs, and snippets.
    """
    from tools.web_tools import web_search

    user_id = str(current_user.get("_id", ""))
    logger.info(f"[tools/search] user={user_id}, query='{payload.query[:60]}'")

    try:
        results = await web_search.ainvoke({"query": payload.query, "max_results": payload.max_results})
        return WebSearchResponse(query=payload.query, results=results, success=True)
    except Exception as e:
        logger.error(f"[tools/search] Error: {e}")
        return WebSearchResponse(query=payload.query, results="", success=False)


# ---------------------------------------------------------------------------
# 4. POST /api/tools/github/repo — GitHub repo context
# ---------------------------------------------------------------------------

@router.post("/github/repo")
@limiter.limit("20/minute")
async def github_repo_context(
    request: Request,
    payload: GitHubRepoRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Fetch high-level context about a GitHub repository (README, file tree, recent commits).
    """
    from tools.github_tools import get_repo_context

    logger.info(f"[tools/github/repo] {payload.owner}/{payload.repo}")

    try:
        result = await get_repo_context.ainvoke({
            "owner": payload.owner,
            "repo": payload.repo,
            "include_tree": payload.include_tree,
        })
        return {"owner": payload.owner, "repo": payload.repo, "context": result, "success": True}
    except Exception as e:
        logger.error(f"[tools/github/repo] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e)[:200])


# ---------------------------------------------------------------------------
# 5. POST /api/tools/github/issue — create GitHub issue
# ---------------------------------------------------------------------------

@router.post("/github/issue")
@limiter.limit("10/minute")
async def create_issue(
    request: Request,
    payload: GitHubIssueRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new GitHub issue in the specified repository.
    """
    from tools.github_tools import create_github_issue

    logger.info(f"[tools/github/issue] {payload.owner}/{payload.repo}: '{payload.title[:60]}'")

    try:
        result = await create_github_issue.ainvoke({
            "owner": payload.owner,
            "repo": payload.repo,
            "title": payload.title,
            "body": payload.body,
            "labels": payload.labels,
        })
        success = result.startswith("✅")
        return {"message": result, "success": success}
    except Exception as e:
        logger.error(f"[tools/github/issue] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e)[:200])
