
from sqlmodel import Session, select

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


class DetallePedidoRepository(BaseRepository[DetallePedido]):

    def __init__(self, session: Session):
        super().__init__(session, DetallePedido)

    def listar_por_pedido(self, pedido_id: int):
        statement = select(DetallePedido).where(
            DetallePedido.pedido_id == pedido_id
        )

        return list(self.session.exec(statement).all())
