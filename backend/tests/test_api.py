from datetime import date, timedelta

import httpx
import pytest
from app.db.models.user import User
from sqlalchemy import select
from sqlalchemy.orm import Session

PASSWORD = "senha-segura"


async def register(
    client: httpx.AsyncClient,
    username: str = "maria",
) -> dict:
    response = await client.post(
        "/auth/register",
        json={"username": username, "password": PASSWORD},
    )
    assert response.status_code == 201
    return response.json()


def auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_public_health_and_metadata(client: httpx.AsyncClient):
    health = await client.get("/health")
    metadata = await client.get("/metadata/form-options")

    assert health.json() == {"status": "ok"}
    assert metadata.status_code == 200
    assert metadata.json()["priorities"] == ["baixa", "media", "alta", "urgente"]
    assert "Matemática" in metadata.json()["subjects"]


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("GET", "/auth/me"),
        ("GET", "/tasks"),
        ("GET", "/study/sessions"),
        ("GET", "/dashboard"),
        ("GET", "/preferences"),
    ],
)
async def test_protected_routes_require_bearer(
    client: httpx.AsyncClient,
    method: str,
    path: str,
):
    response = await client.request(method, path)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_register_hashes_password_and_token(
    client: httpx.AsyncClient,
    db_session: Session,
):
    session = await register(client)
    user = db_session.scalar(select(User).where(User.username == "maria"))

    assert session["username"] == "maria"
    assert session["token"]
    assert user is not None
    assert user.password_hash != PASSWORD
    assert user.auth_token != session["token"]
    assert len(user.auth_token) == 64
    me = await client.get("/auth/me", headers=auth(session["token"]))
    assert me.json() == {"user_id": user.id, "username": "maria"}


@pytest.mark.asyncio
async def test_register_rejects_duplicate_and_invalid_payload(client: httpx.AsyncClient):
    await register(client)
    duplicate = await client.post(
        "/auth/register",
        json={"username": "maria", "password": PASSWORD},
    )
    invalid = await client.post(
        "/auth/register",
        json={"username": "ab", "password": "curta"},
    )

    assert duplicate.status_code == 409
    assert invalid.status_code == 422


@pytest.mark.asyncio
async def test_login_rotates_token_and_rejects_wrong_password(client: httpx.AsyncClient):
    original = await register(client)
    wrong = await client.post(
        "/auth/login",
        json={"username": "maria", "password": "senha-errada"},
    )
    login = await client.post(
        "/auth/login",
        json={"username": "maria", "password": PASSWORD},
    )

    assert wrong.status_code == 401
    assert login.status_code == 200
    assert login.json()["token"] != original["token"]
    assert (await client.get("/auth/me", headers=auth(original["token"]))).status_code == 401
    assert (await client.get("/auth/me", headers=auth(login.json()["token"]))).status_code == 200


@pytest.mark.asyncio
async def test_logout_invalidates_token(client: httpx.AsyncClient):
    session = await register(client)
    response = await client.post("/auth/logout", headers=auth(session["token"]))

    assert response.status_code == 204
    assert (await client.get("/auth/me", headers=auth(session["token"]))).status_code == 401


@pytest.mark.asyncio
async def test_task_lifecycle_and_user_isolation(client: httpx.AsyncClient):
    first = await register(client, "maria")
    second = await register(client, "joana")
    task_response = await client.post(
        "/tasks",
        headers=auth(first["token"]),
        json={
            "title": "Prova de Matemática",
            "priority": "alta",
            "due_date": (date.today() + timedelta(days=1)).isoformat(),
            "time": "14:00",
            "category": "Matemática",
            "description": "Revisar capítulos",
        },
    )

    assert task_response.status_code == 201
    task = task_response.json()
    assert task["completed"] is False
    assert (await client.get("/tasks", headers=auth(second["token"]))).json() == []
    forbidden = await client.patch(
        f"/tasks/{task['id']}/complete",
        headers=auth(second["token"]),
    )
    completed = await client.patch(
        f"/tasks/{task['id']}/complete",
        headers=auth(first["token"]),
    )
    assert forbidden.status_code == 404
    assert completed.json()["completed"] is True


@pytest.mark.asyncio
async def test_preferences_default_update_and_validation(client: httpx.AsyncClient):
    session = await register(client)
    headers = auth(session["token"])

    assert (await client.get("/preferences", headers=headers)).json() == {
        "daily_goal_seconds": 14400
    }
    updated = await client.put(
        "/preferences",
        headers=headers,
        json={"daily_goal_seconds": 7200},
    )
    invalid = await client.put(
        "/preferences",
        headers=headers,
        json={"daily_goal_seconds": 60},
    )
    assert updated.json() == {"daily_goal_seconds": 7200}
    assert invalid.status_code == 422


@pytest.mark.asyncio
async def test_sessions_feed_dashboard_distribution_and_streak(client: httpx.AsyncClient):
    session = await register(client)
    headers = auth(session["token"])
    for duration, subject, session_date in [
        (3600, "Matemática", date.today()),
        (1800, "Português", date.today()),
        (1800, "Matemática", date.today() - timedelta(days=1)),
    ]:
        response = await client.post(
            "/study/sessions",
            headers=headers,
            json={
                "duration": duration,
                "subject": subject,
                "session_type": "Revisão de conteúdo",
                "date": session_date.isoformat(),
            },
        )
        assert response.status_code == 201

    sessions = await client.get("/study/sessions", headers=headers)
    dashboard = (await client.get("/dashboard", headers=headers)).json()

    assert len(sessions.json()) == 3
    assert dashboard["today"]["study_seconds"] == 5400
    assert dashboard["today"]["sessions"] == 2
    assert dashboard["streak_days"] == 2
    assert sum(dashboard["week"]["study_seconds_by_day"]) >= 5400
    percentages = {item["subject"]: item["percentage"] for item in dashboard["subjects"]}
    assert percentages["Matemática"] > percentages["Português"]


@pytest.mark.asyncio
async def test_empty_dashboard_has_real_zero_state(client: httpx.AsyncClient):
    session = await register(client)
    dashboard = (
        await client.get("/dashboard", headers=auth(session["token"]))
    ).json()

    assert dashboard["today"]["study_seconds"] == 0
    assert dashboard["week"]["study_seconds_by_day"] == [0] * 7
    assert dashboard["subjects"] == []
    assert dashboard["streak_days"] == 0
