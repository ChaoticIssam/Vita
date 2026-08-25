import logging
import time

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import text
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import uuid
import os
import json
from dotenv import load_dotenv

load_dotenv()

from app.auth import (
    create_access_token,
    create_user,
    decode_access_token,
    get_user_by_email,
    get_user_by_id,
    verify_password,
)
from app.database import Base, engine, get_db
from app.models import User, FocusTask, FocusSession, ClassifiedApp
from app.schemas import (
    ActivityEvent,
    TokenResponse,
    UserCreate,
    UserUpdate,
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

# ── Structured logging ────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%SZ",
)
logger = logging.getLogger("vita.api")

# ── Create database tables on startup ────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# Auto-migrate missing columns for SQLite & PostgreSQL
try:
    with engine.connect() as conn:
        db_url_str = str(engine.url).lower()
        if "postgres" in db_url_str:
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT"))
            except Exception as e:
                logger.warning("Postgres avatar_url migration notice: %s", e)
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS focus_fields JSONB"))
            except Exception as e:
                logger.warning("Postgres focus_fields migration notice: %s", e)
            try:
                conn.execute(text("ALTER TABLE focus_tasks ADD COLUMN IF NOT EXISTS scheduled_date VARCHAR(50)"))
            except Exception as e:
                logger.warning("Postgres scheduled_date migration notice: %s", e)
            try:
                conn.execute(text("ALTER TABLE focus_tasks ADD COLUMN IF NOT EXISTS start_time VARCHAR(20)"))
            except Exception as e:
                logger.warning("Postgres start_time migration notice: %s", e)
        else:
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url TEXT"))
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN focus_fields JSON"))
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE focus_tasks ADD COLUMN scheduled_date VARCHAR(50)"))
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE focus_tasks ADD COLUMN start_time VARCHAR(20)"))
            except Exception:
                pass
        conn.commit()
except Exception as e:
    logger.warning("Database startup migration notice: %s", e)

# ── Rate limiter (in-memory, per IP) ─────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

# ── FastAPI app — disable interactive docs in production ─────────────────────
_app_env = os.getenv("APP_ENV", "development").lower()
_is_production = _app_env == "production"

app = FastAPI(
    title="Vita API",
    description="Backend for the Vita productivity and activity insights platform.",
    version="0.1.0",
    docs_url=None if _is_production else "/docs",
    redoc_url=None if _is_production else "/redoc",
    openapi_url=None if _is_production else "/openapi.json",
)

app.state.limiter = limiter
def _rate_limit_handler_shim(request: Request, exc: Exception) -> Response:
    return _rate_limit_exceeded_handler(request, exc)  # type: ignore[arg-type]

app.add_exception_handler(RateLimitExceeded, _rate_limit_handler_shim)


# ── Global exception handler — never leak stack traces to clients ─────────────
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled exception on %s %s", request.method, request.url.path, exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."},
    )


# ── Request logging middleware ────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start) * 1000, 1)
    client_ip = request.client.host if request.client else "unknown"
    logger.info(
        "%s %s %s %.1fms ip=%s",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
        client_ip,
    )
    if response.status_code >= 400:
        logger.warning(
            "Suspicious request: %s %s %s ip=%s",
            request.method,
            request.url.path,
            response.status_code,
            client_ip,
        )
    return response


# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:3005",
        "http://127.0.0.1:3005",
        "http://localhost",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
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
@limiter.limit("30/minute")
def ingest_event(
    request: Request,
    event: ActivityEvent,
    current_user: UserResponse = Depends(get_current_user),
) -> dict[str, object]:
    logger.info("Event ingested type=%s user=%s", event.event_type, current_user.id)
    return {"accepted": True}


# --- Authentication Endpoints ---

@app.post("/auth/register", response_model=TokenResponse, tags=["auth"])
@limiter.limit("60/minute")
def register(request: Request, user_in: UserCreate, db: Session = Depends(get_db)) -> TokenResponse:
    existing_user = get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    user_resp = create_user(db, user_in)
    logger.info("New user registered email=%s", user_in.email)
    access_token = create_access_token(data={"sub": user_resp.id, "email": user_resp.email})
    return TokenResponse(access_token=access_token, user=user_resp)


