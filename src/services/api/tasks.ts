import type { Task, TaskCreate } from "../../types/api";
import { apiRequest } from "./client";
import { API_ROUTES } from "./routes";

export function getTasks(token: string) {
  return apiRequest<Task[]>(API_ROUTES.tasks, { token });
}

export function createTask(token: string, task: TaskCreate) {
  return apiRequest<Task>(API_ROUTES.tasks, {
    method: "POST",
    token,
    body: task,
  });
}

export function completeTask(token: string, taskId: number) {
  return apiRequest<Task>(`${API_ROUTES.tasks}/${taskId}/complete`, {
    method: "PATCH",
    token,
  });
}
