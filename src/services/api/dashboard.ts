import type { Dashboard } from "../../types/api";
import { apiRequest } from "./client";
import { API_ROUTES } from "./routes";

export function getDashboard(token: string) {
  return apiRequest<Dashboard>(API_ROUTES.dashboard, { token });
}
