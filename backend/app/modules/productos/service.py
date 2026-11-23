
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCrear,
    ProductoActualizar,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.productos.exceptions import (
    ProductoNoEncontradoError,
    CategoriaProductoNoValidaError,
    ProductoDatoInvalidoError,
)


class ProductoService:

    def __init__(self, uow=None):
        self.uow = uow or ProductoUnitOfWork()

    def listar(self, solo_activos: bool = True):
        with self.uow as uow:
            if solo_activos:
                return uow.productos.listar_activos()

            return uow.productos.listar()

    def listar_paginados(
        self,
        skip: int = 0,
        limit: int = 10,
        buscar: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
        solo_activos: bool = True,
    ):
        """Lista productos con paginación, búsqueda y filtros."""

        with self.uow as uow:
            if solo_activos:
                productos = uow.productos.listar_activos()
            else:
                productos = uow.productos.listar()

            if buscar:
                texto = buscar.strip().casefold()

                productos = [
                    p for p in productos
                    if texto in p.nombre.casefold()
                    or texto in (p.descripcion or "").casefold()
                ]

            if categoria_id is not None:
                productos = [
                    p for p in productos
                    if p.categoria_id == categoria_id
                ]

            if disponible is not None:
                productos = [
                    p for p in productos
                    if p.disponible == disponible
                ]

            total = len(productos)

            return {
                "total": total,
                "items": productos[skip:skip + limit],
            }

    def obtener(self, producto_id: int):
        with self.uow as uow:
            producto = uow.productos.obtener_por_id(producto_id)

            if producto is None:
                raise ProductoNoEncontradoError(
                    "Producto no encontrado."
                )

            return producto

    def crear(self, datos: ProductoCrear):
        with self.uow as uow:
            categoria = uow.categorias.obtener_por_id(
                datos.categoria_id
            )

            if categoria is None or not categoria.activo:
                raise CategoriaProductoNoValidaError(
                    "Categoría inexistente o inactiva."
                )

            producto = Producto(
                **datos.model_dump(),
                activo=True,
            )

            uow.productos.agregar(producto)

            return producto

    def actualizar(
        self,
        producto_id: int,
        datos: ProductoActualizar,
    ):
        with self.uow as uow:
            producto = uow.productos.obtener_por_id(producto_id)

            if producto is None:
                raise ProductoNoEncontradoError(
                    "Producto no encontrado."
                )

            cambios = datos.model_dump(exclude_unset=True)

            if "categoria_id" in cambios:
                nueva_categoria_id = cambios["categoria_id"]

                if nueva_categoria_id is None:
                    raise ProductoDatoInvalidoError(
                        "La categoría no puede ser nula."
                    )

                categoria = uow.categorias.obtener_por_id(
                    nueva_categoria_id
                )

                if categoria is None or not categoria.activo:
                    raise CategoriaProductoNoValidaError(
                        "Categoría inexistente o inactiva."
                    )

            for campo in (
                "precio_base",
                "stock",
                "disponible",
                "activo",
            ):
                if campo in cambios and cambios[campo] is None:
                    raise ProductoDatoInvalidoError(
                        f"El campo {campo} no puede ser nulo."
                    )

            if "nombre" in cambios and cambios["nombre"] is None:
                raise ProductoDatoInvalidoError(
                    "El nombre no puede ser nulo."
                )

            for campo, valor in cambios.items():
                setattr(producto, campo, valor)

            uow.productos.actualizar(producto)

            return producto

    def desactivar(self, producto_id: int):
        with self.uow as uow:
            producto = uow.productos.obtener_por_id(producto_id)

            if producto is None:
                raise ProductoNoEncontradoError(
                    "Producto no encontrado."
                )

            producto.activo = False

            uow.productos.actualizar(producto)

            return None
