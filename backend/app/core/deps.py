
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

from collections.abc import Iterable


def get_current_active_user(
    usuario: Usuario = Depends(obtener_usuario_actual),
) -> Usuario:
    """Devuelve el usuario autenticado y activo."""
    if usuario.disabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La cuenta está deshabilitada.",
        )

    return usuario


def require_role(roles: Iterable[str]):
    """Permite el acceso únicamente a los roles indicados."""
    roles_permitidos = set(roles)

    def verificar_rol(
        usuario: Usuario = Depends(get_current_active_user),
    ) -> Usuario:
        if usuario.role not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta operación.",
            )

        return usuario

    return verificar_rol