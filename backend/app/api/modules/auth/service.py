from __future__ import annotations

from typing import Any

from app.api.modules.account.repository import seed_default_settings
from app.api.modules.auth import repository
from app.core.security import gerar_token, hash_senha, hash_token, verificar_senha
from app.utils.autenticacao import validar_senha, validar_username
from sqlalchemy.orm import Session


def autenticar_usuario(identifier: str, password: str, db: Session) -> dict[str, Any]:
    try:
        validar_senha(password)
    except ValueError as exc:
        raise PermissionError("Credenciais invalidas.") from exc

    usuario = repository.buscar_usuario_por_identificador(db, identifier)
    if not usuario or not verificar_senha(password, usuario["password_hash"]):
        raise PermissionError("Credenciais invalidas.")

    token = gerar_token()
    repository.atualizar_token(db, usuario["id"], hash_token(token))
    return _auth_response(usuario, token)


def registrar_usuario(
    username: str,
    email: str,
    password: str,
    db: Session,
) -> dict[str, Any]:
    try:
        validar_username(username)
        validar_senha(password)
    except ValueError as exc:
        raise ValueError(str(exc)) from exc
    if repository.buscar_usuario(db, username):
        raise FileExistsError("Usuario ja existe.")
    if repository.buscar_usuario_por_email(db, email):
        raise FileExistsError("E-mail ja cadastrado.")

    token = gerar_token()
    usuario = repository.criar_usuario(
        db,
        username,
        email,
        hash_senha(password),
        hash_token(token),
    )
    seed_default_settings(db, usuario["id"])
    db.commit()
    return _auth_response(usuario, token)


def encerrar_sessao(user_id: int, db: Session) -> None:
    repository.atualizar_token(db, user_id, "")


def _auth_response(usuario: dict[str, Any], token: str) -> dict[str, Any]:
    return {
        "user_id": usuario["id"],
        "username": usuario["username"],
        "email": usuario["email"],
        "token": token,
    }
