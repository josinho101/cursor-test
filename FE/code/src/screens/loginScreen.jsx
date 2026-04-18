import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import MuiLink from "@mui/material/Link";

import { useAuth } from "../auth/authProvider.jsx";
import { consumeAuthBannerMessage } from "../auth/authEvents.js";
import { getMockLoginHints } from "../services/authService.js";

function isValidEmail(value) {
  const v = String(value ?? "").trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [banner, setBanner] = useState(null);

  const hints = useMemo(() => getMockLoginHints(), []);
  const from = location.state?.from;

  useEffect(() => {
    setBanner(consumeAuthBannerMessage());
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(typeof from === "string" && from.startsWith("/") ? from : "/app", {
        replace: true
      });
    }
  }, [from, isAuthenticated, navigate]);

  const validate = () => {
    const next = { email: "", password: "" };
    const trimmedEmail = email.trim();
    if (!trimmedEmail) next.email = "Email is required.";
    else if (!isValidEmail(trimmedEmail)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setFieldErrors(next);
    return !next.email && !next.password;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(typeof from === "string" && from.startsWith("/") ? from : "/app", {
        replace: true
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign-in failed.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={2} component="form" onSubmit={handleSubmit} noValidate>
        <Box>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Sign in
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use your workspace credentials. JWTs are stored locally for session restoration.
          </Typography>
        </Box>

        {banner && (
          <Alert severity="warning" onClose={() => setBanner(null)}>
            {banner}
          </Alert>
        )}

        {formError && <Alert severity="error">{formError}</Alert>}

        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={Boolean(fieldErrors.email)}
          helperText={fieldErrors.email}
          disabled={submitting}
          fullWidth
          required
        />

        <TextField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={Boolean(fieldErrors.password)}
          helperText={fieldErrors.password}
          disabled={submitting}
          fullWidth
          required
        />

        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>

        <Divider />

        <Typography variant="caption" color="text.secondary">
          Local mock accounts (used when <Typography component="span" variant="caption" fontFamily="monospace">VITE_API_BASE_URL</Typography>{" "}
          is not set):
        </Typography>
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            User — {hints.userEmail} / {hints.userPassword}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Admin — {hints.adminEmail} / {hints.adminPassword}
          </Typography>
        </Stack>

        {typeof from === "string" && from.startsWith("/") && (
          <Typography variant="caption" color="text.secondary">
            After signing in you will return to{" "}
            <MuiLink component={RouterLink} to={from} underline="hover">
              {from}
            </MuiLink>
            .
          </Typography>
        )}
    </Stack>
  );
}
