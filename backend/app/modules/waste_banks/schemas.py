import uuid

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


class WasteBankUpdateRequest(BaseModel):
    """Perubahan informasi bank sampah.

    Semua kolom bersifat opsional, tetapi kolom wajib (name, address, region)
    harus berupa teks non-kosong ketika dikirim. Mengirim objek kosong ditolak.
    """

    name: str | None = Field(default=None, max_length=160)
    address: str | None = None
    region: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(default=None, max_length=32)
    email: EmailStr | None = None
    operating_hours: str | None = None
    deposit_procedure: str | None = None

    @field_validator("name", "address", "region", mode="before")
    @classmethod
    def strip_required_text(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("phone", "email", "operating_hours", "deposit_procedure", mode="before")
    @classmethod
    def normalize_optional_text(cls, value: object) -> object:
        if isinstance(value, str):
            value = value.strip()
            if value == "":
                return None
        return value

    @field_validator("name", "address", "region")
    @classmethod
    def required_fields_must_not_be_blank(cls, value: str | None) -> str | None:
        if value is None or not value:
            raise ValueError("Kolom wajib diisi")
        return value

    @model_validator(mode="after")
    def at_least_one_field(self) -> "WasteBankUpdateRequest":
        if not self.model_fields_set:
            raise ValueError("Tidak ada kolom yang diperbarui")
        return self


class WasteBankSummaryResponse(BaseModel):
    id: uuid.UUID
    name: str
    region: str
    is_active: bool


class PublicWasteBankResponse(BaseModel):
    id: uuid.UUID
    name: str
    address: str
    region: str
    phone: str | None
    email: str | None
    operating_hours: str | None
    deposit_procedure: str | None
    latitude: float | None
    longitude: float | None
    is_active: bool
