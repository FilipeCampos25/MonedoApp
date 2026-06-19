from sqlalchemy.orm import Session

from app.api.modules.study import repository
from app.api.modules.study.schemas import StudySessionCreate


def create_session(
    user_id: int,
    request: StudySessionCreate,
    db: Session,
) -> dict:
    session = repository.create_session(
        db,
        user_id,
        request.model_dump(),
    )
    return repository.serialize_session(session)


def list_sessions(user_id: int, db: Session) -> list[dict]:
    return [
        repository.serialize_session(session)
        for session in repository.list_sessions(db, user_id)
    ]
