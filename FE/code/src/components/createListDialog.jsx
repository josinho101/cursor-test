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

import { createListForBoard, validateListNameInput } from "../services/listService.js";

/**
 * @param {{
 *   open: boolean,
 *   userId: string,
 *   boardId: string,
 *   onClose: () => void,
 *   onCreated: () => void | Promise<void>
 * }} props
 */
export function CreateListDialog({ open, userId, boardId, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
    setErrors({});
    setSubmitError("");
  }, [open]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitError("");
    const validation = validateListNameInput({ name });
    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await createListForBoard(userId, boardId, { name });
      await onCreated();
      onClose();
    } catch (err) {
      if (err?.validationErrors) {
        setErrors(err.validationErrors);
      } else {
        setSubmitError(err?.message ?? "Could not create the list.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Create list</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
          <TextField
            label="List name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={Boolean(errors.name)}
            helperText={errors.name}
            required
            fullWidth
            autoFocus
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
