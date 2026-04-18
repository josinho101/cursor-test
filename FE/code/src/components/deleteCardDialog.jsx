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

import { deleteCardForBoard } from "../services/cardService.js";

/**
 * @param {{
 *   open: boolean,
 *   userId: string,
 *   boardId: string,
 *   cardId: string,
 *   cardTitle: string,
 *   onClose: () => void,
 *   onDeleted: () => void | Promise<void>
 * }} props
 */
export function DeleteCardDialog({ open, userId, boardId, cardId, cardTitle, onClose, onDeleted }) {
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
      await deleteCardForBoard(userId, boardId, cardId);
      await onDeleted();
      onClose();
    } catch (err) {
      setError(err?.message ?? "Could not delete the card.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Delete card?</DialogTitle>
      <DialogContent>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        <DialogContentText>
          This will permanently remove <strong>{cardTitle || "this card"}</strong> from the board. This
          action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={deleting}>
          Cancel
        </Button>
        <Button color="error" variant="contained" onClick={handleConfirm} disabled={deleting}>
          Delete card
        </Button>
      </DialogActions>
    </Dialog>
  );
}
