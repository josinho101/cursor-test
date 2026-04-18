import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField
} from "@mui/material";

import { updateBoardForUser, validateBoardInput } from "../services/boardService.js";

/**
 * @param {{
 *   open: boolean,
 *   userId: string,
 *   boardId: string,
 *   initialName: string,
 *   initialDescription: string,
 *   onClose: () => void,
 *   onUpdated: () => void | Promise<void>
 * }} props
 */
export function EditBoardDialog({
  open,
  userId,
  boardId,
  initialName,
  initialDescription,
  onClose,
  onUpdated
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setDescription(initialDescription);
    setErrors({});
    setSubmitError("");
  }, [open, initialName, initialDescription]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitError("");
    const validation = validateBoardInput({ name, description });
    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await updateBoardForUser(userId, boardId, { name, description });
      await onUpdated();
      onClose();
    } catch (err) {
      if (err?.validationErrors) {
        setErrors(err.validationErrors);
      } else {
        setSubmitError(err?.message ?? "Could not update the board.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit board</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
          <TextField
            label="Board name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={Boolean(errors.name)}
            helperText={errors.name}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={Boolean(errors.description)}
            helperText={errors.description || "Optional"}
            fullWidth
            multiline
            minRows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
