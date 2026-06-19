from __future__ import annotations

from datetime import date
from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.models.study_session import StudySession


def create_session(
    db: Session,
    user_id: int,
    data: dict[str, Any],
) -> StudySession:
    study_session = StudySession(
        user_id=user_id,
        duration_seconds=int(data["duration"]),
        subject=str(data["subject"]).strip(),
        session_type=_clean_optional(data.get("session_type")),
        session_date=data.get("date") or date.today(),
    )
    db.add(study_session)
    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise
    db.refresh(study_session)
    return study_session


def list_sessions(db: Session, user_id: int) -> list[StudySession]:
    return list(
        db.scalars(
            select(StudySession)
            .where(StudySession.user_id == user_id)
            .order_by(StudySession.session_date.desc(), StudySession.id.desc())
        ).all()
    )


def serialize_session(session: StudySession) -> dict[str, Any]:
    return {
        "id": session.id,
        "duration": session.duration_seconds,
        "subject": session.subject,
        "session_type": session.session_type,
        "date": session.session_date,
    }


def _clean_optional(value: Any) -> str | None:
    if value is None:
        return None
    normalized = str(value).strip()
    return normalized or None
