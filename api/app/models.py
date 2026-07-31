import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, String, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    tasks: Mapped[list["FocusTask"]] = relationship("FocusTask", back_populates="user", cascade="all, delete-orphan")
    sessions: Mapped[list["FocusSession"]] = relationship("FocusSession", back_populates="user", cascade="all, delete-orphan")


class FocusTask(Base):
    __tablename__ = "focus_tasks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="Engineering")
    spent_hours: Mapped[float] = mapped_column(Float, default=0.0)
    target_hours: Mapped[float] = mapped_column(Float, default=2.0)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User", back_populates="tasks")


class FocusSession(Base):
    __tablename__ = "focus_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Float, default=0.0)
    efficiency_score: Mapped[int] = mapped_column(Float, default=0.0)
    app_name: Mapped[str] = mapped_column(String(100), default="VS Code")
    category: Mapped[str] = mapped_column(String(100), default="Coding & Dev")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User", back_populates="sessions")
