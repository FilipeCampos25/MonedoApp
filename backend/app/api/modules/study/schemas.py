from datetime import date as Date

from pydantic import BaseModel, Field


class StudySessionCreate(BaseModel):
    duration: int = Field(gt=0, le=86_400)
    subject: str = Field(min_length=1, max_length=80)
    session_type: str | None = Field(default=None, max_length=80)
    date: Date | None = None


class StudySessionResponse(BaseModel):
    id: int
    duration: int
    subject: str
    session_type: str | None
    date: Date
