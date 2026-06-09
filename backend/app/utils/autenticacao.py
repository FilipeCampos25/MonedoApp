import hashlib
import hmac
import secrets
from typing import Dict, Tuple, Optional

# =========================
# CONFIGURACOES DE SEGURANCA
# =========================
ITERACOES_HASH = 600_000
TAMANHO_SALT = 16
TAMANHO_TOKEN = 32

# =========================
# MOCK DA FUNÇÃO DO DAVI (BANCO DE DADOS)
# =========================

usuarios_db = {}

def davi_buscar_usuario(username: str) -> bool:
    """Função simulada do Davi. Retorna True se o usuário existir no DB."""
    return username in usuarios_db

def hash_senha(password: str) -> Dict[str, str]:
    """Gera um hash seguro da senha com um salt aleatório."""
    salt = secrets.token_bytes(TAMANHO_SALT)
    senha_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        ITERACOES_HASH
    )

    return {
        "salt": salt.hex(),
        "hash": senha_hash.hex()
    }

def verificar_senha(password: str, senha_salva: Dict[str, str]) -> bool:
    """Verifica se a senha em texto plano corresponde ao hash salvo."""
    salt = bytes.fromhex(senha_salva["salt"])
    hash_salvo = senha_salva["hash"]

    senha_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        ITERACOES_HASH
    ).hex()

    return hmac.compare_digest(senha_hash, hash_salvo)

def gerar_token() -> str:
    """Gera um token de sessão seguro."""
    return secrets.token_hex(TAMANHO_TOKEN)

def validar_token(token_input: str, token_salvo: str) -> bool:
    """Valida o token usando comparação segura contra timing attacks."""
    if not token_input or not token_salvo:
        return False
    return hmac.compare_digest(token_input, token_salvo)

def validar_usuario(username: str, tipo: str) -> bool:
    
    existe = davi_buscar_usuario(username) # Chamando a função do colega

    if tipo == "login":
        return existe # Para logar, TEM que existir
    if tipo == "cadastro":
        return not existe # Para cadastrar, NÃO PODE existir

    raise ValueError("Tipo invalido. Use 'login' ou 'cadastro'.")

# VALIDACAO DE ENTRADA
def validar_dados(username: str, password: str) -> Tuple[bool, Optional[str]]:
    if not username or not username.strip():
        return False, "Usuario nao pode estar vazio"
    if not password:
        return False, "Senha nao pode estar vazia"
    if len(password) < 8:
        return False, "Senha precisa ter pelo menos 8 caracteres"
    return True, None