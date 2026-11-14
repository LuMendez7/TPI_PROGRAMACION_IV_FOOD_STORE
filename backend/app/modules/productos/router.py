
from fastapi import APIRouter, Depends, Query, status

from app.core.deps import requerir_admin
from app.modules.productos.schemas import (
    ProductoCrear,
    ProductoActualizar,
    ProductoLeer,
)
from app.modules.productos.service import ProductoService


router = APIRouter(
    prefix="/api/v1/productos",
    tags=["Productos"],
)


def obtener_servicio():
    return ProductoService()


@router.get(
    "/",
    response_model=list[ProductoLeer],
)
def listar_productos(
    solo_activos: bool = Query(default=True),
    service: ProductoService = Depends(obtener_servicio),
):
    return service.listar(solo_activos=solo_activos)


@router.get(
    "/{producto_id}",
    response_model=ProductoLeer,
)
def obtener_producto(
    producto_id: int,
    service: ProductoService = Depends(obtener_servicio),
):
    return service.obtener(producto_id)


@router.post(
    "/",
    response_model=ProductoLeer,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(requerir_admin)],
)
def crear_producto(
    datos: ProductoCrear,
    service: ProductoService = Depends(obtener_servicio),
):
    return service.crear(datos)


@router.put(
    "/{producto_id}",
    response_model=ProductoLeer,
    dependencies=[Depends(requerir_admin)],
)
def actualizar_producto(
    producto_id: int,
    datos: ProductoActualizar,
    service: ProductoService = Depends(obtener_servicio),
):
    return service.actualizar(producto_id, datos)


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(requerir_admin)],
)
def desactivar_producto(
    producto_id: int,
    service: ProductoService = Depends(obtener_servicio),
):
    service.desactivar(producto_id)
