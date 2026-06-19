import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

import CreateScreen from "../screens/CreateScreen";
import FocusScreen from "../screens/FocusScreen";
import HomeScreen from "../screens/HomeScreen";


const mockRequest = jest.fn();
const mockSignOut = jest.fn();

jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    request: mockRequest,
    session: {
      user: { id: 1, email: "maria@example.com" },
    },
    signOut: mockSignOut,
  }),
}));

jest.mock("@react-navigation/native", () => {
  const ReactModule = require("react");
  return {
    useFocusEffect: (callback: () => void) => {
      ReactModule.useEffect(callback, [callback]);
    },
  };
});

const dashboard = {
  today: { study_seconds: 0, sessions: 0 },
  week: {
    dates: [
      "2026-06-15",
      "2026-06-16",
      "2026-06-17",
      "2026-06-18",
      "2026-06-19",
      "2026-06-20",
      "2026-06-21",
    ],
    study_seconds_by_day: [0, 0, 0, 0, 0, 0, 0],
  },
  tasks: { total: 0, completed: 0, pending: 0, upcoming: [] },
  subjects: [],
};


describe("integrated screens", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a task and returns to Estudos", async () => {
    const navigation = { navigate: jest.fn() };
    mockRequest.mockResolvedValue({ id: 10 });
    const screen = render(
      <CreateScreen
        navigation={navigation as never}
        route={{ key: "add", name: "Adicionar" } as never}
      />,
    );

    fireEvent.changeText(
      screen.getByPlaceholderText("Ex: Prova de Matematica"),
      "Prova final",
    );
    fireEvent.press(screen.getByText("Salvar tarefa"));

    await waitFor(() =>
      expect(mockRequest).toHaveBeenCalledWith(
        "/tasks",
        expect.objectContaining({
          method: "POST",
          body: expect.objectContaining({ title: "Prova final" }),
        }),
      ),
    );
    expect(navigation.navigate).toHaveBeenCalledWith(
      "Estudos",
      expect.objectContaining({ refresh: expect.any(Number) }),
    );
  });

  it("completes a task from the home screen", async () => {
    const task = {
      id: 7,
      title: "Lista de exercicios",
      priority: "media",
      due_date: "2026-06-15",
      time: null,
      category: null,
      description: null,
      completed: false,
    };
    mockRequest.mockImplementation((path: string, options?: { method?: string }) => {
      if (path === "/dashboard") {
        return Promise.resolve({
          ...dashboard,
          tasks: { total: 1, completed: 0, pending: 1, upcoming: [task] },
        });
      }
      if (path === "/tasks" && !options) {
        return Promise.resolve([task]);
      }
      return Promise.resolve({ ...task, completed: true });
    });

    const screen = render(<HomeScreen />);
    await waitFor(() => screen.getByText("Lista de exercicios"));
    fireEvent.press(screen.getByLabelText("Concluir Lista de exercicios"));

    await waitFor(() =>
      expect(mockRequest).toHaveBeenCalledWith(
        "/tasks/7/complete",
        { method: "PATCH" },
      ),
    );
  });

  it("sends the timer duration to the backend", async () => {
    jest.useFakeTimers();
    mockRequest.mockImplementation((path: string) => {
      if (path === "/dashboard") {
        return Promise.resolve(dashboard);
      }
      return Promise.resolve({
        id: 1,
        duration: 1,
        subject: "Geral",
        session_type: "Foco",
        date: "2026-06-15",
      });
    });

    const screen = render(<FocusScreen />);
    fireEvent.press(screen.getByText("Iniciar"));
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    fireEvent.press(screen.getByText("Parar"));

    await waitFor(() =>
      expect(mockRequest).toHaveBeenCalledWith(
        "/study/sessions",
        expect.objectContaining({
          method: "POST",
          body: expect.objectContaining({
            duration: 1,
            subject: "Geral",
          }),
        }),
      ),
    );
    jest.useRealTimers();
  });
});
