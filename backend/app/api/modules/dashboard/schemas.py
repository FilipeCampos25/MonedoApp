from datetime import date

from pydantic import BaseModel

from app.api.modules.tasks.schemas import TaskResponse


class TodaySummary(BaseModel):
    study_seconds: int
    sessions: int


class WeekSummary(BaseModel):
    dates: list[date]
    study_seconds_by_day: list[int]


class TaskSummary(BaseModel):
    total: int
    completed: int
    pending: int
    upcoming: list[TaskResponse]


class SubjectSummary(BaseModel):
    subject: str
    study_seconds: int


class DashboardResponse(BaseModel):
    today: TodaySummary
    week: WeekSummary
    tasks: TaskSummary
    subjects: list[SubjectSummary]
