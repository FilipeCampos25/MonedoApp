from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.modules.study.schemas import StudySessionCreate
from app.api.modules.study.service import listar_sessoes, registrar_sessao
from app.db.session import get_db


router = APIRouter(prefix="/study/sessions", tags=["study"])


@router.post("")
def post_study_session(
    request: StudySessionCreate,
    db: Session = Depends(get_db),
):
    data = request.model_dump(exclude={"user_id"}, mode="json")
    return registrar_sessao(request.user_id, data, db)


@router.get("")
def get_study_sessions(user_id: int, db: Session = Depends(get_db)):
    return listar_sessoes(user_id, db)
