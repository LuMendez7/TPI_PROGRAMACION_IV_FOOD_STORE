
import os
from getpass import getpass

import app.models  # Registra todos los modelos SQLModel

from app.core.security import obtener_hash_password
from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository
from app.modules.categorias.models import Categoria
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.models import Producto
from app.modules.productos.repository import ProductoRepository


CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas artesanales"),
    ("Pizzas", "Pizzas recién horneadas"),
    ("Bebidas", "Bebidas para acompañar"),
]

PRODUCTOS = [
    ("Hamburguesa clásica", "Hamburguesas", 8500, 20),
    ("Hamburguesa doble", "Hamburguesas", 11500, 15),
    ("Hamburguesa vegetariana", "Hamburguesas", 9200, 12),
    ("Pizza muzzarella", "Pizzas", 12500, 18),
    ("Pizza especial", "Pizzas", 15500, 12),
    ("Pizza napolitana", "Pizzas", 14000, 10),
    ("Gaseosa 500 ml", "Bebidas", 3000, 40),
    ("Agua mineral 500 ml", "Bebidas", 2200, 35),
]


def cargar_datos():
    print("\n=== SEED FOOD STORE ===")

    username = os.getenv("SEED_ADMIN_USERNAME", "admin")
    email = os.getenv(
        "SEED_ADMIN_EMAIL",
        "admin@foodstore.local",
    )

    with UnitOfWork() as uow:
        usuarios = UsuarioRepository(uow.session)
        categorias = CategoriaRepository(uow.session)
        productos = ProductoRepository(uow.session)

        administrador = usuarios.obtener_por_username(username)

        if administrador is None:
            if usuarios.obtener_por_email(email):
                raise ValueError(
                    "El correo del administrador ya está registrado."
                )

            password = os.getenv("SEED_ADMIN_PASSWORD")

            if not password:
                password = getpass(
                    "Contraseña del administrador (mínimo 12 caracteres): "
                )

            if len(password) < 12:
                raise ValueError(
                    "La contraseña debe tener al menos 12 caracteres."
                )

            administrador = Usuario(
                username=username,
                full_name="Administrador Food Store",
                email=email,
                hashed_password=obtener_hash_password(password),
                role="admin",
                disabled=False,
            )

            usuarios.agregar(administrador)
            print("Administrador creado.")
        else:
            if administrador.role != "admin":
                raise ValueError(
                    "El username indicado ya pertenece a un usuario "
                    "que no es administrador. No se elevarán sus permisos."
                )
            print("Administrador existente: no se modifica.")

        categorias_por_nombre = {}

        for nombre, descripcion in CATEGORIAS:
            categoria = categorias.obtener_por_nombre(nombre)

            if categoria is None:
                categoria = Categoria(
                    nombre=nombre,
                    descripcion=descripcion,
                    activo=True,
                )
                categorias.agregar(categoria)
                print("Categoría creada:", nombre)

            categorias_por_nombre[nombre] = categoria

        for nombre, categoria_nombre, precio, stock in PRODUCTOS:
            categoria = categorias_por_nombre[categoria_nombre]

            existentes = productos.buscar_por_nombre(nombre)

            existe = any(
                p.nombre == nombre
                and p.categoria_id == categoria.id
                for p in existentes
            )

            if not existe:
                producto = Producto(
                    categoria_id=categoria.id,
                    nombre=nombre,
                    descripcion=f"Producto Food Store: {nombre}",
                    precio_base=float(precio),
                    imagen_url=None,
                    stock=stock,
                    disponible=True,
                    activo=True,
                )

                productos.agregar(producto)
                print("Producto creado:", nombre)

    print("\nSEED COMPLETADO CORRECTAMENTE")


if __name__ == "__main__":
    cargar_datos()
