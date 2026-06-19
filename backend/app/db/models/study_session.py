from datetime import date

from sqlalchemy import (
    BigInteger,
    Date,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class StudySession(Base):
    __tablename__ = "study_sessions"

    id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        primary_key=True,
        autoincrement=True,
    )

    user_id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("users.id", ondelete="CASCADE"),
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
