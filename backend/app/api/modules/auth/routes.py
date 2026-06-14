from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.modules.auth.service import autenticar_usuario, registrar_usuario
from app.db.session import get_db


router = APIRouter()


class AuthRequest(BaseModel):
    username: str
    password: str
    token: str


@router.post("/login")
def login(request: AuthRequest, db: Session = Depends(get_db)):
    return autenticar_usuario(
        request.username,
        request.password,
        request.token,
        db,
    )


@router.post("/register")
def register(request: AuthRequest, db: Session = Depends(get_db)):
    return registrar_usuario(
        request.username,
        request.password,
        request.token,
        db,
    )
