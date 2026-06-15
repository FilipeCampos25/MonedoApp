from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class StudySessionCreate(BaseModel):
    user_id: int = Field(gt=0)
    duration: int = Field(gt=0, description="Duracao em segundos.")
    subject: str = Field(min_length=1, max_length=80)
    session_type: Optional[str] = Field(default=None, max_length=80)
    date: Optional[date] = None
