
from fastapi.testclient import TestClient

from app.main_tpi import app


client = TestClient(app)


def test_inicio():
    respuesta = client.get("/")
    assert respuesta.status_code == 200
    assert respuesta.json()["estado"] == "funcionando"


def test_health():
    respuesta = client.get("/health")
    assert respuesta.status_code == 200
    assert respuesta.json()["status"] == "ok"


def test_catalogo_publico():
    respuesta = client.get("/api/v1/productos/")
    assert respuesta.status_code == 200
    assert isinstance(respuesta.json(), list)


def test_categorias_publicas():
    respuesta = client.get("/api/v1/categorias/")
    assert respuesta.status_code == 200
    assert isinstance(respuesta.json(), list)


def test_usuarios_protegidos():
    respuesta = client.get("/api/v1/usuarios/")
    assert respuesta.status_code == 401


def test_pedidos_protegidos():
    respuesta = client.get("/api/v1/pedidos/mis-pedidos")
    assert respuesta.status_code == 401


def test_crear_categoria_sin_login():
    respuesta = client.post(
        "/api/v1/categorias/",
        json={
            "nombre": "Categoria no autorizada",
            "descripcion": "No debe crearse",
        },
    )
    assert respuesta.status_code == 401


def test_crear_pedido_sin_login():
    respuesta = client.post(
        "/api/v1/pedidos/",
        json={
            "forma_pago": "efectivo",
            "direccion_entrega": "Domicilio de prueba",
            "items": [
                {"producto_id": 1, "cantidad": 1}
            ],
        },
    )
    assert respuesta.status_code == 401


def test_cancelar_pedido_sin_login():
    respuesta = client.patch("/api/v1/pedidos/1/cancelar")

    assert respuesta.status_code == 401