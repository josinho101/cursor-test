import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";

import { deleteBoardForUser } from "../services/boardService.js";

/**
 * @param {{
 *   open: boolean,
 *   userId: string,
 *   boardId: string,
 *   boardName: string,
 *   onClose: () => void,
 *   onDeleted: () => void | Promise<void>
 * }} props
 */
export function DeleteBoardDialog({ open, userId, boardId, boardName, onClose, onDeleted }) {
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open) setError("");
  }, [open]);

  const handleClose = () => {
    if (deleting) return;
    setError("");
    onClose();
  };

  const handleConfirm = async () => {
    setError("");
    setDeleting(true);
    try {
      await deleteBoardForUser(userId, boardId);
      await onDeleted();
      onClose();
    } catch (err) {
      setError(err?.message ?? "Could not delete the board.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Delete board?</DialogTitle>
      <DialogContent>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        <DialogContentText>
          This will permanently remove{" "}
          <strong>{boardName || "this board"}</strong> from your workspace. This action cannot be
          undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={deleting}>
          Cancel
        </Button>
        <Button color="error" variant="contained" onClick={handleConfirm} disabled={deleting}>
          Delete board
        </Button>
      </DialogActions>
    </Dialog>
  );
}
