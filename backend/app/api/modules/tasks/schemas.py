from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    user_id: int = Field(gt=0)
    title: str = Field(min_length=1, max_length=120)
    priority: str
    due_date: date
    time: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None


class TaskResponse(TaskCreate):
    id: int
    completed: bool
