import pathlib
import sys
import tempfile
import unittest
from datetime import date

from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import sessionmaker


BACKEND_DIR = pathlib.Path(__file__).resolve().parents[1] / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.api.modules.auth.service import autenticar_usuario, registrar_usuario
from app.api.modules.dashboard.service import obter_dashboard
from app.api.modules.study.service import listar_sessoes, registrar_sessao
from app.api.modules.tasks.service import (
    concluir_tarefa,
    criar_tarefa,
    listar_tarefas,
)
from app.db.base import Base
from app.db.models.study_session import StudySession
from app.db.models.task import Task
from app.db.models.user import User


class DatabasePersistenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp_dir = tempfile.TemporaryDirectory()
        database_path = pathlib.Path(cls.temp_dir.name) / "test.db"
        cls.engine = create_engine(f"sqlite:///{database_path.as_posix()}")
        cls.SessionTesting = sessionmaker(
            bind=cls.engine,
            autoflush=False,
            expire_on_commit=False,
        )
        Base.metadata.create_all(bind=cls.engine)

    @classmethod
    def tearDownClass(cls):
        cls.engine.dispose()
        cls.temp_dir.cleanup()

    def setUp(self):
        with self.engine.begin() as connection:
            for table in reversed(Base.metadata.sorted_tables):
                connection.execute(table.delete())
        self.db = self.SessionTesting()

    def tearDown(self):
        self.db.close()

    def test_register_and_login_use_persisted_password_hash(self):
        register_result = registrar_usuario(
            "alice",
            "password-123",
            "device-token",
            self.db,
        )

        self.assertTrue(register_result["success"])
        user = self.db.scalar(select(User).where(User.username == "alice"))
        self.assertIsNotNone(user)
        self.assertNotEqual(user.password_hash, "password-123")
        self.assertEqual(
            self.db.scalar(select(func.count()).select_from(User)),
            1,
        )

        self.db.close()
        self.db = self.SessionTesting()
        login_result = autenticar_usuario(
            "alice",
            "password-123",
            "device-token",
            self.db,
        )

        self.assertTrue(login_result["success"])
        self.assertEqual(login_result["data"]["user_id"], user.id)

    def test_tasks_sessions_and_dashboard_persist_between_sessions(self):
        registrar_usuario(
            "maria",
            "password-123",
            "device-token",
            self.db,
        )
        user = self.db.scalar(select(User).where(User.username == "maria"))

        task_result = criar_tarefa(
            user.id,
            {
                "user_id": user.id,
                "title": "Prova de Matematica",
                "priority": "alta",
                "due_date": "2026-06-15",
                "time": "14:00",
                "category": "Matematica",
                "description": "Revisar capitulos 1 a 4",
            },
            self.db,
        )
        session_result = registrar_sessao(
            user.id,
            {
                "duration": 3600,
                "subject": "Matematica",
                "session_type": "Revisao",
                "date": date.today().isoformat(),
            },
            self.db,
        )

        self.assertTrue(task_result["success"])
        self.assertTrue(session_result["success"])

        task_id = listar_tarefas(user.id, self.db)[0]["id"]
        self.assertTrue(concluir_tarefa(task_id, self.db)["success"])

        self.db.close()
        self.db = self.SessionTesting()
        tasks = listar_tarefas(user.id, self.db)
        sessions = listar_sessoes(user.id, self.db)
        dashboard = obter_dashboard(user.id, self.db)

        self.assertEqual(len(tasks), 1)
        self.assertTrue(tasks[0]["completed"])
        self.assertEqual(tasks[0]["category"], "Matematica")
        self.assertEqual(len(sessions), 1)
        self.assertEqual(sessions[0]["duration"], 3600)
        self.assertEqual(sessions[0]["subject"], "Matematica")
        self.assertEqual(dashboard["today"]["study_seconds"], 3600)
        self.assertEqual(dashboard["tasks"]["completed"], 1)
        self.assertEqual(
            self.db.scalar(select(func.count()).select_from(Task)),
            1,
        )
        self.assertEqual(
            self.db.scalar(select(func.count()).select_from(StudySession)),
            1,
        )


if __name__ == "__main__":
    unittest.main()
