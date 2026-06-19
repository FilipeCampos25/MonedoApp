import React from "react";
import { Alert } from "react-native";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

import { useAuth } from "../../context/AuthContext";
import { createStudySession, getDashboard, getFormOptions } from "../../services/api";
import FocusScreen from "../FocusScreen";

jest.mock("../../context/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("../../services/api", () => ({
  createStudySession: jest.fn(),
  getDashboard: jest.fn(),
  getFormOptions: jest.fn(),
}));
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback: () => void) => {
    const react = require("react");
    react.useEffect(callback, [callback]);
  },
}));

const useAuthMock = useAuth as jest.Mock;
const createMock = createStudySession as jest.Mock;
const dashboardMock = getDashboard as jest.Mock;
const optionsMock = getFormOptions as jest.Mock;

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-06-19T12:00:00Z"));
  jest.clearAllMocks();
  jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  useAuthMock.mockReturnValue({ token: "token" });
  optionsMock.mockResolvedValue({
    subjects: ["Matemática", "Português"],
    categories: ["Matemática"],
    priorities: ["alta"],
    session_types: ["Revisão", "Leitura"],
  });
  dashboardMock.mockResolvedValue({
    today: { study_seconds: 3600, sessions: 1, daily_goal_seconds: 14400, goal_progress_percent: 25 },
    week: { study_seconds_by_day: [0, 0, 0, 3600, 0, 0, 0], total_seconds: 3600 },
    tasks: { total: 0, completed: 0, pending: 0 },
    streak_days: 2,
    subjects: [],
  });
  createMock.mockResolvedValue({ id: 1 });
});

afterEach(() => {
  jest.useRealTimers();
});

it("measures elapsed wall time and persists a stopped session", async () => {
  const screen = await render(<FocusScreen />);
  expect(await screen.findByText("Matemática")).toBeTruthy();
  await fireEvent.press(screen.getByText("Iniciar"));
  await act(() => jest.advanceTimersByTime(5000));
  expect(screen.getByText("00:00:05")).toBeTruthy();
  await fireEvent.press(screen.getByText("Parar"));

  await waitFor(() => expect(createMock).toHaveBeenCalledWith("token", {
    duration: 5,
    subject: "Matemática",
    session_type: "Revisão",
  }));
  await waitFor(() => expect(screen.getByText("00:00:00")).toBeTruthy());
});

it("preserves elapsed time when persistence fails", async () => {
  createMock.mockRejectedValue(new Error("Servidor indisponível"));
  const screen = await render(<FocusScreen />);
  await screen.findByText("Matemática");
  await fireEvent.press(screen.getByText("Iniciar"));
  await act(() => jest.advanceTimersByTime(3000));
  await fireEvent.press(screen.getByText("Parar"));

  await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
  expect(screen.getByText("00:00:03")).toBeTruthy();
  expect(screen.getByText("Pausado")).toBeTruthy();
});
