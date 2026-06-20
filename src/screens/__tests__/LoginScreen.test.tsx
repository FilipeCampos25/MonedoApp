import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { useAuth } from "../../context/AuthContext";
import LoginScreen from "../LoginScreen";

jest.mock("../../context/AuthContext", () => ({ useAuth: jest.fn() }));

const useAuthMock = useAuth as jest.Mock;
const signIn = jest.fn();
const register = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useAuthMock.mockReturnValue({ signIn, register });
});

it("validates credentials before calling the API", async () => {
  const screen = await render(<LoginScreen />);
  await fireEvent.press(screen.getByText("Entrar"));

  expect(screen.getByText(/Informe seu usuário ou e-mail/)).toBeTruthy();
  expect(signIn).not.toHaveBeenCalled();
});

it("logs in and displays server errors", async () => {
  signIn.mockRejectedValue(new Error("Credenciais inválidas."));
  const screen = await render(<LoginScreen />);
  await fireEvent.changeText(screen.getByPlaceholderText("usuário ou email@exemplo.com"), "maria");
  await fireEvent.changeText(screen.getByPlaceholderText("Mínimo de 8 caracteres"), "senha-segura");
  await fireEvent.press(screen.getByText("Entrar"));

  await waitFor(() => expect(signIn).toHaveBeenCalledWith("maria", "senha-segura"));
  expect(await screen.findByText("Credenciais inválidas.")).toBeTruthy();
});

it("switches to registration mode", async () => {
  register.mockResolvedValue(undefined);
  const screen = await render(<LoginScreen />);
  await fireEvent.press(screen.getByText("Ainda não tem conta? Cadastre-se"));
  await fireEvent.changeText(screen.getByPlaceholderText("seu_usuario"), "joana");
  await fireEvent.changeText(screen.getByPlaceholderText("email@exemplo.com"), "joana@example.com");
  await fireEvent.changeText(screen.getByPlaceholderText("Mínimo de 8 caracteres"), "senha-segura");
  await fireEvent.press(screen.getByText("Cadastrar"));

  await waitFor(() => expect(register).toHaveBeenCalledWith("joana", "joana@example.com", "senha-segura"));
});
