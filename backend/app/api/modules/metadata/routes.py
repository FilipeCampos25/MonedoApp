from fastapi import APIRouter

router = APIRouter(prefix="/metadata", tags=["metadata"])

SUBJECTS = ["Matemática", "Português", "História", "Inglês"]
PRIORITIES = ["baixa", "media", "alta", "urgente"]
SESSION_TYPES = [
    "Resolução de exercícios",
    "Revisão de conteúdo",
    "Leitura guiada",
    "Simulado rápido",
]


@router.get("/form-options")
def get_form_options():
    return {
        "subjects": SUBJECTS,
        "categories": SUBJECTS,
        "priorities": PRIORITIES,
        "session_types": SESSION_TYPES,
    }
