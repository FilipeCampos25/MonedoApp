export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
    logout: "/auth/logout",
  },
  tasks: "/tasks",
  studySessions: "/study/sessions",
  dashboard: "/dashboard",
  preferences: "/preferences",
  metadata: "/metadata/form-options",
} as const;
