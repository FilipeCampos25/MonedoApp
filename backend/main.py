from app.db.base import Base
from app.db.session import engine

from app.db.models.user import User
from app.db.models.task import Task
from app.db.models.study_session import StudySession

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import router as api_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Monedo API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
