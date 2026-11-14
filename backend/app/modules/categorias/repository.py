
from sqlmodel import Session, select

from app.core.repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):

    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def obtener_por_nombre(
        self,
        nombre: str
    ) -> Categoria | None:

        statement = select(Categoria).where(
            Categoria.nombre == nombre
        )

        return self.session.exec(statement).first()

    def listar_activas(self) -> list[Categoria]:

        statement = select(Categoria).where(
            Categoria.activo == True
        )

        return list(self.session.exec(statement).all())

    def buscar_por_nombre(
        self,
        texto: str
    ) -> list[Categoria]:

        statement = select(Categoria).where(
            Categoria.nombre.ilike(f"%{texto}%")
        )

        return list(self.session.exec(statement).all())
