from typing import Any

from sqlalchemy.orm import Session

from app.api.modules.study.repository import criar_sessao_db, listar_sessoes_db


def registrar_sessao(
    user_id: int,
    data: dict[str, Any],
    db: Session,
) -> dict[str, Any]:
    try:
        session = criar_sessao_db(db, user_id, data)
        return {"success": True, "data": session, "error": None}
    except Exception as exc:
        return {"success": False, "data": None, "error": str(exc)}


def listar_sessoes(
    user_id: int,
    db: Session,
) -> list[dict[str, Any]]:
    return listar_sessoes_db(db, user_id)
