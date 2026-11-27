from pydantic import BaseModel, Field, field_validator
from typing import Optional


class QueryRequest(BaseModel):
    msg: str = Field(..., min_length=1, max_length=32000)
    conversation_id: Optional[str] = Field(None, max_length=128)

    mode: str = "agent"

    workflow_type: str = "auto"

    model_provider: Optional[str] = Field(None, max_length=64)

    model_name: Optional[str] = Field(None, max_length=128)
    filename: Optional[str] = Field(None, max_length=256)
    active_features: Optional[dict] = None
    is_voice: Optional[bool] = False

    @field_validator("mode")
    @classmethod
    def normalize_mode(cls, v: str) -> str:
        val = (v or "agent").strip().lower()
        mapping = {
            "simple": "quick",
            "quick": "quick",
            "chat": "quick",
            "research": "agent",
            "agent": "agent",
        }
        if val not in mapping:
            raise ValueError(f"Unsupported chat mode: '{v}'. Must be one of: quick, simple, research, agent.")
        return mapping[val]

    @field_validator("workflow_type")
    @classmethod
    def normalize_workflow(cls, v: str) -> str:
        val = (v or "auto").strip().lower()
        allowed = {
            "auto", "research", "summary", "technical", "competitive",
            "coding", "data_analysis",
        }
        if val not in allowed:
            raise ValueError(f"Unsupported workflow_type: '{v}'")
        return val
