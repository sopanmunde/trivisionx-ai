"""Notes routes — REST API endpoints for user notes dashboard."""
from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Dict, List
from core.security import get_current_user
from core.limiter import limiter
from core.constants import RATE_LIMIT_DEFAULT
from database.mongodb.repositories.notes_repository import (
    get_user_notes,
    create_note_db,
    update_note_db,
    delete_note_db,
    get_note_by_id_db,
)
from core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.get("", response_model=List[Dict])
@limiter.limit(RATE_LIMIT_DEFAULT)
async def list_notes(request: Request, current_user=Depends(get_current_user)):
    """Retrieve all user notes."""
    user_id = str(current_user["_id"])
    return await get_user_notes(user_id)


@router.post("", response_model=Dict)
@limiter.limit(RATE_LIMIT_DEFAULT)
async def create_note(request: Request, note_data: Dict, current_user=Depends(get_current_user)):
    """Create a new note."""
    user_id = str(current_user["_id"])
    return await create_note_db(user_id, note_data)


@router.put("/{note_id}", response_model=Dict)
@limiter.limit(RATE_LIMIT_DEFAULT)
async def update_note(request: Request, note_id: str, updates: Dict, current_user=Depends(get_current_user)):
    """Update note parameters (title, content, category, favorite)."""
    user_id = str(current_user["_id"])
    result = await update_note_db(user_id, note_id, updates)
    if not result:
        raise HTTPException(status_code=404, detail="Note not found or updates empty")
    return result


@router.delete("/{note_id}")
@limiter.limit(RATE_LIMIT_DEFAULT)
async def delete_note(request: Request, note_id: str, current_user=Depends(get_current_user)):
    """Delete a note."""
    user_id = str(current_user["_id"])
    success = await delete_note_db(user_id, note_id)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found or could not be deleted")
    return {"message": "Note deleted successfully"}


@router.post("/{note_id}/ai-action")
@limiter.limit(RATE_LIMIT_DEFAULT)
async def note_ai_action(request: Request, note_id: str, payload: Dict, current_user=Depends(get_current_user)):
    """AI copilot for notes: summarize, extract action items, or polish into markdown."""
    user_id = str(current_user["_id"])
    note = await get_note_by_id_db(user_id, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    action = payload.get("action", "summarize")
    content = note.get("content", "")
    title = note.get("title", "")

    if not content.strip():
        raise HTTPException(status_code=400, detail="Note has no content to process")

    if action == "summarize":
        prompt = (
            f"Provide a concise executive summary with key takeaways as bullet points for this research note.\n"
            f"Title: {title}\n"
            f"Note Content:\n{content}\n\n"
            f"Summary:"
        )
    elif action == "action_items":
        prompt = (
            f"Extract all concrete action items, todos, and follow-up steps from this research note. "
            f"Format them as Markdown task items (- [ ] Task description).\n"
            f"Title: {title}\n"
            f"Note Content:\n{content}\n\n"
            f"Action Items:"
        )
    elif action == "polish":
        prompt = (
            f"Format and enhance this research note into clean, structured GitHub-flavored Markdown. "
            f"Use descriptive subheadings, bullet points, and highlight key concepts, preserving all core information.\n"
            f"Title: {title}\n"
            f"Note Content:\n{content}\n\n"
            f"Polished Note:"
        )
    else:
        custom_prompt = payload.get("custom_prompt", "")
        prompt = f"{custom_prompt}\n\nTitle: {title}\nContent:\n{content}"

    try:
        from core.llm_factory import get_llm
        llm = get_llm(streaming=False)
        response = await llm.ainvoke(prompt)
        text = response.content if hasattr(response, "content") else str(response)
        return {"action": action, "result": text}
    except Exception as e:
        logger.error(f"Error executing note AI action: {e}")
        raise HTTPException(status_code=500, detail=str(e))

