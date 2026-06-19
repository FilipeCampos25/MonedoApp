"""Align database schema and add refresh sessions.

Revision ID: 20260615_01
Revises:
Create Date: 2026-06-15
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260615_01"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _column_names(table_name: str) -> set[str]:
    inspector = sa.inspect(op.get_bind())
    return {column["name"] for column in inspector.get_columns(table_name)}


def _index_names(table_name: str) -> set[str]:
    inspector = sa.inspect(op.get_bind())
    return {index["name"] for index in inspector.get_indexes(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "users" not in tables:
        _create_current_schema()
        return

    user_columns = _column_names("users")
    if "email" not in user_columns:
        op.add_column("users", sa.Column("email", sa.String(255), nullable=True))

    op.execute(
        sa.text(
            "UPDATE users "
            "SET email = LOWER(COALESCE(NULLIF(email, ''), username))"
        )
    )
    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column(
            "email",
            existing_type=sa.String(255),
            nullable=False,
        )
        if "auth_token" in user_columns:
            batch_op.drop_column("auth_token")

    _ensure_unique_email()

    if "tasks" not in tables:
        _create_tasks()
    else:
        task_columns = _column_names("tasks")
        with op.batch_alter_table("tasks") as batch_op:
            if "time" not in task_columns:
                batch_op.add_column(
                    sa.Column("time", sa.String(20), nullable=True)
                )
            if "category" not in task_columns:
                batch_op.add_column(
                    sa.Column("category", sa.String(80), nullable=True)
                )
        _create_index_if_missing(
            "tasks",
            "ix_tasks_user_due_date",
            ["user_id", "due_date"],
        )

    if "study_sessions" not in tables:
        _create_study_sessions()
    else:
        session_columns = _column_names("study_sessions")
        if "subject" not in session_columns:
            op.add_column(
                "study_sessions",
                sa.Column("subject", sa.String(80), nullable=True),
            )
            op.execute(
                sa.text(
                    "UPDATE study_sessions SET subject = 'Geral' "
                    "WHERE subject IS NULL"
                )
            )
            with op.batch_alter_table("study_sessions") as batch_op:
                batch_op.alter_column(
                    "subject",
                    existing_type=sa.String(80),
                    nullable=False,
                )
        if "session_type" not in session_columns:
            op.add_column(
                "study_sessions",
                sa.Column("session_type", sa.String(80), nullable=True),
            )
        _create_index_if_missing(
            "study_sessions",
            "ix_study_sessions_user_date",
            ["user_id", "session_date"],
        )

    if "refresh_sessions" not in tables:
        _create_refresh_sessions()


def _create_current_schema() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("username", sa.String(80), nullable=False, unique=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column(
            "password_algorithm",
            sa.String(30),
            nullable=False,
            server_default="pbkdf2_sha256",
        ),
        sa.Column("password_iterations", sa.Integer(), nullable=False),
        sa.Column("password_salt", sa.String(64), nullable=False),
        sa.Column("password_hash", sa.String(128), nullable=False),
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
    _create_tasks()
    _create_study_sessions()
    _create_refresh_sessions()


def _create_tasks() -> None:
    op.create_table(
        "tasks",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "user_id",
            sa.BigInteger(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
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
    op.create_index(
        "ix_tasks_user_due_date",
        "tasks",
        ["user_id", "due_date"],
    )


def _create_study_sessions() -> None:
    op.create_table(
        "study_sessions",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "user_id",
            sa.BigInteger(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("duration_seconds", sa.Integer(), nullable=False),
        sa.Column("subject", sa.String(80), nullable=False),
        sa.Column("session_type", sa.String(80), nullable=True),
        sa.Column("session_date", sa.Date(), nullable=False),
    )
    op.create_index(
        "ix_study_sessions_user_date",
        "study_sessions",
        ["user_id", "session_date"],
    )


def _create_refresh_sessions() -> None:
    op.create_table(
        "refresh_sessions",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "user_id",
            sa.BigInteger(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index(
        "ix_refresh_sessions_user_id",
        "refresh_sessions",
        ["user_id"],
    )


def _ensure_unique_email() -> None:
    inspector = sa.inspect(op.get_bind())
    unique_columns = {
        tuple(item.get("column_names") or [])
        for item in inspector.get_unique_constraints("users")
    }
    if ("email",) not in unique_columns:
        if op.get_bind().dialect.name == "sqlite":
            with op.batch_alter_table("users") as batch_op:
                batch_op.create_unique_constraint(
                    "uq_users_email",
                    ["email"],
                )
        else:
            op.create_unique_constraint(
                "uq_users_email",
                "users",
                ["email"],
            )


def _create_index_if_missing(
    table_name: str,
    index_name: str,
    columns: list[str],
) -> None:
    if index_name not in _index_names(table_name):
        op.create_index(index_name, table_name, columns)


def downgrade() -> None:
    tables = set(sa.inspect(op.get_bind()).get_table_names())
    if "refresh_sessions" in tables:
        op.drop_table("refresh_sessions")

    if "study_sessions" in tables:
        indexes = _index_names("study_sessions")
        if "ix_study_sessions_user_date" in indexes:
            op.drop_index(
                "ix_study_sessions_user_date",
                table_name="study_sessions",
            )
        columns = _column_names("study_sessions")
        with op.batch_alter_table("study_sessions") as batch_op:
            if "session_type" in columns:
                batch_op.drop_column("session_type")
            if "subject" in columns:
                batch_op.drop_column("subject")

    if "tasks" in tables:
        indexes = _index_names("tasks")
        if "ix_tasks_user_due_date" in indexes:
            op.drop_index("ix_tasks_user_due_date", table_name="tasks")
        columns = _column_names("tasks")
        with op.batch_alter_table("tasks") as batch_op:
            if "category" in columns:
                batch_op.drop_column("category")
            if "time" in columns:
                batch_op.drop_column("time")

    if "users" in tables:
        with op.batch_alter_table("users") as batch_op:
            batch_op.alter_column(
                "email",
                existing_type=sa.String(255),
                nullable=True,
            )
