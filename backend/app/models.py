
# Importación centralizada de los modelos del TPI Food Store.
# Permite que SQLModel registre todas las tablas y relaciones.

from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.pedidos.models import Pedido, DetallePedido

__all__ = [
    "Usuario",
    "Categoria",
    "Producto",
    "Pedido",
    "DetallePedido",
]
