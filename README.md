# MonedoApp

Aplicativo de organizacao de estudos com Expo SDK 54 e backend FastAPI.
Autenticacao, tarefas, cronometro e dashboard usam dados persistidos pelo
backend.

## Requisitos

- Node.js 20 LTS
- Python 3.12
- Expo Go compativel com SDK 54
- PostgreSQL ou SQLite para desenvolvimento local

## Rodar frontend e backend juntos

Execute os comandos abaixo a partir da pasta `MonedoApp`.

### 1. Configurar variaveis de ambiente

Crie `backend/.env`:

```powershell
Copy-Item backend\.env.example backend\.env
```

Para rodar local com SQLite, deixe assim:

```env
DATABASE_URL=sqlite:///./monedo.db
JWT_SECRET_KEY=use-um-segredo-longo-e-aleatorio
APP_TIMEZONE=America/Sao_Paulo
CORS_ORIGINS=*
```

Crie `.env` na raiz do app:

```powershell
Copy-Item .env.example .env
```

Se for usar no navegador/emulador no mesmo computador:

```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
```

Se for usar Expo Go em celular fisico, troque pelo IP LAN do computador:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LAN:8000
```

No Windows, veja o IP com:

```powershell
ipconfig
```

Use o IPv4 da rede Wi-Fi/Ethernet, por exemplo
`EXPO_PUBLIC_API_URL=http://192.168.0.10:8000`.

### 2. Instalar dependencias

Backend:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\.venv\Scripts\python.exe -m pip install -r backend\requirements-dev.txt
```

Frontend:

```powershell
npm ci
```

### 3. Preparar o banco

```powershell
Set-Location backend
..\.venv\Scripts\python.exe -m alembic upgrade head
Set-Location ..
```

### 4. Subir o backend

Abra o primeiro terminal em `MonedoApp`:

```powershell
Set-Location backend
..\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Confira:

- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/ready`
- `http://127.0.0.1:8000/docs`

### 5. Subir o frontend

Abra um segundo terminal em `MonedoApp`:

```powershell
npm start
```

Depois:

- Para celular fisico: escaneie o QR Code no Expo Go.
- Para Android emulator: pressione `a`.
- Para web: pressione `w`.

O backend precisa continuar rodando no primeiro terminal enquanto o Expo roda
no segundo. Se usar celular fisico, computador e celular precisam estar na
mesma rede, e o firewall deve permitir a porta `8000`.

Se o app mostrar erro como `Nao foi possivel acessar http://...`, confira se
`EXPO_PUBLIC_API_URL` usa o IP atual do computador e a porta `8000`. Quando
alterar `.env`, pare o Expo e rode `npm start` novamente para a nova URL entrar
no bundle.

## Backend

Crie o ambiente virtual e instale as dependencias:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\.venv\Scripts\python.exe -m pip install -r backend\requirements-dev.txt
```

Copie `backend/.env.example` para `backend/.env` e configure:

```env
DATABASE_URL=sqlite:///./monedo.db
JWT_SECRET_KEY=use-um-segredo-longo-e-aleatorio
APP_TIMEZONE=America/Sao_Paulo
CORS_ORIGINS=*
```

Antes de iniciar a API, aplique as migracoes:

```powershell
Set-Location backend
..\.venv\Scripts\python.exe -m alembic upgrade head
..\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0
```

Endpoints de verificacao:

- `GET /health`: processo ativo
- `GET /ready`: conexao com o banco ativa
- documentacao: `http://localhost:8000/docs`

## Frontend

Copie `.env.example` para `.env`. Para Expo Go em aparelho fisico, use o IP
LAN do computador:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.10:8000
```

Instale e inicie:

```powershell
npm ci
npm start
```

O computador e o aparelho devem estar na mesma rede. O firewall precisa
permitir a porta `8000`.

## API

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `GET|POST /tasks`
- `PATCH /tasks/{task_id}/complete`
- `GET|POST /study/sessions`
- `GET /dashboard`

Tarefas, sessoes e dashboard exigem `Authorization: Bearer <access_token>`.
O backend identifica o usuario pelo JWT; o cliente nao envia `user_id`.

## Testes

```powershell
.\.venv\Scripts\python.exe -m pytest
npm run typecheck
npm test
npx expo export --platform android
```

Os testes backend usam SQLite isolado e incluem uma migracao a partir do
schema antigo. O CI tambem executa `alembic upgrade head` em PostgreSQL 18.

## Migracao de producao

Antes de atualizar um PostgreSQL existente:

```powershell
pg_dump "$env:DATABASE_URL" --format=custom --file=monedo-backup.dump
Set-Location backend
..\.venv\Scripts\python.exe -m alembic upgrade head
..\.venv\Scripts\python.exe scripts\smoke_neon.py
```

Use uma versao de `pg_dump` compativel com o servidor PostgreSQL de producao.
O backup deve ser guardado fora do repositorio. Nunca coloque
`DATABASE_URL`, `JWT_SECRET_KEY` ou tokens em arquivos versionados.

`npm audit fix` pode resolver apenas parte das vulnerabilidades mantendo Expo
SDK 54. As correcoes restantes exigem upgrade major do Expo/React Native e
devem ser tratadas em uma migracao separada.
