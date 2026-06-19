from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.modules.auth import repository
from app.api.modules.auth.schemas import TokenResponse, UserResponse
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
    hash_senha,
    verificar_senha,
)
from app.db.models.user import User


def register(db: Session, email: str, password: str) -> TokenResponse:
    normalized_email = email.strip().lower()
    if repository.get_user_by_email(db, normalized_email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email ja cadastrado.",
        )
    try:
        user = repository.create_user(
            db,
            normalized_email,
            hash_senha(password),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
    return issue_token_pair(db, user)


def login(db: Session, email: str, password: str) -> TokenResponse:
    normalized_email = email.strip().lower()
    user = repository.get_user_by_email(db, normalized_email)
    if (
        user is None
        or not user.is_active
        or not verificar_senha(password, repository.password_data(user))
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha invalidos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return issue_token_pair(db, user)


def refresh(db: Session, raw_token: str) -> TokenResponse:
    refresh_session = repository.get_refresh_session(
        db,
        hash_refresh_token(raw_token),
    )
    now = datetime.now(timezone.utc)
    if refresh_session is None or refresh_session.revoked_at is not None:
        raise _refresh_error()

    expires_at = refresh_session.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at <= now:
        repository.revoke_refresh_session(db, refresh_session, now)
        raise _refresh_error()

    user = db.get(User, refresh_session.user_id)
    if user is None or not user.is_active:
        repository.revoke_refresh_session(db, refresh_session, now)
        raise _refresh_error()

    repository.revoke_refresh_session(db, refresh_session, now)
    return issue_token_pair(db, user)


def logout(db: Session, raw_token: str) -> None:
    refresh_session = repository.get_refresh_session(
        db,
        hash_refresh_token(raw_token),
    )
    if refresh_session is not None and refresh_session.revoked_at is None:
        repository.revoke_refresh_session(
            db,
            refresh_session,
            datetime.now(timezone.utc),
        )


def issue_token_pair(db: Session, user: User) -> TokenResponse:
    access_token, expires_in = create_access_token(user.id, user.email)
    refresh_token, token_hash, expires_at = create_refresh_token()
    repository.create_refresh_session(
        db,
        user.id,
        token_hash,
        expires_at,
    )
    return TokenResponse(
        user=UserResponse(id=user.id, email=user.email),
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
    )


def _refresh_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh token invalido ou expirado.",
        headers={"WWW-Authenticate": "Bearer"},
    )
