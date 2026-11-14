import pytest
from fastapi import HTTPException
from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel, Session, create_engine, select

from app.modules.categorias.models import Categoria
from app.modules.usuarios.models import Usuario
from app.modules.productos.models import Producto
from app.modules.pedidos.models import Pedido, DetallePedido
from app.modules.pedidos.schemas import (
    PedidoCrear,
    PedidoEstadoActualizar,
)
from app.modules.pedidos.service import PedidoService
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork


@pytest.fixture
def entorno():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    tablas = [
        SQLModel.metadata.tables[nombre]
        for nombre in (
            "usuarios",
            "categorias",
            "productos",
            "pedidos",
            "detalles_pedido",
        )
    ]

    SQLModel.metadata.create_all(engine, tables=tablas)

    def nueva_sesion():
        return Session(engine, expire_on_commit=False)

    with nueva_sesion() as session:
        usuario = Usuario(
            username="cliente_prueba",
            full_name="Cliente de prueba",
            email="cliente_prueba@example.com",
            hashed_password="hash_prueba",
        )
        otro = Usuario(
            username="otro_cliente",
            full_name="Otro cliente",
            email="otro_cliente@example.com",
            hashed_password="hash_prueba",
        )
        session.add(usuario)
        session.add(otro)
        session.flush()

        producto = Producto(
            categoria_id=1,
            nombre="Producto de prueba",
            precio_base=1500,
            stock=10,
            disponible=True,
            activo=True,
        )
        session.add(producto)
        session.commit()

        ids = (usuario.id, otro.id, producto.id)

    servicio = PedidoService(
        PedidoUnitOfWork(session_factory=nueva_sesion)
    )

    yield servicio, nueva_sesion, ids

    engine.dispose()


def crear_pedido(servicio, usuario_id, producto_id, cantidad=2):
    datos = PedidoCrear(
        forma_pago="EFECTIVO",
        direccion_entrega="Direccion de prueba 123",
        items=[
            {"producto_id": producto_id, "cantidad": cantidad}
        ],
    )
    return servicio.crear(usuario_id, datos)


def stock_actual(nueva_sesion, producto_id):
    with nueva_sesion() as session:
        return session.get(Producto, producto_id).stock


def test_creacion_descuenta_stock(entorno):
    servicio, sesion, (usuario, _, producto) = entorno

    pedido = crear_pedido(servicio, usuario, producto)

    assert pedido["estado"] == "PENDIENTE"
    assert pedido["total"] == 3000
    assert stock_actual(sesion, producto) == 8


def test_cancelacion_restituye_stock(entorno):
    servicio, sesion, (usuario, _, producto) = entorno

    pedido = crear_pedido(servicio, usuario, producto)
    cancelado = servicio.cancelar_por_cliente(
        pedido["id"], usuario
    )

    assert cancelado["estado"] == "CANCELADO"
    assert stock_actual(sesion, producto) == 10


def test_otro_usuario_no_puede_cancelar(entorno):
    servicio, sesion, (usuario, otro, producto) = entorno

    pedido = crear_pedido(servicio, usuario, producto)

    with pytest.raises(HTTPException) as error:
        servicio.cancelar_por_cliente(pedido["id"], otro)

    assert error.value.status_code == 403
    assert stock_actual(sesion, producto) == 8


def test_no_permite_cancelar_dos_veces(entorno):
    servicio, sesion, (usuario, _, producto) = entorno

    pedido = crear_pedido(servicio, usuario, producto)
    servicio.cancelar_por_cliente(pedido["id"], usuario)

    with pytest.raises(HTTPException) as error:
        servicio.cancelar_por_cliente(pedido["id"], usuario)

    assert error.value.status_code == 400
    assert stock_actual(sesion, producto) == 10


def test_rechaza_productos_duplicados(entorno):
    servicio, sesion, (usuario, _, producto) = entorno

    datos = PedidoCrear(
        forma_pago="EFECTIVO",
        direccion_entrega="Direccion de prueba 123",
        items=[
            {"producto_id": producto, "cantidad": 1},
            {"producto_id": producto, "cantidad": 2},
        ],
    )

    with pytest.raises(HTTPException) as error:
        servicio.crear(usuario, datos)

    assert error.value.status_code == 400
    assert stock_actual(sesion, producto) == 10


def test_rechaza_stock_insuficiente(entorno):
    servicio, sesion, (usuario, _, producto) = entorno

    with pytest.raises(HTTPException) as error:
        crear_pedido(servicio, usuario, producto, cantidad=11)

    assert error.value.status_code == 400
    assert stock_actual(sesion, producto) == 10


def test_transiciones_de_estado(entorno):
    servicio, sesion, (usuario, _, producto) = entorno

    pedido = crear_pedido(servicio, usuario, producto)

    preparado = servicio.cambiar_estado(
        pedido["id"],
        PedidoEstadoActualizar(estado="EN_PREPARACION"),
    )
    assert preparado["estado"] == "EN_PREPARACION"

    entregado = servicio.cambiar_estado(
        pedido["id"],
        PedidoEstadoActualizar(estado="ENTREGADO"),
    )
    assert entregado["estado"] == "ENTREGADO"

    with pytest.raises(HTTPException) as error:
        servicio.cambiar_estado(
            pedido["id"],
            PedidoEstadoActualizar(estado="CANCELADO"),
        )

    assert error.value.status_code == 400
    assert stock_actual(sesion, producto) == 8


def test_paginacion_y_resumen(entorno):
    servicio, _, (usuario, _, producto) = entorno

    crear_pedido(servicio, usuario, producto, cantidad=1)
    crear_pedido(servicio, usuario, producto, cantidad=2)

    pagina = servicio.listar_paginados(pagina=1, limite=1)
    resumen = servicio.obtener_resumen()

    assert pagina["total"] == 2
    assert pagina["paginas"] == 2
    assert len(pagina["pedidos"]) == 1

    assert resumen["total_pedidos"] == 2
    assert resumen["por_estado"]["PENDIENTE"] == 2
    assert resumen["total_vendido"] == 0
