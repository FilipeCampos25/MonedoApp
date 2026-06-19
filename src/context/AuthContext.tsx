import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";

import {
  ApiError,
  ApiRequestOptions,
  AuthSession,
  apiRequest,
} from "../services/api";


const STORAGE_KEY = "monedo.auth.session";

type AuthContextValue = {
  session: AuthSession | null;
  restoring: boolean;
  busy: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  request: <T>(
    path: string,
    options?: ApiRequestOptions,
  ) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);


export function AuthProvider({ children }: React.PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [busy, setBusy] = useState(false);
  const sessionRef = useRef<AuthSession | null>(null);
  const refreshPromise = useRef<Promise<AuthSession> | null>(null);

  const applySession = useCallback(async (next: AuthSession | null) => {
    sessionRef.current = next;
    setSession(next);
    if (next) {
      await writeStoredSession(next);
    } else {
      await deleteStoredSession();
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    readStoredSession()
      .then((stored) => {
        if (mounted && stored) {
          sessionRef.current = stored;
          setSession(stored);
        }
      })
      .finally(() => {
        if (mounted) {
          setRestoring(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const refresh = useCallback(async (): Promise<AuthSession> => {
    const current = sessionRef.current;
    if (!current) {
      throw new ApiError(401, "Sessao indisponivel.", null);
    }
    if (!refreshPromise.current) {
      refreshPromise.current = apiRequest<AuthSession>("/auth/refresh", {
        method: "POST",
        body: { refresh_token: current.refresh_token },
      })
        .then(async (next) => {
          await applySession(next);
          return next;
        })
        .catch(async (error) => {
          await applySession(null);
          throw error;
        })
        .finally(() => {
          refreshPromise.current = null;
        });
    }
    return refreshPromise.current;
  }, [applySession]);

  const request = useCallback(
    async <T,>(
      path: string,
      options: ApiRequestOptions = {},
    ): Promise<T> => {
      const current = sessionRef.current;
      if (!current) {
        throw new ApiError(401, "Entre novamente para continuar.", null);
      }
      try {
        return await apiRequest<T>(path, {
          ...options,
          accessToken: current.access_token,
        });
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          throw error;
        }
        const next = await refresh();
        return apiRequest<T>(path, {
          ...options,
          accessToken: next.access_token,
        });
      }
    },
    [refresh],
  );

  const authenticate = useCallback(
    async (
      path: "/auth/login" | "/auth/register",
      email: string,
      password: string,
    ) => {
      setBusy(true);
      try {
        const next = await apiRequest<AuthSession>(path, {
          method: "POST",
          body: { email: email.trim().toLowerCase(), password },
        });
        await applySession(next);
      } finally {
        setBusy(false);
      }
    },
    [applySession],
  );

  const signOut = useCallback(async () => {
    const current = sessionRef.current;
    setBusy(true);
    try {
      if (current) {
        await apiRequest<void>("/auth/logout", {
          method: "POST",
          body: { refresh_token: current.refresh_token },
        }).catch(() => undefined);
      }
    } finally {
      await applySession(null);
      setBusy(false);
    }
  }, [applySession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      restoring,
      busy,
      signIn: (email, password) =>
        authenticate("/auth/login", email, password),
      signUp: (email, password) =>
        authenticate("/auth/register", email, password),
      signOut,
      request,
    }),
    [authenticate, busy, request, restoring, session, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}


async function writeStoredSession(session: AuthSession): Promise<void> {
  const value = JSON.stringify(session);
  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(STORAGE_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(STORAGE_KEY, value);
}


async function readStoredSession(): Promise<AuthSession | null> {
  const value =
    Platform.OS === "web"
      ? globalThis.localStorage?.getItem(STORAGE_KEY) || null
      : await SecureStore.getItemAsync(STORAGE_KEY);
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as AuthSession;
  } catch {
    await deleteStoredSession();
    return null;
  }
}


async function deleteStoredSession(): Promise<void> {
  if (Platform.OS === "web") {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}
