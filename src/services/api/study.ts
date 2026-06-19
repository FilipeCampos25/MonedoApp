import type { StudySessionCreate } from "../../types/api";
import { apiRequest } from "./client";
import { API_ROUTES } from "./routes";

export function createStudySession(
  token: string,
  session: StudySessionCreate,
) {
  return apiRequest(API_ROUTES.studySessions, {
    method: "POST",
    token,
    body: session,
  });
}
