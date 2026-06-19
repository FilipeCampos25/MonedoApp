from datetime import date, datetime, timedelta, timezone

import httpx
import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.refresh_session import RefreshSession
from app.db.models.study_session import StudySession
from app.db.models.task import Task
from app.db.models.user import User


PASSWORD = "senha-segura"


async def register(
    client: httpx.AsyncClient,
    email: str = "maria@example.com",
) -> dict:
    response = await client.post(
        "/auth/register",
        json={"email": email, "password": PASSWORD},
    )
    assert response.status_code == 201, response.text
    return response.json()


def auth_headers(tokens: dict) -> dict[str, str]:
    return {"Authorization": f"Bearer {tokens['access_token']}"}


async def create_task(
    client: httpx.AsyncClient,
    tokens: dict,
) -> dict:
    response = await client.post(
        "/tasks",
        headers=auth_headers(tokens),
        json={
            "title": "Prova de Matematica",
            "priority": "alta",
            "due_date": date.today().isoformat(),
            "time": "14:00",
            "category": "Matematica",
            "description": "Revisar capitulos 1 a 4",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


async def create_study_session(
    client: httpx.AsyncClient,
    tokens: dict,
) -> dict:
    response = await client.post(
        "/study/sessions",
        headers=auth_headers(tokens),
        json={
            "duration": 3600,
            "subject": "Matematica",
            "session_type": "Revisao",
            "date": date.today().isoformat(),
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


@pytest.mark.asyncio
async def test_health_and_ready(client: httpx.AsyncClient):
    health = await client.get("/health")
    ready = await client.get("/ready")

    assert health.status_code == 200
    assert health.json() == {"status": "ok"}
    assert ready.status_code == 200
    assert ready.json() == {"status": "ready"}


@pytest.mark.asyncio
async def test_register_normalizes_email_and_hashes_password(
    client: httpx.AsyncClient,
    db_session: Session,
):
    tokens = await register(client, "Maria@Example.com")

    assert tokens["user"]["email"] == "maria@example.com"
    assert tokens["token_type"] == "bearer"
    assert tokens["expires_in"] == 900
    assert tokens["access_token"]
    assert tokens["refresh_token"]

    user = db_session.scalar(
        select(User).where(User.email == "maria@example.com")
    )
    assert user is not None
    assert user.username == "maria@example.com"
    assert user.password_hash != PASSWORD


@pytest.mark.asyncio
async def test_duplicate_registration_returns_conflict(
    client: httpx.AsyncClient,
):
    await register(client)
    response = await client.post(
        "/auth/register",
        json={"email": "MARIA@example.com", "password": PASSWORD},
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_me_and_invalid_password(client: httpx.AsyncClient):
    registered = await register(client)

    login = await client.post(
        "/auth/login",
        json={"email": "maria@example.com", "password": PASSWORD},
    )
    invalid = await client.post(
        "/auth/login",
        json={"email": "maria@example.com", "password": "senha-errada"},
    )
    me = await client.get("/auth/me", headers=auth_headers(registered))

    assert login.status_code == 200
    assert login.json()["user"] == registered["user"]
    assert invalid.status_code == 401
    assert me.status_code == 200
    assert me.json() == registered["user"]


@pytest.mark.asyncio
async def test_refresh_rotates_token_and_rejects_reuse(
    client: httpx.AsyncClient,
):
    registered = await register(client)
    refreshed = await client.post(
        "/auth/refresh",
        json={"refresh_token": registered["refresh_token"]},
    )
    reused = await client.post(
        "/auth/refresh",
        json={"refresh_token": registered["refresh_token"]},
    )

    assert refreshed.status_code == 200
    assert (
        refreshed.json()["refresh_token"]
        != registered["refresh_token"]
    )
    assert reused.status_code == 401


@pytest.mark.asyncio
async def test_logout_revokes_refresh_token(client: httpx.AsyncClient):
    registered = await register(client)
    logout = await client.post(
        "/auth/logout",
        json={"refresh_token": registered["refresh_token"]},
    )
    refresh = await client.post(
        "/auth/refresh",
        json={"refresh_token": registered["refresh_token"]},
    )

    assert logout.status_code == 204
    assert refresh.status_code == 401


@pytest.mark.asyncio
async def test_expired_refresh_token_is_rejected(
    client: httpx.AsyncClient,
    db_session: Session,
):
    registered = await register(client)
    refresh_session = db_session.scalar(select(RefreshSession))
    assert refresh_session is not None
    refresh_session.expires_at = datetime.now(timezone.utc) - timedelta(days=1)
    db_session.commit()

    response = await client.post(
        "/auth/refresh",
        json={"refresh_token": registered["refresh_token"]},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_protected_routes_require_bearer_token(
    client: httpx.AsyncClient,
):
    for method, path in [
        ("GET", "/auth/me"),
        ("GET", "/tasks"),
        ("GET", "/study/sessions"),
        ("GET", "/dashboard"),
    ]:
        response = await client.request(method, path)
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_tasks_are_persisted_completed_and_isolated(
    client: httpx.AsyncClient,
    db_session: Session,
):
    maria = await register(client)
    ana = await register(client, "ana@example.com")
    task = await create_task(client, maria)

    maria_tasks = await client.get(
        "/tasks",
        headers=auth_headers(maria),
    )
    ana_tasks = await client.get(
        "/tasks",
        headers=auth_headers(ana),
    )
    forbidden_complete = await client.patch(
        f"/tasks/{task['id']}/complete",
        headers=auth_headers(ana),
    )
    completed = await client.patch(
        f"/tasks/{task['id']}/complete",
        headers=auth_headers(maria),
    )

    assert maria_tasks.json()[0]["category"] == "Matematica"
    assert ana_tasks.json() == []
    assert forbidden_complete.status_code == 404
    assert completed.status_code == 200
    assert completed.json()["completed"] is True
    assert db_session.scalar(select(Task)).completed is True


@pytest.mark.asyncio
async def test_task_validation_returns_422(client: httpx.AsyncClient):
    tokens = await register(client)
    response = await client.post(
        "/tasks",
        headers=auth_headers(tokens),
        json={
            "title": "Tarefa",
            "priority": "invalida",
            "due_date": date.today().isoformat(),
            "time": "25:00",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_sessions_and_dashboard_use_authenticated_data(
    client: httpx.AsyncClient,
    db_session: Session,
):
    tokens = await register(client)
    task = await create_task(client, tokens)
    await client.patch(
        f"/tasks/{task['id']}/complete",
        headers=auth_headers(tokens),
    )
    created_session = await create_study_session(client, tokens)

    sessions = await client.get(
        "/study/sessions",
        headers=auth_headers(tokens),
    )
    dashboard = await client.get(
        "/dashboard",
        headers=auth_headers(tokens),
    )

    assert sessions.status_code == 200
    assert sessions.json() == [created_session]
    assert db_session.scalar(select(StudySession)) is not None

    payload = dashboard.json()
    assert payload["today"] == {"study_seconds": 3600, "sessions": 1}
    assert payload["tasks"]["completed"] == 1
    assert sum(payload["week"]["study_seconds_by_day"]) == 3600
    assert payload["subjects"] == [
        {"subject": "Matematica", "study_seconds": 3600}
    ]
