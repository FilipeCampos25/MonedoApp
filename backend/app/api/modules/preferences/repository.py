from app.db.models.user_preference import UserPreference
from sqlalchemy.orm import Session

DEFAULT_DAILY_GOAL_SECONDS = 4 * 60 * 60


def obter_preferencias(db: Session, user_id: int) -> dict[str, int]:
    preferences = db.get(UserPreference, user_id)
    return {
        "daily_goal_seconds": (
            preferences.daily_goal_seconds
            if preferences
            else DEFAULT_DAILY_GOAL_SECONDS
        )
    }


def atualizar_preferencias(
    db: Session,
    user_id: int,
    daily_goal_seconds: int,
) -> dict[str, int]:
    preferences = db.get(UserPreference, user_id)
    if preferences is None:
        preferences = UserPreference(
            user_id=user_id,
            daily_goal_seconds=daily_goal_seconds,
        )
        db.add(preferences)
    else:
        preferences.daily_goal_seconds = daily_goal_seconds

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(preferences)
    return {"daily_goal_seconds": preferences.daily_goal_seconds}
