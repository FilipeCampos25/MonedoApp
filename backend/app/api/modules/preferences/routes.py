from typing import Annotated, Any

from app.api.modules.preferences.repository import (
    atualizar_preferencias,
    obter_preferencias,
)
from app.api.modules.preferences.schemas import (
    PreferencesResponse,
    PreferencesUpdate,
)
from app.core.dependencies import get_current_user
from app.db.session import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/preferences", tags=["preferences"])


@router.get("", response_model=PreferencesResponse)
def get_preferences(
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return obter_preferencias(db, user["id"])


@router.put("", response_model=PreferencesResponse)
def put_preferences(
    request: PreferencesUpdate,
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return atualizar_preferencias(
        db,
        user["id"],
        request.daily_goal_seconds,
    )
