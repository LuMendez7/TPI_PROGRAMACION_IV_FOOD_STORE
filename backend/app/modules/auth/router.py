
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    Response,
    status,
)
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import get_settings
from app.core.deps import obtener_usuario_actual
from app.modules.auth.schemas import (
    LoginUsuario,
    MensajeRespuesta,
    RegistroUsuario,
    TokenRespuesta,
)
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UsuarioLeer


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Autenticación"],
)

settings = get_settings()


def obtener_servicio():
    return AuthService()


def guardar_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,  # Desarrollo local con HTTP.
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )


def comprobar_origen(request: Request):
    origen = request.headers.get("origin")

    if origen is not None and origen != settings.FRONTEND_ORIGIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Origen no permitido.",
        )


@router.post(
    "/register",
    response_model=UsuarioLeer,
    status_code=status.HTTP_201_CREATED,
)
def registrar(
    datos: RegistroUsuario,
    request: Request,
    service: AuthService = Depends(obtener_servicio),
):
    comprobar_origen(request)
    return service.registrar(datos)


@router.post("/login", response_model=MensajeRespuesta)
def login(
    datos: LoginUsuario,
    response: Response,
    request: Request,
    service: AuthService = Depends(obtener_servicio),
):
    comprobar_origen(request)
    usuario = service.autenticar(datos.username, datos.password)
    token = service.generar_token(usuario)

    guardar_cookie(response, token)

    return {"mensaje": "Sesión iniciada correctamente."}


@router.post("/token", response_model=MensajeRespuesta)
def obtener_token(
    response: Response,
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(obtener_servicio),
):
    comprobar_origen(request)

    usuario = service.autenticar(
        form_data.username,
        form_data.password,
    )

    token = service.generar_token(usuario)

    guardar_cookie(response, token)

    return {
        "mensaje": "Sesion iniciada correctamente."
    }


@router.get("/me", response_model=UsuarioLeer)
def mi_perfil(
    usuario: Usuario = Depends(obtener_usuario_actual),
):
    return usuario


@router.post("/logout", response_model=MensajeRespuesta)
def logout(
    response: Response,
    request: Request,
):
    comprobar_origen(request)
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        samesite="lax",
        secure=False,
    )

    return {"mensaje": "Sesión cerrada correctamente."}
