import * as SecureStore from "expo-secure-store";
import React from "react";
import { Pressable, Text } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import {
  getCurrentUser,
  loginRequest,
  logoutRequest,
  registerRequest,
} from "../../services/api";
import { AuthProvider, useAuth } from "../AuthContext";

jest.mock("../../services/api", () => ({
  getCurrentUser: jest.fn(),
  loginRequest: jest.fn(),
  logoutRequest: jest.fn(),
  registerRequest: jest.fn(),
}));

const loginMock = loginRequest as jest.Mock;
const registerMock = registerRequest as jest.Mock;
const meMock = getCurrentUser as jest.Mock;
const logoutMock = logoutRequest as jest.Mock;
const getStoredToken = SecureStore.getItemAsync as jest.Mock;

function Probe() {
  const auth = useAuth();
  return (
    <>
      <Text>{auth.loading ? "loading" : auth.user?.username || "anonymous"}</Text>
      <Pressable accessibilityLabel="login" onPress={() => void auth.signIn("maria", "senha-segura")} />
      <Pressable accessibilityLabel="register" onPress={() => void auth.register("joana", "senha-segura")} />
      <Pressable accessibilityLabel="logout" onPress={() => void auth.signOut()} />
    </>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  getStoredToken.mockResolvedValue(null);
});

it("restores a valid stored session", async () => {
  getStoredToken.mockResolvedValue("saved-token");
  meMock.mockResolvedValue({ user_id: 1, username: "maria" });
  const screen = await render(<AuthProvider><Probe /></AuthProvider>);

  await waitFor(() => expect(screen.getByText("maria")).toBeTruthy());
  expect(meMock).toHaveBeenCalledWith("saved-token");
});

it("removes an invalid stored session", async () => {
  getStoredToken.mockResolvedValue("expired-token");
  meMock.mockRejectedValue(new Error("expired"));
  const screen = await render(<AuthProvider><Probe /></AuthProvider>);

  await waitFor(() => expect(screen.getByText("anonymous")).toBeTruthy());
  expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
});

it("supports login, logout and registration", async () => {
  loginMock.mockResolvedValue({ user_id: 1, username: "maria", token: "login-token" });
  registerMock.mockResolvedValue({ user_id: 2, username: "joana", token: "register-token" });
  logoutMock.mockResolvedValue(undefined);
  const screen = await render(<AuthProvider><Probe /></AuthProvider>);
  await waitFor(() => expect(screen.getByText("anonymous")).toBeTruthy());

  await fireEvent.press(screen.getByLabelText("login"));
  await waitFor(() => expect(screen.getByText("maria")).toBeTruthy());
  expect(SecureStore.setItemAsync).toHaveBeenCalledWith("monedo.auth_token", "login-token");

  await fireEvent.press(screen.getByLabelText("logout"));
  await waitFor(() => expect(screen.getByText("anonymous")).toBeTruthy());
  expect(logoutMock).toHaveBeenCalledWith("login-token");

  await fireEvent.press(screen.getByLabelText("register"));
  await waitFor(() => expect(screen.getByText("joana")).toBeTruthy());
});
