from collections import defaultdict
from datetime import date, timedelta
from typing import Any

from sqlalchemy.orm import Session

from app.api.modules.study.repository import listar_sessoes_db
from app.api.modules.tasks.repository import listar_tarefas


def obter_dashboard(user_id: int, db: Session) -> dict[str, Any]:
    sessions = listar_sessoes_db(db, user_id)
    tasks = listar_tarefas(db, user_id)
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    durations_by_day: dict[str, int] = defaultdict(int)

    for session in sessions:
        session_date = str(session["date"])
        durations_by_day[session_date] += int(session["duration"])

    today_key = today.isoformat()
    weekly_seconds = [
        durations_by_day[(week_start + timedelta(days=offset)).isoformat()]
        for offset in range(7)
    ]

    return {
        "today": {
            "study_seconds": durations_by_day[today_key],
            "sessions": sum(
                1 for session in sessions if str(session["date"]) == today_key
            ),
        },
        "week": {"study_seconds_by_day": weekly_seconds},
        "tasks": {
            "total": len(tasks),
            "completed": sum(1 for task in tasks if task["completed"]),
            "pending": sum(1 for task in tasks if not task["completed"]),
        },
    }
