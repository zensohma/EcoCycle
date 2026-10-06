from datetime import datetime, timedelta, timezone

import jwt
from app.core.config import settings
from app.core.security import ALGORITHM
from app.modules.users.models import User
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

REGISTER_PAYLOAD = {
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "phone": "081234567890",
    "password": "rahasia123",
    "confirm_password": "rahasia123",
}

LOGIN_PAYLOAD = {
    "email": "budi@example.com",
    "password": "rahasia123",
}


def get_user(engine: Engine, email: str) -> User | None:
    with Session(engine) as session:
        return session.scalar(select(User).where(User.email == email))


def register(client: TestClient) -> None:
    response = client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)
    assert response.status_code == 201


def test_login_success_returns_role_and_sets_cookies(client: TestClient) -> None:
    register(client)
    response = client.post("/api/v1/auth/login", json=LOGIN_PAYLOAD)

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == "budi@example.com"
    assert body["role"] == "nasabah"
    assert "password" not in body

    assert "access_token" in response.cookies
    assert "csrf_token" in response.cookies

    set_cookies = response.headers.get_list("set-cookie")
    access = next(c for c in set_cookies if c.startswith("access_token="))
    csrf = next(c for c in set_cookies if c.startswith("csrf_token="))
    assert "HttpOnly" in access
    assert "HttpOnly" not in csrf
    assert "samesite=none" in access.lower()


def test_login_wrong_password_rejected(client: TestClient) -> None:
    register(client)
    response = client.post(
        "/api/v1/auth/login",
        json={**LOGIN_PAYLOAD, "password": "salahbanget"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Email atau kata sandi salah"
    assert "access_token" not in response.cookies


def test_login_unknown_email_rejected(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "tidakada@example.com", "password": "rahasia123"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Email atau kata sandi salah"


def test_login_rate_limited_after_five_failures(client: TestClient) -> None:
    register(client)
    bad_payload = {**LOGIN_PAYLOAD, "password": "salahbanget"}

    for _ in range(5):
        response = client.post("/api/v1/auth/login", json=bad_payload)
        assert response.status_code == 401

    sixth = client.post("/api/v1/auth/login", json=bad_payload)
    assert sixth.status_code == 429
    assert "Terlalu banyak" in sixth.json()["detail"]


def test_logout_clears_cookies(client: TestClient) -> None:
    register(client)
    login = client.post("/api/v1/auth/login", json=LOGIN_PAYLOAD)
    assert login.status_code == 200

    csrf_token = response_csrf(client)
    response = client.post(
        "/api/v1/auth/logout",
        headers={"X-CSRF-Token": csrf_token},
    )
    assert response.status_code == 200
    assert "access_token" not in client.cookies
    assert "csrf_token" not in client.cookies


def test_me_requires_authentication(client: TestClient) -> None:
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_me_returns_user_after_login(client: TestClient) -> None:
    register(client)
    login = client.post("/api/v1/auth/login", json=LOGIN_PAYLOAD)
    assert login.status_code == 200

    response = client.get("/api/v1/auth/me")
    assert response.status_code == 200
    body = response.json()
    assert body["email"] == "budi@example.com"
    assert body["role"] == "nasabah"


def test_me_rejects_invalid_token(client: TestClient) -> None:
    client.cookies.set("access_token", "bukan-token-valid")
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_me_rejects_expired_token(client: TestClient, db_engine: Engine) -> None:
    register(client)
    user = get_user(db_engine, "budi@example.com")
    assert user is not None

    expired = jwt.encode(
        {
            "sub": str(user.id),
            "role": user.role.value,
            "exp": datetime.now(timezone.utc) - timedelta(minutes=5),
        },
        settings.secret_key,
        algorithm=ALGORITHM,
    )
    client.cookies.set("access_token", expired)

    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_me_rejects_inactive_user(client: TestClient, db_engine: Engine) -> None:
    register(client)
    client.post("/api/v1/auth/login", json=LOGIN_PAYLOAD)

    with Session(db_engine) as session:
        user = session.scalar(select(User).where(User.email == "budi@example.com"))
        assert user is not None
        user.is_active = False
        session.commit()

    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_csrf_required_for_authenticated_mutating_request(client: TestClient) -> None:
    register(client)
    login = client.post("/api/v1/auth/login", json=LOGIN_PAYLOAD)
    assert login.status_code == 200

    without_csrf = client.post("/api/v1/auth/logout")
    assert without_csrf.status_code == 403
    assert without_csrf.json()["detail"] == "CSRF token tidak valid"
    assert "access_token" in client.cookies

    wrong_csrf = client.post(
        "/api/v1/auth/logout",
        headers={"X-CSRF-Token": "salah-satu-dua-tiga"},
    )
    assert wrong_csrf.status_code == 403
    assert "access_token" in client.cookies

    csrf_token = response_csrf(client)
    valid = client.post(
        "/api/v1/auth/logout",
        headers={"X-CSRF-Token": csrf_token},
    )
    assert valid.status_code == 200
    assert "access_token" not in client.cookies


def response_csrf(client: TestClient) -> str:
    csrf = client.cookies.get("csrf_token")
    assert csrf is not None
    return csrf
