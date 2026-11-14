from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.usuarios.models import Usuario
    from app.modules.productos.models import Producto


def fecha_actual() -> datetime:
    return datetime.now(timezone.utc)


class Pedido(SQLModel, table=True):
    __tablename__ = "pedidos"

    id: int | None = Field(
        default=None,
        primary_key=True
    )

    usuario_id: int = Field(
        foreign_key="usuarios.id",
        index=True
    )

    estado: str = Field(default="PENDIENTE")

    forma_pago: str

    direccion_entrega: str

    notas: str | None = Field(default=None)

    total: float = Field(default=0.0, ge=0)

    created_at: datetime = Field(
        default_factory=fecha_actual
    )

    updated_at: datetime = Field(
        default_factory=fecha_actual
    )

    usuario: "Usuario" = Relationship(
        back_populates="pedidos"
    )

    items: list["DetallePedido"] = Relationship(
        back_populates="pedido"
    )


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalles_pedido"

    id: int | None = Field(
        default=None,
        primary_key=True
    )

    pedido_id: int = Field(
        foreign_key="pedidos.id",
        index=True
    )

    producto_id: int = Field(
        foreign_key="productos.id",
        index=True
    )

    cantidad: int = Field(ge=1)

    nombre_producto: str

    precio_unitario: float = Field(ge=0)

    subtotal: float = Field(ge=0)

    pedido: "Pedido" = Relationship(
        back_populates="items"
    )

    producto: "Producto" = Relationship(
        back_populates="detalles"
    )
