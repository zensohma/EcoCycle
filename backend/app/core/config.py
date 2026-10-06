from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_SECRET_KEY = "change-me-in-production-set-a-32-byte-secret"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "EcoCycle API"
    environment: str = "development"
    database_url: str = "mysql+pymysql://ecocycle:ecocycle@localhost:3306/ecocycle"
    secret_key: str = DEFAULT_SECRET_KEY
    access_token_expire_minutes: int = 60
    cors_origins: list[str] = ["http://localhost:3000"]

    @model_validator(mode="after")
    def require_unique_secret_in_production(self) -> "Settings":
        if self.environment == "production" and self.secret_key == DEFAULT_SECRET_KEY:
            raise ValueError("SECRET_KEY must be set to a unique value in production")
        return self


settings = Settings()
