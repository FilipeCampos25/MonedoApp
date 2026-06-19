from typing import Annotated, Any

from app.api.modules.tasks.schemas import TaskCreate, TaskResponse
from app.api.modules.tasks.service import concluir_tarefa, criar_tarefa, listar_tarefas
from app.core.dependencies import get_current_user
from app.db.session import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def post_task(
    request: TaskCreate,
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    try:
        return criar_tarefa(user["id"], request.model_dump(mode="json"), db)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("", response_model=list[TaskResponse])
def get_tasks(
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return listar_tarefas(user["id"], db)


@router.patch("/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: int,
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    try:
        return concluir_tarefa(task_id, user["id"], db)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
