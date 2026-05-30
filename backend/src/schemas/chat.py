from pydantic import BaseModel
from typing import Optional

class QueryRequest(BaseModel):
    msg: str
    conversation_id: Optional[str] = None
