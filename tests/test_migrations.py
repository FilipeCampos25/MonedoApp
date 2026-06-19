from pathlib import Path
import sys

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect, text


PROJECT_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = PROJECT_DIR / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


def test_migration_preserves_old_schema_user(tmp_path, monkeypatch):
    database_path = tmp_path / "old-schema.db"
    database_url = f"sqlite:///{database_path.as_posix()}"
    engine = create_engine(database_url)
    with engine.begin() as connection:
        connection.execute(
            text(
                """
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username VARCHAR(80) NOT NULL UNIQUE,
                    email VARCHAR(255) UNIQUE,
                    password_algorithm VARCHAR(30) NOT NULL,
                    password_iterations INTEGER NOT NULL,
                    password_salt VARCHAR(64) NOT NULL,
                    password_hash VARCHAR(128) NOT NULL,
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
                CREATE TABLE tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    title VARCHAR(120) NOT NULL,
                    description TEXT,
                    priority VARCHAR(10) NOT NULL,
                    due_date DATE NOT NULL,
                    completed BOOLEAN NOT NULL
                )
                """
            )
        )
        connection.execute(
            text(
                """
                CREATE TABLE study_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    duration_seconds INTEGER NOT NULL,
                    session_date DATE NOT NULL
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
                    is_active, created_at, updated_at
                ) VALUES (
                    'Existing@Example.com', 'Existing@Example.com',
                    'pbkdf2_sha256', 600000, 'salt', 'hash',
                    1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
                """
            )
        )

    monkeypatch.setenv("DATABASE_URL", database_url)
    from app.core.config import get_settings

    get_settings.cache_clear()
    config = Config(str(BACKEND_DIR / "alembic.ini"))
    config.set_main_option(
        "script_location",
        str(BACKEND_DIR / "migrations"),
    )
    command.upgrade(config, "head")

    inspector = inspect(engine)
    assert set(inspector.get_table_names()) >= {
        "users",
        "tasks",
        "study_sessions",
        "refresh_sessions",
    }
    assert {"time", "category"} <= {
        column["name"] for column in inspector.get_columns("tasks")
    }
    assert {"subject", "session_type"} <= {
        column["name"]
        for column in inspector.get_columns("study_sessions")
    }
    with engine.connect() as connection:
        user = connection.execute(
            text("SELECT id, username, email FROM users")
        ).mappings().one()
    assert user["id"] == 1
    assert user["username"] == "Existing@Example.com"
    assert user["email"] == "existing@example.com"

    get_settings.cache_clear()
