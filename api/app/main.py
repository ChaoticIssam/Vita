from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth import (
    create_access_token,
    create_user,
    decode_access_token,
    get_user_by_email,
    users_db,
    verify_password,
)
from app.schemas import ActivityEvent, TokenResponse, UserCreate, UserLogin, UserResponse

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


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload["sub"]
    user_record = users_db.get(user_id)
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return UserResponse(
        id=user_record["id"],
        name=user_record["name"],
        email=user_record["email"],
        created_at=user_record["created_at"],
    )


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
def register(user_in: UserCreate) -> TokenResponse:
    existing_user = get_user_by_email(user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )
    
    user_resp = create_user(user_in)
    access_token = create_access_token(data={"sub": user_resp.id, "email": user_resp.email})
    return TokenResponse(access_token=access_token, user=user_resp)


@app.post("/auth/login", response_model=TokenResponse, tags=["auth"])
def login(credentials: UserLogin) -> TokenResponse:
    user_record = get_user_by_email(credentials.email)
    if not user_record or not verify_password(credentials.password, user_record["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    user_resp = UserResponse(
        id=user_record["id"],
        name=user_record["name"],
        email=user_record["email"],
        created_at=user_record["created_at"],
    )
    access_token = create_access_token(data={"sub": user_resp.id, "email": user_resp.email})
    return TokenResponse(access_token=access_token, user=user_resp)


@app.get("/auth/me", response_model=UserResponse, tags=["auth"])
def me(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    return current_user
