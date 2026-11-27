"""
src/agents/langgraph/nodes/execution_node.py — Code Execution Node
===================================================================
Runs generated Python code in a sandboxed subprocess.
Captures stdout/stderr and exit code, then updates AgentState
for the self-correction feedback loop in the coding graph.

State reads:  generated_code, retry_count
State writes: execution_output, execution_errors, retry_count, current_node
"""
import asyncio
import re
import sys
import tempfile
import os
from agents.langgraph.state import AgentState
from tools.code_tools import _is_safe_code as _is_code_safe, _safe_subprocess_env
from core.config import settings
from core.logger import get_logger

logger = get_logger(__name__)


async def execution_node(state: AgentState) -> dict:
    """
    Code Execution Node — runs generated Python code in a subprocess sandbox.

    Flow in coding graph:
      code_generation → execution_node → [conditional]
        ├── errors + retry_count < 3 → back to code_generation (with error feedback)
        └── success or max retries   → code_review → testing → reporter

    Returns:
        execution_output: stdout from successful run
        execution_errors: stderr/error message if failed (or empty string)
        retry_count:      incremented by 1 for each failed execution
        current_node:     'execution'
    """
    generated_code = state.get("generated_code", "").strip()
    retry_count = state.get("retry_count", 0)
    timeout = min(30, max(1, getattr(settings, "CODE_EXECUTION_TIMEOUT_SECONDS", 30)))

    logger.info(
        f"[Execution] Running code ({len(generated_code)} chars), "
        f"retry_count={retry_count}, timeout={timeout}s"
    )

    if not generated_code:
        logger.info("[Execution] No generated_code in state — skipping execution")
        return {
            "execution_output": "",
            "execution_errors": "",
            "current_node": "execution",
        }

    lang, code_to_run = _extract_code_block_with_lang(generated_code)
    if lang and lang not in ("python", "py"):
        logger.info(f"[Execution] Non-Python language '{lang}' — skipping Python sandbox")
        return {
            "execution_output": f"Skipped sandbox execution for non-Python snippet ({lang}).",
            "execution_errors": "",
            "current_node": "execution",
        }

    is_safe, reason = _is_code_safe(code_to_run)
    if not is_safe:
        logger.warning(f"[Execution] Blocked unsafe code: {reason}")
        return {
            "execution_output": "",
            "execution_errors": f"BLOCKED: {reason}. Code uses restricted system operations.",
            "retry_count": retry_count + 1,
            "current_node": "execution",
        }

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
            raw_out, raw_err = await asyncio.wait_for(
                proc.communicate(), timeout=float(timeout)
            )
            stdout_output = raw_out.decode("utf-8", errors="replace").strip()
            stderr_output = raw_err.decode("utf-8", errors="replace").strip()
            exit_code = proc.returncode or 0
        except asyncio.TimeoutError:
            proc.kill()
            await proc.communicate()
            stderr_output = f"TimeoutError: Code execution exceeded {timeout} seconds limit."
            exit_code = -1
    except Exception as e:
        stderr_output = f"ExecutionError: {str(e)}"
        exit_code = -1
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass

    elapsed_ms = int((asyncio.get_running_loop().time() - start) * 1000)

    if exit_code == 0:
        logger.info(f"[Execution] Success in {elapsed_ms}ms: {stdout_output[:100]}")
        return {
            "execution_output": stdout_output or "(No output)",
            "execution_errors": "",
            "current_node": "execution",
        }
    else:
        new_retry = retry_count + 1
        logger.warning(
            f"[Execution] Failed (exit={exit_code}), retry_count -> {new_retry}: "
            f"{stderr_output[:150]}"
        )
        return {
            "execution_output": stdout_output or "",
            "execution_errors": stderr_output or f"Process exited with code {exit_code}",
            "retry_count": new_retry,
            "current_node": "execution",
        }


def _extract_code_block_with_lang(text: str) -> tuple[str, str]:
    pattern = re.compile(r"```([a-zA-Z0-9_+-]*)\s*\n(.*?)```", re.DOTALL)
    matches = pattern.findall(text)
    if matches:
        py_blocks = [code.strip() for lang, code in matches if lang.lower() in ("", "python", "py")]
        if py_blocks:
            first_nonempty = next((lang.lower() for lang, _ in matches if lang), "")
            return first_nonempty or "python", "\n\n".join(py_blocks)
        return matches[0][0].lower(), matches[0][1].strip()
    return "", text


def _extract_code_block(text: str) -> str:
    return _extract_code_block_with_lang(text)[1]
