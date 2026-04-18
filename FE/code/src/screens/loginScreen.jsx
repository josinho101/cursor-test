import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Divider, Stack, Typography } from "@mui/material";

import { useAuth } from "../auth/authProvider.jsx";

export function LoginScreen() {
  const navigate = useNavigate();
  const { loginDemo } = useAuth();

  const signIn = (role) => {
    loginDemo(role);
    navigate("/app", { replace: true });
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={700}>
        Login (demo)
      </Typography>
      <Typography color="text.secondary">
        Foundation scaffolding only — real JWT auth will be implemented later.
      </Typography>
      <Divider />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button variant="contained" onClick={() => signIn("user")}>
          Sign in as User
        </Button>
        <Button variant="outlined" onClick={() => signIn("admin")}>
          Sign in as Admin
        </Button>
      </Stack>
    </Stack>
  );
}

