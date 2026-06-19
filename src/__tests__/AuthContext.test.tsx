import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { Pressable, Text } from "react-native";
import {
  act,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react-native";

import { AuthProvider, useAuth } from "../context/AuthContext";
import { AuthSession } from "../services/api";


jest.mock("expo-secure-store", () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const SESSION: AuthSession = {
  user: { id: 1, email: "maria@example.com" },
  access_token: "access-old",
  refresh_token: "refresh-old",
  token_type: "bearer",
  expires_in: 900,
};


function Probe() {
  const { restoring, session, signIn, signUp, request } = useAuth();
  const [result, setResult] = useState("");

  if (restoring) {
    return <Text>restoring</Text>;
  }

  return (
    <>
      <Text>{session?.user.email ?? "anonymous"}</Text>
      <Text>{result}</Text>
      <Pressable onPress={() => void signIn("maria@example.com", "password-1")}>
        <Text>login</Text>
      </Pressable>
      <Pressable onPress={() => void signUp("nova@example.com", "password-1")}>
        <Text>register</Text>
      </Pressable>
      <Pressable
        onPress={() =>
          void request<{ value: string }>("/protected").then((data) =>
            setResult(data.value),
          )
        }
      >
        <Text>protected</Text>
      </Pressable>
    </>
  );
}


describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    global.fetch = jest.fn();
  });

  it("logs in and persists the session", async () => {
    mockFetch(200, SESSION);
    const screen = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => screen.getByText("anonymous"));
    fireEvent.press(screen.getByText("login"));

    await waitFor(() => screen.getByText("maria@example.com"));
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalled();
  });

  it("registers a new account", async () => {
    const registered = {
      ...SESSION,
      user: { id: 2, email: "nova@example.com" },
    };
    mockFetch(201, registered);
    const screen = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => screen.getByText("anonymous"));
    fireEvent.press(screen.getByText("register"));

    await waitFor(() => screen.getByText("nova@example.com"));
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/register"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("restores and refreshes a session after one 401", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
      JSON.stringify(SESSION),
    );
    const refreshed = {
      ...SESSION,
      access_token: "access-new",
      refresh_token: "refresh-new",
    };
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(response(401, { detail: "expired" }))
      .mockResolvedValueOnce(response(200, refreshed))
      .mockResolvedValueOnce(response(200, { value: "authorized" }));

    const screen = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => screen.getByText("maria@example.com"));

    await act(async () => {
      fireEvent.press(screen.getByText("protected"));
    });

    await waitFor(() => screen.getByText("authorized"));
    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining("refresh-new"),
    );
  });
});


function mockFetch(status: number, payload: unknown) {
  (global.fetch as jest.Mock).mockResolvedValue(response(status, payload));
}


function response(status: number, payload: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
  };
}
