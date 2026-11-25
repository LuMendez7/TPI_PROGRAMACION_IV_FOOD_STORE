
from sqlmodel import Session, select
from sqlalchemy import func

from app.core.repository import BaseRepository
from app.modules.pedidos.models import Pedido, DetallePedido


class PedidoRepository(BaseRepository[Pedido]):

    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def listar_por_usuario(self, usuario_id: int):
        statement = (
            select(Pedido)
            .where(Pedido.usuario_id == usuario_id)
            .order_by(Pedido.created_at.desc())
        )

        return list(self.session.exec(statement).all())

    def listar_paginados(
        self,
        skip=0,
        limit=20,
        usuario_id=None,
        estado=None,
    ):
        filtros = []

        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)

        if estado is not None:
            filtros.append(
                func.upper(Pedido.estado) == estado.upper()
            )

        total = self.session.exec(
            select(func.count(Pedido.id)).where(*filtros)
        ).one()

        items = self.session.exec(
            select(Pedido)
            .where(*filtros)
            .order_by(Pedido.created_at.desc(), Pedido.id.desc())
            .offset(skip)
            .limit(limit)
        ).all()

        return total, items

    def count_by_estado(self, estado):
        return self.session.exec(
            select(func.count(Pedido.id)).where(
                func.upper(Pedido.estado) == estado.upper()
            )
        ).one()

    def contar_entre_fechas(self, inicio, fin):
        return self.session.exec(
            select(func.count(Pedido.id)).where(
                Pedido.created_at >= inicio,
                Pedido.created_at < fin,
            )
        ).one()

    def ingresos_entregados(self):
        return self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0))
            .where(func.upper(Pedido.estado) == "ENTREGADO")
        ).one()


class DetallePedidoRepository(BaseRepository[DetallePedido]):

    def __init__(self, session: Session):
        super().__init__(session, DetallePedido)

    def listar_por_pedido(self, pedido_id: int):
        statement = select(DetallePedido).where(
            DetallePedido.pedido_id == pedido_id
        )

        return list(self.session.exec(statement).all())
