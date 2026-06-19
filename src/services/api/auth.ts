import type { AuthSession, CurrentUser } from "../../types/api";
import { apiRequest } from "./client";
import { API_ROUTES } from "./routes";

export function loginRequest(username: string, password: string) {
  return apiRequest<AuthSession>(API_ROUTES.auth.login, {
    method: "POST",
    body: { username, password },
  });
}

export function registerRequest(username: string, password: string) {
  return apiRequest<AuthSession>(API_ROUTES.auth.register, {
    method: "POST",
    body: { username, password },
  });
}

export function getCurrentUser(token: string) {
  return apiRequest<CurrentUser>(API_ROUTES.auth.me, { token });
}

export function logoutRequest(token: string) {
  return apiRequest<void>(API_ROUTES.auth.logout, { method: "POST", token });
}
