from app.core.security import verify_password
from app.modules.users.models import User, UserRole
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

VALID_PAYLOAD = {
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "phone": "081234567890",
    "password": "rahasia123",
    "confirm_password": "rahasia123",
}


def get_user(engine: Engine, email: str) -> User | None:
    with Session(engine) as session:
        return session.scalar(select(User).where(User.email == email))


def test_register_success(client: TestClient, db_engine: Engine) -> None:
    response = client.post("/api/v1/auth/register", json=VALID_PAYLOAD)

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Budi Santoso"
    assert body["email"] == "budi@example.com"
    assert "password" not in body
    assert "password_hash" not in body

    user = get_user(db_engine, "budi@example.com")
    assert user is not None
    assert user.role == UserRole.NASABAH
    assert user.password_hash != "rahasia123"
    assert user.password_hash.startswith("$argon2id$")
    assert verify_password(user.password_hash, "rahasia123")


def test_register_duplicate_email_rejected(client: TestClient, db_engine: Engine) -> None:
    first = client.post("/api/v1/auth/register", json=VALID_PAYLOAD)
    assert first.status_code == 201

    duplicate = {**VALID_PAYLOAD, "name": "Lain Orang"}
    second = client.post("/api/v1/auth/register", json=duplicate)
    assert second.status_code == 409
    assert second.json()["detail"] == "Email sudah terdaftar"

    with Session(db_engine) as session:
        count = len(list(session.scalars(select(User))))
    assert count == 1


def test_register_duplicate_email_case_insensitive(client: TestClient) -> None:
    first = client.post("/api/v1/auth/register", json=VALID_PAYLOAD)
    assert first.status_code == 201

    second = client.post(
        "/api/v1/auth/register",
        json={**VALID_PAYLOAD, "email": "BUDI@EXAMPLE.COM"},
    )
    assert second.status_code == 409


def test_register_password_mismatch_rejected(client: TestClient) -> None:
    payload = {**VALID_PAYLOAD, "confirm_password": "berbeda123"}
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_register_invalid_email_rejected(client: TestClient) -> None:
    payload = {**VALID_PAYLOAD, "email": "bukan-email"}
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_register_missing_fields_rejected(client: TestClient) -> None:
    response = client.post("/api/v1/auth/register", json={})
    assert response.status_code == 422


def test_register_short_password_rejected(client: TestClient) -> None:
    payload = {**VALID_PAYLOAD, "password": "abc", "confirm_password": "abc"}
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_register_ignores_role_in_payload(client: TestClient, db_engine: Engine) -> None:
    payload = {**VALID_PAYLOAD, "role": "administrator"}
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201

    user = get_user(db_engine, "budi@example.com")
    assert user is not None
    assert user.role == UserRole.NASABAH


def test_register_creates_user_with_zero_balance_state(
    client: TestClient, db_engine: Engine
) -> None:
    response = client.post("/api/v1/auth/register", json=VALID_PAYLOAD)
    assert response.status_code == 201

    user = get_user(db_engine, "budi@example.com")
    assert user is not None
    assert user.is_active is True
    assert user.waste_bank_id is None
