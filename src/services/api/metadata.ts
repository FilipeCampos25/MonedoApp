import type { FormOptions } from "../../types/api";
import { apiRequest } from "./client";
import { API_ROUTES } from "./routes";

export function getFormOptions() {
  return apiRequest<FormOptions>(API_ROUTES.metadata);
}
