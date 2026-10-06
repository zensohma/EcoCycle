import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class MembershipMemberResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    email: str
    balance: Decimal
    is_active: bool
    joined_at: datetime


class MemberListResponse(BaseModel):
    waste_bank_id: uuid.UUID
    members: list[MembershipMemberResponse]
