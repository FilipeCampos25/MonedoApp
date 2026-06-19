import type { Preferences } from "../../types/api";
import { apiRequest } from "./client";
import { API_ROUTES } from "./routes";

export function getPreferences(token: string) {
  return apiRequest<Preferences>(API_ROUTES.preferences, { token });
}

export function updatePreferences(token: string, dailyGoalSeconds: number) {
  return apiRequest<Preferences>(API_ROUTES.preferences, {
    method: "PUT",
    token,
    body: { daily_goal_seconds: dailyGoalSeconds },
  });
}
