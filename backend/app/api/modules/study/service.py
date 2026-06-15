from typing import Any

from app.api.modules.study.repository import criar_sessao_db, listar_sessoes_db


def registrar_sessao(user_id: int, data: dict[str, Any]) -> dict[str, Any]:
    try:
        session = criar_sessao_db(user_id, data)
        return {"success": True, "data": session, "error": None}
    except Exception as exc:
        return {"success": False, "data": None, "error": str(exc)}


def listar_sessoes(user_id: int) -> list[dict[str, Any]]:
    return listar_sessoes_db(user_id)
