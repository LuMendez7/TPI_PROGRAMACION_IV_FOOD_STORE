
from sqlmodel import Session, select

from app.core.repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):

    def __init__(self, session: Session):
        super().__init__(session, Usuario)

    def obtener_por_username(
        self,
        username: str,
    ) -> Usuario | None:

        statement = select(Usuario).where(
            Usuario.username == username
        )

        return self.session.exec(statement).first()

    def obtener_por_email(
        self,
        email: str,
    ) -> Usuario | None:

        statement = select(Usuario).where(
            Usuario.email == email
        )

        return self.session.exec(statement).first()

    def listar_activos(self) -> list[Usuario]:

        statement = select(Usuario).where(
            Usuario.disabled == False
        )

        return list(self.session.exec(statement).all())
