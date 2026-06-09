from __future__ import annotations

from threading import Lock
from typing import Any


_tasks: list[dict[str, Any]] = []
_next_id = 1
_lock = Lock()


def criar_tarefa_db(data: dict[str, Any]) -> dict[str, Any]:
    global _next_id

    with _lock:
        task = {
            "id": _next_id,
            **data,
            "completed": False,
        }
        _tasks.append(task)
        _next_id += 1
        return dict(task)


def listar_tarefas(user_id: int) -> list[dict[str, Any]]:
    return [dict(task) for task in _tasks if task["user_id"] == user_id]


def atualizar_status_tarefa(task_id: int, completed: bool) -> dict[str, Any]:
    with _lock:
        for task in _tasks:
            if task["id"] == task_id:
                task["completed"] = completed
                return dict(task)

    raise LookupError("Tarefa nao encontrada.")
