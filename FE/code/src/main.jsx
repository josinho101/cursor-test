import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline } from "@mui/material";
import { RouterProvider } from "react-router-dom";

import { AppThemeProvider } from "./theme/appThemeProvider.jsx";
import { router } from "./router/router.jsx";
import { AuthProvider } from "./auth/authProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AppThemeProvider>
        <CssBaseline />
        <RouterProvider router={router} />
      </AppThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);

