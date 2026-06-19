from __future__ import annotations

import secrets
import sys
from datetime import UTC, date, datetime
from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import text

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.session import SessionLocal  # noqa: E402
from main import app  # noqa: E402


def _assert_status(response, expected: int, label: str) -> dict:
    if response.status_code != expected:
        raise RuntimeError(
            f"{label} falhou: HTTP {response.status_code} {response.text}"
        )
    if response.status_code == 204:
        return {}
    return response.json()


def _cleanup(email: str) -> None:
    with SessionLocal() as db:
        user_id = db.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": email},
        ).scalar_one_or_none()
        if user_id is None:
            return

        for statement in (
            "DELETE FROM refresh_sessions WHERE user_id = :user_id",
            "DELETE FROM study_sessions WHERE user_id = :user_id",
            "DELETE FROM tasks WHERE user_id = :user_id",
            "DELETE FROM users WHERE id = :user_id",
        ):
            db.execute(text(statement), {"user_id": user_id})
        db.commit()


def main() -> None:
    suffix = datetime.now(UTC).strftime("%Y%m%d%H%M%S")
    email = f"monedo-smoke-{suffix}-{secrets.token_hex(3)}@example.com"
    password = f"Smoke-{secrets.token_urlsafe(16)}"
    client = TestClient(app)

    try:
        _assert_status(client.get("/ready"), 200, "ready")

        registered = _assert_status(
            client.post(
                "/auth/register",
                json={"email": email, "password": password},
            ),
            201,
            "register",
        )
        access_token = registered["access_token"]
        refresh_token = registered["refresh_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        _assert_status(
            client.post(
                "/auth/login",
                json={"email": email.upper(), "password": password},
            ),
            200,
            "login",
        )

        task = _assert_status(
            client.post(
                "/tasks",
                headers=headers,
                json={
                    "title": "Smoke test",
                    "priority": "media",
                    "due_date": date.today().isoformat(),
                    "time": "09:00",
                    "category": "Smoke",
                    "description": "Registro temporario de validacao.",
                },
            ),
            201,
            "create task",
        )
        _assert_status(client.get("/tasks", headers=headers), 200, "list tasks")
        _assert_status(
            client.patch(
                f"/tasks/{task['id']}/complete",
                headers=headers,
            ),
            200,
            "complete task",
        )

        _assert_status(
            client.post(
                "/study/sessions",
                headers=headers,
                json={
                    "duration": 600,
                    "subject": "Smoke",
                    "session_type": "Validacao",
                    "date": date.today().isoformat(),
                },
            ),
            201,
            "create study session",
        )
        _assert_status(
            client.get("/study/sessions", headers=headers),
            200,
            "list study sessions",
        )
        _assert_status(
            client.get("/dashboard", headers=headers),
            200,
            "dashboard",
        )
        _assert_status(
            client.post("/auth/logout", json={"refresh_token": refresh_token}),
            204,
            "logout",
        )
        print("Smoke test aprovado e usuario temporario removido.")
    finally:
        _cleanup(email)


if __name__ == "__main__":
    main()
