
from fastapi import APIRouter, Depends, status

from app.core.deps import requerir_admin
from app.modules.categorias.schemas import (
    CategoriaCrear,
    CategoriaActualizar,
    CategoriaLeer,
)
from app.modules.categorias.service import CategoriaService


router = APIRouter(
    prefix="/api/v1/categorias",
    tags=["Categorías"],
)


def obtener_servicio():
    return CategoriaService()


@router.get(
    "/",
    response_model=list[CategoriaLeer],
)
def listar_categorias(
    service: CategoriaService = Depends(obtener_servicio),
):
    return service.listar()


@router.get(
    "/{categoria_id}",
    response_model=CategoriaLeer,
)
def obtener_categoria(
    categoria_id: int,
    service: CategoriaService = Depends(obtener_servicio),
):
    return service.obtener(categoria_id)


@router.post(
    "/",
    response_model=CategoriaLeer,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(requerir_admin)],
)
def crear_categoria(
    datos: CategoriaCrear,
    service: CategoriaService = Depends(obtener_servicio),
):
    return service.crear(datos)


@router.put(
    "/{categoria_id}",
    response_model=CategoriaLeer,
    dependencies=[Depends(requerir_admin)],
)
def actualizar_categoria(
    categoria_id: int,
    datos: CategoriaActualizar,
    service: CategoriaService = Depends(obtener_servicio),
):
    return service.actualizar(categoria_id, datos)


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(requerir_admin)],
)
def desactivar_categoria(
    categoria_id: int,
    service: CategoriaService = Depends(obtener_servicio),
):
    service.desactivar(categoria_id)
