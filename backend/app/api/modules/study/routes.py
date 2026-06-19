from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.modules.study import service
from app.api.modules.study.schemas import (
    StudySessionCreate,
    StudySessionResponse,
)
from app.core.dependencies import CurrentUser
from app.db.session import get_db


router = APIRouter(prefix="/study/sessions", tags=["study"])
Database = Annotated[Session, Depends(get_db)]


@router.post(
    "",
    response_model=StudySessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def post_study_session(
    request: StudySessionCreate,
    current_user: CurrentUser,
    db: Database,
) -> dict:
    return service.create_session(current_user.id, request, db)


@router.get("", response_model=list[StudySessionResponse])
def get_study_sessions(
    current_user: CurrentUser,
    db: Database,
) -> list[dict]:
    return service.list_sessions(current_user.id, db)
