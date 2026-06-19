from __future__ import annotations

from collections.abc import Mapping
from datetime import date, datetime
from typing import Any

PRIORIDADES_VALIDAS = {
    "baixa",
    "media",
    "alta",
    "urgente",
    "low",
    "medium",
    "high",
}


def validar_tarefa(data: Mapping[str, Any]) -> bool:
    if not isinstance(data, Mapping):
        return False

    title = data.get("title")
    if not isinstance(title, str) or not title.strip():
        return False

    priority = data.get("priority")
    if (
        not isinstance(priority, str)
        or priority.strip().lower() not in PRIORIDADES_VALIDAS
    ):
        return False

    return _data_valida(data.get("due_date"))


def _data_valida(value: Any) -> bool:
    if isinstance(value, datetime):
        return True
    if isinstance(value, date):
        return True
    if not isinstance(value, str) or not value.strip():
        return False

    try:
        date.fromisoformat(value.strip())
    except ValueError:
        return False
    return True
