from __future__ import annotations

from datetime import date
from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.models.study_session import StudySession


def criar_sessao_db(
    db: Session,
    user_id: int,
    data: dict[str, Any],
) -> dict[str, Any]:
    session_date = data.get("date") or date.today()
    if isinstance(session_date, str):
        session_date = date.fromisoformat(session_date)

    study_session = StudySession(
        user_id=user_id,
        duration_seconds=int(data["duration"]),
        subject=str(data["subject"]).strip(),
        session_type=data.get("session_type"),
        session_date=session_date,
    )
    db.add(study_session)
    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise
    db.refresh(study_session)
    return _serialize_session(study_session)


def listar_sessoes_db(
    db: Session,
    user_id: int,
) -> list[dict[str, Any]]:
    sessions = db.scalars(
        select(StudySession)
        .where(StudySession.user_id == user_id)
        .order_by(StudySession.id)
    ).all()
    return [_serialize_session(session) for session in sessions]


def _serialize_session(session: StudySession) -> dict[str, Any]:
    return {
        "id": session.id,
        "user_id": session.user_id,
        "duration": session.duration_seconds,
        "subject": session.subject,
        "session_type": session.session_type,
        "date": session.session_date.isoformat(),
    }
