from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.modules.dashboard.schemas import DashboardResponse
from app.api.modules.dashboard.service import get_dashboard
from app.core.dependencies import CurrentUser
from app.db.session import get_db


router = APIRouter(prefix="/dashboard", tags=["dashboard"])
Database = Annotated[Session, Depends(get_db)]


@router.get("", response_model=DashboardResponse)
def dashboard(
    current_user: CurrentUser,
    db: Database,
) -> dict:
    return get_dashboard(current_user.id, db)
