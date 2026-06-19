from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.modules.tasks import repository
from app.api.modules.tasks.schemas import TaskCreate


def create_task(user_id: int, request: TaskCreate, db: Session) -> dict:
    task = repository.create_task(
        db,
        user_id,
        request.model_dump(),
    )
    return repository.serialize_task(task)


def list_tasks(user_id: int, db: Session) -> list[dict]:
    return [
        repository.serialize_task(task)
        for task in repository.list_tasks(db, user_id)
    ]


def complete_task(user_id: int, task_id: int, db: Session) -> dict:
    task = repository.complete_task(db, user_id, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa nao encontrada.",
        )
    return repository.serialize_task(task)
