from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import Column, String
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(
        sa_column=Column(String(100), unique=True, nullable=False, index=True)
    )
    full_name: str
    email: str = Field(
        sa_column=Column(String(255), unique=True, nullable=False, index=True)
    )
    hashed_password: str
    role: str = Field(default="user")
    disabled: bool = Field(default=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
  