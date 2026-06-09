from datetime import datetime
from typing import Dict, Any

def validar_tarefa(data: Dict[str, Any]) -> bool:
   
    try:
        # 1. Validação do Title (Não pode ser vazio ou apenas espaços)
        title = data.get("title")
        if not title or not str(title).strip():
            return False

        # 2. Validação da Prioridade
        # Define quais são as prioridades aceitas no seu sistema
        prioridades_validas = [
            "baixa",
            "media",
            "alta",
            "urgente",
            "low",
            "medium",
            "high",
        ]
        priority = data.get("priority")
        if not priority or str(priority).lower() not in prioridades_validas:
            return False

        # 3. Validação da Data (due_date)
        # Tenta converter a string da data para um formato real (ex: AAAA-MM-DD)
        due_date_str = data.get("due_date")
        if not due_date_str:
            return False
            
        # Tenta validar o formato de data mais comum (Ano-Mês-Dia)
        datetime.strptime(str(due_date_str), "%Y-%m-%d")
        
        # Se passou por todas as checagens sem retornar False
        return True

    except (ValueError, TypeError):
        # Se a conversão da data falhar ou vier um tipo errado, a tarefa é inválida
        return False
