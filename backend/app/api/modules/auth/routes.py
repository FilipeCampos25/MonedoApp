from fastapi import APIRouter
from pydantic import BaseModel

from app.modules.auth.service import autenticar_usuario, registrar_usuario


router = APIRouter()


class AuthRequest(BaseModel):
    username: str
    password: str
    token: str


@router.post("/login")
def login(request: AuthRequest):
    resultado = autenticar_usuario(request.username, request.password, request.token)
    return resultado


@router.post("/register")
def register(request: AuthRequest):
    resultado = registrar_usuario(request.username, request.password, request.token)
    return resultado
