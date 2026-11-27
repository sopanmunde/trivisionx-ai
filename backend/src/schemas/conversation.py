from pydantic import BaseModel, Field
from typing import Optional


class ConversationCreate(BaseModel):
    title: str = Field("New Chat", min_length=1, max_length=200)
    folder: Optional[str] = Field("Work Projects", max_length=100)
    pinned: bool = False


class ConversationUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    folder: Optional[str] = Field(None, max_length=100)
    pinned: Optional[bool] = None
