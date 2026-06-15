from fastapi import APIRouter

from app.api.routes.auth import router as auth_router


router = APIRouter()
router.include_router(auth_router)

# A verificacao mantem compatibilidade com o FastAPI minimo usado nos testes
# legados de autenticacao. Na aplicacao real, os metodos sempre existem.
if hasattr(router, "get") and hasattr(router, "patch"):
    from app.api.modules.dashboard.routes import router as dashboard_router
    from app.api.modules.study.routes import router as study_router
    from app.api.modules.tasks.routes import router as tasks_router

    router.include_router(tasks_router)
    router.include_router(study_router)
    router.include_router(dashboard_router)
