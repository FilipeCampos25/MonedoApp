from collections import defaultdict
from datetime import date, timedelta
from typing import Any

from app.api.modules.preferences.repository import obter_preferencias
from app.api.modules.study.repository import listar_sessoes_db
from app.api.modules.tasks.repository import listar_tarefas
from sqlalchemy.orm import Session


def obter_dashboard(user_id: int, db: Session) -> dict[str, Any]:
    sessions = listar_sessoes_db(db, user_id)
    tasks = listar_tarefas(db, user_id)
    preferences = obter_preferencias(db, user_id)
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    durations_by_day: dict[date, int] = defaultdict(int)
    sessions_by_day: dict[date, int] = defaultdict(int)
    subjects: dict[str, int] = defaultdict(int)
    study_dates: set[date] = set()

    for session in sessions:
        session_date = date.fromisoformat(str(session["date"]))
        duration = int(session["duration"])
        study_dates.add(session_date)
        durations_by_day[session_date] += duration
        sessions_by_day[session_date] += 1
        if week_start <= session_date <= week_start + timedelta(days=6):
            subjects[str(session["subject"])] += duration

    weekly_seconds = [
        durations_by_day[week_start + timedelta(days=offset)]
        for offset in range(7)
    ]
    weekly_total = sum(weekly_seconds)
    daily_goal = preferences["daily_goal_seconds"]
    today_seconds = durations_by_day[today]

    subject_summary = [
        {
            "subject": subject,
            "study_seconds": duration,
            "percentage": round(duration / weekly_total * 100),
        }
        for subject, duration in sorted(
            subjects.items(),
            key=lambda item: (-item[1], item[0]),
        )
    ] if weekly_total else []

    return {
        "today": {
            "study_seconds": today_seconds,
            "sessions": sessions_by_day[today],
            "daily_goal_seconds": daily_goal,
            "goal_progress_percent": min(
                100,
                round(today_seconds / daily_goal * 100),
            ),
        },
        "week": {
            "study_seconds_by_day": weekly_seconds,
            "total_seconds": weekly_total,
        },
        "tasks": {
            "total": len(tasks),
            "completed": sum(1 for task in tasks if task["completed"]),
            "pending": sum(1 for task in tasks if not task["completed"]),
        },
        "streak_days": _calculate_streak(study_dates, today),
        "subjects": subject_summary,
    }


def _calculate_streak(study_dates: set[date], today: date) -> int:
    cursor = today if today in study_dates else today - timedelta(days=1)
    streak = 0
    while cursor in study_dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak
