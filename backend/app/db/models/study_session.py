from datetime import date

from app.db.base import Base
from sqlalchemy import (
    BigInteger,
    Date,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column


class StudySession(Base):
    __tablename__ = "study_sessions"

    id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        primary_key=True,
        autoincrement=True,
    )

    user_id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("users.id"),
        nullable=False,
    )

    duration_seconds: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    subject: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
    )

    session_type: Mapped[str | None] = mapped_column(
        String(80),
        nullable=True,
    )

    session_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        default=date.today,
    )
