from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ConversationCreate(BaseModel):
    title: str = "New Chat"
    folder: Optional[str] = "Work Projects"
    pinned: bool = False

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    folder: Optional[str] = None
    pinned: Optional[bool] = None
