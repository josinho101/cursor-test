import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { loginWithCredentials } from "../services/authService.js";
import {
  clearAuthSession,
  readAuthSession,
  writeAuthSession
} from "../services/authSessionStorage.js";
import { authSessionInvalidatedEvent, requestAuthSessionReset } from "./authEvents.js";
import { isJwtExpired, parseJwtPayload } from "../utils/jwtUtils.js";

const AuthContext = createContext(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}

function userFromTokenPayload(payload) {
  if (!payload) return null;
  const id = typeof payload.sub === "string" ? payload.sub : String(payload.sub ?? "");
  const name =
    typeof payload.name === "string"
      ? payload.name
      : typeof payload.email === "string"
        ? payload.email
        : "User";
  const role = typeof payload.role === "string" ? payload.role : "user";
  const email = typeof payload.email === "string" ? payload.email : null;
  if (!id) return null;
  return { id, name, role, email };
}

function buildInitialState() {
  return {
    isAuthenticated: false,
    user: null
  };
}

function readPersistedAuthState() {
  const session = readAuthSession();
  if (!session?.accessToken) return buildInitialState();

  const payload = parseJwtPayload(session.accessToken);
  if (!payload || isJwtExpired(payload)) {
    clearAuthSession();
    return buildInitialState();
  }

  const user = userFromTokenPayload(payload);
  if (!user) {
    clearAuthSession();
    return buildInitialState();
  }

  return {
    isAuthenticated: true,
    user
  };
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(readPersistedAuthState);

  const logout = useCallback(() => {
    clearAuthSession();
    setState(buildInitialState());
  }, []);

  useEffect(() => {
    const onInvalidated = () => logout();
    window.addEventListener(authSessionInvalidatedEvent, onInvalidated);
    return () => window.removeEventListener(authSessionInvalidatedEvent, onInvalidated);
  }, [logout]);

  useEffect(() => {
    if (!state.isAuthenticated) return undefined;

    const tick = () => {
      const session = readAuthSession();
      if (!session?.accessToken) {
        requestAuthSessionReset("Your session expired. Please sign in again.");
        return;
      }
      const payload = parseJwtPayload(session.accessToken);
      if (!payload || isJwtExpired(payload)) {
        requestAuthSessionReset("Your session expired. Please sign in again.");
      }
    };

    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [state.isAuthenticated]);

  const login = useCallback(async ({ email, password }) => {
    const session = await loginWithCredentials({ email, password });
    const payload = parseJwtPayload(session.accessToken);
    if (!payload || isJwtExpired(payload)) {
      throw new Error("Received an invalid or expired token from the server.");
    }
    const user = userFromTokenPayload(payload);
    if (!user) {
      throw new Error("Token did not include recognizable user claims.");
    }
    writeAuthSession(session);
    setState({
      isAuthenticated: true,
      user
    });
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      login,
      logout
    }),
    [state.isAuthenticated, state.user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
