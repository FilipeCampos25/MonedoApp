from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.router import router as api_router
from app.core.config import get_settings
from app.db.session import get_db


settings = get_settings()
app = FastAPI(title="Monedo API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=settings.cors_origins != ("*",),
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/ready", tags=["health"])
def ready(
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ready"}
