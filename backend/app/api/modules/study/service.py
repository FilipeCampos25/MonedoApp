from typing import Any

from app.api.modules.study.repository import criar_sessao_db, listar_sessoes_db
from sqlalchemy.orm import Session


def registrar_sessao(
    user_id: int,
    data: dict[str, Any],
    db: Session,
) -> dict[str, Any]:
    return criar_sessao_db(db, user_id, data)


def listar_sessoes(user_id: int, db: Session) -> list[dict[str, Any]]:
    return listar_sessoes_db(db, user_id)
