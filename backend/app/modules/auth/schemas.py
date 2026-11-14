
from pydantic import BaseModel, EmailStr, Field, field_validator


class RegistroUsuario(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    full_name: str = Field(min_length=2)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("username", "full_name")
    @classmethod
    def limpiar_espacios(cls, valor: str) -> str:
        valor = valor.strip()

        if not valor:
            raise ValueError("Este campo no puede estar vacío.")

        return valor


class LoginUsuario(BaseModel):
    username: str
    password: str


class TokenRespuesta(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MensajeRespuesta(BaseModel):
    mensaje: str
