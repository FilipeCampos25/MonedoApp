from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect, text

BACKEND_DIR = Path(__file__).resolve().parents[1]


def test_account_migration_preserves_user_and_seeds_defaults(
    tmp_path,
    monkeypatch,
):
    database_path = tmp_path / "legacy.db"
    database_url = f"sqlite:///{database_path.as_posix()}"
    engine = create_engine(database_url)
    with engine.begin() as connection:
        connection.execute(
            text(
                """
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username VARCHAR(80) NOT NULL UNIQUE,
                    email VARCHAR(255),
                    password_algorithm VARCHAR(30) NOT NULL,
                    password_iterations INTEGER NOT NULL,
                    password_salt VARCHAR(64) NOT NULL,
                    password_hash VARCHAR(128) NOT NULL,
                    auth_token VARCHAR(255) NOT NULL,
                    is_active BOOLEAN NOT NULL,
                    created_at TIMESTAMP NOT NULL,
                    updated_at TIMESTAMP NOT NULL
                )
                """
            )
        )
        connection.execute(
            text(
                """
                INSERT INTO users (
                    username, email, password_algorithm,
                    password_iterations, password_salt, password_hash,
                    auth_token, is_active, created_at, updated_at
                ) VALUES (
                    'legado', NULL, 'pbkdf2_sha256',
                    600000, 'salt', 'hash', 'token', 1,
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
                """
            )
        )
        connection.execute(
            text("CREATE TABLE alembic_version (version_num VARCHAR(32) NOT NULL)")
        )
        connection.execute(
            text("INSERT INTO alembic_version VALUES ('20260615_01')")
        )

    monkeypatch.setenv("DATABASE_URL", database_url)
    config = Config(str(BACKEND_DIR / "alembic.ini"))
    config.set_main_option(
        "script_location",
        str(BACKEND_DIR / "migrations"),
    )
    command.upgrade(config, "head")

    assert {"user_preferences", "user_categories", "user_subjects"} <= set(
        inspect(engine).get_table_names()
    )
    with engine.connect() as connection:
        assert connection.execute(text("SELECT COUNT(*) FROM users")).scalar_one() == 1
        assert connection.execute(
            text("SELECT daily_goal_seconds FROM user_preferences")
        ).scalar_one() == 14400
        assert connection.execute(
            text("SELECT COUNT(*) FROM user_categories")
        ).scalar_one() == 4
        assert connection.execute(
            text("SELECT COUNT(*) FROM user_subjects")
        ).scalar_one() == 4
        assert connection.execute(
            text("SELECT version_num FROM alembic_version")
        ).scalar_one() == "20260620_01"
