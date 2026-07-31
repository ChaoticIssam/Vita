from datetime import datetime, timezone
from typing import Any
from pydantic import BaseModel, EmailStr, Field


class ActivityEvent(BaseModel):
    source: str = Field(..., examples=["desktop"])
    event_type: str = Field(..., examples=["app_usage"])
    occurred_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    payload: dict[str, Any] = Field(default_factory=dict)

    model_config = {"from_attributes": True}


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

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

    model_config = {"from_attributes": True}


# Focus Task Schemas
class FocusTaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    category: str = Field(default="Engineering")
    target_hours: float = Field(default=2.0, ge=0.1)


class FocusTaskUpdate(BaseModel):
    title: str | None = None
    category: str | None = None
    spent_hours: float | None = None
    target_hours: float | None = None
    completed: bool | None = None


class FocusTaskResponse(BaseModel):
    id: str
    user_id: str
    title: str
    category: str
    spent_hours: float
    target_hours: float
    completed: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# Focus Session Schemas
class FocusSessionCreate(BaseModel):
    duration_minutes: float = Field(default=25.0)
    efficiency_score: float = Field(default=0.0)
    app_name: str = Field(default="VS Code")
    category: str = Field(default="Coding & Dev")


class FocusSessionResponse(BaseModel):
    id: str
    user_id: str
    duration_minutes: float
    efficiency_score: float
    app_name: str
    category: str
    created_at: datetime

    model_config = {"from_attributes": True}


# Analytics Summary Schema
class AnalyticsSummaryResponse(BaseModel):
    daily_focus_hours: float
    weekly_focus_hours: float
    total_focus_hours: float
    focus_score: float
    remaining_target_hours: float
    tasks_completed: int
    tasks_total: int


# AI App Classifier Schemas
class AppClassifyRequest(BaseModel):
    raw_name: str = Field(..., examples=["Postman"])


class AppClassifyResponse(BaseModel):
    name: str
    category: str
    efficiency: int
    status: str
