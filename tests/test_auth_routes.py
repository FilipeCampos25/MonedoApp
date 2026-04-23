import importlib
import importlib.util
import pathlib
import sys
import types
import unittest


BACKEND_DIR = pathlib.Path(__file__).resolve().parents[1] / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


def ensure_fastapi_module():
    if "fastapi" in sys.modules or importlib.util.find_spec("fastapi") is not None:
        return

    fastapi_module = types.ModuleType("fastapi")

    class Route:
        def __init__(self, path, endpoint, methods):
            self.path = path
            self.endpoint = endpoint
            self.methods = set(methods)

    class APIRouter:
        def __init__(self):
            self.routes = []

        def post(self, path):
            def decorator(func):
                self.routes.append(Route(path, func, {"POST"}))
                return func

            return decorator

        def include_router(self, router):
            self.routes.extend(router.routes)

    fastapi_module.APIRouter = APIRouter
    sys.modules["fastapi"] = fastapi_module


def ensure_pydantic_module():
    if "pydantic" in sys.modules or importlib.util.find_spec("pydantic") is not None:
        return

    pydantic_module = types.ModuleType("pydantic")

    class BaseModel:
        def __init__(self, **data):
            for key, value in data.items():
                setattr(self, key, value)

    pydantic_module.BaseModel = BaseModel
    sys.modules["pydantic"] = pydantic_module


def ensure_auth_service_alias():
    app_module = importlib.import_module("app")

    modules_module = sys.modules.get("app.modules")
    if modules_module is None:
        modules_module = types.ModuleType("app.modules")
        modules_module.__path__ = []
        sys.modules["app.modules"] = modules_module

    auth_module = sys.modules.get("app.modules.auth")
    if auth_module is None:
        auth_module = types.ModuleType("app.modules.auth")
        auth_module.__path__ = []
        sys.modules["app.modules.auth"] = auth_module

    service_module = sys.modules.get("app.modules.auth.service")
    if service_module is None:
        service_module = types.ModuleType("app.modules.auth.service")
        sys.modules["app.modules.auth.service"] = service_module

    if not hasattr(service_module, "autenticar_usuario"):
        service_module.autenticar_usuario = lambda username, password, token: {}

    if not hasattr(service_module, "registrar_usuario"):
        service_module.registrar_usuario = lambda username, password, token: {}

    setattr(app_module, "modules", modules_module)
    setattr(modules_module, "auth", auth_module)
    setattr(auth_module, "service", service_module)


def load_modules():
    ensure_fastapi_module()
    ensure_pydantic_module()
    ensure_auth_service_alias()

    for module_name in (
        "app.api.modules.auth.routes",
        "app.api.routes.auth",
        "app.api.router",
    ):
        sys.modules.pop(module_name, None)

    auth_routes = importlib.import_module("app.api.modules.auth.routes")
    auth_router = importlib.import_module("app.api.router")
    return auth_routes, auth_router


class AuthRoutesTests(unittest.TestCase):
    def setUp(self):
        self.auth_routes, self.api_router = load_modules()

    def test_login_forwards_request_data_and_returns_service_result(self):
        captured = {}
        expected = {"success": True, "user_id": 42}

        def fake_auth(username, password, token):
            captured["username"] = username
            captured["password"] = password
            captured["token"] = token
            return expected

        self.auth_routes.autenticar_usuario = fake_auth

        request = self.auth_routes.AuthRequest(
            username="alice",
            password="secret",
            token="token-1",
        )

        result = self.auth_routes.login(request)

        self.assertIs(result, expected)
        self.assertEqual(
            captured,
            {"username": "alice", "password": "secret", "token": "token-1"},
        )

    def test_register_forwards_request_data_and_returns_service_result(self):
        captured = {}
        expected = {"success": False}

        def fake_register(username, password, token):
            captured["username"] = username
            captured["password"] = password
            captured["token"] = token
            return expected

        self.auth_routes.registrar_usuario = fake_register

        request = self.auth_routes.AuthRequest(
            username="bob",
            password="pass-2",
            token="token-2",
        )

        result = self.auth_routes.register(request)

        self.assertIs(result, expected)
        self.assertEqual(
            captured,
            {"username": "bob", "password": "pass-2", "token": "token-2"},
        )

    def test_router_registers_login_and_register_post_routes(self):
        auth_paths = {
            route.path
            for route in self.auth_routes.router.routes
            if "POST" in route.methods
        }
        api_paths = {
            route.path
            for route in self.api_router.router.routes
            if "POST" in route.methods
        }

        self.assertEqual(auth_paths, {"/login", "/register"})
        self.assertEqual(api_paths, {"/login", "/register"})


if __name__ == "__main__":
    unittest.main()
