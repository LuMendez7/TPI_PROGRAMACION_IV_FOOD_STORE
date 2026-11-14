
from sqlalchemy import inspect
from sqlmodel import SQLModel

import app.models
from app.core.database import engine


TABLAS_ESPERADAS = {
    "usuarios",
    "categorias",
    "productos",
    "pedidos",
    "detalles_pedido",
}


def main():
    print("Iniciando verificación de Food Store...")

    nombre_base = engine.url.database

    if nombre_base != "tpi_foodstore_db":
        raise RuntimeError(
            f"Base de datos incorrecta: {nombre_base}. "
            "Se esperaba tpi_foodstore_db."
        )

    tablas_registradas = set(SQLModel.metadata.tables.keys())

    if tablas_registradas != TABLAS_ESPERADAS:
        raise RuntimeError(
            "Los modelos registrados no coinciden con los esperados. "
            f"Encontradas: {sorted(tablas_registradas)}"
        )

    inspector = inspect(engine)
    tablas_existentes = set(inspector.get_table_names())

    conflictos = TABLAS_ESPERADAS & tablas_existentes

    if conflictos:
        raise RuntimeError(
            "Ya existen tablas del TPI en PostgreSQL: "
            f"{sorted(conflictos)}. "
            "No se realizarán cambios automáticamente."
        )

    print("Base de datos:", nombre_base)
    print("Modelos registrados:", len(tablas_registradas))

    SQLModel.metadata.create_all(engine)

    inspector = inspect(engine)
    tablas_creadas = set(inspector.get_table_names())

    faltantes = TABLAS_ESPERADAS - tablas_creadas

    if faltantes:
        raise RuntimeError(
            f"Faltan tablas: {sorted(faltantes)}"
        )

    print("Tablas creadas correctamente:")
    for tabla in sorted(TABLAS_ESPERADAS):
        print(" -", tabla)

    print("PASO 11 COMPLETADO")


if __name__ == "__main__":
    main()
