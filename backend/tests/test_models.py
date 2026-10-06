from collections.abc import Iterator
from decimal import Decimal

import pytest
from app.db import Base
from app.modules.memberships.models import Membership
from app.modules.transactions.models import Transaction, TransactionItem, TransactionType
from app.modules.users.models import User, UserRole
from app.modules.waste_banks.models import WasteBank
from app.modules.waste_types.models import WasteType, WasteTypePrice
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool


@pytest.fixture()
def session() -> Iterator[Session]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        yield db
    Base.metadata.drop_all(engine)
    engine.dispose()


def create_bank(session: Session) -> WasteBank:
    bank = WasteBank(name="Bank Sampah Sejahtera", address="Jl. Mawar 1", region="Bandung")
    session.add(bank)
    session.flush()
    return bank


def create_user(
    session: Session,
    role: UserRole = UserRole.NASABAH,
    email: str = "nasabah@example.com",
) -> User:
    user = User(
        name="Nasabah Uji",
        email=email,
        phone="0812000000",
        password_hash="hash",
        role=role,
    )
    session.add(user)
    session.flush()
    return user


def create_membership(session: Session, user: User, bank: WasteBank) -> Membership:
    membership = Membership(user_id=user.id, waste_bank_id=bank.id)
    session.add(membership)
    session.flush()
    return membership


def create_staff(session: Session, bank: WasteBank) -> User:
    staff = User(
        name="Petugas",
        email="staff@example.com",
        phone="0812000002",
        password_hash="hash",
        role=UserRole.PENGELOLA,
        waste_bank_id=bank.id,
    )
    session.add(staff)
    session.flush()
    return staff


def test_membership_initial_balance_is_zero(session: Session) -> None:
    bank = create_bank(session)
    user = create_user(session)
    membership = create_membership(session, user, bank)
    assert membership.balance == Decimal("0")


def test_membership_unique_per_user_and_waste_bank(session: Session) -> None:
    bank = create_bank(session)
    user = create_user(session)
    create_membership(session, user, bank)

    duplicate = Membership(user_id=user.id, waste_bank_id=bank.id)
    session.add(duplicate)
    with pytest.raises(IntegrityError):
        session.flush()
    session.rollback()


def test_membership_balance_cannot_be_negative(session: Session) -> None:
    bank = create_bank(session)
    user = create_user(session)
    membership = Membership(user_id=user.id, waste_bank_id=bank.id, balance=Decimal("-1"))
    session.add(membership)
    with pytest.raises(IntegrityError):
        session.flush()
    session.rollback()


def test_manager_requires_waste_bank(session: Session) -> None:
    manager = User(
        name="Pengelola",
        email="pengelola@example.com",
        phone="0812000001",
        password_hash="hash",
        role=UserRole.PENGELOLA,
    )
    session.add(manager)
    with pytest.raises(IntegrityError):
        session.flush()
    session.rollback()


def test_manager_with_waste_bank_is_accepted(session: Session) -> None:
    bank = create_bank(session)
    manager = User(
        name="Pengelola",
        email="pengelola@example.com",
        phone="0812000001",
        password_hash="hash",
        role=UserRole.PENGELOLA,
        waste_bank_id=bank.id,
    )
    session.add(manager)
    session.flush()
    assert manager.waste_bank_id == bank.id


def test_waste_type_name_unique_per_waste_bank(session: Session) -> None:
    bank = create_bank(session)
    session.add(WasteType(waste_bank_id=bank.id, name="Plastik"))
    session.flush()

    duplicate = WasteType(waste_bank_id=bank.id, name="Plastik")
    session.add(duplicate)
    with pytest.raises(IntegrityError):
        session.flush()
    session.rollback()


def test_waste_type_price_must_be_positive(session: Session) -> None:
    bank = create_bank(session)
    waste_type = WasteType(waste_bank_id=bank.id, name="Plastik")
    session.add(waste_type)
    session.flush()

    price = WasteTypePrice(waste_type_id=waste_type.id, price_per_kg=Decimal("0"))
    session.add(price)
    with pytest.raises(IntegrityError):
        session.flush()
    session.rollback()


def test_transaction_idempotency_key_is_unique(session: Session) -> None:
    bank = create_bank(session)
    user = create_user(session)
    staff = create_staff(session, bank)
    membership = create_membership(session, user, bank)

    first = Transaction(
        membership_id=membership.id,
        transaction_type=TransactionType.DEPOSIT,
        total_amount=Decimal("10000"),
        idempotency_key="idem-1",
        created_by=staff.id,
    )
    session.add(first)
    session.flush()

    duplicate = Transaction(
        membership_id=membership.id,
        transaction_type=TransactionType.DEPOSIT,
        total_amount=Decimal("20000"),
        idempotency_key="idem-1",
        created_by=staff.id,
    )
    session.add(duplicate)
    with pytest.raises(IntegrityError):
        session.flush()
    session.rollback()


def test_deposit_must_have_positive_amount(session: Session) -> None:
    bank = create_bank(session)
    user = create_user(session)
    staff = create_staff(session, bank)
    membership = create_membership(session, user, bank)

    transaction = Transaction(
        membership_id=membership.id,
        transaction_type=TransactionType.DEPOSIT,
        total_amount=Decimal("0"),
        created_by=staff.id,
    )
    session.add(transaction)
    with pytest.raises(IntegrityError):
        session.flush()
    session.rollback()


def test_transaction_item_requires_positive_weight(session: Session) -> None:
    bank = create_bank(session)
    user = create_user(session)
    staff = create_staff(session, bank)
    membership = create_membership(session, user, bank)
    waste_type = WasteType(waste_bank_id=bank.id, name="Plastik")
    session.add(waste_type)
    session.flush()

    transaction = Transaction(
        membership_id=membership.id,
        transaction_type=TransactionType.DEPOSIT,
        total_amount=Decimal("5000"),
        created_by=staff.id,
    )
    session.add(transaction)
    session.flush()

    item = TransactionItem(
        transaction_id=transaction.id,
        waste_type_id=waste_type.id,
        waste_type_name="Plastik",
        weight_kg=Decimal("0"),
        price_per_kg=Decimal("5000"),
        subtotal=Decimal("0"),
    )
    session.add(item)
    with pytest.raises(IntegrityError):
        session.flush()
    session.rollback()


def test_transaction_item_stores_price_snapshot(session: Session) -> None:
    bank = create_bank(session)
    user = create_user(session)
    staff = create_staff(session, bank)
    membership = create_membership(session, user, bank)
    waste_type = WasteType(waste_bank_id=bank.id, name="Plastik")
    session.add(waste_type)
    session.flush()

    session.add(
        WasteTypePrice(
            waste_type_id=waste_type.id,
            price_per_kg=Decimal("4000"),
            created_by=staff.id,
        )
    )
    transaction = Transaction(
        membership_id=membership.id,
        transaction_type=TransactionType.DEPOSIT,
        total_amount=Decimal("8000"),
        created_by=staff.id,
    )
    session.add(transaction)
    session.flush()
    session.add(
        TransactionItem(
            transaction_id=transaction.id,
            waste_type_id=waste_type.id,
            waste_type_name="Plastik",
            weight_kg=Decimal("2.000"),
            price_per_kg=Decimal("4000"),
            subtotal=Decimal("8000"),
        )
    )
    session.commit()

    item_id = session.query(TransactionItem).one().id
    stored = session.get(TransactionItem, item_id)
    assert stored is not None
    assert stored.price_per_kg == Decimal("4000")
    assert stored.weight_kg == Decimal("2.000")
