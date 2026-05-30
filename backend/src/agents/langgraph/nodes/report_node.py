"""
src/agents/langgraph/nodes/report_node.py — Report Agent
=========================================================
Corresponds to "Report agent" in the image workflow.

Responsibilities:
  - Assemble the final markdown response from summary + citations
  - Format citation anchors as numbered references
  - Produce clean, renderer-friendly markdown for the frontend
"""
from src.agents.langgraph.state import AgentState
from src.core.logger import get_logger

logger = get_logger(__name__)


def report_node(state: AgentState) -> dict:
    """
    Report Agent — assembles the final markdown output from summary + citations.

    Output format:
      <summary content>

      ---

      ## 📚 References
      1. **filename** — Page X _(confidence: 0.95)_
         > snippet preview...
      ...
    """
    summary = state.get("summary", "")
    citations = state.get("citations", [])
    report_mode = state.get("report_mode", False)

    final_output = summary

    if citations:
        final_output += "\n\n---\n\n## 📚 References\n\n"
        for cit in citations:
            rank = cit.get("rank", cit.get("index", "•"))
            source = cit.get("filename", cit.get("source", "Unknown"))
            page = cit.get("page", "")
            confidence = cit.get("confidence", "")
            snippet = cit.get("snippet", "")
            uploaded_at = cit.get("uploaded_at", "")

            # Build the reference line
            page_str = f" — Page {page}" if page and page not in ("N/A", "") else ""
            conf_str = f" _(confidence: {confidence})_" if confidence else ""
            date_str = f" · _{uploaded_at[:10]}_" if uploaded_at else ""

            final_output += f"{rank}. **{source}**{page_str}{conf_str}{date_str}\n"

            if snippet:
                # Indent snippet as a blockquote for visual separation
                final_output += f"   > {snippet}\n"

            final_output += "\n"

    # In report_mode, append a brief methodology note
    if report_mode and citations:
        final_output += (
            "\n---\n\n_This report was generated using semantic MMR retrieval "
            f"across {len(citations)} document source(s) with GPT-4o synthesis._\n"
        )

    logger.info(
        f"[Report Agent] Final output: {len(final_output)} chars, "
        f"{len(citations)} citations, report_mode={report_mode}"
    )

    return {
        "final_output": final_output,
        "current_node": "reporter",
    }
