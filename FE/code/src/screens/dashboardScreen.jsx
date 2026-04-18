import React from "react";
import { Paper, Stack, Typography } from "@mui/material";

import { SharedEmpty } from "../components/sharedEmpty.jsx";

export function DashboardScreen() {
  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={800}>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          This is the authenticated layout baseline.
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <SharedEmpty
          title="No boards yet"
          description="Boards will show up here once the Boards feature is implemented."
        />
      </Paper>
    </Stack>
  );
}

