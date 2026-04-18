import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}

function buildInitialState() {
  return {
    isAuthenticated: false,
    user: null
  };
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(buildInitialState);

  const loginDemo = (role = "user") => {
    setState({
      isAuthenticated: true,
      user: {
        id: "demo",
        name: "Demo User",
        role
      }
    });
  };

  const logout = () => setState(buildInitialState());

  const value = useMemo(
    () => ({
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      loginDemo,
      logout
    }),
    [state.isAuthenticated, state.user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

