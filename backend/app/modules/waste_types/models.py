import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    UniqueConstraint,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class WasteType(TimestampMixin, Base):
    __tablename__ = "waste_types"
    __table_args__ = (
        UniqueConstraint("waste_bank_id", "name", name="uq_waste_types_waste_bank_name"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    waste_bank_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("waste_banks.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default=text("true"),
    )


class WasteTypePrice(Base):
    __tablename__ = "waste_type_prices"
    __table_args__ = (
        Index(
            "ix_waste_type_prices_type_effective_from",
            "waste_type_id",
            "effective_from",
        ),
        CheckConstraint("price_per_kg > 0", name="ck_waste_type_prices_positive_price"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    waste_type_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("waste_types.id", ondelete="CASCADE"),
        nullable=False,
    )
    price_per_kg: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    effective_from: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
