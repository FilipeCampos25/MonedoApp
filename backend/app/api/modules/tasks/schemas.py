from datetime import date

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: str
    due_date: date
    time: str | None = None
    category: str | None = None
    description: str | None = None


class TaskResponse(TaskCreate):
    id: int
    user_id: int
    completed: bool
