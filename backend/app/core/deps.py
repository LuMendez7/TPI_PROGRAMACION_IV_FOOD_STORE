
from fastapi import Depends, HTTPException, Request, status

from app.core.security import decodificar_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def obtener_usuario_actual(request: Request) -> Usuario:
    error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado o sesión vencida.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = request.cookies.get("access_token")

    if not token:
        raise error

    payload = decodificar_token(token)

    if not payload:
        raise error

    try:
        usuario_id = int(payload.get("sub", ""))
    except (TypeError, ValueError):
        raise error

    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.obtener_por_id(usuario_id)

        if usuario is None or usuario.disabled:
            raise error

        return usuario


def requerir_admin(
    usuario: Usuario = Depends(obtener_usuario_actual),
) -> Usuario:
    if usuario.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de administrador.",
        )

    return usuario
