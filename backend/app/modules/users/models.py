import enum
import uuid

from sqlalchemy import Boolean, CheckConstraint, Enum, ForeignKey, String, text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class UserRole(str, enum.Enum):
    NASABAH = "nasabah"
    PENGELOLA = "pengelola"
    ADMINISTRATOR = "administrator"


class User(TimestampMixin, Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "role <> 'pengelola' OR waste_bank_id IS NOT NULL",
            name="ck_users_pengelola_requires_waste_bank",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(
            UserRole,
            name="user_role",
            native_enum=False,
            values_callable=lambda e: [member.value for member in e],
        ),
        nullable=False,
        default=UserRole.NASABAH,
        server_default=text("'nasabah'"),
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default=text("true"),
    )
    waste_bank_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("waste_banks.id", ondelete="RESTRICT"),
        nullable=True,
    )
