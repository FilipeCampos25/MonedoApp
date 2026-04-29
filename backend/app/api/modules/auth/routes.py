from fastapi import APIRouter
from pydantic import BaseModel

# Ajuste minimo de integracao:
# a rota passa a importar a service pelo caminho real existente no projeto.
from app.api.modules.auth.service import autenticar_usuario, registrar_usuario


router = APIRouter()


class AuthRequest(BaseModel):
    username: str
    password: str
    token: str


@router.post("/login")
def login(request: AuthRequest):
    # Esta funcao de rota recebe username, password e token no corpo da requisicao.
    # O papel dela e apenas encaminhar os dados para a service de autenticacao.
    resultado = autenticar_usuario(request.username, request.password, request.token)
    # A rota devolve exatamente a resposta padronizada produzida pela camada de servico.
    return resultado


@router.post("/register")
def register(request: AuthRequest):
    # Esta funcao de rota recebe username, password e token para o processo de cadastro.
    # O papel dela e encaminhar os dados para a service responsavel pela regra de negocio.
    resultado = registrar_usuario(request.username, request.password, request.token)
    # A rota devolve exatamente a resposta padronizada produzida pela camada de servico.
    return resultado
