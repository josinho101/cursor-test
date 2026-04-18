import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

export function SharedEmpty({
  title = "Nothing here yet",
  description,
  actionLabel,
  onAction
}) {
  return (
    <Box sx={{ py: 6 }}>
      <Stack spacing={1.5} alignItems="center" textAlign="center">
        <InboxOutlinedIcon color="disabled" sx={{ fontSize: 44 }} />
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        {description ? (
          <Typography color="text.secondary" sx={{ maxWidth: 520 }}>
            {description}
          </Typography>
        ) : null}
        {actionLabel && onAction ? (
          <Button variant="contained" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}

