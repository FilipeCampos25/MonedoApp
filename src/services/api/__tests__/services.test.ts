import {
  completeTask,
  createAccountOption,
  createStudySession,
  createTask,
  getCurrentUser,
  getAccount,
  getDashboard,
  getFormOptions,
  getPreferences,
  getTasks,
  loginRequest,
  logoutRequest,
  deleteAccount,
  deleteAccountOption,
  registerRequest,
  updatePreferences,
  updateAccountOption,
  updateProfile,
} from "..";
import { apiRequest } from "../client";

jest.mock("../client", () => ({ apiRequest: jest.fn() }));

const requestMock = apiRequest as jest.Mock;

it("maps all service calls to the canonical API contract", async () => {
  requestMock.mockResolvedValue({});

  await loginRequest("maria", "senha-segura");
  await registerRequest("maria", "maria@example.com", "senha-segura");
  await getCurrentUser("token");
  await logoutRequest("token");
  await getTasks("token");
  await createTask("token", {
    title: "Prova",
    due_date: "2026-06-20",
    time: null,
    category: "Matemática",
    priority: "alta",
    description: null,
  });
  await completeTask("token", 7);
  await getDashboard("token");
  await getFormOptions("token");
  await getPreferences("token");
  await updatePreferences("token", 7200);
  await createStudySession("token", {
    duration: 60,
    subject: "Matemática",
    session_type: "Revisão",
  });
  await getAccount("token");
  await updateProfile("token", "maria", "maria@example.com");
  await createAccountOption("token", "categories", "Ciências");
  await updateAccountOption("token", "categories", 3, "Exatas");
  await deleteAccountOption("token", "categories", 3);
  await deleteAccount("token", "senha-segura");

  expect(requestMock).toHaveBeenCalledWith("/auth/login", expect.objectContaining({ method: "POST" }));
  expect(requestMock).toHaveBeenCalledWith("/tasks/7/complete", expect.objectContaining({ method: "PATCH" }));
  expect(requestMock).toHaveBeenCalledWith("/preferences", expect.objectContaining({ body: { daily_goal_seconds: 7200 } }));
  expect(requestMock).toHaveBeenCalledWith("/account", expect.objectContaining({ method: "DELETE" }));
  expect(requestMock).toHaveBeenCalledTimes(18);
});
