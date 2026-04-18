import React from "react";
import { Alert, AlertTitle, Box, Button, Stack } from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

export function SharedError({
  title = "Something went wrong",
  message = "Please try again.",
  actionLabel = "Retry",
  onRetry
}) {
  return (
    <Box sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Alert severity="error">
          <AlertTitle>{title}</AlertTitle>
          {message}
        </Alert>
        {onRetry ? (
          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshOutlinedIcon />}
              onClick={onRetry}
            >
              {actionLabel}
            </Button>
          </Box>
        ) : null}
      </Stack>
    </Box>
  );
}

