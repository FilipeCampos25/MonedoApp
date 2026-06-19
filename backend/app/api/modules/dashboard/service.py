from collections import defaultdict
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.api.modules.study.repository import list_sessions
from app.api.modules.tasks.repository import list_tasks, serialize_task
from app.core.config import get_settings


def get_dashboard(user_id: int, db: Session) -> dict:
    sessions = list_sessions(db, user_id)
    tasks = list_tasks(db, user_id)
    today = datetime.now(
        ZoneInfo(get_settings().app_timezone)
    ).date()
    week_start = today - timedelta(days=today.weekday())
    week_dates = [week_start + timedelta(days=offset) for offset in range(7)]

    durations_by_day: dict = defaultdict(int)
    durations_by_subject: dict[str, int] = defaultdict(int)
    for session in sessions:
        durations_by_day[session.session_date] += session.duration_seconds
        if session.session_date in week_dates:
            durations_by_subject[session.subject] += session.duration_seconds

    pending_tasks = [task for task in tasks if not task.completed]
    upcoming = sorted(
        (task for task in pending_tasks if task.due_date >= today),
        key=lambda task: (task.due_date, task.time or "", task.id),
    )[:4]

    return {
        "today": {
            "study_seconds": durations_by_day[today],
            "sessions": sum(
                1 for session in sessions if session.session_date == today
            ),
        },
        "week": {
            "dates": week_dates,
            "study_seconds_by_day": [
                durations_by_day[day] for day in week_dates
            ],
        },
        "tasks": {
            "total": len(tasks),
            "completed": len(tasks) - len(pending_tasks),
            "pending": len(pending_tasks),
            "upcoming": [serialize_task(task) for task in upcoming],
        },
        "subjects": [
            {"subject": subject, "study_seconds": seconds}
            for subject, seconds in sorted(
                durations_by_subject.items(),
                key=lambda item: (-item[1], item[0].lower()),
            )
        ],
    }
