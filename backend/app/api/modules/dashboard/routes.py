from typing import Annotated, Any

from app.api.modules.dashboard.schemas import DashboardResponse
from app.api.modules.dashboard.service import obter_dashboard
from app.core.dependencies import get_current_user
from app.db.session import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return obter_dashboard(user["id"], db)
