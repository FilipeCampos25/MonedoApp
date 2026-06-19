from __future__ import annotations

from typing import Any

from app.api.modules.auth import repository
from app.core.security import gerar_token, hash_senha, hash_token, verificar_senha
from app.utils.validators import validar_dados
from sqlalchemy.orm import Session


def autenticar_usuario(username: str, password: str, db: Session) -> dict[str, Any]:
    dados_validos, _ = validar_dados(username, password)
    if not dados_validos:
        raise PermissionError("Credenciais invalidas.")

    usuario = repository.buscar_usuario(db, username)
    if not usuario or not verificar_senha(password, usuario["password_hash"]):
        raise PermissionError("Credenciais invalidas.")

    token = gerar_token()
    repository.atualizar_token(db, usuario["id"], hash_token(token))
    return _auth_response(usuario, token)


def registrar_usuario(username: str, password: str, db: Session) -> dict[str, Any]:
    dados_validos, validation_error = validar_dados(username, password)
    if not dados_validos:
        raise ValueError(validation_error or "Dados invalidos.")
    if repository.buscar_usuario(db, username):
        raise FileExistsError("Usuario ja existe.")

    token = gerar_token()
    usuario = repository.criar_usuario(
        db,
        username,
        hash_senha(password),
        hash_token(token),
    )
    return _auth_response(usuario, token)


def encerrar_sessao(user_id: int, db: Session) -> None:
    repository.atualizar_token(db, user_id, "")


def _auth_response(usuario: dict[str, Any], token: str) -> dict[str, Any]:
    return {
        "user_id": usuario["id"],
        "username": usuario["username"],
        "token": token,
    }
