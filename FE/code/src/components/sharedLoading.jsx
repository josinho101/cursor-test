import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export function SharedLoading({ label = "Loading..." }) {
  return (
    <Box
      sx={{
        py: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2
      }}
    >
      <CircularProgress />
      <Typography color="text.secondary">{label}</Typography>
    </Box>
  );
}

