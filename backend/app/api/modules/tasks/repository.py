from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.models.task import Task


def create_task(
    db: Session,
    user_id: int,
    data: dict[str, Any],
) -> Task:
    task = Task(
        user_id=user_id,
        title=str(data["title"]).strip(),
        priority=str(data["priority"]),
        due_date=data["due_date"],
        time=data.get("time"),
        category=_clean_optional(data.get("category")),
        description=_clean_optional(data.get("description")),
        completed=False,
    )
    db.add(task)
    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise
    db.refresh(task)
    return task


def list_tasks(db: Session, user_id: int) -> list[Task]:
    return list(
        db.scalars(
            select(Task)
            .where(Task.user_id == user_id)
            .order_by(Task.due_date, Task.id)
        ).all()
    )


def complete_task(
    db: Session,
    user_id: int,
    task_id: int,
) -> Task | None:
    task = db.scalar(
        select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id,
        )
    )
    if task is None:
        return None
    task.completed = True
    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise
    db.refresh(task)
    return task


def serialize_task(task: Task) -> dict[str, Any]:
    return {
        "id": task.id,
        "title": task.title,
        "priority": task.priority,
        "due_date": task.due_date,
        "time": task.time,
        "category": task.category,
        "description": task.description,
        "completed": task.completed,
    }


def _clean_optional(value: Any) -> str | None:
    if value is None:
        return None
    normalized = str(value).strip()
    return normalized or None
