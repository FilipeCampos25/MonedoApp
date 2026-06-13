from datetime import date

from sqlalchemy import (
    BigInteger,
    ForeignKey,
    Integer,
    Date
)

from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class StudySession(Base):
    __tablename__ = "study_sessions"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    duration_seconds: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    session_date: Mapped[date] = mapped_column(
        Date
    )