
from getpass import getpass

import app.models
from sqlmodel import select

from app.core.database import session_factory
from app.core.security import obtener_hash_password
from app.modules.usuarios.models import Usuario


def main():
    print("\n=== RESTABLECER CONTRASEÑA ADMIN ===")

    nueva = getpass("Nueva contraseña (mínimo 12 caracteres): ")
    confirmar = getpass("Repetir nueva contraseña: ")

    if len(nueva) < 12:
        print("ERROR: La contraseña debe tener al menos 12 caracteres.")
        return

    if nueva != confirmar:
        print("ERROR: Las contraseñas no coinciden.")
        return

    with session_factory() as session:
        administrador = session.exec(
            select(Usuario).where(Usuario.username == "admin")
        ).first()

        if administrador is None:
            print("ERROR: No existe el usuario admin.")
            return

        if administrador.role != "admin":
            print("ERROR: El usuario no tiene rol administrador.")
            return

        administrador.hashed_password = obtener_hash_password(nueva)

        session.add(administrador)
        session.commit()

    print("CONTRASEÑA DEL ADMINISTRADOR ACTUALIZADA")


if __name__ == "__main__":
    main()
