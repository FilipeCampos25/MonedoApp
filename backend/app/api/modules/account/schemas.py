from pydantic import BaseModel, EmailStr, Field


class AccountOption(BaseModel):
    id: int
    name: str


class AccountResponse(BaseModel):
    user_id: int
    username: str
    email: str | None
    daily_goal_seconds: int
    categories: list[AccountOption]
    subjects: list[AccountOption]


class ProfileUpdate(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    email: EmailStr


class ProfileResponse(BaseModel):
    user_id: int
    username: str
    email: str | None


class AccountDelete(BaseModel):
    password: str = Field(min_length=8, max_length=128)


class OptionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)


class OptionUpdate(OptionCreate):
    pass
