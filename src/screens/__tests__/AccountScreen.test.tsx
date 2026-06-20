import React from "react";
import { Alert } from "react-native";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

import { useAuth } from "../../context/AuthContext";
import {
  createAccountOption,
  deleteAccount,
  deleteAccountOption,
  getAccount,
  updatePreferences,
  updateAccountOption,
  updateProfile,
} from "../../services/api";
import AccountScreen from "../AccountScreen";

jest.mock("../../context/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("../../services/api", () => ({
  createAccountOption: jest.fn(),
  deleteAccount: jest.fn(),
  deleteAccountOption: jest.fn(),
  getAccount: jest.fn(),
  updateAccountOption: jest.fn(),
  updatePreferences: jest.fn(),
  updateProfile: jest.fn(),
}));

const useAuthMock = useAuth as jest.Mock;
const getAccountMock = getAccount as jest.Mock;
const updateProfileMock = updateProfile as jest.Mock;
const updatePreferencesMock = updatePreferences as jest.Mock;
const createOptionMock = createAccountOption as jest.Mock;
const deleteAccountMock = deleteAccount as jest.Mock;
const deleteOptionMock = deleteAccountOption as jest.Mock;
const updateOptionMock = updateAccountOption as jest.Mock;
const updateUser = jest.fn();
const clearSession = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useAuthMock.mockReturnValue({
    token: "token",
    updateUser,
    clearSession,
  });
  getAccountMock.mockResolvedValue({
    user_id: 1,
    username: "maria",
    email: "maria@example.com",
    daily_goal_seconds: 14400,
    categories: [{ id: 1, name: "Matemática" }],
    subjects: [{ id: 2, name: "Português" }],
  });
  updateProfileMock.mockResolvedValue({
    user_id: 1,
    username: "maria_nova",
    email: "nova@example.com",
  });
  updatePreferencesMock.mockResolvedValue({ daily_goal_seconds: 16200 });
  createOptionMock.mockResolvedValue({ id: 3, name: "Ciências" });
  deleteAccountMock.mockResolvedValue(undefined);
  deleteOptionMock.mockResolvedValue(undefined);
  updateOptionMock.mockResolvedValue({ id: 1, name: "Exatas" });
  clearSession.mockResolvedValue(undefined);
});

it("renames and removes options while preserving confirmation", async () => {
  const alert = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
  const screen = await render(
    <AccountScreen navigation={{ goBack: jest.fn() }} />,
  );
  await screen.findByText("Matemática");

  await fireEvent.press(screen.getByLabelText("Editar Matemática"));
  await fireEvent.changeText(screen.getByDisplayValue("Matemática"), "Exatas");
  await fireEvent.press(screen.getByLabelText("Salvar Matemática"));
  await waitFor(() => expect(updateOptionMock).toHaveBeenCalledWith(
    "token",
    "categories",
    1,
    "Exatas",
  ));

  await fireEvent.press(screen.getByLabelText("Excluir Exatas"));
  const actions = alert.mock.calls.at(-1)?.[2];
  const destructive = actions?.find((action) => action.style === "destructive");
  await act(async () => {
    destructive?.onPress?.();
  });
  await waitFor(() => expect(deleteOptionMock).toHaveBeenCalledWith(
    "token",
    "categories",
    1,
  ));
  alert.mockRestore();
});

it("shows legacy email and validates profile and deletion inputs", async () => {
  getAccountMock.mockResolvedValueOnce({
    user_id: 1,
    username: "maria",
    email: null,
    daily_goal_seconds: 14400,
    categories: [],
    subjects: [],
  });
  const goBack = jest.fn();
  const screen = await render(<AccountScreen navigation={{ goBack }} />);
  expect(await screen.findByText(/Complete seu e-mail/)).toBeTruthy();
  expect(screen.getAllByText("Nenhuma opção cadastrada.")).toHaveLength(2);

  await fireEvent.changeText(screen.getByDisplayValue("maria"), "ab");
  await fireEvent.press(screen.getByText("Salvar perfil"));
  expect(screen.getByText(/pelo menos 3 caracteres/)).toBeTruthy();

  await fireEvent.press(screen.getByText("Excluir minha conta"));
  await fireEvent.press(screen.getByText("Excluir definitivamente"));
  expect(screen.getAllByText(/Informe sua senha atual/).length).toBeGreaterThan(0);
  await fireEvent.press(screen.getByText("Cancelar"));
  await fireEvent.press(screen.getByLabelText("Voltar"));
  expect(goBack).toHaveBeenCalled();
});

it("updates profile, goal and personalized options", async () => {
  const screen = await render(
    <AccountScreen navigation={{ goBack: jest.fn() }} />,
  );
  expect(await screen.findByText("Minha conta")).toBeTruthy();

  await fireEvent.changeText(screen.getByDisplayValue("maria"), "maria_nova");
  await fireEvent.changeText(
    screen.getByDisplayValue("maria@example.com"),
    "nova@example.com",
  );
  await fireEvent.press(screen.getByText("Salvar perfil"));
  await waitFor(() => expect(updateProfileMock).toHaveBeenCalledWith(
    "token",
    "maria_nova",
    "nova@example.com",
  ));
  expect(updateUser).toHaveBeenCalled();

  await fireEvent.press(screen.getByText("+ 30 min"));
  await fireEvent.press(screen.getByText("Salvar meta"));
  await waitFor(() => expect(updatePreferencesMock).toHaveBeenCalledWith(
    "token",
    16200,
  ));

  await fireEvent.changeText(
    screen.getByPlaceholderText("Nova categoria"),
    "Ciências",
  );
  await fireEvent.press(screen.getByLabelText("Adicionar Categorias"));
  await waitFor(() => expect(createOptionMock).toHaveBeenCalledWith(
    "token",
    "categories",
    "Ciências",
  ));
});

it("requires the current password to delete the account", async () => {
  const screen = await render(
    <AccountScreen navigation={{ goBack: jest.fn() }} />,
  );
  await screen.findByText("Excluir minha conta");
  await fireEvent.press(screen.getByText("Excluir minha conta"));
  await fireEvent.changeText(screen.getByPlaceholderText("Senha atual"), "senha-segura");
  await fireEvent.press(screen.getByText("Excluir definitivamente"));

  await waitFor(() => expect(deleteAccountMock).toHaveBeenCalledWith(
    "token",
    "senha-segura",
  ));
  expect(clearSession).toHaveBeenCalled();
});
