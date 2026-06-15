from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.modules.tasks.schemas import TaskCreate
from app.api.modules.tasks.service import (
    concluir_tarefa,
    criar_tarefa,
    listar_tarefas,
)
from app.db.session import get_db


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("")
def post_task(request: TaskCreate, db: Session = Depends(get_db)):
    data = request.model_dump(exclude={"user_id"}, mode="json")
    data["user_id"] = request.user_id
    return criar_tarefa(request.user_id, data, db)


@router.get("")
def get_tasks(user_id: int, db: Session = Depends(get_db)):
    return listar_tarefas(user_id, db)


@router.patch("/{id}/complete")
def complete_task(id: int, db: Session = Depends(get_db)):
    return concluir_tarefa(id, db)
