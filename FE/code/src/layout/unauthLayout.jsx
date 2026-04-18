import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";

export function UnauthLayout() {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={700}>
            Trello-like
          </Typography>
          <Typography color="text.secondary">
            Sign in to access your boards.
          </Typography>
        </Stack>
        <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
}

