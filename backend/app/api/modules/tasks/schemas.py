from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


Priority = Literal["baixa", "media", "alta", "urgente"]


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: Priority
    due_date: date
    time: str | None = Field(default=None, pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    category: str | None = Field(default=None, max_length=80)
    description: str | None = Field(default=None, max_length=2000)


class TaskResponse(TaskCreate):
    id: int
    completed: bool
