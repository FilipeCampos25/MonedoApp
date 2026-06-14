from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.models.user import User


def buscar_usuario(db: Session, username: str) -> dict[str, Any] | None:
    normalized_username = username.strip()
    user = db.scalar(
        select(User).where(User.username == normalized_username)
    )
    return _serialize_user(user) if user else None


def criar_usuario(
    db: Session,
    username: str,
    password_hash: dict[str, str],
    token: str,
) -> dict[str, Any]:
    normalized_username = username.strip()
    user = User(
        username=normalized_username,
        password_algorithm=password_hash["algoritmo"],
        password_iterations=int(password_hash["iteracoes"]),
        password_salt=password_hash["salt"],
        password_hash=password_hash["hash"],
        auth_token=token,
    )
    db.add(user)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ValueError("Usuario ja existe.") from exc
    except SQLAlchemyError:
        db.rollback()
        raise

    db.refresh(user)
    return _serialize_user(user)


def _serialize_user(user: User) -> dict[str, Any]:
    return {
        "id": user.id,
        "username": user.username,
        "password_hash": {
            "algoritmo": user.password_algorithm,
            "iteracoes": str(user.password_iterations),
            "salt": user.password_salt,
            "hash": user.password_hash,
        },
        "token": user.auth_token,
    }
