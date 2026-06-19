from __future__ import annotations

import hashlib
import hmac
import secrets
from collections.abc import Mapping
from typing import Any

ITERACOES_HASH = 600_000
TAMANHO_SALT = 16
TAMANHO_TOKEN = 32
TAMANHO_MINIMO_SENHA = 8


def hash_senha(password: str) -> dict[str, str]:
    validar_senha(password)

    salt = secrets.token_bytes(TAMANHO_SALT)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        ITERACOES_HASH,
    )
    return {
        "algoritmo": "pbkdf2_sha256",
        "iteracoes": str(ITERACOES_HASH),
        "salt": salt.hex(),
        "hash": password_hash.hex(),
    }


def verificar_senha(password: str, senha_salva: Mapping[str, Any]) -> bool:
    if not isinstance(password, str) or not isinstance(senha_salva, Mapping):
        return False

    try:
        salt = bytes.fromhex(str(senha_salva["salt"]))
        hash_salvo = str(senha_salva["hash"])
        iteracoes = int(senha_salva.get("iteracoes", ITERACOES_HASH))
    except (KeyError, TypeError, ValueError):
        return False

    if not salt or not hash_salvo or iteracoes <= 0:
        return False

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        iteracoes,
    ).hex()
    return hmac.compare_digest(password_hash, hash_salvo)


def gerar_token() -> str:
    return secrets.token_hex(TAMANHO_TOKEN)


def hash_token(token: str) -> str:
    if not isinstance(token, str) or not token:
        raise ValueError("Token nao pode estar vazio.")
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def validar_token(token_input: str, token_salvo: str) -> bool:
    if not isinstance(token_input, str) or not isinstance(token_salvo, str):
        return False
    if not token_input or not token_salvo:
        return False
    return hmac.compare_digest(token_input, token_salvo)


def validar_usuario(username: str, contexto: str) -> bool:
    if contexto not in {"login", "cadastro"}:
        raise ValueError("Contexto invalido. Use 'login' ou 'cadastro'.")

    validar_username(username)
    return True


def validar_username(username: str) -> None:
    if not isinstance(username, str) or not username.strip():
        raise ValueError("Usuario nao pode estar vazio.")
    if len(username.strip()) < 3:
        raise ValueError("Usuario precisa ter pelo menos 3 caracteres.")
    if len(username.strip()) > 80:
        raise ValueError("Usuario pode ter no maximo 80 caracteres.")


def validar_senha(password: str) -> None:
    if not isinstance(password, str) or not password:
        raise ValueError("Senha nao pode estar vazia.")
    if len(password) < TAMANHO_MINIMO_SENHA:
        raise ValueError(
            f"Senha precisa ter pelo menos {TAMANHO_MINIMO_SENHA} caracteres."
        )


def validar_dados(username: str, password: str) -> tuple[bool, str | None]:
    try:
        validar_username(username)
        validar_senha(password)
    except ValueError as exc:
        return False, str(exc)
    return True, None
