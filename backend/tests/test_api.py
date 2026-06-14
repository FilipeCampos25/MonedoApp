from datetime import date
import importlib

import httpx
import pytest
from fastapi import FastAPI
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.study_session import StudySession
from app.db.models.task import Task
from app.db.models.user import User


AUTH_PAYLOAD = {
    "username": "maria",
    "password": "senha-segura",
    "token": "token-do-dispositivo",
}


async def register_user(client: httpx.AsyncClient) -> int:
    register_response = await client.post("/register", json=AUTH_PAYLOAD)
    assert register_response.status_code == 200
    assert register_response.json() == {
        "success": True,
        "data": None,
        "error": None,
    }

    login_response = await client.post("/login", json=AUTH_PAYLOAD)
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert login_data["success"] is True
    return login_data["data"]["user_id"]


async def create_task(client: httpx.AsyncClient, user_id: int) -> int:
    response = await client.post(
        "/tasks",
        json={
            "user_id": user_id,
            "title": "Prova de Matematica",
            "priority": "alta",
            "due_date": "2026-06-15",
            "time": "14:00",
            "category": "Matematica",
            "description": "Revisar capitulos 1 a 4",
        },
    )
    assert response.status_code == 200
    assert response.json() == {"success": True}

    tasks_response = await client.get("/tasks", params={"user_id": user_id})
    return tasks_response.json()[0]["id"]


async def create_study_session(
    client: httpx.AsyncClient,
    user_id: int,
) -> dict:
    response = await client.post(
        "/study/sessions",
        json={
            "user_id": user_id,
            "duration": 3600,
            "subject": "Matematica",
            "session_type": "Revisao",
            "date": date.today().isoformat(),
        },
    )
    assert response.status_code == 200
    return response.json()


@pytest.mark.asyncio
async def test_health_returns_success(client: httpx.AsyncClient):
    response = await client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_register_creates_user(
    client: httpx.AsyncClient,
    db_session: Session,
):
    response = await client.post("/register", json=AUTH_PAYLOAD)

    assert response.status_code == 200
    assert response.json()["success"] is True
    user = db_session.scalar(
        select(User).where(User.username == AUTH_PAYLOAD["username"])
    )
    assert user is not None
    assert user.password_hash != AUTH_PAYLOAD["password"]


@pytest.mark.asyncio
async def test_login_authenticates_created_user(client: httpx.AsyncClient):
    user_id = await register_user(client)

    response = await client.post("/login", json=AUTH_PAYLOAD)

    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "data": {"user_id": user_id},
        "error": None,
    }


@pytest.mark.asyncio
async def test_create_task_persists_in_database(
    client: httpx.AsyncClient,
    db_session: Session,
):
    user_id = await register_user(client)

    await create_task(client, user_id)

    task = db_session.scalar(select(Task).where(Task.user_id == user_id))
    assert task is not None
    assert task.title == "Prova de Matematica"
    assert task.completed is False


@pytest.mark.asyncio
async def test_list_tasks_returns_created_task(client: httpx.AsyncClient):
    user_id = await register_user(client)
    await create_task(client, user_id)

    response = await client.get("/tasks", params={"user_id": user_id})

    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 1
    assert tasks[0]["title"] == "Prova de Matematica"
    assert tasks[0]["completed"] is False


@pytest.mark.asyncio
async def test_complete_task_updates_database(client: httpx.AsyncClient):
    user_id = await register_user(client)
    task_id = await create_task(client, user_id)

    response = await client.patch(f"/tasks/{task_id}/complete")
    tasks_response = await client.get(
        "/tasks",
        params={"user_id": user_id},
    )

    assert response.status_code == 200
    assert response.json() == {"success": True}
    assert tasks_response.json()[0]["completed"] is True


@pytest.mark.asyncio
async def test_create_study_session_persists_in_database(
    client: httpx.AsyncClient,
    db_session: Session,
):
    user_id = await register_user(client)

    response_data = await create_study_session(client, user_id)

    assert response_data["success"] is True
    study_session = db_session.scalar(
        select(StudySession).where(StudySession.user_id == user_id)
    )
    assert study_session is not None
    assert study_session.duration_seconds == 3600


@pytest.mark.asyncio
async def test_list_study_sessions_returns_created_session(
    client: httpx.AsyncClient,
):
    user_id = await register_user(client)
    await create_study_session(client, user_id)

    response = await client.get(
        "/study/sessions",
        params={"user_id": user_id},
    )

    assert response.status_code == 200
    sessions = response.json()
    assert len(sessions) == 1
    assert sessions[0]["subject"] == "Matematica"
    assert sessions[0]["duration"] == 3600


@pytest.mark.asyncio
async def test_dashboard_uses_persisted_tasks_and_sessions(
    client: httpx.AsyncClient,
):
    user_id = await register_user(client)
    task_id = await create_task(client, user_id)
    await client.patch(f"/tasks/{task_id}/complete")
    await create_study_session(client, user_id)

    response = await client.get(
        "/dashboard",
        params={"user_id": user_id},
    )

    assert response.status_code == 200
    dashboard = response.json()
    assert dashboard["today"] == {
        "study_seconds": 3600,
        "sessions": 1,
    }
    assert dashboard["tasks"] == {
        "total": 1,
        "completed": 1,
        "pending": 0,
    }
    assert sum(dashboard["week"]["study_seconds_by_day"]) == 3600


def test_fastapi_app_imports_without_error():
    main_module = importlib.import_module("main")

    assert isinstance(main_module.app, FastAPI)
