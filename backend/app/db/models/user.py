from sqlalchemy import (
    String,
    Boolean,
    BigInteger,
    DateTime
)

from sqlalchemy.orm import Mapped, mapped_column

from datetime import datetime

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    username: Mapped[str] = mapped_column(
        String(80),
        unique=True,
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=True
    )

    password_algorithm: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="pbkdf2_sha256"
    )

    password_iterations: Mapped[int]

    password_salt: Mapped[str] = mapped_column(
        String(64),
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        String(128),
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )