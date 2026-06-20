"""Add account settings and personalized options.

Revision ID: 20260620_01
Revises: 20260615_01
Create Date: 2026-06-20
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260620_01"
down_revision: str | None = "20260615_01"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

DEFAULT_OPTIONS = ["Matemática", "Português", "História", "Inglês"]


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())
    identifier = sa.BigInteger().with_variant(sa.Integer(), "sqlite")

    if "user_preferences" not in tables:
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
    if "user_categories" not in tables:
        _create_options_table("user_categories", "uq_user_category_name")
    if "user_subjects" not in tables:
        _create_options_table("user_subjects", "uq_user_subject_name")

    metadata = sa.MetaData()
    users = sa.Table("users", metadata, autoload_with=bind)
    preferences = sa.Table("user_preferences", metadata, autoload_with=bind)
    categories = sa.Table("user_categories", metadata, autoload_with=bind)
    subjects = sa.Table("user_subjects", metadata, autoload_with=bind)

    user_ids = list(bind.execute(sa.select(users.c.id)).scalars())
    for user_id in user_ids:
        has_preferences = bind.execute(
            sa.select(preferences.c.user_id).where(
                preferences.c.user_id == user_id
            )
        ).scalar_one_or_none()
        if has_preferences is None:
            bind.execute(
                preferences.insert().values(
                    user_id=user_id,
                    daily_goal_seconds=14400,
                )
            )
        for table in (categories, subjects):
            has_options = bind.execute(
                sa.select(table.c.id).where(table.c.user_id == user_id).limit(1)
            ).scalar_one_or_none()
            if has_options is None:
                bind.execute(
                    table.insert(),
                    [
                        {
                            "user_id": user_id,
                            "name": name,
                            "normalized_name": name.casefold(),
                        }
                        for name in DEFAULT_OPTIONS
                    ],
                )


def _create_options_table(table_name: str, constraint_name: str) -> None:
    identifier = sa.BigInteger().with_variant(sa.Integer(), "sqlite")
    op.create_table(
        table_name,
        sa.Column("id", identifier, primary_key=True, autoincrement=True),
        sa.Column(
            "user_id",
            identifier,
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(80), nullable=False),
        sa.Column("normalized_name", sa.String(80), nullable=False),
        sa.UniqueConstraint(
            "user_id",
            "normalized_name",
            name=constraint_name,
        ),
    )
    op.create_index(
        f"ix_{table_name}_user_id",
        table_name,
        ["user_id"],
    )


def downgrade() -> None:
    for table_name in ("user_subjects", "user_categories"):
        if table_name in sa.inspect(op.get_bind()).get_table_names():
            op.drop_table(table_name)
