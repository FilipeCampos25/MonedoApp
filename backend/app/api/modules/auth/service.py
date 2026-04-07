from __future__ import annotations

from typing import Any, Callable

from app.api.modules.auth import repository as auth_repository
from app.core import security
from app.utils import validators


# Mensagem publica e generica usada no login para evitar expor detalhes sensiveis.
LOGIN_ERROR_MESSAGE = "Credenciais invalidas."
# Mensagem padrao usada quando o cadastro falha sem uma causa publica especifica.
REGISTER_ERROR_MESSAGE = "Nao foi possivel registrar o usuario."


def autenticar_usuario(username: str, password: str, token: str) -> dict[str, Any]:
    # Esta funcao centraliza o fluxo de autenticacao.
    # Ela nao valida manualmente, nao consulta banco diretamente e nao aplica hash.
    # O papel dela e orquestrar as chamadas das camadas corretas e devolver um retorno padronizado.
    try:
        # Primeiro a service localiza a funcao de validacao de usuario disponivel no modulo de validadores.
        validar_usuario = _resolve_callable(
            validators,
            "validar_usuario",
            "validate_user",
        )
        # Depois localiza a funcao de repositorio responsavel por buscar o usuario pelo identificador recebido.
        buscar_usuario = _resolve_callable(
            auth_repository,
            "buscar_usuario",
            "obter_usuario",
            "get_user_by_username",
            "buscar_usuario_por_username",
        )
        # Em seguida localiza a funcao de seguranca que compara a senha informada com o hash persistido.
        verificar_senha = _resolve_callable(
            security,
            "verificar_senha",
            "verify_password",
            "check_password",
        )
        # Por fim localiza a funcao de seguranca que compara o token informado com o token salvo.
        validar_token = _resolve_callable(
            security,
            "validar_token",
            "verify_token",
            "check_token",
        )

        # Passo 1 do fluxo de login: validar se o username pode seguir no contexto de login.
        _executar_validacao_usuario(validar_usuario, username, "login")
        # Passo 2 do fluxo de login: buscar o usuario na camada de repositorio.
        usuario = buscar_usuario(username)
        # Se o usuario nao existir, a service interrompe o fluxo e retorna erro generico.
        if not usuario:
            return _login_error()

        # Extrai o hash da senha usando nomes de campo compativeis com possiveis implementacoes do repositorio.
        password_hash = _obter_campo_usuario(
            usuario,
            "password_hash",
            "senha_hash",
            "hashed_password",
        )
        # Extrai o token salvo do usuario para a etapa final de validacao.
        token_salvo = _obter_campo_usuario(
            usuario,
            "token",
            "auth_token",
            "token_salvo",
        )

        # Passo 3 do fluxo de login: verificar se a senha informada corresponde ao hash salvo.
        if not verificar_senha(password, password_hash):
            return _login_error()
        # Passo 4 do fluxo de login: validar se o token informado corresponde ao token salvo.
        if not validar_token(token, token_salvo):
            return _login_error()

        # Se todas as etapas anteriores passarem, a service extrai o identificador do usuario autenticado.
        user_id = _obter_campo_usuario(usuario, "id", "user_id", "usuario_id")
        # O retorno de sucesso do login segue o contrato pedido: success, data com user_id e error nulo.
        return _build_response(True, {"user_id": user_id}, None)
    except Exception:
        # Qualquer falha no login retorna a mesma mensagem publica para nao vazar detalhes internos.
        return _login_error()


