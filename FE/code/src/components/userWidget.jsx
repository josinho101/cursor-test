import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Tooltip
} from "@mui/material";

import { useAuth } from "../auth/authProvider.jsx";

function getInitials(name) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}

export function UserWidget() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const label = useMemo(() => {
    if (!isAuthenticated || !user) return "Guest";
    return user.name ?? "User";
  }, [isAuthenticated, user]);

  const role = isAuthenticated && user ? user.role : null;
  const email = isAuthenticated && user?.email ? user.email : null;

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Tooltip title={isAuthenticated ? "Account" : "Not signed in"}>
        <Button
          color="inherit"
          onClick={handleOpen}
          aria-haspopup="menu"
          aria-expanded={open ? "true" : undefined}
          aria-controls={open ? "user-widget-menu" : undefined}
          startIcon={
            <Avatar
              sx={{ width: 28, height: 28, fontSize: 12 }}
              alt={label}
            >
              {getInitials(label)}
            </Avatar>
          }
          sx={{
            textTransform: "none",
            borderRadius: 999,
            px: 1,
            minWidth: 0
          }}
        >
          <Stack
            direction="column"
            alignItems="flex-start"
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            <Typography variant="body2" fontWeight={700} lineHeight={1.1}>
              {label}
            </Typography>
            {role && (
              <Typography variant="caption" color="text.secondary" lineHeight={1.1}>
                {role}
              </Typography>
            )}
          </Stack>
        </Button>
      </Tooltip>

      <Menu
        id="user-widget-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {isAuthenticated ? (
          <>
            {email && (
              <MenuItem disabled sx={{ opacity: "1 !important", py: 1.5 }}>
                <Stack spacing={0.25} sx={{ width: "100%" }}>
                  <Typography variant="caption" color="text.secondary">
                    Signed in as
                  </Typography>
                  <Typography variant="body2" fontWeight={600} noWrap title={email}>
                    {email}
                  </Typography>
                </Stack>
              </MenuItem>
            )}
            {email && <Divider sx={{ my: 0.5 }} />}
            <MenuItem
              onClick={() => {
                logout();
                handleClose();
              }}
            >
              Log out
            </MenuItem>
          </>
        ) : (
          <MenuItem
            onClick={() => {
              handleClose();
              navigate("/login");
            }}
          >
            Sign in
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
