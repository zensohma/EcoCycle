from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.modules.users.models import User, UserRole
from app.modules.users.schemas import CreatePengelolaRequest
from app.modules.waste_banks.models import WasteBank

__all__ = [
    "EmailAlreadyRegisteredError",
    "WasteBankNotFoundError",
    "create_pengelola",
]


class EmailAlreadyRegisteredError(Exception):
    def __init__(self, email: str) -> None:
        super().__init__(f"Email sudah terdaftar: {email}")
        self.email = email


class WasteBankNotFoundError(Exception):
    def __init__(self, waste_bank_id: object) -> None:
        super().__init__(f"Bank sampah tidak ditemukan: {waste_bank_id}")
        self.waste_bank_id = waste_bank_id


def create_pengelola(db: Session, payload: CreatePengelolaRequest) -> User:
    email = str(payload.email).lower()

    existing = db.scalar(select(User).where(User.email == email))
    if existing is not None:
        raise EmailAlreadyRegisteredError(email)

    waste_bank = db.get(WasteBank, payload.waste_bank_id)
    if waste_bank is None:
        raise WasteBankNotFoundError(payload.waste_bank_id)

    user = User(
        name=payload.name,
        email=email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=UserRole.PENGELOLA,
        waste_bank_id=waste_bank.id,
    )
    db.add(user)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise EmailAlreadyRegisteredError(email) from exc

    db.refresh(user)
    return user
