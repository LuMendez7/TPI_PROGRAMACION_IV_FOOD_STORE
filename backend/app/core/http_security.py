
from fastapi import HTTPException, Request, status

from app.core.config import get_settings


METODOS_SEGUROS = {"GET", "HEAD", "OPTIONS"}


async def validar_origen(request: Request, call_next):
    if request.method not in METODOS_SEGUROS:
        settings = get_settings()

        origen = request.headers.get("origin")

        if origen and origen != settings.FRONTEND_ORIGIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Origen no autorizado.",
            )

        # Los navegadores envían Origin o Referer en
        # las solicitudes relevantes. Si falta Origin,
        # comprobamos Referer cuando esté presente.
        if not origen:
            referer = request.headers.get("referer")

            if referer:
                from urllib.parse import urlsplit

                parsed = urlsplit(referer)
                origen_referer = (
                    f"{parsed.scheme}://{parsed.netloc}"
                )

                if origen_referer != settings.FRONTEND_ORIGIN:
                    raise HTTPException(
                        status_code=403,
                        detail="Origen no autorizado.",
                    )

    return await call_next(request)
