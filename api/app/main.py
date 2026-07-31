from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import uuid

from app.auth import (
    create_access_token,
    create_user,
    decode_access_token,
    get_user_by_email,
    get_user_by_id,
    verify_password,
)
from app.database import Base, engine, get_db
from app.models import User, FocusTask, FocusSession
from app.schemas import (
    ActivityEvent,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    FocusTaskCreate,
    FocusTaskUpdate,
    FocusTaskResponse,
    FocusSessionCreate,
    FocusSessionResponse,
    AnalyticsSummaryResponse,
    AppClassifyRequest,
    AppClassifyResponse,
)

# Create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vita API",
    description="Backend for the Vita productivity and activity insights platform.",
    version="0.1.0",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3005",
        "http://127.0.0.1:3005",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> UserResponse:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload["sub"]
    user_record = get_user_by_id(db, user_id)
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return UserResponse.model_validate(user_record)


@app.get("/", tags=["system"])
def root() -> dict[str, str]:
    return {"message": "Vita API is running"}


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/events", tags=["events"])
def ingest_event(event: ActivityEvent) -> dict[str, object]:
    return {"accepted": True, "event": event}


# --- Authentication Endpoints ---

@app.post("/auth/register", response_model=TokenResponse, tags=["auth"])
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> TokenResponse:
    existing_user = get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )
    
    user_resp = create_user(db, user_in)
    access_token = create_access_token(data={"sub": user_resp.id, "email": user_resp.email})
    return TokenResponse(access_token=access_token, user=user_resp)


