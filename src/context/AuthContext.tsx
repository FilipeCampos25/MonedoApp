import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUser,
  loginRequest,
  logoutRequest,
  registerRequest,
} from "../services/api";
import type { CurrentUser } from "../types/api";

const TOKEN_KEY = "monedo.auth_token";

type AuthContextValue = {
  loading: boolean;
  token: string | null;
  user: CurrentUser | null;
  signIn: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: CurrentUser) => void;
  clearSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);

  const applySession = useCallback(async (session: {
    token: string;
    user_id: number;
    username: string;
    email: string | null;
  }) => {
    await SecureStore.setItemAsync(TOKEN_KEY, session.token);
    setToken(session.token);
    setUser({
      user_id: session.user_id,
      username: session.username,
      email: session.email,
    });
  }, []);

  useEffect(() => {
    async function restoreSession() {
      try {
        const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!savedToken) return;
        const currentUser = await getCurrentUser(savedToken);
        setToken(savedToken);
        setUser(currentUser);
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    }
    void restoreSession();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      token,
      user,
      signIn: async (identifier, password) => {
        await applySession(await loginRequest(identifier, password));
      },
      register: async (username, email, password) => {
        await applySession(await registerRequest(username, email, password));
      },
      signOut: async () => {
        try {
          if (token) await logoutRequest(token);
        } finally {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      },
      updateUser: setUser,
      clearSession: async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setToken(null);
        setUser(null);
      },
    }),
    [applySession, loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
