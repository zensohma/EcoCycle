from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.modules.auth.schemas import LoginRequest, RegisterRequest
from app.modules.users.models import User, UserRole

__all__ = [
    "EmailAlreadyRegisteredError",
    "InvalidCredentialsError",
    "login_user",
    "register_user",
]


class EmailAlreadyRegisteredError(Exception):
    def __init__(self, email: str) -> None:
        super().__init__(f"Email sudah terdaftar: {email}")
        self.email = email


class InvalidCredentialsError(Exception):
    pass


def register_user(db: Session, payload: RegisterRequest) -> User:
    email = str(payload.email).lower()

    existing = db.scalar(select(User).where(User.email == email))
    if existing is not None:
        raise EmailAlreadyRegisteredError(email)

    user = User(
        name=payload.name,
        email=email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=UserRole.NASABAH,
    )
    db.add(user)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise EmailAlreadyRegisteredError(email) from exc

    db.refresh(user)
    return user


def login_user(db: Session, payload: LoginRequest) -> User:
    email = str(payload.email).lower()

    user = db.scalar(select(User).where(User.email == email))
    if user is None or not user.is_active:
        raise InvalidCredentialsError()

    if not verify_password(user.password_hash, payload.password):
        raise InvalidCredentialsError()

    return user
