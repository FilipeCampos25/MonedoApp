# MonedoApp

Aplicativo Expo/React Native com API FastAPI, autenticação Bearer e persistência
SQLAlchemy.

## Frontend

Requisitos: Node.js 22.11 ou superior e npm.

```bash
cp .env.example .env
npm ci
npm start
```

Defina `EXPO_PUBLIC_API_URL` conforme o ambiente:

- web ou simulador iOS local: `http://localhost:8000`;
- emulador Android Studio: `http://10.0.2.2:8000`;
- dispositivo físico: IP LAN do computador, por exemplo `http://192.168.0.10:8000`.

### Emulador Android com VPN ou rede corporativa

Quando o emulador não consegue acessar o endereço LAN exibido pelo Metro,
encaminhe a porta pelo ADB e inicie o Expo em `localhost`. No PowerShell:

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:Path = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:Path"

adb devices
adb reverse tcp:8081 tcp:8081
adb shell am force-stop host.exp.exponent
$env:REACT_NATIVE_PACKAGER_HOSTNAME = "127.0.0.1"
npx.cmd expo start --lan -c
```

O modo `--lan` faz o Metro escutar em IPv4, enquanto
`REACT_NATIVE_PACKAGER_HOSTNAME` anuncia `127.0.0.1` ao Expo Go. O Metro deve
exibir `exp://127.0.0.1:8081`. Mantenha o backend em outro terminal, aceitando
conexões do emulador:

```powershell
cd backend
..\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0
```

## Backend

Requisitos: Python 3.12.

```bash
python -m venv .venv
python -m pip install -r backend/requirements.txt -r backend/requirements-dev.txt
cp backend/.env.example backend/.env
cd backend
python -m alembic -c alembic.ini upgrade head
python -m uvicorn main:app --reload
```

A API fica em `http://localhost:8000`, a documentação em `/docs` e o health
check em `/health`. Quando `DATABASE_URL` não é informado, o backend usa um
banco SQLite local.

## Qualidade e testes

```bash
python -m ruff check backend
python -m pytest --cov=backend/app --cov-report=term-missing --cov-fail-under=80
npm run lint
npm run typecheck
npm run test:coverage
npm run export:android
```

Os testes backend usam SQLite em memória. Os testes frontend simulam apenas as
fronteiras externas, como HTTP e armazenamento seguro. A aplicação de produção
não contém dados mockados.

## Integração contínua

Como a raiz Git é o diretório pai de `MonedoApp`, o workflow está em
`../.github/workflows/ci.yml`. Em pushes e pull requests ele executa lint,
typecheck, testes com cobertura e exportação do bundle Android.
