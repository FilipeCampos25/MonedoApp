from typing import Annotated, Any

from app.api.modules.study.schemas import StudySessionCreate, StudySessionResponse
from app.api.modules.study.service import listar_sessoes, registrar_sessao
from app.core.dependencies import get_current_user
from app.db.session import get_db
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/study/sessions", tags=["study"])


@router.post(
    "",
    response_model=StudySessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def post_study_session(
    request: StudySessionCreate,
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return registrar_sessao(user["id"], request.model_dump(mode="json"), db)


@router.get("", response_model=list[StudySessionResponse])
def get_study_sessions(
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return listar_sessoes(user["id"], db)
