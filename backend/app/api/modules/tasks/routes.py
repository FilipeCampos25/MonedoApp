from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.modules.tasks import service
from app.api.modules.tasks.schemas import TaskCreate, TaskResponse
from app.core.dependencies import CurrentUser
from app.db.session import get_db


router = APIRouter(prefix="/tasks", tags=["tasks"])
Database = Annotated[Session, Depends(get_db)]


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def post_task(
    request: TaskCreate,
    current_user: CurrentUser,
    db: Database,
) -> dict:
    return service.create_task(current_user.id, request, db)


@router.get("", response_model=list[TaskResponse])
def get_tasks(
    current_user: CurrentUser,
    db: Database,
) -> list[dict]:
    return service.list_tasks(current_user.id, db)


@router.patch("/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: int,
    current_user: CurrentUser,
    db: Database,
) -> dict:
    return service.complete_task(current_user.id, task_id, db)
