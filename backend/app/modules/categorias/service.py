
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCrear,
    CategoriaActualizar,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaService:

    def __init__(self, uow=None):
        self.uow = uow or CategoriaUnitOfWork()

    def listar(self, solo_activas: bool = True):
        with self.uow as uow:
            if solo_activas:
                return uow.categorias.listar_activas()

            return uow.categorias.listar()

    def obtener(self, categoria_id: int):
        with self.uow as uow:
            categoria = uow.categorias.obtener_por_id(categoria_id)

            if categoria is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Categoría no encontrada.",
                )

            return categoria

    def crear(self, datos: CategoriaCrear):
        try:
            with self.uow as uow:
                existente = uow.categorias.obtener_por_nombre(
                    datos.nombre
                )

                if existente:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Ya existe una categoría con ese nombre.",
                    )

                categoria = Categoria(
                    nombre=datos.nombre,
                    descripcion=datos.descripcion,
                    activo=True,
                )

                uow.categorias.agregar(categoria)

                return categoria

        except IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe una categoría con ese nombre.",
            )

    def actualizar(
        self,
        categoria_id: int,
        datos: CategoriaActualizar,
    ):
        try:
            with self.uow as uow:
                categoria = uow.categorias.obtener_por_id(
                    categoria_id
                )

                if categoria is None:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Categoría no encontrada.",
                    )

                cambios = datos.model_dump(exclude_unset=True)

                if "nombre" in cambios:
                    nuevo_nombre = cambios["nombre"]

                    if nuevo_nombre is None:
                        raise HTTPException(
                            status_code=422,
                            detail="El nombre no puede ser nulo.",
                        )

                    existente = uow.categorias.obtener_por_nombre(
                        nuevo_nombre
                    )

                    if existente and existente.id != categoria_id:
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail="Ya existe una categoría con ese nombre.",
                        )

                for campo, valor in cambios.items():
                    setattr(categoria, campo, valor)

                uow.categorias.actualizar(categoria)

                return categoria

        except IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe una categoría con ese nombre.",
            )

    def desactivar(self, categoria_id: int):
        with self.uow as uow:
            categoria = uow.categorias.obtener_por_id(
                categoria_id
            )

            if categoria is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Categoría no encontrada.",
                )

            categoria.activo = False

            uow.categorias.actualizar(categoria)

            return None
