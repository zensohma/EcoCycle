import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.dependencies import AdminUser, PengelolaUser
from app.modules.users.models import User, UserRole
from app.modules.waste_banks.models import WasteBank
from app.modules.waste_banks.schemas import (
    PublicWasteBankResponse,
    WasteBankSummaryResponse,
    WasteBankUpdateRequest,
)

router = APIRouter(prefix="/api/v1/admin/waste-banks", tags=["admin"])
public_router = APIRouter(prefix="/api/v1/waste-banks", tags=["waste-banks"])
manage_router = APIRouter(prefix="/api/v1/waste-banks", tags=["waste-banks"])


def _to_public_response(bank: WasteBank) -> PublicWasteBankResponse:
    return PublicWasteBankResponse(
        id=bank.id,
        name=bank.name,
        address=bank.address,
        region=bank.region,
        phone=bank.phone,
        email=bank.email,
        operating_hours=bank.operating_hours,
        deposit_procedure=bank.deposit_procedure,
        latitude=float(bank.latitude) if bank.latitude is not None else None,
        longitude=float(bank.longitude) if bank.longitude is not None else None,
        is_active=bank.is_active,
    )


@public_router.get("", response_model=list[PublicWasteBankResponse])
def list_public_waste_banks(
    db: Annotated[Session, Depends(get_db)],
    q: str | None = None,
) -> list[PublicWasteBankResponse]:
    stmt = select(WasteBank).where(WasteBank.is_active.is_(True))

    if q is not None and q.strip():
        pattern = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(
                WasteBank.name.ilike(pattern),
                WasteBank.region.ilike(pattern),
            )
        )

    stmt = stmt.order_by(WasteBank.name)
    return [_to_public_response(bank) for bank in db.scalars(stmt).all()]


@public_router.get("/{waste_bank_id}", response_model=PublicWasteBankResponse)
def get_public_waste_bank(
    waste_bank_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
) -> PublicWasteBankResponse:
    bank = db.get(WasteBank, waste_bank_id)
    if bank is None or not bank.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bank sampah tidak ditemukan",
        )
    return _to_public_response(bank)


@router.get("", response_model=list[WasteBankSummaryResponse])
def list_waste_banks(
    admin: AdminUser,
    db: Annotated[Session, Depends(get_db)],
) -> list[WasteBankSummaryResponse]:
    waste_banks = db.scalars(select(WasteBank).order_by(WasteBank.name)).all()
    return [
        WasteBankSummaryResponse(
            id=bank.id,
            name=bank.name,
            region=bank.region,
            is_active=bank.is_active,
        )
        for bank in waste_banks
    ]


def _get_manageable_bank(
    db: Session,
    user: User,
    waste_bank_id: uuid.UUID,
) -> WasteBank:
    bank = db.get(WasteBank, waste_bank_id)
    if bank is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bank sampah tidak ditemukan",
        )
    if user.role != UserRole.ADMINISTRATOR and user.waste_bank_id != bank.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki akses untuk melakukan aksi ini",
        )
    return bank


@manage_router.get("/{waste_bank_id}/manage", response_model=PublicWasteBankResponse)
def get_managed_waste_bank(
    user: PengelolaUser,
    waste_bank_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
) -> PublicWasteBankResponse:
    bank = _get_manageable_bank(db, user, waste_bank_id)
    return _to_public_response(bank)


@manage_router.put(
    "/{waste_bank_id}",
    response_model=PublicWasteBankResponse,
)
def update_waste_bank(
    user: PengelolaUser,
    payload: WasteBankUpdateRequest,
    waste_bank_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
) -> PublicWasteBankResponse:
    bank = _get_manageable_bank(db, user, waste_bank_id)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(bank, field, value)

    db.commit()
    db.refresh(bank)
    return _to_public_response(bank)
