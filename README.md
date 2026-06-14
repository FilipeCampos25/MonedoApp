# MonedoApp

Aplicativo mobile em Expo/React Native com backend FastAPI executado
separadamente.

## Frontend

Requisitos: Node.js e npm.

```bash
npm ci
npm start
```

O comando principal permanece `npm start`, equivalente a:

```bash
npx expo start
```

## Backend

Crie e ative um ambiente virtual, depois instale as dependencias:

```bash
python -m venv .venv
python -m pip install -r backend/requirements.txt
```

Copie `backend/.env.example` para `backend/.env` e configure
`DATABASE_URL`. Para desenvolvimento local, SQLite e suficiente:

```env
DATABASE_URL=sqlite:///./monedo.db
```

Exemplo PostgreSQL:

```env
DATABASE_URL=postgresql://monedo:change-me@localhost:5432/monedo
```

Inicie o backend separadamente:

```bash
cd backend
python -m uvicorn main:app --reload
```

A API fica disponivel em `http://localhost:8000` e o health check em
`http://localhost:8000/health`.

## Testes

Instale as dependencias de desenvolvimento:

```bash
python -m pip install -r backend/requirements.txt
python -m pip install -r backend/requirements-dev.txt
```

Execute toda a suite:

```bash
python -m pytest
```

Os testes HTTP usam SQLite em memoria e substituem `get_db`, portanto nao
dependem de PostgreSQL nem do banco local.

## Integracao continua

O workflow `.github/workflows/ci.yml` roda em pushes e pull requests:

- backend: instala dependencias e executa `python -m pytest`;
- frontend: executa `npm ci` e gera um bundle Android com `expo export`.

O CI nao inicia `expo start`; esse comando permanece destinado ao
desenvolvimento local.
