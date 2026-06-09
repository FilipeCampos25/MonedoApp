from __future__ import annotations

from datetime import date
from threading import Lock
from typing import Any


_sessions: list[dict[str, Any]] = []
_next_id = 1
_lock = Lock()


def criar_sessao_db(user_id: int, data: dict[str, Any]) -> dict[str, Any]:
    global _next_id

    with _lock:
        session = {
            "id": _next_id,
            "user_id": user_id,
            **data,
            "date": data.get("date") or date.today().isoformat(),
        }
        _sessions.append(session)
        _next_id += 1
        return dict(session)


def listar_sessoes_db(user_id: int) -> list[dict[str, Any]]:
    return [
        dict(session)
        for session in _sessions
        if session["user_id"] == user_id
    ]
