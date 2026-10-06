from app.core.security import hash_password
from app.modules.memberships.models import Membership
from app.modules.users.models import User, UserRole
from app.modules.waste_banks.models import WasteBank
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

PASSWORD = "rahasia123"

CREATE_PENGELOLA_PAYLOAD = {
    "name": "Pengelola Baru",
    "email": "pengelola.baru@example.com",
    "phone": "081111111111",
    "password": PASSWORD,
    "confirm_password": PASSWORD,
}


def login(client: TestClient, email: str) -> None:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": PASSWORD},
    )
    assert response.status_code == 200


def csrf_headers(client: TestClient) -> dict[str, str]:
    token = client.cookies.get("csrf_token")
    assert token is not None
    return {"X-CSRF-Token": token}


def seed_users(db_engine: Engine) -> dict[str, object]:
    with Session(db_engine) as session:
        bank_one = WasteBank(
            name="Bank Melati",
            address="Jl. Melati No. 1",
            region="Jakarta Selatan",
        )
        bank_two = WasteBank(
            name="Bank Anggrek",
            address="Jl. Anggrek No. 2",
            region="Bandung",
        )
        session.add_all([bank_one, bank_two])
        session.flush()

        admin = User(
            name="Administrator",
            email="admin@example.com",
            phone="081200000001",
            password_hash=hash_password(PASSWORD),
            role=UserRole.ADMINISTRATOR,
        )
        pengelola_one = User(
            name="Pengelola Melati",
            email="pengelola1@example.com",
            phone="081200000002",
            password_hash=hash_password(PASSWORD),
            role=UserRole.PENGELOLA,
            waste_bank_id=bank_one.id,
        )
        pengelola_two = User(
            name="Pengelola Anggrek",
            email="pengelola2@example.com",
            phone="081200000003",
            password_hash=hash_password(PASSWORD),
            role=UserRole.PENGELOLA,
            waste_bank_id=bank_two.id,
        )
        nasabah_one = User(
            name="Nasabah Melati",
            email="nasabah1@example.com",
            phone="081200000004",
            password_hash=hash_password(PASSWORD),
            role=UserRole.NASABAH,
            waste_bank_id=bank_one.id,
        )
        nasabah_two = User(
            name="Nasabah Anggrek",
            email="nasabah2@example.com",
            phone="081200000005",
            password_hash=hash_password(PASSWORD),
            role=UserRole.NASABAH,
            waste_bank_id=bank_two.id,
        )
        session.add_all([admin, pengelola_one, pengelola_two, nasabah_one, nasabah_two])
        session.flush()

        session.add_all(
            [
                Membership(user_id=nasabah_one.id, waste_bank_id=bank_one.id),
                Membership(user_id=nasabah_two.id, waste_bank_id=bank_two.id),
            ]
        )
        session.commit()

        return {
            "bank_one": str(bank_one.id),
            "bank_two": str(bank_two.id),
            "admin": str(admin.id),
            "pengelola_one": str(pengelola_one.id),
            "pengelola_two": str(pengelola_two.id),
            "nasabah_one": str(nasabah_one.id),
            "nasabah_two": str(nasabah_two.id),
        }


def test_endpoints_require_authentication(client: TestClient) -> None:
    assert client.get("/api/v1/users/00000000-0000-0000-0000-000000000001").status_code == 401
    assert client.post("/api/v1/admin/users", json=CREATE_PENGELOLA_PAYLOAD).status_code == 401
    assert (
        client.get("/api/v1/waste-banks/00000000-0000-0000-0000-000000000001/members").status_code
        == 401
    )
    assert client.get("/api/v1/admin/waste-banks").status_code == 401


def test_nasabah_can_only_view_own_profile(client: TestClient, db_engine: Engine) -> None:
    ids = seed_users(db_engine)
    login(client, "nasabah1@example.com")

    own = client.get(f"/api/v1/users/{ids['nasabah_one']}")
    assert own.status_code == 200
    assert own.json()["email"] == "nasabah1@example.com"

    other = client.get(f"/api/v1/users/{ids['nasabah_two']}")
    assert other.status_code == 403

    other_role = client.get(f"/api/v1/users/{ids['pengelola_one']}")
    assert other_role.status_code == 403


def test_nasabah_cannot_access_admin_endpoints(client: TestClient, db_engine: Engine) -> None:
    ids = seed_users(db_engine)
    login(client, "nasabah1@example.com")

    create = client.post(
        "/api/v1/admin/users",
        json=CREATE_PENGELOLA_PAYLOAD,
        headers=csrf_headers(client),
    )
    assert create.status_code == 403

    members = client.get(f"/api/v1/waste-banks/{ids['bank_one']}/members")
    assert members.status_code == 403

    banks = client.get("/api/v1/admin/waste-banks")
    assert banks.status_code == 403


def test_pengelola_can_view_own_bank_members_and_members(
    client: TestClient, db_engine: Engine
) -> None:
    ids = seed_users(db_engine)
    login(client, "pengelola1@example.com")

    members = client.get(f"/api/v1/waste-banks/{ids['bank_one']}/members")
    assert members.status_code == 200
    body = members.json()
    assert body["waste_bank_id"] == ids["bank_one"]
    assert [m["email"] for m in body["members"]] == ["nasabah1@example.com"]

    member_profile = client.get(f"/api/v1/users/{ids['nasabah_one']}")
    assert member_profile.status_code == 200
    assert member_profile.json()["email"] == "nasabah1@example.com"


