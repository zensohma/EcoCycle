import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.dependencies import CurrentUser
from app.modules.memberships.models import Membership
from app.modules.memberships.schemas import MemberListResponse, MembershipMemberResponse
from app.modules.users.models import User, UserRole
from app.modules.waste_banks.models import WasteBank

router = APIRouter(prefix="/api/v1/waste-banks", tags=["members"])


@router.get("/{waste_bank_id}/members", response_model=MemberListResponse)
def list_bank_members(
    waste_bank_id: uuid.UUID,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> MemberListResponse:
    waste_bank = db.get(WasteBank, waste_bank_id)
    if waste_bank is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bank sampah tidak ditemukan",
        )

    if current_user.role == UserRole.NASABAH:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki akses untuk melakukan aksi ini",
        )

    if current_user.role == UserRole.PENGELOLA and current_user.waste_bank_id != waste_bank_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda hanya dapat mengakses bank sampah yang Anda kelola",
        )

    rows = db.execute(
        select(Membership, User)
        .join(User, User.id == Membership.user_id)
        .where(Membership.waste_bank_id == waste_bank_id)
        .order_by(Membership.joined_at)
    ).all()

    members = [
        MembershipMemberResponse(
            id=membership.id,
            user_id=user.id,
            name=user.name,
            email=user.email,
            balance=membership.balance,
            is_active=membership.is_active,
            joined_at=membership.joined_at,
        )
        for membership, user in rows
    ]

    return MemberListResponse(waste_bank_id=waste_bank_id, members=members)
