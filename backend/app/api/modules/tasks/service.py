from typing import Any

from app.api.modules.account.repository import option_exists
from app.api.modules.tasks.repository import (
    atualizar_status_tarefa,
    criar_tarefa_db,
)
from app.api.modules.tasks.repository import (
    listar_tarefas as listar_tarefas_db,
)
from app.utils.validators import validar_tarefa
from sqlalchemy.orm import Session


def criar_tarefa(user_id: int, data: dict[str, Any], db: Session) -> dict[str, Any]:
    task_data = dict(data)
    task_data["user_id"] = user_id
    if not validar_tarefa(task_data):
        raise ValueError("Dados da tarefa invalidos.")
    category = task_data.get("category")
    if category and not option_exists(db, user_id, "categories", str(category)):
        raise ValueError("Categoria não cadastrada para este usuário.")
    return criar_tarefa_db(db, task_data)


def listar_tarefas(user_id: int, db: Session) -> list[dict[str, Any]]:
    return listar_tarefas_db(db, user_id)


def concluir_tarefa(task_id: int, user_id: int, db: Session) -> dict[str, Any]:
    return atualizar_status_tarefa(db, task_id, user_id, True)
