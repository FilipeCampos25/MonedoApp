from typing import Annotated, Any

from app.api.modules.account.repository import list_options
from app.core.dependencies import get_current_user
from app.db.session import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/metadata", tags=["metadata"])

PRIORITIES = ["baixa", "media", "alta", "urgente"]
SESSION_TYPES = [
    "Resolução de exercícios",
    "Revisão de conteúdo",
    "Leitura guiada",
    "Simulado rápido",
]


@router.get("/form-options")
def get_form_options(
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return {
        "subjects": [
            option["name"]
            for option in list_options(db, user["id"], "subjects")
        ],
        "categories": [
            option["name"]
            for option in list_options(db, user["id"], "categories")
        ],
        "priorities": PRIORITIES,
        "session_types": SESSION_TYPES,
    }
