
from datetime import datetime

from pydantic import ConfigDict, EmailStr, Field, field_validator
from sqlmodel import SQLModel


class UsuarioCrear(SQLModel):
    username: str
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("username")
    @classmethod
    def validar_username(cls, valor: str) -> str:
        valor = valor.strip()

        if not 3 <= len(valor) <= 100:
            raise ValueError(
                "El usuario debe tener entre 3 y 100 caracteres."
            )

        return valor

    @field_validator("full_name")
    @classmethod
    def validar_nombre(cls, valor: str) -> str:
        valor = valor.strip()

        if len(valor) < 2:
            raise ValueError(
                "El nombre completo debe tener al menos 2 caracteres."
            )

        return valor


class UsuarioLeer(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime


class UsuarioEstadoActualizar(SQLModel):
    disabled: bool


class UsuarioRolActualizar(SQLModel):
    role: str

    @field_validator("role")
    @classmethod
    def validar_rol(cls, valor: str) -> str:
        if valor not in ("user", "admin"):
            raise ValueError(
                "El rol debe ser user o admin."
            )

        return valor
