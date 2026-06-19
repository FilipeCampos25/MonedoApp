from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.models.refresh_session import RefreshSession
from app.db.models.user import User


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def create_user(
    db: Session,
    email: str,
    password_hash: dict[str, str],
) -> User:
    user = User(
        username=email,
        email=email,
        password_algorithm=password_hash["algoritmo"],
        password_iterations=int(password_hash["iteracoes"]),
        password_salt=password_hash["salt"],
        password_hash=password_hash["hash"],
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ValueError("Email ja cadastrado.") from exc
    except SQLAlchemyError:
        db.rollback()
        raise
    db.refresh(user)
    return user


def password_data(user: User) -> dict[str, str]:
    return {
        "algoritmo": user.password_algorithm,
        "iteracoes": str(user.password_iterations),
        "salt": user.password_salt,
        "hash": user.password_hash,
    }


def create_refresh_session(
    db: Session,
    user_id: int,
    token_hash: str,
    expires_at: datetime,
) -> RefreshSession:
    refresh_session = RefreshSession(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(refresh_session)
    db.commit()
    db.refresh(refresh_session)
    return refresh_session


def get_refresh_session(
    db: Session,
    token_hash: str,
) -> RefreshSession | None:
    return db.scalar(
        select(RefreshSession).where(
            RefreshSession.token_hash == token_hash
        )
    )


def revoke_refresh_session(
    db: Session,
    refresh_session: RefreshSession,
    revoked_at: datetime,
) -> None:
    refresh_session.revoked_at = revoked_at
    db.commit()
