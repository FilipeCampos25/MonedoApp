from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.modules.auth import service
from app.api.modules.auth.schemas import (
    CredentialsRequest,
    RefreshRequest,
    TokenResponse,
    UserResponse,
)
from app.core.dependencies import CurrentUser
from app.db.session import get_db


router = APIRouter(prefix="/auth", tags=["auth"])
Database = Annotated[Session, Depends(get_db)]


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(request: CredentialsRequest, db: Database) -> TokenResponse:
    return service.register(db, str(request.email), request.password)


@router.post("/login", response_model=TokenResponse)
def login(request: CredentialsRequest, db: Database) -> TokenResponse:
    return service.login(db, str(request.email), request.password)


@router.post("/refresh", response_model=TokenResponse)
def refresh(request: RefreshRequest, db: Database) -> TokenResponse:
    return service.refresh(db, request.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(request: RefreshRequest, db: Database) -> Response:
    service.logout(db, request.refresh_token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=UserResponse)
def me(current_user: CurrentUser) -> UserResponse:
    return UserResponse(id=current_user.id, email=current_user.email)
