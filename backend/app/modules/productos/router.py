
from fastapi import APIRouter, Depends, Query, HTTPException, status

from app.core.deps import require_role
from app.modules.productos.exceptions import (
    ProductoNoEncontradoError,
    CategoriaProductoNoValidaError,
    ProductoDatoInvalidoError,
)
from app.modules.productos.schemas import (
    ProductoCrear,
    ProductoActualizar,
    ProductoLeer,
    ProductosPaginados,
    ProductoStockActualizar,
)
from app.modules.productos.service import ProductoService


router = APIRouter(
    prefix="/api/v1/productos",
    tags=["Productos"],
)


def obtener_servicio():
    return ProductoService()


def traducir_error_producto(exc: Exception):
    if isinstance(exc, ProductoNoEncontradoError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    if isinstance(exc, CategoriaProductoNoValidaError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    if isinstance(exc, ProductoDatoInvalidoError):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    raise exc


@router.get(
    "/paginados",
    response_model=ProductosPaginados,
)
def listar_productos_paginados(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    buscar: str | None = Query(default=None),
    search: str | None = Query(default=None),
    categoria_id: int | None = Query(default=None, gt=0),
    disponible: bool | None = Query(default=None),
    solo_activos: bool = Query(default=True),
    service: ProductoService = Depends(obtener_servicio),
):
    return service.listar_paginados(
        skip=skip,
        limit=limit,
        buscar=search if search is not None else buscar,
        categoria_id=categoria_id,
        disponible=disponible,
        solo_activos=True,
    )


@router.get(
    "/",
    response_model=ProductosPaginados,
)
def listar_productos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    buscar: str | None = Query(default=None),
    search: str | None = Query(default=None),
    categoria_id: int | None = Query(default=None, gt=0),
    disponible: bool | None = Query(default=None),
    solo_activos: bool = Query(default=True),
    service: ProductoService = Depends(obtener_servicio),
):
    return service.listar_paginados(
        skip=skip,
        limit=limit,
        buscar=search if search is not None else buscar,
        categoria_id=categoria_id,
        disponible=disponible,
        solo_activos=True,
    )


@router.get(
    "/{producto_id}",
    response_model=ProductoLeer,
)
def obtener_producto(
    producto_id: int,
    service: ProductoService = Depends(obtener_servicio),
):
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontradoError as exc:
        traducir_error_producto(exc)


@router.post(
    "/",
    response_model=ProductoLeer,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(["admin"]))],
)
def crear_producto(
    datos: ProductoCrear,
    service: ProductoService = Depends(obtener_servicio),
):
    try:
        return service.crear(datos)
    except CategoriaProductoNoValidaError as exc:
        traducir_error_producto(exc)


@router.put(
    "/{producto_id}",
    response_model=ProductoLeer,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_producto(
    producto_id: int,
    datos: ProductoActualizar,
    service: ProductoService = Depends(obtener_servicio),
):
    try:
        return service.actualizar(producto_id, datos)
    except (
        ProductoNoEncontradoError,
        CategoriaProductoNoValidaError,
        ProductoDatoInvalidoError,
    ) as exc:
        traducir_error_producto(exc)


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role(["admin"]))],
)
def desactivar_producto(
    producto_id: int,
    service: ProductoService = Depends(obtener_servicio),
):
    try:
        service.desactivar(producto_id)
    except ProductoNoEncontradoError as exc:
        traducir_error_producto(exc)


@router.patch(
    "/{producto_id}/stock",
    response_model=ProductoLeer,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_stock_producto(
    producto_id: int,
    datos: ProductoStockActualizar,
    service: ProductoService = Depends(obtener_servicio),
):
    try:
        return service.actualizar(
            producto_id,
            ProductoActualizar(**datos.model_dump(exclude_none=True)),
        )
    except (
        ProductoNoEncontradoError,
        ProductoDatoInvalidoError,
    ) as exc:
        traducir_error_producto(exc)
