
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:

    def __init__(self, uow=None):
        self.uow = uow or UsuarioUnitOfWork()

    def listar(self):
        with self.uow as uow:
            return uow.usuarios.listar()

    def obtener(self, usuario_id: int):
        with self.uow as uow:
            usuario = uow.usuarios.obtener_por_id(usuario_id)

            if usuario is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario no encontrado.",
                )

            return usuario

    def buscar_por_username(self, username: str):
        with self.uow as uow:
            return uow.usuarios.obtener_por_username(username)

    def buscar_por_email(self, email: str):
        with self.uow as uow:
            return uow.usuarios.obtener_por_email(email)

    def crear(
        self,
        username: str,
        full_name: str,
        email: str,
        hashed_password: str,
    ):
        try:
            with self.uow as uow:
                if uow.usuarios.obtener_por_username(username):
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="El nombre de usuario ya existe.",
                    )

                if uow.usuarios.obtener_por_email(email):
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="El correo electrónico ya está registrado.",
                    )

                usuario = Usuario(
                    username=username,
                    full_name=full_name,
                    email=email,
                    hashed_password=hashed_password,
                    role="user",
                    disabled=False,
                )

                uow.usuarios.agregar(usuario)

                return usuario

        except IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El usuario o correo electrónico ya existe.",
            )

    def cambiar_estado(
        self,
        usuario_id: int,
        disabled: bool,
    ):
        with self.uow as uow:
            usuario = uow.usuarios.obtener_por_id(usuario_id)

            if usuario is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario no encontrado.",
                )

            usuario.disabled = disabled

            uow.usuarios.actualizar(usuario)

            return usuario

    def cambiar_rol(
        self,
        usuario_id: int,
        role: str,
    ):
        if role not in ("user", "admin"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Rol inválido.",
            )

        with self.uow as uow:
            usuario = uow.usuarios.obtener_por_id(usuario_id)

            if usuario is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario no encontrado.",
                )

            usuario.role = role

            uow.usuarios.actualizar(usuario)

            return usuario
