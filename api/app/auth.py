from datetime import datetime, timedelta, timezone
from typing import Optional
import os

import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher
from sqlalchemy.orm import Session

from app.models import User
from app.schemas import UserCreate, UserResponse

_raw_secret = os.getenv("JWT_SECRET_KEY", "")
if not _raw_secret or "change" in _raw_secret.lower() or "secret" in _raw_secret.lower():
    raise RuntimeError(
        "JWT_SECRET_KEY env var is missing or still set to a placeholder. "
        "Generate one with: openssl rand -hex 32"
    )
SECRET_KEY = _raw_secret
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

password_hash = PasswordHash((BcryptHasher(),))


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


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    email_lower = email.lower().strip()
    return db.query(User).filter(User.email == email_lower).first()


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_in: UserCreate) -> UserResponse:
    hashed = hash_password(user_in.password)
    db_user = User(
        name=user_in.name,
        email=user_in.email.lower().strip(),
        hashed_password=hashed,
        avatar_url=user_in.avatar_url,
        focus_fields=user_in.focus_fields,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return UserResponse.model_validate(db_user)