def registrar_usuario(username: str, password: str, token: str) -> dict[str, Any]:
    # Esta funcao centraliza o fluxo de cadastro.
    # Ela delega validacao, protecao da senha e persistencia para os modulos apropriados.
    try:
        # Localiza a funcao de validacao usada para verificar o username no contexto de cadastro.
        validar_usuario = _resolve_callable(
            validators,
            "validar_usuario",
            "validate_user",
        )
        # Localiza a funcao de repositorio que consulta se o usuario ja existe.
        buscar_usuario = _resolve_callable(
            auth_repository,
            "buscar_usuario",
            "obter_usuario",
            "get_user_by_username",
            "buscar_usuario_por_username",
        )
        # Localiza a funcao de seguranca responsavel por gerar o hash da senha.
        hash_senha = _resolve_callable(
            security,
            "hash_senha",
            "gerar_hash_senha",
            "hash_password",
            "get_password_hash",
        )
        # Localiza a funcao de repositorio que efetivamente cria o usuario.
        criar_usuario = _resolve_callable(
            auth_repository,
            "criar_usuario",
            "create_user",
            "inserir_usuario",
        )

        # Passo 1 do fluxo de cadastro: validar o username para o contexto de registro.
        _executar_validacao_usuario(validar_usuario, username, "cadastro")
        # Passo 2 do fluxo de cadastro: verificar no repositorio se ja existe usuario com esse identificador.
        usuario_existente = buscar_usuario(username)
        # Se ja existir, o cadastro nao segue para nao permitir duplicidade.
        if usuario_existente:
            return _build_response(False, None, "Usuario ja existe.")

        # Passo 3 do fluxo de cadastro: transformar a senha em hash pela camada de seguranca.
        password_hash = hash_senha(password)
        # Passo 4 do fluxo de cadastro: delegar a persistencia do novo usuario ao repositorio.
        criar_usuario(username, password_hash, token)
        # O retorno de sucesso do cadastro segue o contrato pedido: success, data nulo e error nulo.
        return _build_response(True, None, None)
    except Exception as exc:
        # No cadastro, o erro retorna em formato padronizado usando uma mensagem publica adequada.
        return _build_response(False, None, _public_error_message(exc, REGISTER_ERROR_MESSAGE))


def _resolve_callable(module: Any, *names: str) -> Callable[..., Any]:
    # Esta funcao auxiliar procura dinamicamente uma funcao existente no modulo informado.
    # Ela permite integrar a service aos nomes reais que o restante do time vier a usar.
    for name in names:
        candidate = getattr(module, name, None)
        if callable(candidate):
            return candidate
    # Se nenhuma funcao compativel existir, a service falha explicitamente para sinalizar integracao incompleta.
    available_names = ", ".join(names)
    raise AttributeError(f"Nenhuma funcao disponivel encontrada: {available_names}")


def _executar_validacao_usuario(
    validar_usuario: Callable[..., Any],
    username: str,
    contexto: str,
) -> None:
    # Esta funcao auxiliar executa a validacao de usuario usando a funcao vinda da camada de validadores.
    # Ela considera falha tanto quando a funcao retorna False quanto quando retorna um dict com success=False.
    resultado = validar_usuario(username, contexto)
    if resultado is False:
        raise ValueError("Validacao de usuario falhou.")
    if isinstance(resultado, dict) and resultado.get("success") is False:
        raise ValueError(resultado.get("error") or "Validacao de usuario falhou.")


def _obter_campo_usuario(usuario: Any, *campos: str) -> Any:
    # Esta funcao auxiliar extrai dados do usuario sem assumir um formato unico.
    # Ela aceita tanto dict quanto objeto, buscando os nomes de campo informados na ordem recebida.
    for campo in campos:
        if isinstance(usuario, dict) and campo in usuario:
            return usuario[campo]
        if hasattr(usuario, campo):
            return getattr(usuario, campo)
    # Se nenhum nome esperado existir, a integracao com o repositorio ainda nao esta completa.
    raise AttributeError(f"Campo ausente no usuario: {', '.join(campos)}")


def _public_error_message(exc: Exception, fallback: str) -> str:
    # Esta funcao auxiliar normaliza a mensagem de erro publica.
    # Se a excecao nao trouxer texto util, a service usa a mensagem padrao recebida.
    message = str(exc).strip()
    return message or fallback


def _login_error() -> dict[str, Any]:
    # Esta funcao auxiliar concentra o formato de erro do login.
    # O user_id permanece explicito como None para manter o contrato de resposta consistente.
    return _build_response(False, {"user_id": None}, LOGIN_ERROR_MESSAGE)


def _build_response(success: bool, data: Any, error: str | None) -> dict[str, Any]:
    # Esta funcao auxiliar monta o payload padronizado usado por todas as saidas da service.
    return {
        "success": success,
        "data": data,
        "error": error,
    }
