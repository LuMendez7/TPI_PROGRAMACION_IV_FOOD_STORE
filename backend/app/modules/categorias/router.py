
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.modules.categorias.exceptions import (
    CategoriaNoEncontradaError,
    CategoriaDuplicadaError,
    CategoriaNombreInvalidoError,
)
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


def traducir_error_categoria(exc: Exception):
    if isinstance(exc, CategoriaNoEncontradaError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    if isinstance(exc, CategoriaDuplicadaError):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    if isinstance(exc, CategoriaNombreInvalidoError):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    raise exc


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
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontradaError as exc:
        traducir_error_categoria(exc)


@router.post(
    "/",
    response_model=CategoriaLeer,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(["admin"]))],
)
def crear_categoria(
    datos: CategoriaCrear,
    service: CategoriaService = Depends(obtener_servicio),
):
    try:
        return service.crear(datos)
    except CategoriaDuplicadaError as exc:
        traducir_error_categoria(exc)


@router.put(
    "/{categoria_id}",
    response_model=CategoriaLeer,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_categoria(
    categoria_id: int,
    datos: CategoriaActualizar,
    service: CategoriaService = Depends(obtener_servicio),
):
    try:
        return service.actualizar(categoria_id, datos)
    except (
        CategoriaNoEncontradaError,
        CategoriaDuplicadaError,
        CategoriaNombreInvalidoError,
    ) as exc:
        traducir_error_categoria(exc)


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role(["admin"]))],
)
def desactivar_categoria(
    categoria_id: int,
    service: CategoriaService = Depends(obtener_servicio),
):
    try:
        service.desactivar(categoria_id)
    except CategoriaNoEncontradaError as exc:
        traducir_error_categoria(exc)
