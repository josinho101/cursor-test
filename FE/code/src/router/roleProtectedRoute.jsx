import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../auth/authProvider.jsx";
import { ProtectedRoute } from "./protectedRoute.jsx";

export function RoleProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth();
  const isAllowed = user && allowedRoles.includes(user.role);

  return (
    <ProtectedRoute>
      {isAllowed ? children : <Navigate to="/app/forbidden" replace />}
    </ProtectedRoute>
  );
}

