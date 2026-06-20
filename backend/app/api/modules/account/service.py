from typing import Any

from app.api.modules.account import repository
from app.core.security import verificar_senha
from sqlalchemy.orm import Session


def delete_account(user: dict[str, Any], password: str, db: Session) -> None:
    if not verificar_senha(password, user["password_hash"]):
        raise PermissionError("Senha atual incorreta.")
    repository.delete_account(db, user["id"])
