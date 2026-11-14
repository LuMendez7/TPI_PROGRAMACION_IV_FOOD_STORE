
from fastapi import APIRouter, Depends, status

from app.core.deps import obtener_usuario_actual, requerir_admin
from app.modules.usuarios.models import Usuario
from app.modules.pedidos.schemas import (
    PedidoCrear,
    PedidoLeer,
    PedidoEstadoActualizar,
)
from app.modules.pedidos.service import PedidoService


router = APIRouter(
    prefix="/api/v1/pedidos",
    tags=["Pedidos"],
)


def obtener_servicio():
    return PedidoService()


@router.post(
    "/",
    response_model=PedidoLeer,
    status_code=status.HTTP_201_CREATED,
)
def crear_pedido(
    datos: PedidoCrear,
    usuario: Usuario = Depends(obtener_usuario_actual),
    service: PedidoService = Depends(obtener_servicio),
):
    return service.crear(usuario.id, datos)


@router.get("/mis-pedidos", response_model=list[PedidoLeer])
def mis_pedidos(
    usuario: Usuario = Depends(obtener_usuario_actual),
    service: PedidoService = Depends(obtener_servicio),
):
    return service.listar_mis_pedidos(usuario.id)


@router.get(
    "/admin/todos",
    response_model=list[PedidoLeer],
)
def listar_todos(
    admin: Usuario = Depends(requerir_admin),
    service: PedidoService = Depends(obtener_servicio),
):
    return service.listar_todos()


@router.get("/{pedido_id}", response_model=PedidoLeer)
def obtener_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(obtener_usuario_actual),
    service: PedidoService = Depends(obtener_servicio),
):
    return service.obtener(
        pedido_id,
        usuario.id,
        es_admin=(usuario.role == "admin"),
    )


@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoLeer,
)
def cambiar_estado(
    pedido_id: int,
    datos: PedidoEstadoActualizar,
    admin: Usuario = Depends(requerir_admin),
    service: PedidoService = Depends(obtener_servicio),
):
    return service.cambiar_estado(pedido_id, datos)
