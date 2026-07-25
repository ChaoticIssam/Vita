from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


class ActivityEvent(BaseModel):
    source: str = Field(..., examples=["desktop"])
    event_type: str = Field(..., examples=["app_usage"])
    occurred_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    payload: dict[str, Any] = Field(default_factory=dict)
