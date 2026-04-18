import React, { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import { ThemeSwitchControl } from "../components/themeSwitchControl.jsx";
import { UserWidget } from "../components/userWidget.jsx";
import { useAuth } from "../auth/authProvider.jsx";

const drawerWidth = 280;

export function AppShellLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(
    () => [
      {
        to: "/app",
        label: "Boards",
        icon: <DashboardOutlinedIcon />
      },
      {
        to: "/app/admin",
        label: "Admin",
        icon: <AdminPanelSettingsOutlinedIcon />
      }
    ],
    []
  );

  const toggleMobileDrawer = () => setMobileOpen((v) => !v);
  const closeMobileDrawer = () => setMobileOpen(false);

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="subtitle1" fontWeight={800}>
          Trello-like
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user ? `${user.name} (${user.role})` : "Not signed in"}
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            onClick={closeMobileDrawer}
            sx={{
              borderRadius: 2,
              my: 0.5,
              "&.active": {
                bgcolor: "action.selected"
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 44 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flex: 1 }} />
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          {!isDesktop && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleMobileDrawer}
              sx={{ mr: 1 }}
              aria-label="Open navigation"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flex: 1 }} fontWeight={700}>
            {location.pathname.startsWith("/app/admin")
              ? "Admin"
              : location.pathname.startsWith("/app/boards/")
                ? "Board"
                : "Boards"}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <ThemeSwitchControl />
            <UserWidget />
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="Sidebar navigation"
      >
        <Drawer
          variant={isDesktop ? "permanent" : "temporary"}
          open={isDesktop ? true : mobileOpen}
          onClose={toggleMobileDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box"
            }
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3 },
          pt: { xs: 10, sm: 11 },
          maxWidth: "100%",
          overflowX: "hidden"
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

