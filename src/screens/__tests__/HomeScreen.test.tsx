import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { useAuth } from "../../context/AuthContext";
import {
  completeTask,
  getDashboard,
  getTasks,
  updatePreferences,
} from "../../services/api";
import type { Dashboard } from "../../types/api";
import HomeScreen from "../HomeScreen";

jest.mock("../../context/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("../../services/api", () => ({
  completeTask: jest.fn(),
  getDashboard: jest.fn(),
  getTasks: jest.fn(),
  updatePreferences: jest.fn(),
}));
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback: () => void) => {
    const react = require("react");
    react.useEffect(callback, [callback]);
  },
}));
jest.mock("react-native-chart-kit", () => {
  const { Text: NativeText } = require("react-native");
  return { BarChart: () => <NativeText>chart</NativeText> };
});

const dashboard: Dashboard = {
  today: {
    study_seconds: 3600,
    sessions: 2,
    daily_goal_seconds: 14400,
    goal_progress_percent: 25,
  },
  week: { study_seconds_by_day: [0, 3600, 0, 0, 0, 0, 0], total_seconds: 3600 },
  tasks: { total: 1, completed: 0, pending: 1 },
  streak_days: 3,
  subjects: [{ subject: "Matemática", study_seconds: 3600, percentage: 100 }],
};

const useAuthMock = useAuth as jest.Mock;
const dashboardMock = getDashboard as jest.Mock;
const tasksMock = getTasks as jest.Mock;
const completeMock = completeTask as jest.Mock;
const preferencesMock = updatePreferences as jest.Mock;
const signOut = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useAuthMock.mockReturnValue({ token: "token", user: { username: "maria" }, signOut });
  dashboardMock.mockResolvedValue(dashboard);
  tasksMock.mockResolvedValue([{
    id: 5,
    user_id: 1,
    title: "Prova",
    priority: "alta",
    due_date: "2026-06-20",
    time: "14:00",
    category: "Matemática",
    description: null,
    completed: false,
  }]);
  completeMock.mockResolvedValue({});
  preferencesMock.mockResolvedValue({ daily_goal_seconds: 16200 });
});

it("renders real dashboard data and completes a task", async () => {
  const screen = await render(<HomeScreen />);
  expect(await screen.findByText("Olá, maria")).toBeTruthy();
  expect(screen.getByText("25% da meta", { exact: false })).toBeTruthy();
  expect(screen.getByText("Matemática")).toBeTruthy();

  await fireEvent.press(screen.getByLabelText("Concluir Prova"));
  await waitFor(() => expect(completeMock).toHaveBeenCalledWith("token", 5));
  await fireEvent.press(screen.getByLabelText("Sair"));
  expect(signOut).toHaveBeenCalled();
});

it("edits the daily goal", async () => {
  const screen = await render(<HomeScreen />);
  await screen.findByText("Meta: 4h");
  await fireEvent.press(screen.getByText("Meta: 4h"));
  await fireEvent.press(screen.getByText("+ 30 min"));
  await fireEvent.press(screen.getByText("Salvar meta"));

  await waitFor(() => expect(preferencesMock).toHaveBeenCalledWith("token", 16200));
});

it("offers retry when dashboard loading fails", async () => {
  dashboardMock.mockRejectedValueOnce(new Error("Servidor indisponível"));
  const screen = await render(<HomeScreen />);
  expect(await screen.findByText("Servidor indisponível")).toBeTruthy();
  await fireEvent.press(screen.getByText("Tentar novamente"));
  await waitFor(() => expect(dashboardMock).toHaveBeenCalledTimes(2));
});
