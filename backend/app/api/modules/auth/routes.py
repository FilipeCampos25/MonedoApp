from typing import Annotated, Any

from app.api.modules.auth.schemas import AuthRequest, AuthResponse, CurrentUserResponse
from app.api.modules.auth.service import autenticar_usuario, encerrar_sessao, registrar_usuario
from app.core.dependencies import get_current_user
from app.db.session import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(request: AuthRequest, db: Annotated[Session, Depends(get_db)]):
    try:
        return registrar_usuario(request.username, request.password, db)
    except FileExistsError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/login", response_model=AuthResponse)
def login(request: AuthRequest, db: Annotated[Session, Depends(get_db)]):
    try:
        return autenticar_usuario(request.username, request.password, db)
    except PermissionError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.get("/me", response_model=CurrentUserResponse)
def me(user: Annotated[dict[str, Any], Depends(get_current_user)]):
    return {"user_id": user["id"], "username": user["username"]}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    encerrar_sessao(user["id"], db)
    return None
