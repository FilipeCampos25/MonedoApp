from pydantic import BaseModel, Field


class PreferencesResponse(BaseModel):
    daily_goal_seconds: int


class PreferencesUpdate(BaseModel):
    daily_goal_seconds: int = Field(ge=30 * 60, le=12 * 60 * 60)
