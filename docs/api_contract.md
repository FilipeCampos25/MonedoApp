# Monedo API

Base local: `http://localhost:8000`

## Aplicacao

- `GET /health`: liveness simples do processo.
- `GET /ready`: verifica a conexao com o banco.

## Autenticacao

- `POST /auth/register`: cadastra com email e senha.
- `POST /auth/login`: autentica com email e senha.
- `POST /auth/refresh`: rotaciona o refresh token.
- `POST /auth/logout`: revoga a sessao de refresh.
- `GET /auth/me`: retorna o usuario autenticado.

Corpo de cadastro e login:

```json
{
  "email": "maria@example.com",
  "password": "senha-segura"
}
```

Resposta de cadastro, login e refresh:

```json
{
  "user": {
    "id": 1,
    "email": "maria@example.com"
  },
  "access_token": "jwt",
  "refresh_token": "token-opaco",
  "token_type": "bearer",
  "expires_in": 900
}
```

## Tarefas

Todas as rotas exigem `Authorization: Bearer <access_token>`.
O cliente nao envia `user_id`; o backend usa o usuario autenticado pelo JWT.

- `POST /tasks`: cria uma tarefa do usuario autenticado.
- `GET /tasks`: lista tarefas do usuario autenticado.
- `PATCH /tasks/{task_id}/complete`: conclui uma tarefa do usuario autenticado.

Corpo de `POST /tasks`:

```json
{
  "title": "Prova de Matematica",
  "priority": "alta",
  "due_date": "2026-06-15",
  "time": "14:00",
  "category": "Matematica",
  "description": "Revisar capitulos 1 a 4"
}
```

## Estudos

Todas as rotas exigem `Authorization: Bearer <access_token>`.

- `POST /study/sessions`: registra uma sessao concluida.
- `GET /study/sessions`: lista sessoes do usuario autenticado.

Corpo de `POST /study/sessions`:

```json
{
  "duration": 3600,
  "subject": "Matematica",
  "session_type": "Revisao",
  "date": "2026-06-09"
}
```

`duration` e informada em segundos. `date` e opcional e assume a data
atual quando omitida.

## Dashboard

- `GET /dashboard`: retorna resumo diario, sete dias da semana, proximas
  tarefas e distribuicao semanal por materia do usuario autenticado.