@app.post("/auth/login", response_model=TokenResponse, tags=["auth"])
def login(credentials: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    user_record = get_user_by_email(db, credentials.email)
    if not user_record or not verify_password(credentials.password, user_record.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    access_token = create_access_token(data={"sub": user_record.id, "email": user_record.email})
    user_resp = UserResponse.model_validate(user_record)
    return TokenResponse(access_token=access_token, user=user_resp)


@app.get("/auth/me", response_model=UserResponse, tags=["auth"])
def get_me(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    return current_user


# --- Analytics Summary Endpoint ---

@app.get("/analytics/summary", response_model=AnalyticsSummaryResponse, tags=["analytics"])
def get_analytics_summary(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AnalyticsSummaryResponse:
    now = datetime.now(timezone.utc)
    start_of_today = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    start_of_week = now - timedelta(days=7)

    today_sessions = db.query(FocusSession).filter(
        FocusSession.user_id == current_user.id,
        FocusSession.created_at >= start_of_today
    ).all()
    today_mins = sum(s.duration_minutes for s in today_sessions)
    daily_focus_hours = round(today_mins / 60.0, 2)

    week_sessions = db.query(FocusSession).filter(
        FocusSession.user_id == current_user.id,
        FocusSession.created_at >= start_of_week
    ).all()
    week_mins = sum(s.duration_minutes for s in week_sessions)
    weekly_focus_hours = round(week_mins / 60.0, 2)

    all_sessions = db.query(FocusSession).filter(FocusSession.user_id == current_user.id).all()
    all_mins = sum(s.duration_minutes for s in all_sessions)
    total_focus_hours = round(all_mins / 60.0, 1)

    if all_sessions:
        avg_score = round(sum(s.efficiency_score for s in all_sessions) / len(all_sessions), 1)
    else:
        avg_score = 0.0

    remaining_target = max(0.0, round(7.0 - daily_focus_hours, 1))

    tasks = db.query(FocusTask).filter(FocusTask.user_id == current_user.id).all()
    tasks_completed = sum(1 for t in tasks if t.completed)
    tasks_total = len(tasks)

    return AnalyticsSummaryResponse(
        daily_focus_hours=daily_focus_hours,
        weekly_focus_hours=weekly_focus_hours,
        total_focus_hours=total_focus_hours,
        focus_score=avg_score,
        remaining_target_hours=remaining_target,
        tasks_completed=tasks_completed,
        tasks_total=tasks_total,
    )


# --- Focus Tasks Endpoints ---

@app.get("/tasks", response_model=list[FocusTaskResponse], tags=["tasks"])
def list_tasks(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[FocusTaskResponse]:
    tasks = db.query(FocusTask).filter(FocusTask.user_id == current_user.id).order_by(FocusTask.created_at.desc()).all()
    return [FocusTaskResponse.model_validate(t) for t in tasks]


@app.post("/tasks", response_model=FocusTaskResponse, tags=["tasks"])
def create_task(
    task_in: FocusTaskCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FocusTaskResponse:
    task = FocusTask(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title=task_in.title,
        category=task_in.category,
        target_hours=task_in.target_hours,
        spent_hours=0.0,
        completed=False,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return FocusTaskResponse.model_validate(task)


@app.patch("/tasks/{task_id}", response_model=FocusTaskResponse, tags=["tasks"])
def update_task(
    task_id: str,
    task_in: FocusTaskUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FocusTaskResponse:
    task = db.query(FocusTask).filter(FocusTask.id == task_id, FocusTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    update_data = task_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(task, field, val)

    db.commit()
    db.refresh(task)
    return FocusTaskResponse.model_validate(task)


@app.delete("/tasks/{task_id}", tags=["tasks"])
def delete_task(
    task_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    task = db.query(FocusTask).filter(FocusTask.id == task_id, FocusTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"deleted": True}


# --- Focus Sessions Endpoints ---

@app.get("/sessions", response_model=list[FocusSessionResponse], tags=["sessions"])
def list_sessions(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[FocusSessionResponse]:
    sessions = db.query(FocusSession).filter(FocusSession.user_id == current_user.id).order_by(FocusSession.created_at.desc()).all()
    return [FocusSessionResponse.model_validate(s) for s in sessions]


@app.post("/sessions", response_model=FocusSessionResponse, tags=["sessions"])
def record_session(
    session_in: FocusSessionCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FocusSessionResponse:
    session = FocusSession(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        duration_minutes=session_in.duration_minutes,
        efficiency_score=session_in.efficiency_score,
        app_name=session_in.app_name,
        category=session_in.category,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return FocusSessionResponse.model_validate(session)


@app.delete("/analytics/purge", tags=["analytics"])
def purge_user_data(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    db.query(FocusSession).filter(FocusSession.user_id == current_user.id).delete()
    db.query(FocusTask).filter(FocusTask.user_id == current_user.id).delete()
    db.commit()
    return {"purged": True}


@app.delete("/auth/account", tags=["auth"])
def delete_user_account(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    db.query(FocusSession).filter(FocusSession.user_id == current_user.id).delete()
    db.query(FocusTask).filter(FocusTask.user_id == current_user.id).delete()
    user_rec = db.query(User).filter(User.id == current_user.id).first()
    if user_rec:
        db.delete(user_rec)
    db.commit()
    return {"deleted": True}


@app.post("/analytics/classify-app", response_model=AppClassifyResponse, tags=["analytics"])
def classify_application(payload: AppClassifyRequest) -> AppClassifyResponse:
    raw = payload.raw_name.strip()
    low = raw.lower()

    # 1. Music & Entertainment (e.g. Spotify, Music, YouTube)
    if any(k in low for k in ["spotify", "music", "apple music", "podcasts", "vlc", "iina", "youtube", "netflix", "audible", "media"]):
        category = "Entertainment"
        status = "Background Audio & Streaming"
        efficiency = 65

    # 2. Notes, Writing & Personal Productivity (e.g. Notes, Bear, TextEdit, Reminders, Craft)
    elif any(k in low for k in ["notes", "apple notes", "bear", "textedit", "obsidian", "craft", "evernote", "ulysses", "reminders", "calendar", "fantastical", "raycast", "alfred", "things", "todoist"]):
        category = "Productivity"
        status = "Notes & Personal Organization"
        efficiency = 85

    # 3. Engineering & Software Development
    elif any(k in low for k in ["antigravity", "visual studio", "vs code", "vscode", "xcode", "postman", "iterm", "terminal", "warp", "ghostty", "sublime", "zed", "intellij", "pycharm", "webstorm", "docker", "orbstack", "dbeaver", "tableplus", "insomnia", "git", "mysql", "postgres"]):
        category = "Coding & Dev"
        status = "Active Software Engineering"
        efficiency = 95

    # 4. Design & Creative UI
    elif any(k in low for k in ["figma", "sketch", "penpot", "framer", "blender", "photoshop", "illustrator", "canva", "indesign", "affinity", "pixelmator"]):
        category = "Design & UI"
        status = "Creative Design & UI Tokens"
        efficiency = 90

    # 5. Communication & Team Async
    elif any(k in low for k in ["slack", "discord", "linear", "telegram", "zoom", "meet", "teams", "signal", "whatsapp", "messages", "mail", "outlook"]):
        category = "Communication"
        status = "Team Communication & Collaboration"
        efficiency = 78

    # 6. Research & Documentation Browsing
    elif any(k in low for k in ["safari", "chrome", "arc", "brave", "firefox", "notion", "perplexity", "docs", "books", "reader", "medium"]):
        category = "Research & Docs"
        status = "Web Research & Technical Docs"
        efficiency = 84

    else:
        category = "Productivity"
        status = "General Focus Activity"
        efficiency = 80

    name = raw
    if "antigravity" in low:
        name = "Antigravity"
    elif "visual studio" in low or "code" in low:
        name = "VS Code"
    elif "iterm" in low:
        name = "iTerm"
    elif "spotify" in low:
        name = "Spotify"
    elif "notes" in low:
        name = "Notes"

    return AppClassifyResponse(
        name=name,
        category=category,
        efficiency=efficiency,
        status=status
    )
