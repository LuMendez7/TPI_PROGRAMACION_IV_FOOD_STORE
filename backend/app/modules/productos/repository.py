
from sqlmodel import Session, select
from sqlalchemy import func
from sqlalchemy.orm import selectinload

from app.core.repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):

    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def listar_activos(self) -> list[Producto]:
        statement = select(Producto).where(
            Producto.activo == True
        )
        return list(self.session.exec(statement).all())

    def listar_disponibles(self) -> list[Producto]:
        statement = select(Producto).where(
            Producto.activo == True,
            Producto.disponible == True,
            Producto.stock > 0,
        )
        return list(self.session.exec(statement).all())

    def listar_por_categoria(
        self,
        categoria_id: int,
    ) -> list[Producto]:
        statement = select(Producto).where(
            Producto.categoria_id == categoria_id,
            Producto.activo == True,
        )
        return list(self.session.exec(statement).all())

    def buscar_por_nombre(
        self,
        texto: str,
    ) -> list[Producto]:
        statement = select(Producto).where(
            Producto.nombre.ilike(f"%{texto}%"),
            Producto.activo == True,
        )
        return list(self.session.exec(statement).all())


    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
        solo_activos: bool = True,
    ):
        filtros = []

        if solo_activos:
            filtros.append(Producto.activo == True)

        if search and search.strip():
            filtros.append(
                Producto.nombre.ilike(f"%{search.strip()}%")
            )

        if categoria_id is not None:
            filtros.append(
                Producto.categoria_id == categoria_id
            )

        if disponible is not None:
            filtros.append(
                Producto.disponible == disponible
            )

        consulta_total = (
            select(func.count(Producto.id))
            .where(*filtros)
        )

        total = self.session.exec(consulta_total).one()

        consulta = (
            select(Producto)
            .where(*filtros)
            .options(selectinload(Producto.categoria))
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )

        items = list(self.session.exec(consulta).all())

        return total, items
