import re
from typing import Any, Optional
from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field, GetCoreSchemaHandler, model_validator, field_validator
from pydantic_core import core_schema


PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128
PASSWORD_RULES = [
    (r"[A-Z]", "at least one uppercase letter (A-Z)"),
    (r"[a-z]", "at least one lowercase letter (a-z)"),
    (r"[0-9]", "at least one number (0-9)"),
    (r"[!@#$%^&*(),.?\":{}|<>_\-+=/\\[\]~`';]", "at least one special character (!@#$%^&*…)"),
]


def validate_password_strength(password: str) -> str:
    """Raise ValueError with a descriptive message if password is too weak."""
    errors = []
    if len(password) < PASSWORD_MIN_LENGTH:
        errors.append(f"minimum {PASSWORD_MIN_LENGTH} characters")
    if len(password) > PASSWORD_MAX_LENGTH:
        errors.append(f"maximum {PASSWORD_MAX_LENGTH} characters")
    for pattern, label in PASSWORD_RULES:
        if not re.search(pattern, password):
            errors.append(label)
    if errors:
        raise ValueError("Password must contain: " + ", ".join(errors) + ".")
    return password


class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, _source_type: Any, _handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.str_schema(),
            ]),
        )

    @classmethod
    def validate(cls, v: Any) -> str:
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return str(v)


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=1, max_length=64)
    first_name: str = Field("", max_length=64)
    last_name: str = Field("", max_length=64)
    password: str
    confirm_password: str

    @field_validator("email")
    @classmethod
    def normalize_email_field(cls, v: EmailStr) -> str:
        return str(v).strip().lower()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        return validate_password_strength(v)

    @model_validator(mode="after")
    def check_passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=256)

    @field_validator("email")
    @classmethod
    def normalize_email_field(cls, v: EmailStr) -> str:
        return str(v).strip().lower()


class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=64)
    last_name: Optional[str] = Field(None, max_length=64)
    username: Optional[str] = Field(None, min_length=1, max_length=64)
    bio: Optional[str] = Field(None, max_length=500)
    timezone: Optional[str] = Field(None, max_length=64)


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
