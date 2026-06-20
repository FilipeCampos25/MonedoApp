"""Establish the current Monedo core schema.

Revision ID: 20260615_01
Revises:
Create Date: 2026-06-15
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260615_01"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if "users" in inspector.get_table_names():
        return

    identifier = sa.BigInteger().with_variant(sa.Integer(), "sqlite")
    op.create_table(
        "users",
        sa.Column("id", identifier, primary_key=True, autoincrement=True),
        sa.Column("username", sa.String(80), nullable=False, unique=True),
        sa.Column("email", sa.String(255), nullable=True, unique=True),
        sa.Column("password_algorithm", sa.String(30), nullable=False),
        sa.Column("password_iterations", sa.Integer(), nullable=False),
        sa.Column("password_salt", sa.String(64), nullable=False),
        sa.Column("password_hash", sa.String(128), nullable=False),
        sa.Column("auth_token", sa.String(255), nullable=False),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_table(
        "tasks",
        sa.Column("id", identifier, primary_key=True, autoincrement=True),
        sa.Column(
            "user_id",
            identifier,
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column("title", sa.String(120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("priority", sa.String(10), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("time", sa.String(20), nullable=True),
        sa.Column("category", sa.String(80), nullable=True),
        sa.Column(
            "completed",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.create_table(
        "study_sessions",
        sa.Column("id", identifier, primary_key=True, autoincrement=True),
        sa.Column(
            "user_id",
            identifier,
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column("duration_seconds", sa.Integer(), nullable=False),
        sa.Column("subject", sa.String(80), nullable=False),
        sa.Column("session_type", sa.String(80), nullable=True),
        sa.Column("session_date", sa.Date(), nullable=False),
    )
    op.create_table(
        "user_preferences",
        sa.Column(
            "user_id",
            identifier,
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "daily_goal_seconds",
            sa.Integer(),
            nullable=False,
            server_default="14400",
        ),
    )


def downgrade() -> None:
    for table_name in (
        "user_preferences",
        "study_sessions",
        "tasks",
        "users",
    ):
        if table_name in sa.inspect(op.get_bind()).get_table_names():
            op.drop_table(table_name)
