# Monedo API

Base local: `http://localhost:8000`

## Aplicacao

- `GET /health`: verifica se a API esta disponivel.

## Autenticacao

- `POST /register`: cadastra um usuario.
- `POST /login`: autentica um usuario.

Corpo das duas rotas:

```json
{
  "username": "maria",
  "password": "senha-segura",
  "token": "token-do-dispositivo"
}
```

## Tarefas

- `POST /tasks`: chama `criar_tarefa(user_id, data)`.
- `GET /tasks?user_id=1`: chama `listar_tarefas(user_id)`.
- `PATCH /tasks/{id}/complete`: chama `concluir_tarefa(id)`.

Corpo de `POST /tasks`:

```json
{
  "user_id": 1,
  "title": "Prova de Matematica",
  "priority": "alta",
  "due_date": "2026-06-15",
  "time": "14:00",
  "category": "Matematica",
  "description": "Revisar capitulos 1 a 4"
}
```

## Estudos

- `POST /study/sessions`: registra uma sessao concluida.
- `GET /study/sessions?user_id=1`: lista as sessoes do usuario.

Corpo de `POST /study/sessions`:

```json
{
  "user_id": 1,
  "duration": 3600,
  "subject": "Matematica",
  "session_type": "Revisao",
  "date": "2026-06-09"
}
```

`duration` e informada em segundos. `date` e opcional e assume a data
atual quando omitida.

## Dashboard

- `GET /dashboard?user_id=1`: retorna resumo do dia, semana e tarefas.
