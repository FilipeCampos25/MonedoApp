from app.api.modules.account.routes import router as account_router
from app.api.modules.auth.routes import router as auth_router
from app.api.modules.dashboard.routes import router as dashboard_router
from app.api.modules.metadata.routes import router as metadata_router
from app.api.modules.preferences.routes import router as preferences_router
from app.api.modules.study.routes import router as study_router
from app.api.modules.tasks.routes import router as tasks_router
from fastapi import APIRouter

router = APIRouter()
router.include_router(auth_router)
router.include_router(tasks_router)
router.include_router(study_router)
router.include_router(dashboard_router)
router.include_router(preferences_router)
router.include_router(metadata_router)
router.include_router(account_router)
