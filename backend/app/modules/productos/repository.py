
from sqlmodel import Session, select

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
