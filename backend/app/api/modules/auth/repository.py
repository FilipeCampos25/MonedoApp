from __future__ import annotations

from typing import Any

from app.core.security import hash_token
from app.db.models.user import User
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session


def buscar_usuario(db: Session, username: str) -> dict[str, Any] | None:
    normalized_username = username.strip()
    user = db.scalar(
        select(User).where(User.username == normalized_username)
    )
    return _serialize_user(user) if user else None


def buscar_usuario_por_email(db: Session, email: str) -> dict[str, Any] | None:
    normalized_email = email.strip().lower()
    user = db.scalar(
        select(User).where(func.lower(User.email) == normalized_email)
    )
    return _serialize_user(user) if user else None


def buscar_usuario_por_identificador(
    db: Session,
    identifier: str,
) -> dict[str, Any] | None:
    normalized_identifier = identifier.strip()
    user = db.scalar(
        select(User).where(User.username == normalized_identifier)
    )
    if user is None:
        user = db.scalar(
            select(User).where(
                func.lower(User.email) == normalized_identifier.lower()
            )
        )
    return _serialize_user(user) if user else None


def buscar_usuario_por_token(db: Session, token: str) -> dict[str, Any] | None:
    token_digest = hash_token(token)
    user = db.scalar(
        select(User).where(
            User.auth_token == token_digest,
            User.is_active.is_(True),
        )
    )
    return _serialize_user(user) if user else None


def criar_usuario(
    db: Session,
    username: str,
    email: str,
    password_hash: dict[str, str],
    token_hash: str,
) -> dict[str, Any]:
    normalized_username = username.strip()
    user = User(
        username=normalized_username,
        email=email.strip().lower(),
        password_algorithm=password_hash["algoritmo"],
        password_iterations=int(password_hash["iteracoes"]),
        password_salt=password_hash["salt"],
        password_hash=password_hash["hash"],
        auth_token=token_hash,
    )
    db.add(user)

    try:
        db.flush()
    except IntegrityError as exc:
        db.rollback()
        raise ValueError("Usuario ja existe.") from exc
    except SQLAlchemyError:
        db.rollback()
        raise

    return _serialize_user(user)


def atualizar_token(db: Session, user_id: int, token_hash: str) -> dict[str, Any]:
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise LookupError("Usuario nao encontrado.")
    user.auth_token = token_hash
    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise
    db.refresh(user)
    return _serialize_user(user)


def _serialize_user(user: User) -> dict[str, Any]:
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "password_hash": {
            "algoritmo": user.password_algorithm,
            "iteracoes": str(user.password_iterations),
            "salt": user.password_salt,
            "hash": user.password_hash,
        },
        "token_hash": user.auth_token,
        "is_active": user.is_active,
    }
