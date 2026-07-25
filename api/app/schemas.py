from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class ActivityEvent(BaseModel):
    source: str = Field(..., examples=["desktop"])
    event_type: str = Field(..., examples=["app_usage"])
    occurred_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    payload: dict[str, Any] = Field(default_factory=dict)


# Authentication Schemas
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["Alex Morgan"])
    email: EmailStr = Field(..., examples=["alex@example.com"])
    password: str = Field(..., min_length=6, max_length=100, examples=["password123"])


class UserLogin(BaseModel):
    email: str = Field(..., examples=["alex@example.com"])
    password: str = Field(..., examples=["password123"])


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
