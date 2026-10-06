from app.core.config import settings
from app.core.security import hash_password
from sqlalchemy import create_engine, text

ADMIN_EMAIL = "admin@ecocycle.id"
ADMIN_PASSWORD = "admin12345"

CHECK_SQL = text("SELECT COUNT(*) FROM users WHERE email = :email")

INSERT_SQL = text(
    """
    INSERT INTO users
        (id, name, email, phone, password_hash, role, is_active, waste_bank_id,
         created_at, updated_at)
    VALUES
        (REPLACE(UUID(), '-', ''), :name, :email, :phone, :password_hash,
         'administrator', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    """
)


def main() -> None:
    engine = create_engine(settings.database_url)
    with engine.begin() as conn:
        existing = conn.execute(CHECK_SQL, {"email": ADMIN_EMAIL}).scalar()
        if existing:
            print(f"administrator {ADMIN_EMAIL} already exists, skipped")
            return
        conn.execute(
            INSERT_SQL,
            {
                "name": "Admin EcoCycle",
                "email": ADMIN_EMAIL,
                "phone": "08111111111",
                "password_hash": hash_password(ADMIN_PASSWORD),
            },
        )
        print(f"created administrator {ADMIN_EMAIL} (password: {ADMIN_PASSWORD})")


if __name__ == "__main__":
    main()
