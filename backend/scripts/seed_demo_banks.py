from app.core.config import settings
from sqlalchemy import create_engine, text

INSERT_SQL = text(
    """
    INSERT INTO waste_banks
        (id, name, address, region, phone, email, operating_hours,
         deposit_procedure, latitude, longitude, is_active, created_at, updated_at)
    VALUES
        (REPLACE(UUID(), '-', ''), :name, :address, :region, :phone, :email, :operating_hours,
         :deposit_procedure, :latitude, :longitude, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    """
)

SEEDS = [
    {
        "name": "Bank Sampah Melati",
        "address": "Jl. Melati Raya No. 12, Kebayoran Baru",
        "region": "Jakarta Selatan",
        "phone": "021-5551111",
        "email": "melati@ecocycle.id",
        "operating_hours": "Senin-Sabtu, 08.00-16.00",
        "deposit_procedure": (
            "Bawa sampah yang sudah dipilah ke loket, timbang, "
            "lalu saldo otomatis masuk ke akun Anda."
        ),
        "latitude": -6.2447,
        "longitude": 106.7993,
    },
    {
        "name": "Bank Sampah Anggrek",
        "address": "Jl. Anggrek No. 5, Coblong",
        "region": "Bandung",
        "phone": "022-5552222",
        "email": "anggrek@ecocycle.id",
        "operating_hours": "Senin-Jumat, 09.00-17.00",
        "deposit_procedure": (
            "Daftar sebagai nasabah, setor sampah terpilah, " "dan terima saldo sesuai berat."
        ),
        "latitude": -6.8966,
        "longitude": 107.6111,
    },
    {
        "name": "Bank Sampah Cempaka",
        "address": "Jl. Cempaka No. 8, Kemayoran",
        "region": "Jakarta Pusat",
        "phone": None,
        "email": None,
        "operating_hours": None,
        "deposit_procedure": None,
        "latitude": None,
        "longitude": None,
    },
]


def main() -> None:
    engine = create_engine(settings.database_url)
    with engine.begin() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM waste_banks")).scalar()
        if count:
            print(f"already {count} banks, skipped")
            return
        for seed in SEEDS:
            conn.execute(INSERT_SQL, seed)
        print(f"seeded {len(SEEDS)} banks")


if __name__ == "__main__":
    main()
