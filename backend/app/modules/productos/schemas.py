
from pydantic import ConfigDict, Field, field_validator
from sqlmodel import SQLModel
from app.modules.categorias.schemas import CategoriaLeer


class ProductoCrear(SQLModel):
    categoria_id: int = Field(gt=0)
    nombre: str
    descripcion: str | None = None
    precio_base: float = Field(ge=0)
    imagen_url: str | None = None
    stock: int = Field(default=0, ge=0)
    disponible: bool = True

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, valor: str) -> str:
        valor = valor.strip()

        if not 2 <= len(valor) <= 100:
            raise ValueError(
                "El nombre debe tener entre 2 y 100 caracteres."
            )

        return valor


class ProductoActualizar(SQLModel):
    categoria_id: int | None = Field(default=None, gt=0)
    nombre: str | None = None
    descripcion: str | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
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


class ProductoLeer(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    categoria_id: int
    nombre: str
    descripcion: str | None
    precio_base: float
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool
    categoria: CategoriaLeer

class ProductoStockActualizar(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoLeer]