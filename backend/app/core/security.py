
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings


settings = get_settings()

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def obtener_hash_password(password: str) -> str:
    """Genera un hash seguro de la contraseña."""
    return pwd_context.hash(password)


def verificar_password(
    password: str,
    hashed_password: str,
) -> bool:
    """Verifica una contraseña contra su hash."""
    return pwd_context.verify(password, hashed_password)


def crear_token_acceso(
    data: dict,
    expires_delta: timedelta | None = None,
) -> str:
    """Genera un token JWT firmado."""

    datos = data.copy()

    if expires_delta is None:
        expires_delta = timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    expiracion = datetime.now(timezone.utc) + expires_delta

    datos.update({"exp": expiracion})

    token = jwt.encode(
        datos,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

    return token


def decodificar_token(token: str) -> dict | None:
    """Decodifica y valida un token JWT."""

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        return payload

    except JWTError:
        return None