@app.post("/auth/login", response_model=TokenResponse, tags=["auth"])
@limiter.limit("10/minute")
def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    client_ip = request.client.host if request.client else "unknown"
    user_record = get_user_by_email(db, credentials.email)
    if not user_record or not verify_password(credentials.password, user_record.hashed_password):
        logger.warning(
            "Failed login attempt email=%s ip=%s",
            credentials.email,
            client_ip,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    logger.info("Successful login user=%s ip=%s", user_record.id, client_ip)
    access_token = create_access_token(data={"sub": user_record.id, "email": user_record.email})
    user_resp = UserResponse.model_validate(user_record)
    return TokenResponse(access_token=access_token, user=user_resp)


@app.get("/auth/me", response_model=UserResponse, tags=["auth"])
def get_me(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    return current_user


@app.put("/auth/me", response_model=UserResponse, tags=["auth"])
def update_me(
    user_update: UserUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    db_user = db.query(User).filter(User.id == current_user.id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.name is not None:
        db_user.name = user_update.name
    if user_update.avatar_url is not None:
        db_user.avatar_url = user_update.avatar_url
    if user_update.focus_fields is not None:
        db_user.focus_fields = user_update.focus_fields
        
    db.commit()
    db.refresh(db_user)
    return UserResponse.model_validate(db_user)


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
        scheduled_date=task_in.scheduled_date,
        start_time=task_in.start_time,
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
    created_time = session_in.created_at or datetime.now(timezone.utc)
    session = FocusSession(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        duration_minutes=session_in.duration_minutes,
        efficiency_score=session_in.efficiency_score,
        app_name=session_in.app_name,
        category=session_in.category,
        created_at=created_time,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return FocusSessionResponse.model_validate(session)


@app.delete("/sessions/{session_id}", tags=["sessions"])
def delete_session(
    session_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    session = (
        db.query(FocusSession)
        .filter(FocusSession.id == session_id, FocusSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"deleted": True}


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


# =============================================================================
# 🧠 Machine Learning N-Gram TF-IDF Vector Classifier Engine
# =============================================================================
import math
import re
from collections import Counter

DOMAIN_TRAINING_CORPUS = {
    "Coding & Dev": [
        "code developer editor ide terminal console shell git compiler debug repository container docker kubernetes database sql python typescript rust golang cplusplus java react nextjs node script backend frontend API postman insomniac zed visual studio xcode iterm warp ghostty dbeaver tableplus orbstack pycharm webstorm intellij vscode"
    ],
    "Design & UI": [
        "design ui ux canvas vector illustration prototyping graphics animation 3d render photoshop illustrator figma sketch penpot framer blender premiere photo art layout color palette typography pixelmator canva affinity gimp inkscape"
    ],
    "Research & Docs": [
        "browser research documentation wikipedia reading pdf book paper article guide search web search engine safari chrome arc brave firefox opera edge notion perplexity medium arxiv stackoverflow MDN"
    ],
    "Productivity": [
        "notes task todo calendar reminder planner organization notebook writing draft journal document text edit obsidian bear craft textedit evernote ulysses raycast alfred things3 todoist focus workflow"
    ],
    "Communication": [
        "chat message messaging email mail video conference call team async conversation slack discord linear zoom teams meet telegram whatsapp signal outlook messages imessage"
    ],
    "Entertainment": [
        "music song audio stream video player movie podcast radio album playlist spotify apple music youtube vlc iina netflix hulu twitch audible soundcloud steam game"
    ],
    "System & Utilities": [
        "system settings preferences finder activity monitor control panel options utility utilities disk keychain setup terminal storage display network"
    ]
}

def extract_ngrams(text: str, n_range=(2, 4)) -> list[str]:
    clean = re.sub(r'[^a-z0-9]', '', text.lower())
    ngrams = []
    for n in range(n_range[0], n_range[1] + 1):
        for i in range(len(clean) - n + 1):
            ngrams.append(clean[i:i+n])
    return ngrams

def build_tfidf_model():
    doc_freqs = Counter()
    domain_vectors = {}
    total_docs = len(DOMAIN_TRAINING_CORPUS)

    for domain, texts in DOMAIN_TRAINING_CORPUS.items():
        all_ngrams = []
        for text in texts:
            all_ngrams.extend(extract_ngrams(text))
        counts = Counter(all_ngrams)
        domain_vectors[domain] = counts
        for gram in counts.keys():
            doc_freqs[gram] += 1

    # Compute TF-IDF centroids
    domain_tfidf = {}
    for domain, counts in domain_vectors.items():
        total_grams = sum(counts.values())
        tfidf = {}
        for gram, count in counts.items():
            tf = count / total_grams
            idf = math.log((1 + total_docs) / (1 + doc_freqs[gram])) + 1
            tfidf[gram] = tf * idf
        domain_tfidf[domain] = tfidf

    return domain_tfidf

ML_TFIDF_MODEL = build_tfidf_model()

def ml_classify_app_domain(raw_name: str) -> tuple[str, float]:
    input_ngrams = extract_ngrams(raw_name)
    if not input_ngrams:
        return ("Productivity", 0.5)

    input_counts = Counter(input_ngrams)
    total_grams = len(input_ngrams)
    input_vector = {gram: count / total_grams for gram, count in input_counts.items()}

    best_domain = "Productivity"
    max_sim = -1.0

    for domain, centroid in ML_TFIDF_MODEL.items():
        # Cosine similarity
        dot_product = sum(input_vector.get(g, 0.0) * centroid.get(g, 0.0) for g in input_vector)
        input_norm = math.sqrt(sum(v ** 2 for v in input_vector.values()))
        centroid_norm = math.sqrt(sum(v ** 2 for v in centroid.values()))
        
        sim = dot_product / (input_norm * centroid_norm) if (input_norm * centroid_norm) > 0 else 0.0
        if sim > max_sim:
            max_sim = sim
            best_domain = domain

    return best_domain, max_sim


# =============================================================================
# 🤖 Tier 3: Gemini 2.0 Flash LLM Zero-Shot Classifier
# =============================================================================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

DOMAIN_EFFICIENCY = {
    "Coding & Dev": 95,
    "Design & UI": 90,
    "Writing & Docs": 88,
    "Reading & Research": 86,
    "Data & Analytics": 92,
    "Product & Strategy": 82,
}

def classify_with_gemini(app_name: str) -> tuple[str, str, int]:
    """
    Tier 3: Zero-shot classification using Gemini 2.0 Flash.
    Called only when Tier 1 heuristics miss AND Tier 2 TF-IDF confidence is low.
    Returns (category, status, efficiency).
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key or "your_gemini_api_key" in api_key.lower():
        logger.warning("[Gemini] Valid GEMINI_API_KEY not found in env — falling back to TF-IDF.")
        return "Writing & Docs", "General Focus Activity", 80

    try:
        from google import genai
        client = genai.Client(api_key=api_key)

        prompt = f"""You are classifying macOS application process names for a focus productivity tracker.

App process name: "{app_name}"

Classify into EXACTLY ONE of these 6 domains:
- Coding & Dev       → Code editors, terminals, developer tools, databases, containers, API clients, compilers
- Design & UI        → Graphic design, 3D modeling, UI/UX prototyping, illustration, photo editing, video editing
- Writing & Docs     → Note-taking, technical documentation, specs, Markdown, writing tools
- Reading & Research → Web browsers, documentation readers, PDF tools, knowledge bases, web research
- Data & Analytics   → Data notebooks, SQL tools, spreadsheets, analytics tools
- Product & Strategy → Task planning, issue tracking, project management, team alignment

Respond ONLY with a valid JSON object and nothing else:
{{"category": "<exact domain name from the list above>", "status": "<2 to 5 words describing what this app does>"}}"""

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        if not response.text:
            raise ValueError("Empty or blocked response from model")
        text = response.text.strip()
        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

        result = json.loads(text)
        category = result.get("category", "Writing & Docs")
        status = result.get("status", "Active Application")

        # Validate the category is one of ours
        if category not in DOMAIN_EFFICIENCY:
            category = "Writing & Docs"
            status = "General Focus Activity"

        return category, status, DOMAIN_EFFICIENCY[category]

    except Exception as e:
        logger.error("[Gemini] Classification failed for '%s': %s", app_name, e)
        return "Writing & Docs", "General Focus Activity", 80


@app.post("/analytics/classify-app", response_model=AppClassifyResponse, tags=["analytics"])
@limiter.limit("120/minute")
def classify_application(request: Request, payload: AppClassifyRequest, db: Session = Depends(get_db)) -> AppClassifyResponse:
    raw = payload.raw_name.strip()
    low = raw.lower()
    tier = "heuristic"
    confidence = 1.0

    # ── Check Persistent DB Cache First ──────────────────────────────────────
    cached = db.query(ClassifiedApp).filter(ClassifiedApp.app_name == raw).first()
    if cached and cached.category in DOMAIN_EFFICIENCY:
        return AppClassifyResponse(
            name=raw,
            category=cached.category,
            efficiency=cached.efficiency,
            status=cached.status,
        )

    # ── Tier 1: Fast Heuristic Match (0ms deterministic) ─────────────────────
    category = None
    status = ""
    efficiency = 80

    if any(k in low for k in ["antigravity", "visual studio", "vs code", "vscode", "xcode", "postman", "iterm", "terminal", "warp", "ghostty", "sublime", "zed", "intellij", "pycharm", "webstorm", "docker", "orbstack", "insomnia", "git", "cursor", "windsurf"]):
        category, status, efficiency = "Coding & Dev", "Active Software Engineering", 95
    elif any(k in low for k in ["figma", "sketch", "penpot", "framer", "blender", "photoshop", "illustrator", "canva", "indesign", "affinity", "pixelmator", "krita"]):
        category, status, efficiency = "Design & UI", "Creative Design & UI Tokens", 90
    elif any(k in low for k in ["notion", "obsidian", "word", "pages", "craft", "bear", "textedit", "notes", "ulysses", "typora", "reminders"]):
        category, status, efficiency = "Writing & Docs", "Notes & Technical Docs", 88
    elif any(k in low for k in ["safari", "chrome", "arc", "brave", "firefox", "perplexity", "books", "reader", "medium", "zotero", "acrobat"]):
        category, status, efficiency = "Reading & Research", "Web Research & Reading", 86
    elif any(k in low for k in ["jupyter", "tableplus", "dbeaver", "excel", "rstudio", "tableau", "snowflake", "postico"]):
        category, status, efficiency = "Data & Analytics", "Data Notebooks & Queries", 92
    elif any(k in low for k in ["linear", "jira", "slack", "discord", "asana", "trello", "teams", "zoom", "messages"]):
        category, status, efficiency = "Product & Strategy", "Sprint & Product Strategy", 82

    # ── Tier 2: N-Gram TF-IDF (ML inference, fast local) ─────────────────────
    if category is None:
        predicted_domain, tfidf_confidence = ml_classify_app_domain(raw)
        tier = "tfidf"
        confidence = tfidf_confidence

        if tfidf_confidence >= 0.20:  # Valid domain match in TF-IDF
            # Confident enough — accept TF-IDF result
            category = predicted_domain
            status = f"Auto-Classified · {predicted_domain}"
            efficiency = DOMAIN_EFFICIENCY.get(category, 80)
        else:
            # ── Tier 3: Gemini 2.0 Flash LLM (semantic understanding) ────────
            tier = "llm"
            confidence = 0.95  # LLM is highly reliable
            category, status, efficiency = classify_with_gemini(raw)
            status = f"{status} · AI Classified"

    # ── Persist to DB cache (avoids repeated calls across restarts) ───────────
    try:
        db_entry = ClassifiedApp(
            app_name=raw,
            category=category,
            status=status,
            efficiency=float(efficiency),
            tier=tier,
            confidence=confidence,
        )
        db.add(db_entry)
        db.commit()
    except Exception:
        db.rollback()

    # ── Normalise display name ────────────────────────────────────────────────
    name = raw
    if "antigravity" in low:
        name = "Antigravity"
    elif "visual studio" in low or "vscode" in low:
        name = "VS Code"
    elif "cursor" in low:
        name = "Cursor"
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
        status=status,
    )
