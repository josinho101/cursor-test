import React from "react";
import { createBrowserRouter } from "react-router-dom";

import { UnauthLayout } from "../layout/unauthLayout.jsx";
import { AppShellLayout } from "../layout/appShellLayout.jsx";
import { ProtectedRoute } from "./protectedRoute.jsx";
import { RoleProtectedRoute } from "./roleProtectedRoute.jsx";
import { RootRedirect } from "./rootRedirect.jsx";

import { LoginScreen } from "../screens/loginScreen.jsx";
import { DashboardScreen } from "../screens/dashboardScreen.jsx";
import { AdminScreen } from "../screens/adminScreen.jsx";
import { ForbiddenScreen } from "../screens/forbiddenScreen.jsx";
import { NotFoundScreen } from "../screens/notFoundScreen.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />
  },
  {
    path: "/login",
    element: <UnauthLayout />,
    children: [
      {
        index: true,
        element: <LoginScreen />
      }
    ]
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppShellLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardScreen />
      },
      {
        path: "admin",
        element: (
          <RoleProtectedRoute allowedRoles={["admin"]}>
            <AdminScreen />
          </RoleProtectedRoute>
        )
      },
      {
        path: "forbidden",
        element: <ForbiddenScreen />
      }
    ]
  },
  {
    path: "*",
    element: <NotFoundScreen />
  }
]);

