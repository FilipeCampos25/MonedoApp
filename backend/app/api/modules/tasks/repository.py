from __future__ import annotations

from datetime import date
from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.models.task import Task


def criar_tarefa_db(db: Session, data: dict[str, Any]) -> dict[str, Any]:
    due_date = data["due_date"]
    if isinstance(due_date, str):
        due_date = date.fromisoformat(due_date)

    task = Task(
        user_id=int(data["user_id"]),
        title=str(data["title"]).strip(),
        priority=str(data["priority"]),
        due_date=due_date,
        time=data.get("time"),
        category=data.get("category"),
        description=data.get("description"),
        completed=False,
    )
    db.add(task)
    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise
    db.refresh(task)
    return _serialize_task(task)


def listar_tarefas(db: Session, user_id: int) -> list[dict[str, Any]]:
    tasks = db.scalars(
        select(Task).where(Task.user_id == user_id).order_by(Task.id)
    ).all()
    return [_serialize_task(task) for task in tasks]


def atualizar_status_tarefa(
    db: Session,
    task_id: int,
    completed: bool,
) -> dict[str, Any]:
    task = db.get(Task, task_id)
    if task is None:
        raise LookupError("Tarefa nao encontrada.")

    task.completed = completed
    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise
    db.refresh(task)
    return _serialize_task(task)


def _serialize_task(task: Task) -> dict[str, Any]:
    return {
        "id": task.id,
        "user_id": task.user_id,
        "title": task.title,
        "priority": task.priority,
        "due_date": task.due_date.isoformat(),
        "time": task.time,
        "category": task.category,
        "description": task.description,
        "completed": task.completed,
    }
