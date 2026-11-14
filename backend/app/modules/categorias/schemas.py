
from pydantic import ConfigDict, field_validator
from sqlmodel import SQLModel


class CategoriaCrear(SQLModel):
    nombre: str
    descripcion: str | None = None

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, valor: str) -> str:
        valor = valor.strip()

        if not 2 <= len(valor) <= 100:
            raise ValueError(
                "El nombre debe tener entre 2 y 100 caracteres."
            )

        return valor


class CategoriaActualizar(SQLModel):
    nombre: str | None = None
    descripcion: str | None = None
    activo: bool | None = None

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, valor: str | None) -> str | None:
        if valor is None:
            return None

        valor = valor.strip()

        if not 2 <= len(valor) <= 100:
            raise ValueError(
                "El nombre debe tener entre 2 y 100 caracteres."
            )

        return valor


class CategoriaLeer(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    descripcion: str | None
    activo: bool
