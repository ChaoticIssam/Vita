import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher

from app.schemas import UserCreate, UserResponse

SECRET_KEY = "vita-super-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

password_hash = PasswordHash((BcryptHasher(),))

# In-memory User Database (can easily plug into SQLAlchemy / Postgres)
users_db: dict[str, dict] = {}


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None


def get_user_by_email(email: str) -> Optional[dict]:
    email_lower = email.lower().strip()
    for u in users_db.values():
        if u["email"].lower() == email_lower:
            return u
    return None


def create_user(user_in: UserCreate) -> UserResponse:
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    hashed = hash_password(user_in.password)

    user_record = {
        "id": user_id,
        "name": user_in.name,
        "email": user_in.email.lower().strip(),
        "hashed_password": hashed,
        "created_at": now,
    }
    users_db[user_id] = user_record
    return UserResponse(
        id=user_id,
        name=user_in.name,
        email=user_in.email,
        created_at=now,
    )
