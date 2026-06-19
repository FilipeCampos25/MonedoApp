from pydantic import BaseModel


class TodaySummary(BaseModel):
    study_seconds: int
    sessions: int
    daily_goal_seconds: int
    goal_progress_percent: int


class WeekSummary(BaseModel):
    study_seconds_by_day: list[int]
    total_seconds: int


class TaskSummary(BaseModel):
    total: int
    completed: int
    pending: int


class SubjectSummary(BaseModel):
    subject: str
    study_seconds: int
    percentage: int


class DashboardResponse(BaseModel):
    today: TodaySummary
    week: WeekSummary
    tasks: TaskSummary
    streak_days: int
    subjects: list[SubjectSummary]
