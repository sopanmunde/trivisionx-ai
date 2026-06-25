"""Report routes — generate and retrieve research reports."""
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from src.core.limiter import limiter
from src.core.constants import RATE_LIMIT_REPORT
from typing import Optional
from src.core.security import get_current_user
from src.services.report_service import create_report
from src.database.mongodb.connection import get_database
from src.rag.memory.research_memory import get_research_sessions
from src.core.constants import COLLECTION_REPORTS
from src.utils.markdown_export import build_markdown_report
from fastapi.responses import Response

router = APIRouter()


class ReportRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None
    top_k: int = 10


@router.post("/generate")
@limiter.limit(RATE_LIMIT_REPORT)
async def generate_report_endpoint(
    request: Request,
    report_req: ReportRequest,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["_id"])
    db = get_database()

    result = await create_report(
        query=report_req.query,
        user_id=user_id,
        conversation_id=report_req.conversation_id,
        reports_collection=db[COLLECTION_REPORTS],
        top_k=report_req.top_k,
    )
    return result


@router.get("/history")
async def get_report_history(current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    db = get_database()
    return await get_research_sessions(db[COLLECTION_REPORTS], user_id)


@router.get("/{report_id}/export")
async def export_report_markdown(
    report_id: str,
    current_user=Depends(get_current_user),
):
    """Download a report as a .md file."""
    from bson import ObjectId
    user_id = str(current_user["_id"])
    db = get_database()
    doc = await db[COLLECTION_REPORTS].find_one({"_id": ObjectId(report_id), "user_id": user_id})
    if not doc:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Report not found")

    md = build_markdown_report(
        query=doc.get("query", ""),
        report_text=doc.get("final_output", ""),
        citations=doc.get("citations", []),
    )
    return Response(
        content=md,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="report-{report_id}.md"'},
    )
