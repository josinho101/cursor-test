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

import { updateListNameForBoard, validateListNameInput } from "../services/listService.js";

/**
 * @param {{
 *   open: boolean,
 *   userId: string,
 *   boardId: string,
 *   listId: string,
 *   initialName: string,
 *   onClose: () => void,
 *   onRenamed: () => void | Promise<void>
 * }} props
 */
export function RenameListDialog({
  open,
  userId,
  boardId,
  listId,
  initialName,
  onClose,
  onRenamed
}) {
  const [name, setName] = useState(initialName);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setErrors({});
    setSubmitError("");
  }, [open, initialName]);

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
      await updateListNameForBoard(userId, boardId, listId, { name });
      await onRenamed();
      onClose();
    } catch (err) {
      if (err?.validationErrors) {
        setErrors(err.validationErrors);
      } else {
        setSubmitError(err?.message ?? "Could not rename the list.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Rename list</DialogTitle>
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
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
