
from typing import Generic, TypeVar

from sqlmodel import SQLModel, Session, select


T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: type[T]):
        self.session = session
        self.model = model

    def obtener_por_id(self, id: int) -> T | None:
        return self.session.get(self.model, id)

    def listar(self) -> list[T]:
        statement = select(self.model)
        return list(self.session.exec(statement).all())

    def agregar(self, entidad: T) -> T:
        self.session.add(entidad)
        self.session.flush()
        return entidad

    def actualizar(self, entidad: T) -> T:
        self.session.add(entidad)
        self.session.flush()
        return entidad

    def eliminar(self, entidad: T) -> None:
        self.session.delete(entidad)
        self.session.flush()
