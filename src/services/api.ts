export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export type User = {
  id: number;
  email: string;
};

export type AuthSession = {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
};

export type Task = {
  id: number;
  title: string;
  priority: "baixa" | "media" | "alta" | "urgente";
  due_date: string;
  time: string | null;
  category: string | null;
  description: string | null;
  completed: boolean;
};

export type StudySession = {
  id: number;
  duration: number;
  subject: string;
  session_type: string | null;
  date: string;
};

export type Dashboard = {
  today: {
    study_seconds: number;
    sessions: number;
  };
  week: {
    dates: string[];
    study_seconds_by_day: number[];
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    upcoming: Task[];
  };
  subjects: Array<{
    subject: string;
    study_seconds: number;
  }>;
};

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  accessToken?: string;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body:
        options.body === undefined
          ? undefined
          : JSON.stringify(options.body),
    });
  } catch {
    throw new Error(
      `Nao foi possivel acessar ${API_BASE_URL}. Verifique o backend e a rede.`,
    );
  }

  const rawText = await response.text();
  let payload: unknown = null;
  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = rawText;
    }
  }

  if (!response.ok) {
    const detail =
      payload &&
      typeof payload === "object" &&
      "detail" in payload
        ? String(payload.detail)
        : "Erro ao comunicar com o backend.";
    throw new ApiError(response.status, detail, payload);
  }

  return payload as T;
}
