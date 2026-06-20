from __future__ import annotations

from typing import Literal

from app.api.modules.account.constants import (
    DEFAULT_DAILY_GOAL_SECONDS,
    DEFAULT_OPTIONS,
)
from app.db.models.study_session import StudySession
from app.db.models.task import Task
from app.db.models.user import User
from app.db.models.user_option import UserCategory, UserSubject
from app.db.models.user_preference import UserPreference
from sqlalchemy import delete, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

type OptionKind = Literal["categories", "subjects"]
type OptionModel = type[UserCategory] | type[UserSubject]


def normalize_option_name(value: str) -> tuple[str, str]:
    name = " ".join(value.strip().split())
    if not name:
        raise ValueError("O nome não pode estar vazio.")
    if len(name) > 80:
        raise ValueError("O nome pode ter no máximo 80 caracteres.")
    return name, name.casefold()


def seed_default_settings(db: Session, user_id: int) -> None:
    if db.get(UserPreference, user_id) is None:
        db.add(
            UserPreference(
                user_id=user_id,
                daily_goal_seconds=DEFAULT_DAILY_GOAL_SECONDS,
            )
        )

    for model in (UserCategory, UserSubject):
        has_options = db.scalar(
            select(model.id).where(model.user_id == user_id).limit(1)
        )
        if has_options is None:
            for value in DEFAULT_OPTIONS:
                name, normalized_name = normalize_option_name(value)
                db.add(
                    model(
                        user_id=user_id,
                        name=name,
                        normalized_name=normalized_name,
                    )
                )


def get_account(db: Session, user_id: int) -> dict[str, object]:
    user = db.get(User, user_id)
    if user is None:
        raise LookupError("Usuário não encontrado.")
    preferences = db.get(UserPreference, user_id)
    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "daily_goal_seconds": (
            preferences.daily_goal_seconds
            if preferences
            else DEFAULT_DAILY_GOAL_SECONDS
        ),
        "categories": list_options(db, user_id, "categories"),
        "subjects": list_options(db, user_id, "subjects"),
    }


def update_profile(
    db: Session,
    user_id: int,
    username: str,
    email: str,
) -> dict[str, object]:
    user = db.get(User, user_id)
    if user is None:
        raise LookupError("Usuário não encontrado.")

    normalized_username = username.strip()
    normalized_email = email.strip().lower()
    username_owner = db.scalar(
        select(User.id).where(
            User.username == normalized_username,
            User.id != user_id,
        )
    )
    email_owner = db.scalar(
        select(User.id).where(
            User.email == normalized_email,
            User.id != user_id,
        )
    )
    if username_owner is not None:
        raise FileExistsError("Nome de usuário já cadastrado.")
    if email_owner is not None:
        raise FileExistsError("E-mail já cadastrado.")

    user.username = normalized_username
    user.email = normalized_email
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise FileExistsError("Nome de usuário ou e-mail já cadastrado.") from exc
    db.refresh(user)
    return {"user_id": user.id, "username": user.username, "email": user.email}


def list_options(
    db: Session,
    user_id: int,
    kind: OptionKind,
) -> list[dict[str, object]]:
    model = _model_for(kind)
    values = db.scalars(
        select(model).where(model.user_id == user_id).order_by(model.id)
    ).all()
    return [{"id": value.id, "name": value.name} for value in values]


def option_exists(db: Session, user_id: int, kind: OptionKind, name: str) -> bool:
    model = _model_for(kind)
    _, normalized_name = normalize_option_name(name)
    return db.scalar(
        select(model.id).where(
            model.user_id == user_id,
            model.normalized_name == normalized_name,
        )
    ) is not None


def create_option(
    db: Session,
    user_id: int,
    kind: OptionKind,
    value: str,
) -> dict[str, object]:
    model = _model_for(kind)
    name, normalized_name = normalize_option_name(value)
    if option_exists(db, user_id, kind, name):
        raise FileExistsError("Opção já cadastrada.")
    option = model(
        user_id=user_id,
        name=name,
        normalized_name=normalized_name,
    )
    db.add(option)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise FileExistsError("Opção já cadastrada.") from exc
    db.refresh(option)
    return {"id": option.id, "name": option.name}


def rename_option(
    db: Session,
    user_id: int,
    kind: OptionKind,
    option_id: int,
    value: str,
) -> dict[str, object]:
    model = _model_for(kind)
    option = db.scalar(
        select(model).where(model.id == option_id, model.user_id == user_id)
    )
    if option is None:
        raise LookupError("Opção não encontrada.")
    name, normalized_name = normalize_option_name(value)
    duplicate = db.scalar(
        select(model.id).where(
            model.user_id == user_id,
            model.normalized_name == normalized_name,
            model.id != option_id,
        )
    )
    if duplicate is not None:
        raise FileExistsError("Opção já cadastrada.")

    previous_name = option.name
    option.name = name
    option.normalized_name = normalized_name
    if kind == "categories":
        db.execute(
            update(Task)
            .where(Task.user_id == user_id, Task.category == previous_name)
            .values(category=name)
        )
    else:
        db.execute(
            update(StudySession)
            .where(
                StudySession.user_id == user_id,
                StudySession.subject == previous_name,
            )
            .values(subject=name)
        )
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise FileExistsError("Opção já cadastrada.") from exc
    db.refresh(option)
    return {"id": option.id, "name": option.name}


def delete_option(
    db: Session,
    user_id: int,
    kind: OptionKind,
    option_id: int,
) -> None:
    model = _model_for(kind)
    option = db.scalar(
        select(model).where(model.id == option_id, model.user_id == user_id)
    )
    if option is None:
        raise LookupError("Opção não encontrada.")
    db.delete(option)
    db.commit()


def delete_account(db: Session, user_id: int) -> None:
    db.execute(delete(Task).where(Task.user_id == user_id))
    db.execute(delete(StudySession).where(StudySession.user_id == user_id))
    db.execute(delete(UserCategory).where(UserCategory.user_id == user_id))
    db.execute(delete(UserSubject).where(UserSubject.user_id == user_id))
    db.execute(delete(UserPreference).where(UserPreference.user_id == user_id))
    db.execute(delete(User).where(User.id == user_id))
    db.commit()


def _model_for(kind: OptionKind) -> OptionModel:
    return UserCategory if kind == "categories" else UserSubject
