import React, { createContext, useContext, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";

import { buildAppTheme } from "./themeTokens.js";
import { getStoredThemeMode, setStoredThemeMode } from "./themeStorage.js";

const ThemeModeContext = createContext(null);

export function useThemeMode() {
  const value = useContext(ThemeModeContext);
  if (!value) {
    throw new Error("useThemeMode must be used within AppThemeProvider");
  }
  return value;
}

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(getStoredThemeMode());

  const theme = useMemo(() => buildAppTheme(mode), [mode]);

  const setThemeMode = (nextMode) => {
    setMode(nextMode);
    setStoredThemeMode(nextMode);
  };

  const toggleThemeMode = () => {
    setThemeMode(mode === "dark" ? "light" : "dark");
  };

  const value = useMemo(
    () => ({ mode, setThemeMode, toggleThemeMode }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

