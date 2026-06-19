import pytest
from app.core.security import hash_senha, hash_token, verificar_senha


def test_password_hash_round_trip():
    saved = hash_senha("senha-segura")
    assert saved["hash"] != "senha-segura"
    assert verificar_senha("senha-segura", saved) is True
    assert verificar_senha("senha-errada", saved) is False


def test_token_hash_is_deterministic_and_rejects_empty():
    assert hash_token("token") == hash_token("token")
    assert hash_token("token") != "token"
    with pytest.raises(ValueError):
        hash_token("")
