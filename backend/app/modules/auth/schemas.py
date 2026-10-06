import uuid

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=8, max_length=32, pattern=r"^\+?[0-9\s\-]{8,32}$")
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str

    @field_validator("name", mode="before")
    @classmethod
    def strip_name(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("phone", mode="before")
    @classmethod
    def strip_phone(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value

    @model_validator(mode="after")
    def passwords_must_match(self) -> "RegisterRequest":
        if self.password != self.confirm_password:
            raise ValueError("Konfirmasi kata sandi tidak sama dengan kata sandi")
        return self


class RegisterResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    phone: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class LoginResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: str


class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    phone: str
    role: str
    waste_bank_id: uuid.UUID | None = None
