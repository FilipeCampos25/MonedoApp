from __future__ import annotations

from threading import Lock
from typing import Any


_users: dict[str, dict[str, Any]] = {}
_next_id = 1
_lock = Lock()


def buscar_usuario(username: str) -> dict[str, Any] | None:
    user = _users.get(username.strip())
    return dict(user) if user else None


def criar_usuario(
    username: str,
    password_hash: dict[str, str],
    token: str,
) -> dict[str, Any]:
    global _next_id

    normalized_username = username.strip()
    with _lock:
        if normalized_username in _users:
            raise ValueError("Usuario ja existe.")

        user = {
            "id": _next_id,
            "username": normalized_username,
            "password_hash": dict(password_hash),
            "token": token,
        }
        _users[normalized_username] = user
        _next_id += 1
        return dict(user)
