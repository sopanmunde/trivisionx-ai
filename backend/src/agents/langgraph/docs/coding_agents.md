# 💻 Code Generation Agent

**Node:** `code_generation_node`  
**File:** [`code_generation_node.py`](../nodes/code_generation_node.py)  
**Role:** Generates production-ready code from user requirements  

## Purpose

Generates complete, working code based on the user's request. Part of the **Coding Workflow** pipeline.

## Pipeline Position

```
planner → code_generation → code_review → testing → reporter
```

## System Prompt Rules

1. Write complete, working code — not snippets or pseudocode
2. Include error handling and edge cases
3. Use appropriate design patterns and best practices
4. Explain the architecture/approach before showing code
5. Output code in a clear code block with language annotation
6. Consider performance, security, and maintainability
7. Reference conversation history for context

## State Updates

| Field | Value |
|-------|-------|
| `generated_code` | The generated code string |
| `current_node` | `"code_generation"` |

## LLM Configuration

- **Temperature:** 0.2
- **Default provider:** `openai/gpt-4o-mini`
- **History:** Last 4 conversation turns

---

# 🔎 Code Review Agent

**Node:** `code_review_node`  
**File:** [`code_review_node.py`](../nodes/code_review_node.py)  
**Role:** Reviews generated code for quality and security  

## Review Criteria

1. **Correctness** — Does it solve the problem? Any logical errors?
2. **Security** — Vulnerabilities (injection, XSS, auth issues)?
3. **Performance** — Obvious bottlenecks?
4. **Best Practices** — Language/framework conventions?
5. **Edge Cases** — Empty inputs, errors, boundary conditions?

## Output Format

- Critical issues (must fix)
- Suggestions (nice to have)
- Overall: ✅ Pass / ⚠️ Needs fixes / ❌ Reject

## State Updates

| Field | Value |
|-------|-------|
| `code_review` | Review findings string |
| `current_node` | `"code_review"` |

---

# 🧪 Testing Agent

**Node:** `testing_node`  
**File:** [`testing_node.py`](../nodes/testing_node.py)  
**Role:** Generates unit tests for the generated code  

## Test Generation Rules

1. Cover: happy path, edge cases, error conditions
2. Use appropriate framework (pytest, jest, etc.)
3. Include test descriptions
4. Consider mocks for external dependencies

## State Updates

| Field | Value |
|-------|-------|
| `test_results` | Generated test code string |
| `current_node` | `"testing"` |
