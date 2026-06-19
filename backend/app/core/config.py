from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[2]
DEFAULT_DATABASE_URL = f"sqlite:///{(BACKEND_DIR / 'monedo.db').as_posix()}"

load_dotenv(BACKEND_DIR / ".env")


def _database_url() -> str:
    value = os.getenv("DATABASE_URL", "").strip() or DEFAULT_DATABASE_URL
    if value.startswith("postgres://"):
        return value.replace("postgres://", "postgresql+psycopg2://", 1)
    if value.startswith("postgresql://"):
        return value.replace("postgresql://", "postgresql+psycopg2://", 1)
    return value


def _cors_origins() -> tuple[str, ...]:
    raw_value = os.getenv("CORS_ORIGINS", "*")
    origins = tuple(
        origin.strip() for origin in raw_value.split(",") if origin.strip()
    )
    return origins or ("*",)


@dataclass(frozen=True)
class Settings:
    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str
    access_token_minutes: int
    refresh_token_days: int
    app_timezone: str
    cors_origins: tuple[str, ...]


@lru_cache
def get_settings() -> Settings:
    return Settings(
        database_url=_database_url(),
        jwt_secret_key=os.getenv(
            "JWT_SECRET_KEY",
            "development-only-change-this-secret-key",
        ),
        jwt_algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
        access_token_minutes=int(os.getenv("ACCESS_TOKEN_MINUTES", "15")),
        refresh_token_days=int(os.getenv("REFRESH_TOKEN_DAYS", "30")),
        app_timezone=os.getenv("APP_TIMEZONE", "America/Sao_Paulo"),
        cors_origins=_cors_origins(),
    )
