
from typing import Callable

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    def __init__(
        self,
        session_factory: Callable[[], Session] = session_factory,
    ):
        self.session_factory = session_factory
        self.session: Session | None = None

    def __enter__(self):
        self.session = self.session_factory()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if self.session is None:
            return False

        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        except Exception:
            self.session.rollback()
            raise
        finally:
            self.session.close()
            self.session = None

        return False
