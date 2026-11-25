
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict

from typing import Literal

class ItemPedidoCrear(BaseModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(gt=0)


class PedidoCrear(BaseModel):
    forma_pago: Literal["EFECTIVO", "TRANSFERENCIA"]
    direccion_entrega: str = Field(min_length=5)
    notas: str | None = None
    items: list[ItemPedidoCrear] = Field(min_length=1)


class DetallePedidoLeer(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    producto_id: int
    cantidad: int
    nombre_producto: str
    precio_unitario: float
    subtotal: float


class PedidoLeer(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: datetime
    updated_at: datetime | None = None
    items: list[DetallePedidoLeer]


class PedidoEstadoActualizar(BaseModel):
    estado: str


class PedidosPaginados(BaseModel):
    total: int
    items: list[PedidoLeer]


class ResumenPedidos(BaseModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
