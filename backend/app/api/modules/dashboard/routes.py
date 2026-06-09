from fastapi import APIRouter

from app.api.modules.dashboard.service import obter_dashboard


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard(user_id: int):
    return obter_dashboard(user_id)