def test_pengelola_cannot_access_other_bank(client: TestClient, db_engine: Engine) -> None:
    ids = seed_users(db_engine)
    login(client, "pengelola1@example.com")

    cross_members = client.get(f"/api/v1/waste-banks/{ids['bank_two']}/members")
    assert cross_members.status_code == 403

    cross_profile = client.get(f"/api/v1/users/{ids['nasabah_two']}")
    assert cross_profile.status_code == 403

    cross_pengelola = client.get(f"/api/v1/users/{ids['pengelola_two']}")
    assert cross_pengelola.status_code == 403


def test_pengelola_cannot_create_accounts(client: TestClient, db_engine: Engine) -> None:
    seed_users(db_engine)
    login(client, "pengelola1@example.com")

    response = client.post(
        "/api/v1/admin/users",
        json=CREATE_PENGELOLA_PAYLOAD,
        headers=csrf_headers(client),
    )
    assert response.status_code == 403


def test_admin_creates_pengelola_with_assigned_bank(client: TestClient, db_engine: Engine) -> None:
    ids = seed_users(db_engine)
    login(client, "admin@example.com")

    response = client.post(
        "/api/v1/admin/users",
        json={**CREATE_PENGELOLA_PAYLOAD, "waste_bank_id": ids["bank_one"]},
        headers=csrf_headers(client),
    )
    assert response.status_code == 201
    body = response.json()
    assert body["role"] == "pengelola"
    assert body["waste_bank_id"] == ids["bank_one"]
    assert body["email"] == "pengelola.baru@example.com"

    with Session(db_engine) as session:
        created = session.scalar(select(User).where(User.email == "pengelola.baru@example.com"))
    assert created is not None
    assert created.role == UserRole.PENGELOLA
    assert created.waste_bank_id is not None
    assert created.password_hash.startswith("$argon2id$")


def test_admin_create_pengelola_requires_valid_bank(client: TestClient, db_engine: Engine) -> None:
    seed_users(db_engine)
    login(client, "admin@example.com")

    response = client.post(
        "/api/v1/admin/users",
        json={
            **CREATE_PENGELOLA_PAYLOAD,
            "waste_bank_id": "00000000-0000-0000-0000-000000000099",
        },
        headers=csrf_headers(client),
    )
    assert response.status_code == 422
    assert response.json()["detail"] == "Bank sampah tidak ditemukan"


def test_admin_create_pengelola_duplicate_email_rejected(
    client: TestClient, db_engine: Engine
) -> None:
    ids = seed_users(db_engine)
    login(client, "admin@example.com")

    payload = {**CREATE_PENGELOLA_PAYLOAD, "waste_bank_id": ids["bank_one"]}
    first = client.post("/api/v1/admin/users", json=payload, headers=csrf_headers(client))
    assert first.status_code == 201

    second = client.post("/api/v1/admin/users", json=payload, headers=csrf_headers(client))
    assert second.status_code == 409
    assert second.json()["detail"] == "Email sudah terdaftar"


def test_admin_create_pengelola_password_mismatch_rejected(
    client: TestClient, db_engine: Engine
) -> None:
    ids = seed_users(db_engine)
    login(client, "admin@example.com")

    response = client.post(
        "/api/v1/admin/users",
        json={
            **CREATE_PENGELOLA_PAYLOAD,
            "confirm_password": "berbeda123",
            "waste_bank_id": ids["bank_one"],
        },
        headers=csrf_headers(client),
    )
    assert response.status_code == 422


def test_admin_can_view_any_user_and_list_banks(client: TestClient, db_engine: Engine) -> None:
    ids = seed_users(db_engine)
    login(client, "admin@example.com")

    for key in ("nasabah_one", "nasabah_two", "pengelola_one", "pengelola_two"):
        response = client.get(f"/api/v1/users/{ids[key]}")
        assert response.status_code == 200

    banks = client.get("/api/v1/admin/waste-banks")
    assert banks.status_code == 200
    regions = {bank["region"] for bank in banks.json()}
    assert regions == {"Jakarta Selatan", "Bandung"}


def test_common_registration_cannot_assign_privileged_role(
    client: TestClient, db_engine: Engine
) -> None:
    ids = seed_users(db_engine)
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Penipu",
            "email": "penipu@example.com",
            "phone": "089999999999",
            "password": PASSWORD,
            "confirm_password": PASSWORD,
            "role": "pengelola",
            "waste_bank_id": ids["bank_one"],
        },
    )
    assert response.status_code == 201

    login(client, "penipu@example.com")
    profile = client.get("/api/v1/auth/me")
    assert profile.status_code == 200
    assert profile.json()["role"] == "nasabah"


def test_csrf_required_for_admin_creation(client: TestClient, db_engine: Engine) -> None:
    ids = seed_users(db_engine)
    login(client, "admin@example.com")

    response = client.post(
        "/api/v1/admin/users",
        json={**CREATE_PENGELOLA_PAYLOAD, "waste_bank_id": ids["bank_one"]},
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "CSRF token tidak valid"
