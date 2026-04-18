import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../auth/authProvider.jsx";

export function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/app" : "/login"} replace />;
}

