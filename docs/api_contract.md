# Contrato da API Monedo

Base local: `http://localhost:8000`. Erros usam o formato padrão
`{"detail": "mensagem"}` e códigos HTTP 4xx.

## Autenticação

`POST /auth/register` e `POST /auth/login` recebem:

```json
{"username": "maria", "password": "senha-segura"}
```

Cadastro retorna 201 e login retorna 200:

```json
{"user_id": 1, "username": "maria", "token": "token-bearer"}
```

- `GET /auth/me`: valida e retorna o usuário atual.
- `POST /auth/logout`: invalida o token e retorna 204.

As rotas abaixo exigem `Authorization: Bearer <token>`. O usuário é sempre
derivado do token; o cliente não envia `user_id`.

## Tarefas

- `POST /tasks`: cria e retorna uma tarefa (201).
- `GET /tasks`: lista tarefas do usuário atual.
- `PATCH /tasks/{task_id}/complete`: conclui e retorna a tarefa.

```json
{
  "title": "Prova de Matemática",
  "priority": "alta",
  "due_date": "2026-06-20",
  "time": "14:00",
  "category": "Matemática",
  "description": "Revisar capítulos"
}
```

## Estudos e dashboard

- `POST /study/sessions`: persiste uma sessão concluída (201).
- `GET /study/sessions`: lista sessões do usuário.
- `GET /dashboard`: retorna hoje, sete dias da semana, meta diária, sequência,
  totais de tarefas e distribuição semanal por matéria.

```json
{
  "duration": 3600,
  "subject": "Matemática",
  "session_type": "Revisão de conteúdo",
  "date": "2026-06-19"
}
```

`duration` é informada em segundos e `date` é opcional.

## Preferências e metadados

- `GET /preferences`: retorna `daily_goal_seconds` (padrão: 14400).
- `PUT /preferences`: aceita metas entre 1800 e 43200 segundos.
- `GET /metadata/form-options`: retorna matérias, categorias, prioridades e
  tipos de sessão usados nos formulários.
