from datetime import date

from sqlalchemy import (
    String,
    Boolean,
    BigInteger,
    ForeignKey,
    Text,
    Date
)

from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    title: Mapped[str] = mapped_column(
        String(120),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    priority: Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    due_date: Mapped[date] = mapped_column(
        Date
    )

    completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )