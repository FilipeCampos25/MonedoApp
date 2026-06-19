import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { useAuth } from "../../context/AuthContext";
import { createTask, getFormOptions } from "../../services/api";
import CreateScreen from "../CreateScreen";

jest.mock("../../context/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("../../services/api", () => ({
  createTask: jest.fn(),
  getFormOptions: jest.fn(),
}));
jest.mock("@react-native-community/datetimepicker", () => {
  const { Pressable: NativePressable, Text: NativeText } = require("react-native");
  return {
    __esModule: true,
    default: ({ onChange }: { onChange: (event: { type: string }, date: Date) => void }) => (
      <NativePressable accessibilityLabel="pick-date" onPress={() => onChange({ type: "set" }, new Date(2026, 5, 20))}>
        <NativeText>date-picker</NativeText>
      </NativePressable>
    ),
  };
});
jest.mock("react-native-dropdown-picker", () => {
  const { Pressable: NativePressable, Text: NativeText } = require("react-native");
  return {
    __esModule: true,
    default: ({ items, placeholder, setValue }: { items: { value: string }[]; placeholder: string; setValue: (value: string) => void }) => (
      <NativePressable accessibilityLabel={placeholder} onPress={() => setValue(items[0]?.value)}>
        <NativeText>{placeholder}</NativeText>
      </NativePressable>
    ),
  };
});

const useAuthMock = useAuth as jest.Mock;
const createMock = createTask as jest.Mock;
const optionsMock = getFormOptions as jest.Mock;
const navigation = { navigate: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  useAuthMock.mockReturnValue({ token: "token" });
  optionsMock.mockResolvedValue({
    subjects: ["Matemática"],
    categories: ["Matemática"],
    priorities: ["alta"],
    session_types: ["Revisão"],
  });
  createMock.mockResolvedValue({ id: 1 });
});

it("validates required fields", async () => {
  const screen = await render(<CreateScreen navigation={navigation} />);
  await waitFor(() => expect(optionsMock).toHaveBeenCalled());
  await fireEvent.press(screen.getByText("Salvar atividade"));
  expect(Alert.alert).toHaveBeenCalledWith("Campos obrigatórios", expect.any(String));
});

it("creates a task using metadata and ISO date", async () => {
  const screen = await render(<CreateScreen navigation={navigation} />);
  await waitFor(() => expect(screen.getByLabelText("Selecione uma categoria")).toBeTruthy());
  await fireEvent.changeText(screen.getByPlaceholderText("Ex: Prova de Matemática"), "Prova");
  await fireEvent.press(screen.getByText("dd/mm/aaaa"));
  await fireEvent.press(screen.getByLabelText("pick-date"));
  await fireEvent.press(screen.getByLabelText("Selecione uma categoria"));
  await fireEvent.press(screen.getByLabelText("Selecione a prioridade"));
  await fireEvent.changeText(screen.getByPlaceholderText("HH:MM"), "1400");
  await fireEvent.changeText(screen.getByPlaceholderText("Detalhes..."), "Revisar");
  await fireEvent.press(screen.getByText("Salvar atividade"));

  await waitFor(() => expect(createMock).toHaveBeenCalledWith("token", {
    title: "Prova",
    due_date: "2026-06-20",
    time: "14:00",
    category: "Matemática",
    priority: "alta",
    description: "Revisar",
  }));
  expect(navigation.navigate).toHaveBeenCalledWith("Estudos");
});
