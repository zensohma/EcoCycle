from decimal import Decimal

from app.modules.waste_banks.models import WasteBank
from fastapi.testclient import TestClient
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

BANK_ONE_ID = "11111111-1111-1111-1111-111111111111"
BANK_TWO_ID = "22222222-2222-2222-2222-222222222222"
INACTIVE_ID = "33333333-3333-3333-3333-333333333333"
MISSING_ID = "44444444-4444-4444-4444-444444444444"


def _seed(db_engine: Engine) -> None:
    import uuid as _uuid

    with Session(db_engine) as session:
        session.add_all(
            [
                WasteBank(
                    id=_uuid.UUID(BANK_ONE_ID),
                    name="Bank Melati",
                    address="Jl. Melati No. 1, Jakarta Selatan",
                    region="Jakarta Selatan",
                    phone="021-5551111",
                    email="melati@example.com",
                    operating_hours="Senin–Sabtu, 08.00–16.00",
                    deposit_procedure="Bawa sampah terpilah, timbang di loket, terima saldo.",
                    latitude=Decimal("-6.288900"),
                    longitude=Decimal("106.800000"),
                ),
                WasteBank(
                    id=_uuid.UUID(BANK_TWO_ID),
                    name="Bank Anggrek",
                    address="Jl. Anggrek No. 2, Bandung",
                    region="Bandung",
                    phone="022-5552222",
                    operating_hours="Senin–Jumat, 09.00–17.00",
                    deposit_procedure=(
                        "Daftar sebagai nasabah, setor sampah, saldo otomatis terisi."
                    ),
                ),
                WasteBank(
                    id=_uuid.UUID(INACTIVE_ID),
                    name="Bank Tutup",
                    address="Jl. Lama No. 3, Jakarta Selatan",
                    region="Jakarta Selatan",
                    is_active=False,
                ),
            ]
        )
        session.commit()


def test_list_accessible_without_login(client: TestClient, db_engine: Engine) -> None:
    _seed(db_engine)

    response = client.get("/api/v1/waste-banks")
    assert response.status_code == 200

    body = response.json()
    assert len(body) == 2
    assert {bank["name"] for bank in body} == {"Bank Melati", "Bank Anggrek"}


def test_list_excludes_inactive_banks(client: TestClient, db_engine: Engine) -> None:
    _seed(db_engine)

    response = client.get("/api/v1/waste-banks")
    names = [bank["name"] for bank in response.json()]
    assert "Bank Tutup" not in names


def test_search_by_name(client: TestClient, db_engine: Engine) -> None:
    _seed(db_engine)

    response = client.get("/api/v1/waste-banks", params={"q": "melati"})
    assert response.status_code == 200

    body = response.json()
    assert len(body) == 1
    assert body[0]["name"] == "Bank Melati"


def test_search_by_region(client: TestClient, db_engine: Engine) -> None:
    _seed(db_engine)

    response = client.get("/api/v1/waste-banks", params={"q": "Bandung"})
    assert response.status_code == 200

    body = response.json()
    assert len(body) == 1
    assert body[0]["region"] == "Bandung"


def test_search_with_no_results_returns_empty_list(client: TestClient, db_engine: Engine) -> None:
    _seed(db_engine)

    response = client.get("/api/v1/waste-banks", params={"q": "tidakada"})
    assert response.status_code == 200
    assert response.json() == []


def test_detail_accessible_without_login(client: TestClient, db_engine: Engine) -> None:
    _seed(db_engine)

    response = client.get(f"/api/v1/waste-banks/{BANK_ONE_ID}")
    assert response.status_code == 200

    body = response.json()
    assert body["name"] == "Bank Melati"
    assert body["address"] == "Jl. Melati No. 1, Jakarta Selatan"
    assert body["region"] == "Jakarta Selatan"
    assert body["phone"] == "021-5551111"
    assert body["email"] == "melati@example.com"
    assert body["operating_hours"] == "Senin–Sabtu, 08.00–16.00"
    assert body["deposit_procedure"].startswith("Bawa sampah")
    assert body["latitude"] == -6.2889
    assert body["longitude"] == 106.8
    assert body["is_active"] is True


def test_detail_without_optional_fields(client: TestClient, db_engine: Engine) -> None:
    _seed(db_engine)

    response = client.get(f"/api/v1/waste-banks/{BANK_TWO_ID}")
    assert response.status_code == 200

    body = response.json()
    assert body["email"] is None
    assert body["latitude"] is None
    assert body["longitude"] is None


def test_detail_missing_bank_returns_404(client: TestClient, db_engine: Engine) -> None:
    _seed(db_engine)

    response = client.get(f"/api/v1/waste-banks/{MISSING_ID}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Bank sampah tidak ditemukan"


def test_detail_inactive_bank_returns_404(client: TestClient, db_engine: Engine) -> None:
    _seed(db_engine)

    response = client.get(f"/api/v1/waste-banks/{INACTIVE_ID}")
    assert response.status_code == 404
