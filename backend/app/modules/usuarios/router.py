
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.core.deps import requerir_admin
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import (
    UsuarioEstadoActualizar,
    UsuarioLeer,
    UsuarioRolActualizar,
)
from app.modules.usuarios.service import UsuarioService


router = APIRouter(
    prefix="/api/v1/usuarios",
    tags=["Usuarios - Administración"],
    dependencies=[Depends(requerir_admin)],
)


def obtener_servicio():
    return UsuarioService()


@router.get("/", response_model=list[UsuarioLeer])
def listar_usuarios(
    service: UsuarioService = Depends(obtener_servicio),
):
    return service.listar()


@router.get("/{usuario_id}", response_model=UsuarioLeer)
def obtener_usuario(
    usuario_id: int,
    service: UsuarioService = Depends(obtener_servicio),
):
    return service.obtener(usuario_id)


@router.patch("/{usuario_id}/estado", response_model=UsuarioLeer)
def cambiar_estado(
    usuario_id: int,
    datos: UsuarioEstadoActualizar,
    admin: Usuario = Depends(requerir_admin),
    service: UsuarioService = Depends(obtener_servicio),
):
    if admin.id == usuario_id and datos.disabled:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=409,
            detail="No podés desactivar tu propia cuenta.",
        )

    return service.cambiar_estado(
        usuario_id,
        datos.disabled,
    )


@router.patch("/{usuario_id}/rol", response_model=UsuarioLeer)
def cambiar_rol(
    usuario_id: int,
    datos: UsuarioRolActualizar,
    admin: Usuario = Depends(requerir_admin),
    service: UsuarioService = Depends(obtener_servicio),
):
    if admin.id == usuario_id and datos.role != "admin":
        from fastapi import HTTPException

        raise HTTPException(
            status_code=409,
            detail="No podés quitarte tu propio rol de administrador.",
        )

    return service.cambiar_rol(
        usuario_id,
        datos.role,
    )

# Rutas administrativas solicitadas en la consigna.
# Se conservan las rutas existentes por compatibilidad.

admin_router = APIRouter(
    prefix="/api/v1/admin",
    tags=["Administración de usuarios"],
    dependencies=[Depends(require_role(["admin"]))],
)


@admin_router.patch(
    "/usuarios/{usuario_id}/activar",
    response_model=UsuarioLeer,
)
def activar_usuario(
    usuario_id: int,
    service: UsuarioService = Depends(obtener_servicio),
):
    return service.cambiar_estado(
        usuario_id,
        False,
    )


@admin_router.patch(
    "/usuarios/{usuario_id}/desactivar",
    response_model=UsuarioLeer,
)
def desactivar_usuario(
    usuario_id: int,
    admin: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(obtener_servicio),
):
    if admin.id == usuario_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No podés desactivar tu propia cuenta.",
        )

    return service.cambiar_estado(
        usuario_id,
        True,
    )