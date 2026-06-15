from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.modules.dashboard.service import obter_dashboard
from app.db.session import get_db


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard(user_id: int, db: Session = Depends(get_db)):
    return obter_dashboard(user_id, db)
