
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlmodel import select

from app.modules.pedidos.models import Pedido, DetallePedido
from app.modules.pedidos.schemas import (
    PedidoCrear,
    PedidoEstadoActualizar,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.models import Producto


ESTADOS_VALIDOS = {
    "pendiente",
    "confirmado",
    "preparando",
    "enviado",
    "entregado",
    "cancelado",
}


class PedidoService:

    def __init__(self, uow=None):
        self.uow = uow or PedidoUnitOfWork()

    @staticmethod
    def convertir_pedido(pedido, detalles):
        return {
            "id": pedido.id,
            "usuario_id": pedido.usuario_id,
            "estado": pedido.estado,
            "forma_pago": pedido.forma_pago,
            "direccion_entrega": pedido.direccion_entrega,
            "notas": pedido.notas,
            "total": pedido.total,
            "created_at": pedido.created_at,
            "updated_at": pedido.updated_at,
            "items": [
                {
                    "id": detalle.id,
                    "producto_id": detalle.producto_id,
                    "cantidad": detalle.cantidad,
                    "nombre_producto": detalle.nombre_producto,
                    "precio_unitario": detalle.precio_unitario,
                    "subtotal": detalle.subtotal,
                }
                for detalle in detalles
            ],
        }

    def crear(self, usuario_id: int, datos: PedidoCrear):
        cantidades = {}

        for item in datos.items:
            cantidades[item.producto_id] = (
                cantidades.get(item.producto_id, 0)
                + item.cantidad
            )

        with self.uow as uow:
            productos = {}

            # Bloqueo de filas para evitar ventas simultáneas
            # que descuenten el mismo stock.
            for producto_id in sorted(cantidades):
                statement = (
                    select(Producto)
                    .where(Producto.id == producto_id)
                    .with_for_update()
                )

                producto = uow.session.exec(statement).first()

                if producto is None:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Producto {producto_id} no encontrado.",
                    )

                if not producto.activo or not producto.disponible:
                    raise HTTPException(
                        status_code=409,
                        detail=f"Producto {producto_id} no disponible.",
                    )

                if producto.stock < cantidades[producto_id]:
                    raise HTTPException(
                        status_code=409,
                        detail=f"Stock insuficiente: {producto.nombre}.",
                    )

                productos[producto_id] = producto

            total_centavos = 0

            for producto_id, cantidad in cantidades.items():
                producto = productos[producto_id]
                precio_centavos = round(producto.precio_base * 100)
                total_centavos += precio_centavos * cantidad

            pedido = Pedido(
                usuario_id=usuario_id,
                estado="pendiente",
                forma_pago=datos.forma_pago,
                direccion_entrega=datos.direccion_entrega,
                notas=datos.notas,
                total=total_centavos / 100,
            )

            uow.pedidos.agregar(pedido)

            detalles = []

            for producto_id, cantidad in cantidades.items():
                producto = productos[producto_id]

                precio_centavos = round(producto.precio_base * 100)

                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=precio_centavos / 100,
                    subtotal=(precio_centavos * cantidad) / 100,
                )

                uow.detalles.agregar(detalle)
                detalles.append(detalle)

                producto.stock -= cantidad
                uow.productos.actualizar(producto)

            uow.session.flush()

            return self.convertir_pedido(pedido, detalles)

    def obtener(self, pedido_id: int, usuario_id: int, es_admin=False):
        with self.uow as uow:
            pedido = uow.pedidos.obtener_por_id(pedido_id)

            if pedido is None:
                raise HTTPException(404, "Pedido no encontrado.")

            if not es_admin and pedido.usuario_id != usuario_id:
                raise HTTPException(403, "No podés consultar este pedido.")

            detalles = uow.detalles.listar_por_pedido(pedido_id)
            return self.convertir_pedido(pedido, detalles)

    def listar_mis_pedidos(self, usuario_id: int):
        with self.uow as uow:
            pedidos = uow.pedidos.listar_por_usuario(usuario_id)

            return [
                self.convertir_pedido(
                    pedido,
                    uow.detalles.listar_por_pedido(pedido.id),
                )
                for pedido in pedidos
            ]

    def listar_todos(self):
        with self.uow as uow:
            pedidos = uow.pedidos.listar()

            return [
                self.convertir_pedido(
                    pedido,
                    uow.detalles.listar_por_pedido(pedido.id),
                )
                for pedido in pedidos
            ]

    def cambiar_estado(
        self,
        pedido_id: int,
        datos: PedidoEstadoActualizar,
    ):
        if datos.estado not in ESTADOS_VALIDOS:
            raise HTTPException(422, "Estado de pedido inválido.")

        with self.uow as uow:
            pedido = uow.pedidos.obtener_por_id(pedido_id)

            if pedido is None:
                raise HTTPException(404, "Pedido no encontrado.")

            if pedido.estado == "cancelado" and datos.estado != "cancelado":
                raise HTTPException(
                    409,
                    "No se puede reactivar un pedido cancelado.",
                )

            if pedido.estado == "entregado" and datos.estado != "entregado":
                raise HTTPException(
                    409,
                    "No se puede modificar un pedido entregado.",
                )

            if datos.estado == "cancelado" and pedido.estado != "cancelado":
                detalles = uow.detalles.listar_por_pedido(pedido.id)

                for detalle in sorted(detalles, key=lambda d: d.producto_id):
                    statement = (
                        select(Producto)
                        .where(Producto.id == detalle.producto_id)
                        .with_for_update()
                    )
                    producto = uow.session.exec(statement).first()

                    if producto is not None:
                        producto.stock += detalle.cantidad
                        uow.productos.actualizar(producto)

            pedido.estado = datos.estado
            pedido.updated_at = datetime.now(timezone.utc)

            uow.pedidos.actualizar(pedido)

            detalles = uow.detalles.listar_por_pedido(pedido.id)
            return self.convertir_pedido(pedido, detalles)
