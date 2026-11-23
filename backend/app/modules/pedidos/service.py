
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from fastapi import HTTPException
from sqlmodel import select
from sqlalchemy import func

from app.modules.pedidos.models import Pedido, DetallePedido
from app.modules.pedidos.schemas import (
    PedidoCrear,
    PedidoEstadoActualizar,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.models import Producto


ESTADOS_VALIDOS = {
    "PENDIENTE",
    "EN_PREPARACION",
    "ENTREGADO",
    "CANCELADO",
}

TRANSICIONES_PERMITIDAS = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
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
            if item.producto_id in cantidades:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"El producto {item.producto_id} "
                        "está repetido en el pedido."
                    ),
                )

            cantidades[item.producto_id] = item.cantidad

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
                        status_code=400,
                        detail=f"Producto {producto_id} no disponible.",
                    )

                if producto.stock < cantidades[producto_id]:
                    raise HTTPException(
                        status_code=400,
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
                estado="PENDIENTE",
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

    def cancelar_por_cliente(self, pedido_id: int, usuario_id: int):
        with self.uow as uow:
            # Bloquear el pedido durante la verificación y cancelación.
            statement = (
                select(Pedido)
                .where(Pedido.id == pedido_id)
                .with_for_update()
            )

            pedido = uow.session.exec(statement).first()

            if pedido is None:
                raise HTTPException(
                    status_code=404,
                    detail="Pedido no encontrado.",
                )

            if pedido.usuario_id != usuario_id:
                raise HTTPException(
                    status_code=403,
                    detail="No podés cancelar un pedido de otro usuario.",
                )

            if pedido.estado.upper() != "PENDIENTE":
                raise HTTPException(
                    status_code=400,
                    detail="Solo se pueden cancelar pedidos pendientes.",
                )

            detalles = uow.detalles.listar_por_pedido(pedido.id)

            # Restaurar el stock de cada producto.
            for detalle in sorted(
                detalles,
                key=lambda d: d.producto_id,
            ):
                statement_producto = (
                    select(Producto)
                    .where(Producto.id == detalle.producto_id)
                    .with_for_update()
                )

                producto = uow.session.exec(
                    statement_producto
                ).first()

                if producto is not None:
                    producto.stock += detalle.cantidad
                    uow.productos.actualizar(producto)

            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)

            uow.pedidos.actualizar(pedido)

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


    def listar_paginados(
        self,
        pagina: int = 1,
        limite: int = 10,
        estado: str | None = None,
    ):
        with self.uow as uow:
            consulta = select(Pedido)
            consulta_total = select(func.count()).select_from(Pedido)

            if estado is not None:
                estado = estado.upper()

                if estado not in ESTADOS_VALIDOS:
                    raise HTTPException(
                        status_code=422,
                        detail="Estado de pedido inválido.",
                    )

                consulta = consulta.where(func.upper(Pedido.estado) == estado)
                consulta_total = consulta_total.where(
                    func.upper(Pedido.estado) == estado
                )

            total = uow.session.exec(consulta_total).one()

            statement = (
                consulta
                .order_by(Pedido.created_at.desc(), Pedido.id.desc())
                .offset((pagina - 1) * limite)
                .limit(limite)
            )

            pedidos = uow.session.exec(statement).all()

            return {
                "pagina": pagina,
                "limite": limite,
                "total": total,
                "paginas": (total + limite - 1) // limite,
                "pedidos": [
                    self.convertir_pedido(
                        pedido,
                        uow.detalles.listar_por_pedido(pedido.id),
                    )
                    for pedido in pedidos
                ],
            }

    def obtener_resumen(self):
        with self.uow as uow:
            pedidos = uow.session.exec(select(Pedido)).all()

            zona_argentina = ZoneInfo("America/Argentina/Buenos_Aires")
            hoy = datetime.now(zona_argentina).date()

            por_estado = {
                "PENDIENTE": 0,
                "EN_PREPARACION": 0,
                "ENTREGADO": 0,
                "CANCELADO": 0,
            }

            total_vendido = 0.0
            pedidos_hoy = 0

            for pedido in pedidos:
                estado = pedido.estado.upper()

                if estado in por_estado:
                    por_estado[estado] += 1

                if estado == "ENTREGADO":
                    total_vendido += pedido.total

                fecha_creacion = pedido.created_at

                if fecha_creacion.tzinfo is None:
                    fecha_creacion = fecha_creacion.replace(
                        tzinfo=timezone.utc
                    )

                fecha_argentina = fecha_creacion.astimezone(
                    zona_argentina
                ).date()

                if fecha_argentina == hoy:
                    pedidos_hoy += 1

            return {
                "total_pedidos": len(pedidos),
                "pedidos_hoy": pedidos_hoy,
                "por_estado": por_estado,
                "total_vendido": round(total_vendido, 2),
            }

    def cambiar_estado(
        self,
        pedido_id: int,
        datos: PedidoEstadoActualizar,
    ):
        nuevo_estado = datos.estado.upper()

        if nuevo_estado not in ESTADOS_VALIDOS:
            raise HTTPException(
                status_code=400,
                detail="Estado de pedido inválido.",
            )

        with self.uow as uow:
            # Bloquear el pedido para evitar cambios simultáneos.
            statement = (
                select(Pedido)
                .where(Pedido.id == pedido_id)
                .with_for_update()
            )

            pedido = uow.session.exec(statement).first()

            if pedido is None:
                raise HTTPException(
                    status_code=404,
                    detail="Pedido no encontrado.",
                )

            estado_actual = pedido.estado.upper()

            if nuevo_estado not in TRANSICIONES_PERMITIDAS.get(
                estado_actual, set()
            ):
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"No se permite cambiar el estado "
                        f"de {estado_actual} a {nuevo_estado}."
                    ),
                )

            if nuevo_estado == "CANCELADO":
                detalles = uow.detalles.listar_por_pedido(pedido.id)

                for detalle in sorted(
                    detalles,
                    key=lambda d: d.producto_id,
                ):
                    statement = (
                        select(Producto)
                        .where(Producto.id == detalle.producto_id)
                        .with_for_update()
                    )

                    producto = uow.session.exec(statement).first()

                    if producto is not None:
                        producto.stock += detalle.cantidad
                        uow.productos.actualizar(producto)

            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(timezone.utc)

            uow.pedidos.actualizar(pedido)

            detalles = uow.detalles.listar_por_pedido(pedido.id)

            return self.convertir_pedido(pedido, detalles)
