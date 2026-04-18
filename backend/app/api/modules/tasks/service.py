from __future__ import annotations

from importlib import import_module
from typing import Any, Callable


def criar_tarefa(user_id: Any, data: Any) -> dict[str, bool]:
    # Esta funcao orquestra o fluxo de criacao de uma tarefa para o usuario informado.
    try:
        # Primeiro a service localiza a funcao responsavel por validar os dados da tarefa.
        validar = _resolve_callable(
            "app.utils.validators",
            "validar_tarefa",
        )
        # Em seguida localiza a funcao da camada de persistencia que cria a tarefa no banco.
        criar = _resolve_callable(
            "app.api.modules.tasks.repository",
            "criar_tarefa_db",
        )

        # O fluxo pedido pela issue comeca executando a validacao da tarefa recebida.
        validar(data)
        # Depois da validacao, a service delega a criacao da tarefa para a outra camada.
        criar(data)
        # Se todas as chamadas ocorrerem sem erro, a resposta segue o contrato da issue.
        return {"success": True}
    except Exception:
        # Qualquer falha no fluxo retorna apenas o status booleano padronizado.
        return {"success": False}


def listar_tarefas(user_id: Any) -> list[Any]:
    # Esta funcao orquestra a consulta das tarefas do usuario informado.
    # Ela apenas busca os dados na camada responsavel e devolve a lista recebida.
    buscar = _resolve_callable(
        "app.api.modules.tasks.repository",
        "listar_tarefas",
    )
    return buscar(user_id)


def concluir_tarefa(task_id: Any) -> dict[str, bool]:
    # Esta funcao orquestra o fluxo de conclusao de uma tarefa existente.
    try:
        # A service localiza a funcao responsavel por atualizar o status da tarefa.
        atualizar_status = _resolve_callable(
            "app.api.modules.tasks.repository",
            "atualizar_status_tarefa",
        )

        # O fluxo pedido pela issue atualiza a tarefa para o status concluido.
        atualizar_status(task_id, True)
        # Se a chamada ocorrer sem erro, a resposta segue o contrato definido.
        return {"success": True}
    except Exception:
        # Qualquer falha no fluxo retorna apenas o status booleano padronizado.
        return {"success": False}


def _resolve_callable(module_path: str, function_name: str) -> Callable[..., Any]:
    # Esta funcao auxiliar importa dinamicamente a funcao esperada em outra camada.
    # Ela permite manter a service apenas como orquestradora sem implementar a dependencia.
    module = import_module(module_path)
    candidate = getattr(module, function_name, None)
    if callable(candidate):
        return candidate
    raise AttributeError(
        f"Nenhuma funcao disponivel encontrada em {module_path}: {function_name}"
    )
