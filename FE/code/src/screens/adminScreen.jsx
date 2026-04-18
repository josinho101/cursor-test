import React from "react";
import { Paper, Stack, Typography } from "@mui/material";

import { SharedEmpty } from "../components/sharedEmpty.jsx";

export function AdminScreen() {
  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={800}>
          Admin
        </Typography>
        <Typography color="text.secondary">
          Role-protected route baseline (admin only).
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <SharedEmpty
          title="No admin tools yet"
          description="User/workspace management screens will be added later."
        />
      </Paper>
    </Stack>
  );
}

