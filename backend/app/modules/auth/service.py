
from fastapi import HTTPException, status

from app.core.security import (
    crear_token_acceso,
    obtener_hash_password,
    verificar_password,
)
from app.modules.auth.schemas import RegistroUsuario
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:

    def __init__(self):
        self.usuarios = UsuarioService()

    def registrar(self, datos: RegistroUsuario):
        hashed_password = obtener_hash_password(datos.password)

        return self.usuarios.crear(
            username=datos.username,
            full_name=datos.full_name,
            email=str(datos.email),
            hashed_password=hashed_password,
        )

    def autenticar(self, username: str, password: str):
        with UsuarioUnitOfWork() as uow:
            usuario = uow.usuarios.obtener_por_username(username)

            if usuario is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciales incorrectas.",
                )

            if not verificar_password(
                password,
                usuario.hashed_password,
            ):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciales incorrectas.",
                )

            if usuario.disabled:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La cuenta está deshabilitada.",
                )

            return usuario

    def generar_token(self, usuario):
        return crear_token_acceso({
            "sub": str(usuario.id),
            "role": usuario.role,
        })
