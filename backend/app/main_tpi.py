
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router
from app.modules.pedidos.router import router as pedidos_router

# Registra los modelos SQLModel y sus relaciones.
import app.models  # noqa: F401


settings = get_settings()

app = FastAPI(
    title="Food Store - API TPI",
    description="API del Trabajo Práctico Integrador de Programación IV",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization", "X-CSRF-Token"],
)


@app.get("/")
def inicio():
    return {
        "aplicacion": "Food Store",
        "estado": "funcionando",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(usuarios_router)
app.include_router(categorias_router)
app.include_router(productos_router)
app.include_router(pedidos_router)