import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.dependencies import AdminUser, CurrentUser
from app.modules.memberships.models import Membership
from app.modules.users.models import User, UserRole
from app.modules.users.schemas import (
    CreatePengelolaRequest,
    CreatePengelolaResponse,
    UserDetailResponse,
)
from app.modules.users.service import (
    EmailAlreadyRegisteredError,
    WasteBankNotFoundError,
    create_pengelola,
)

users_router = APIRouter(prefix="/api/v1/users", tags=["users"])
admin_users_router = APIRouter(prefix="/api/v1/admin/users", tags=["admin"])


def _can_view_user(db: Session, viewer: User, target: User) -> bool:
    if viewer.role == UserRole.ADMINISTRATOR:
        return True
    if viewer.role == UserRole.NASABAH:
        return viewer.id == target.id
    if viewer.waste_bank_id is None:
        return False
    if target.waste_bank_id == viewer.waste_bank_id:
        return True
    membership = db.scalar(
        select(Membership).where(
            Membership.user_id == target.id,
            Membership.waste_bank_id == viewer.waste_bank_id,
        )
    )
    return membership is not None


@users_router.get("/{user_id}", response_model=UserDetailResponse)
def get_user(
    user_id: uuid.UUID,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> UserDetailResponse:
    target = db.get(User, user_id)
    if target is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pengguna tidak ditemukan",
        )

    if not _can_view_user(db, current_user, target):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki akses untuk melakukan aksi ini",
        )

    return UserDetailResponse(
        id=target.id,
        name=target.name,
        email=target.email,
        phone=target.phone,
        role=target.role.value,
        waste_bank_id=target.waste_bank_id,
    )


@admin_users_router.post(
    "",
    response_model=CreatePengelolaResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_pengelola_account(
    payload: CreatePengelolaRequest,
    admin: AdminUser,
    db: Annotated[Session, Depends(get_db)],
) -> CreatePengelolaResponse:
    try:
        user = create_pengelola(db, payload)
    except EmailAlreadyRegisteredError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email sudah terdaftar",
        ) from None
    except WasteBankNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Bank sampah tidak ditemukan",
        ) from None
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Bank sampah tidak ditemukan",
        ) from None

    assert user.waste_bank_id is not None
    return CreatePengelolaResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role.value,
        waste_bank_id=user.waste_bank_id,
    )
