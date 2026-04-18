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

import { deleteListForBoard } from "../services/listService.js";

/**
 * @param {{
 *   open: boolean,
 *   userId: string,
 *   boardId: string,
 *   listId: string,
 *   listName: string,
 *   onClose: () => void,
 *   onDeleted: () => void | Promise<void>
 * }} props
 */
export function DeleteListDialog({ open, userId, boardId, listId, listName, onClose, onDeleted }) {
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
      await deleteListForBoard(userId, boardId, listId);
      await onDeleted();
      onClose();
    } catch (err) {
      setError(err?.message ?? "Could not delete the list.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Delete list?</DialogTitle>
      <DialogContent>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        <DialogContentText>
          This will permanently remove <strong>{listName || "this list"}</strong> from the board.
          This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={deleting}>
          Cancel
        </Button>
        <Button color="error" variant="contained" onClick={handleConfirm} disabled={deleting}>
          Delete list
        </Button>
      </DialogActions>
    </Dialog>
  );
}
