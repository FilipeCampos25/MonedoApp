from typing import Annotated, Any, Literal

from app.api.modules.account import repository
from app.api.modules.account.schemas import (
    AccountDelete,
    AccountOption,
    AccountResponse,
    OptionCreate,
    OptionUpdate,
    ProfileResponse,
    ProfileUpdate,
)
from app.api.modules.account.service import delete_account
from app.core.dependencies import get_current_user
from app.db.session import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/account", tags=["account"])
OptionKind = Literal["categories", "subjects"]


@router.get("", response_model=AccountResponse)
def get_account(
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return repository.get_account(db, user["id"])


@router.patch("/profile", response_model=ProfileResponse)
def patch_profile(
    request: ProfileUpdate,
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    try:
        return repository.update_profile(
            db,
            user["id"],
            request.username,
            str(request.email),
        )
    except FileExistsError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def remove_account(
    request: AccountDelete,
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    try:
        delete_account(user, request.password, db)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    return None


def _create_option(
    kind: OptionKind,
    request: OptionCreate,
    user: dict[str, Any],
    db: Session,
):
    try:
        return repository.create_option(db, user["id"], kind, request.name)
    except FileExistsError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


def _rename_option(
    kind: OptionKind,
    option_id: int,
    request: OptionUpdate,
    user: dict[str, Any],
    db: Session,
):
    try:
        return repository.rename_option(
            db,
            user["id"],
            kind,
            option_id,
            request.name,
        )
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except FileExistsError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


def _delete_option(
    kind: OptionKind,
    option_id: int,
    user: dict[str, Any],
    db: Session,
):
    try:
        repository.delete_option(db, user["id"], kind, option_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return None


@router.post(
    "/categories",
    response_model=AccountOption,
    status_code=status.HTTP_201_CREATED,
)
def post_category(
    request: OptionCreate,
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return _create_option("categories", request, user, db)


@router.patch("/categories/{option_id}", response_model=AccountOption)
def patch_category(
    option_id: int,
    request: OptionUpdate,
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return _rename_option("categories", option_id, request, user, db)


@router.delete(
    "/categories/{option_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_category(
    option_id: int,
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return _delete_option("categories", option_id, user, db)


@router.post(
    "/subjects",
    response_model=AccountOption,
    status_code=status.HTTP_201_CREATED,
)
def post_subject(
    request: OptionCreate,
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return _create_option("subjects", request, user, db)


@router.patch("/subjects/{option_id}", response_model=AccountOption)
def patch_subject(
    option_id: int,
    request: OptionUpdate,
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return _rename_option("subjects", option_id, request, user, db)


@router.delete(
    "/subjects/{option_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_subject(
    option_id: int,
    user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return _delete_option("subjects", option_id, user, db)
