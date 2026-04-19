import React, { Fragment, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
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
  Tooltip,
  Typography,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import { ThemeSwitchControl } from "../components/themeSwitchControl.jsx";
import { UserWidget } from "../components/userWidget.jsx";
import { GlobalSearchField } from "../components/globalSearchField.jsx";
import { useAuth } from "../auth/authProvider.jsx";
import {
  getStoredSidebarNavCollapsed,
  setStoredSidebarNavCollapsed
} from "./sidebarNavStorage.js";

const drawerWidth = 280;
const drawerWidthCollapsed = 72;

export function AppShellLayout() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopNavCollapsed, setDesktopNavCollapsed] = useState(
    getStoredSidebarNavCollapsed
  );

  const isAdmin = user?.role === "admin";

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
  const toggleDesktopNavCollapsed = () => {
    setDesktopNavCollapsed((v) => {
      const next = !v;
      setStoredSidebarNavCollapsed(next);
      return next;
    });
  };

  const handleDrawerMenuClick = () => {
    if (isDesktop) toggleDesktopNavCollapsed();
    else closeMobileDrawer();
  };

  const navCollapsed = isDesktop && desktopNavCollapsed;
  const drawerMenuAriaLabel = isDesktop
    ? navCollapsed
      ? "Expand navigation"
      : "Collapse navigation"
    : "Close navigation";

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          px: navCollapsed ? 0.5 : 2,
          py: 2,
          display: "flex",
          flexDirection: navCollapsed ? "column" : "row",
          alignItems: navCollapsed ? "center" : "flex-start",
          gap: navCollapsed ? 1 : 1.5
        }}
      >
        <IconButton
          color="inherit"
          edge={navCollapsed ? false : "start"}
          onClick={handleDrawerMenuClick}
          aria-label={drawerMenuAriaLabel}
          sx={{ flexShrink: 0 }}
        >
          <MenuIcon />
        </IconButton>
        {!navCollapsed && (
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={800}>
              Trello-like
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user ? `${user.name} (${user.role})` : "Not signed in"}
            </Typography>
          </Box>
        )}
      </Box>
      <Divider />
      <List sx={{ px: navCollapsed ? 0.5 : 1 }}>
        {navItems.map((item) => {
          const linkButton = (
            <ListItemButton
              component={NavLink}
              to={item.to}
              onClick={closeMobileDrawer}
              sx={{
                borderRadius: 2,
                my: 0.5,
                justifyContent: navCollapsed ? "center" : "flex-start",
                px: navCollapsed ? 1 : 2,
                "&.active": {
                  bgcolor: "action.selected"
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: navCollapsed ? 0 : 44, justifyContent: "center" }}>
                {item.icon}
              </ListItemIcon>
              {!navCollapsed && <ListItemText primary={item.label} />}
            </ListItemButton>
          );
          return (
            <Fragment key={item.to}>
              {navCollapsed ? (
                <Tooltip title={item.label} placement="right">
                  {linkButton}
                </Tooltip>
              ) : (
                linkButton
              )}
            </Fragment>
          );
        })}
      </List>
      <Box sx={{ flex: 1 }} />
    </Box>
  );

  const resolvedDrawerWidth = navCollapsed ? drawerWidthCollapsed : drawerWidth;
  /** Fixed AppBar sits above the drawer z-index; offset permanent drawer so the header is not hidden. */
  const desktopDrawerTop = theme.spacing(8);

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
          {!isDesktop && isAdmin && (
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
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, minWidth: 0, mr: 1 }}>
            <Typography variant="h6" sx={{ flexShrink: 0 }} fontWeight={700} noWrap>
              {location.pathname.startsWith("/app/admin")
                ? "Admin"
                : location.pathname.startsWith("/app/search")
                  ? "Search"
                  : location.pathname.startsWith("/app/boards/")
                    ? "Board"
                    : "Boards"}
            </Typography>
            <GlobalSearchField />
          </Stack>
          <IconButton
            color="inherit"
            aria-label="Open search"
            onClick={() => navigate("/app/search")}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <SearchOutlinedIcon />
          </IconButton>
          <Stack direction="row" spacing={1} alignItems="center">
            <ThemeSwitchControl />
            <UserWidget />
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { md: isAdmin ? resolvedDrawerWidth : 0 },
          flexShrink: { md: 0 },
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen
            })
        }}
        aria-label="Sidebar navigation"
      >
        {isAdmin && (
          <Drawer
            variant={isDesktop ? "permanent" : "temporary"}
            open={isDesktop ? true : mobileOpen}
            onClose={toggleMobileDrawer}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: isDesktop ? resolvedDrawerWidth : drawerWidth,
                boxSizing: "border-box",
                transition: (t) =>
                  t.transitions.create("width", {
                    easing: t.transitions.easing.sharp,
                    duration: t.transitions.duration.leavingScreen
                  }),
                overflowX: "hidden",
                ...(isDesktop && {
                  top: desktopDrawerTop,
                  height: `calc(100dvh - ${desktopDrawerTop})`
                })
              }
            }}
          >
            {drawer}
          </Drawer>
        )}
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

