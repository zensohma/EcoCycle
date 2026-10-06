from app.core.security import hash_password
from app.modules.users.models import User, UserRole
from app.modules.waste_banks.models import WasteBank
from fastapi.testclient import TestClient
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

PASSWORD = "rahasia123"

BANK_ONE_ID = "11111111-1111-1111-1111-111111111111"
BANK_TWO_ID = "22222222-2222-2222-2222-222222222222"
MISSING_ID = "44444444-4444-4444-4444-444444444444"

FULL_UPDATE_PAYLOAD = {
    "name": "Bank Melati Baru",
    "address": "Jl. Melati Baru No. 9, Jakarta Selatan",
    "region": "Jakarta Utara",
    "phone": "021-5559999",
    "email": "melati.baru@example.com",
    "operating_hours": "Senin–Minggu, 07.00–18.00",
    "deposit_procedure": "Pilah sampah, timbang di loket, saldo terisi.",
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


def seed(db_engine: Engine) -> None:
    import uuid as _uuid

    with Session(db_engine) as session:
        bank_one = WasteBank(
            id=_uuid.UUID(BANK_ONE_ID),
            name="Bank Melati",
            address="Jl. Melati No. 1, Jakarta Selatan",
            region="Jakarta Selatan",
            phone="021-5551111",
            email="melati@example.com",
            operating_hours="Senin–Sabtu, 08.00–16.00",
            deposit_procedure="Bawa sampah terpilah, timbang di loket.",
        )
        bank_two = WasteBank(
            id=_uuid.UUID(BANK_TWO_ID),
            name="Bank Anggrek",
            address="Jl. Anggrek No. 2, Bandung",
            region="Bandung",
            phone="022-5552222",
        )
        session.add_all([bank_one, bank_two])
        session.flush()

        session.add_all(
            [
                User(
                    name="Administrator",
                    email="admin@example.com",
                    phone="081200000001",
                    password_hash=hash_password(PASSWORD),
                    role=UserRole.ADMINISTRATOR,
                ),
                User(
                    name="Pengelola Melati",
                    email="pengelola1@example.com",
                    phone="081200000002",
                    password_hash=hash_password(PASSWORD),
                    role=UserRole.PENGELOLA,
                    waste_bank_id=bank_one.id,
                ),
                User(
                    name="Pengelola Anggrek",
                    email="pengelola2@example.com",
                    phone="081200000003",
                    password_hash=hash_password(PASSWORD),
                    role=UserRole.PENGELOLA,
                    waste_bank_id=bank_two.id,
                ),
                User(
                    name="Nasabah Melati",
                    email="nasabah1@example.com",
                    phone="081200000004",
                    password_hash=hash_password(PASSWORD),
                    role=UserRole.NASABAH,
                    waste_bank_id=bank_one.id,
                ),
            ]
        )
        session.commit()


def load_bank(db_engine: Engine, bank_id: str) -> WasteBank | None:
    import uuid as _uuid

    with Session(db_engine) as session:
        bank = session.get(WasteBank, _uuid.UUID(bank_id))
        if bank is not None:
            session.refresh(bank)
        return bank


def test_manage_endpoints_require_authentication(client: TestClient) -> None:
    assert client.get(f"/api/v1/waste-banks/{BANK_ONE_ID}/manage").status_code == 401
    assert (
        client.put(f"/api/v1/waste-banks/{BANK_ONE_ID}", json=FULL_UPDATE_PAYLOAD).status_code
        == 401
    )


def test_nasabah_cannot_manage_waste_bank(client: TestClient, db_engine: Engine) -> None:
    seed(db_engine)
    login(client, "nasabah1@example.com")

    read = client.get(f"/api/v1/waste-banks/{BANK_ONE_ID}/manage")
    assert read.status_code == 403

    update = client.put(
        f"/api/v1/waste-banks/{BANK_ONE_ID}",
        json=FULL_UPDATE_PAYLOAD,
        headers=csrf_headers(client),
    )
    assert update.status_code == 403


def test_pengelola_reads_own_bank(client: TestClient, db_engine: Engine) -> None:
    seed(db_engine)
    login(client, "pengelola1@example.com")

    response = client.get(f"/api/v1/waste-banks/{BANK_ONE_ID}/manage")
    assert response.status_code == 200

    body = response.json()
    assert body["id"] == BANK_ONE_ID
    assert body["name"] == "Bank Melati"
    assert body["deposit_procedure"] == "Bawa sampah terpilah, timbang di loket."


def test_pengelola_cannot_read_other_bank(client: TestClient, db_engine: Engine) -> None:
    seed(db_engine)
    login(client, "pengelola1@example.com")

    response = client.get(f"/api/v1/waste-banks/{BANK_TWO_ID}/manage")
    assert response.status_code == 403
    assert response.json()["detail"] == "Anda tidak memiliki akses untuk melakukan aksi ini"


def test_pengelola_updates_own_bank(client: TestClient, db_engine: Engine) -> None:
    seed(db_engine)
    login(client, "pengelola1@example.com")

    response = client.put(
        f"/api/v1/waste-banks/{BANK_ONE_ID}",
        json=FULL_UPDATE_PAYLOAD,
        headers=csrf_headers(client),
    )
    assert response.status_code == 200

    body = response.json()
    assert body["name"] == "Bank Melati Baru"
    assert body["address"] == "Jl. Melati Baru No. 9, Jakarta Selatan"
    assert body["operating_hours"] == "Senin–Minggu, 07.00–18.00"
    assert body["deposit_procedure"].startswith("Pilah sampah")

    stored = load_bank(db_engine, BANK_ONE_ID)
    assert stored is not None
    assert stored.name == "Bank Melati Baru"
    assert stored.region == "Jakarta Utara"
    assert stored.phone == "021-5559999"


def test_update_is_visible_on_public_page(client: TestClient, db_engine: Engine) -> None:
    seed(db_engine)
    login(client, "pengelola1@example.com")

    updated = client.put(
        f"/api/v1/waste-banks/{BANK_ONE_ID}",
        json=FULL_UPDATE_PAYLOAD,
        headers=csrf_headers(client),
    )
    assert updated.status_code == 200

    client.cookies.clear()

    detail = client.get(f"/api/v1/waste-banks/{BANK_ONE_ID}")
    assert detail.status_code == 200
    assert detail.json()["address"] == "Jl. Melati Baru No. 9, Jakarta Selatan"
    assert detail.json()["operating_hours"] == "Senin–Minggu, 07.00–18.00"

    listing = client.get("/api/v1/waste-banks", params={"q": "Jakarta Utara"})
    assert [bank["id"] for bank in listing.json()] == [BANK_ONE_ID]


def test_pengelola_cannot_update_other_bank(client: TestClient, db_engine: Engine) -> None:
    seed(db_engine)
    login(client, "pengelola1@example.com")

    response = client.put(
        f"/api/v1/waste-banks/{BANK_TWO_ID}",
        json=FULL_UPDATE_PAYLOAD,
        headers=csrf_headers(client),
    )
    assert response.status_code == 403

    stored = load_bank(db_engine, BANK_TWO_ID)
    assert stored is not None
    assert stored.name == "Bank Anggrek"
    assert stored.address == "Jl. Anggrek No. 2, Bandung"


def test_admin_updates_any_bank(client: TestClient, db_engine: Engine) -> None:
    seed(db_engine)
    login(client, "admin@example.com")

    response = client.put(
        f"/api/v1/waste-banks/{BANK_TWO_ID}",
        json={**FULL_UPDATE_PAYLOAD, "name": "Bank Anggrek Baru"},
        headers=csrf_headers(client),
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Bank Anggrek Baru"

    managed = client.get(f"/api/v1/waste-banks/{BANK_ONE_ID}/manage")
    assert managed.status_code == 200


def test_update_missing_bank_returns_404(client: TestClient, db_engine: Engine) -> None:
    seed(db_engine)
    login(client, "admin@example.com")

    response = client.put(
        f"/api/v1/waste-banks/{MISSING_ID}",
        json=FULL_UPDATE_PAYLOAD,
        headers=csrf_headers(client),
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Bank sampah tidak ditemukan"

    read = client.get(f"/api/v1/waste-banks/{MISSING_ID}/manage")
    assert read.status_code == 404


def test_update_rejects_blank_required_columns(client: TestClient, db_engine: Engine) -> None:
    seed(db_engine)
    login(client, "pengelola1@example.com")
    headers = csrf_headers(client)

    blank_name = client.put(
        f"/api/v1/waste-banks/{BANK_ONE_ID}",
        json={"name": "   "},
        headers=headers,
    )
    assert blank_name.status_code == 422

    blank_address = client.put(
        f"/api/v1/waste-banks/{BANK_ONE_ID}",
        json={"address": ""},
        headers=headers,
    )
    assert blank_address.status_code == 422

    null_region = client.put(
        f"/api/v1/waste-banks/{BANK_ONE_ID}",
        json={"region": None},
        headers=headers,
    )
    assert null_region.status_code == 422

    stored = load_bank(db_engine, BANK_ONE_ID)
    assert stored is not None
    assert stored.name == "Bank Melati"
    assert stored.address == "Jl. Melati No. 1, Jakarta Selatan"


def test_update_rejects_invalid_contact_values(client: TestClient, db_engine: Engine) -> None:
    seed(db_engine)
    login(client, "pengelola1@example.com")
    headers = csrf_headers(client)

    invalid_email = client.put(
        f"/api/v1/waste-banks/{BANK_ONE_ID}",
        json={"email": "bukan-email"},
        headers=headers,
    )
    assert invalid_email.status_code == 422

    too_long_phone = client.put(
        f"/api/v1/waste-banks/{BANK_ONE_ID}",
        json={"phone": "0" * 40},
        headers=headers,
    )
    assert too_long_phone.status_code == 422

    stored = load_bank(db_engine, BANK_ONE_ID)
    assert stored is not None
    assert stored.email == "melati@example.com"
    assert stored.phone == "021-5551111"


def test_update_rejects_empty_payload(client: TestClient, db_engine: Engine) -> None:
    seed(db_engine)
    login(client, "pengelola1@example.com")

    response = client.put(
        f"/api/v1/waste-banks/{BANK_ONE_ID}",
        json={},
        headers=csrf_headers(client),
    )
    assert response.status_code == 422


def test_partial_update_preserves_other_columns(client: TestClient, db_engine: Engine) -> None:
    seed(db_engine)
    login(client, "pengelola1@example.com")

    response = client.put(
        f"/api/v1/waste-banks/{BANK_ONE_ID}",
        json={"operating_hours": "Setiap hari, 09.00–17.00"},
        headers=csrf_headers(client),
    )
    assert response.status_code == 200
    assert response.json()["operating_hours"] == "Setiap hari, 09.00–17.00"

    stored = load_bank(db_engine, BANK_ONE_ID)
    assert stored is not None
    assert stored.name == "Bank Melati"
    assert stored.email == "melati@example.com"


def test_optional_fields_can_be_cleared(client: TestClient, db_engine: Engine) -> None:
    seed(db_engine)
    login(client, "pengelola1@example.com")

    response = client.put(
        f"/api/v1/waste-banks/{BANK_ONE_ID}",
        json={"email": None, "phone": "", "deposit_procedure": ""},
        headers=csrf_headers(client),
    )
    assert response.status_code == 200

    body = response.json()
    assert body["email"] is None
    assert body["phone"] is None
    assert body["deposit_procedure"] is None

    stored = load_bank(db_engine, BANK_ONE_ID)
    assert stored is not None
    assert stored.email is None
    assert stored.phone is None
    assert stored.deposit_procedure is None


def test_csrf_required_for_update(client: TestClient, db_engine: Engine) -> None:
    seed(db_engine)
    login(client, "pengelola1@example.com")

    response = client.put(
        f"/api/v1/waste-banks/{BANK_ONE_ID}",
        json=FULL_UPDATE_PAYLOAD,
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "CSRF token tidak valid"

    stored = load_bank(db_engine, BANK_ONE_ID)
    assert stored is not None
    assert stored.name == "Bank Melati"


def test_me_exposes_waste_bank_id(client: TestClient, db_engine: Engine) -> None:
    seed(db_engine)

    login(client, "pengelola1@example.com")
    pengelola = client.get("/api/v1/auth/me")
    assert pengelola.status_code == 200
    assert pengelola.json()["waste_bank_id"] == BANK_ONE_ID

    client.cookies.clear()
    login(client, "admin@example.com")
    admin = client.get("/api/v1/auth/me")
    assert admin.status_code == 200
    assert admin.json()["waste_bank_id"] is None
