from fastapi import APIRouter

from app.api.modules.tasks.schemas import TaskCreate
from app.api.modules.tasks.service import (
    concluir_tarefa,
    criar_tarefa,
    listar_tarefas,
)


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("")
def post_task(request: TaskCreate):
    data = request.model_dump(exclude={"user_id"}, mode="json")
    data["user_id"] = request.user_id
    return criar_tarefa(request.user_id, data)


@router.get("")
def get_tasks(user_id: int):
    return listar_tarefas(user_id)


@router.patch("/{id}/complete")
def complete_task(id: int):
    return concluir_tarefa(id)
