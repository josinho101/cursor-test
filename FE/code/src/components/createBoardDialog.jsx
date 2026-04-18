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

import { createBoardForUser, validateBoardInput } from "../services/boardService.js";

/**
 * @param {{
 *   open: boolean,
 *   userId: string,
 *   onClose: () => void,
 *   onCreated: () => void | Promise<void>
 * }} props
 */
export function CreateBoardDialog({ open, userId, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setErrors({});
    setSubmitError("");
  }, [open]);

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
      await createBoardForUser(userId, { name, description });
      await onCreated();
      onClose();
    } catch (err) {
      if (err?.validationErrors) {
        setErrors(err.validationErrors);
      } else {
        setSubmitError(err?.message ?? "Could not create the board.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Create board</DialogTitle>
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
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
