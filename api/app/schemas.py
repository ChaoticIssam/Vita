from datetime import datetime, timezone
from typing import Any
from pydantic import BaseModel, EmailStr, Field, field_validator
import re


class ActivityEvent(BaseModel):
    source: str = Field(..., min_length=1, max_length=50, examples=["desktop"])
    event_type: str = Field(..., min_length=1, max_length=50, examples=["app_usage"])
    occurred_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    payload: dict[str, Any] = Field(default_factory=dict)

    model_config = {"from_attributes": True}


# Authentication Schemas
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["Alex Morgan"])
    email: EmailStr = Field(..., examples=["alex@example.com"])
    password: str = Field(..., min_length=8, max_length=128, examples=["s3cur3P@ssw0rd"])
    avatar_url: str | None = Field(default=None)
    focus_fields: list[str] | None = Field(default=None)

    @field_validator("name")
    @classmethod
    def name_no_html(cls, v: str) -> str:
        if re.search(r"[<>\"']", v):
            raise ValueError("Name contains invalid characters")
        return v.strip()


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    avatar_url: str | None = Field(default=None)
    focus_fields: list[str] | None = Field(default=None)


class UserLogin(BaseModel):
    email: EmailStr = Field(..., examples=["alex@example.com"])
    password: str = Field(..., min_length=1, max_length=128, examples=["s3cur3P@ssw0rd"])


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar_url: str | None = None
    focus_fields: list[str] | None = None
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
    category: str = Field(default="Engineering", max_length=100)
    target_hours: float = Field(default=2.0, ge=0.1, le=24.0)
    scheduled_date: str | None = Field(default=None, max_length=50)
    start_time: str | None = Field(default=None, max_length=20)


class FocusTaskUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    category: str | None = Field(default=None, max_length=100)
    spent_hours: float | None = Field(default=None, ge=0.0, le=10000.0)
    target_hours: float | None = Field(default=None, ge=0.1, le=24.0)
    scheduled_date: str | None = Field(default=None, max_length=50)
    start_time: str | None = Field(default=None, max_length=20)
    completed: bool | None = None


class FocusTaskResponse(BaseModel):
    id: str
    user_id: str
    title: str
    category: str
    spent_hours: float
    target_hours: float
    scheduled_date: str | None = None
    start_time: str | None = None
    completed: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# Focus Session Schemas
class FocusSessionCreate(BaseModel):
    duration_minutes: float = Field(default=25.0, ge=0.0, le=1440.0)
    efficiency_score: float = Field(default=0.0, ge=0.0, le=100.0)
    app_name: str = Field(default="VS Code", max_length=200)
    category: str = Field(default="Coding & Dev", max_length=100)
    created_at: datetime | None = None


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
    raw_name: str = Field(..., min_length=1, max_length=200, examples=["Postman"])


class AppClassifyResponse(BaseModel):
    name: str
    category: str
    efficiency: int
    status: str
