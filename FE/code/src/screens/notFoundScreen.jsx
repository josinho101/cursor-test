import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button, Paper, Stack, Typography } from "@mui/material";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";

export function NotFoundScreen() {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={1.5} alignItems="flex-start">
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchOffOutlinedIcon color="disabled" />
          <Typography variant="h6" fontWeight={800}>
            Page not found
          </Typography>
        </Stack>
        <Typography color="text.secondary">
          The page you’re looking for doesn’t exist.
        </Typography>
        <Button component={RouterLink} to="/app" variant="contained">
          Go to app
        </Button>
      </Stack>
    </Paper>
  );
}

