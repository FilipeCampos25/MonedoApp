from fastapi import APIRouter

from app.api.modules.study.schemas import StudySessionCreate
from app.api.modules.study.service import listar_sessoes, registrar_sessao


router = APIRouter(prefix="/study/sessions", tags=["study"])


@router.post("")
def post_study_session(request: StudySessionCreate):
    data = request.model_dump(exclude={"user_id"}, mode="json")
    return registrar_sessao(request.user_id, data)


@router.get("")
def get_study_sessions(user_id: int):
    return listar_sessoes(user_id)
