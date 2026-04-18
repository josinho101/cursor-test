import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { useAuth } from "../auth/authProvider.jsx";
import {
  addCommentToCard,
  CARD_LABEL_OPTIONS,
  fetchCardsForBoard,
  updateCardForBoard,
  validateCardDescriptionInput,
  validateCardTitleInput,
  validateCommentInput
} from "../services/cardService.js";

/**
 * @param {{ id: string, name: string }} m
 */
function memberLabel(m) {
  return m.name || m.id;
}

/**
 * @param {{
 *   open: boolean,
 *   userId: string,
 *   boardId: string,
 *   card: import("../services/cardStorage.js").StoredCard | null,
 *   assignableMembers: { id: string, name: string }[],
 *   onClose: () => void,
 *   onUpdated: () => void | Promise<void>,
 *   onRequestDelete: (card: import("../services/cardStorage.js").StoredCard) => void
 * }} props
 */
export function CardDetailsDialog({
  open,
  userId,
  boardId,
  card,
  assignableMembers,
  onClose,
  onUpdated,
  onRequestDelete
}) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [memberIds, setMemberIds] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [labels, setLabels] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [saving, setSaving] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  const memberOptions = useMemo(() => assignableMembers ?? [], [assignableMembers]);

  useEffect(() => {
    if (!open || !card) return;
    setTitle(card.title ?? "");
    setDescription(card.description ?? "");
    setMemberIds(Array.isArray(card.memberIds) ? card.memberIds : []);
    setDueDate(card.dueDate ? String(card.dueDate).slice(0, 10) : "");
    setLabels(Array.isArray(card.labels) ? card.labels : []);
    setComments(Array.isArray(card.comments) ? [...card.comments] : []);
    setCommentBody("");
    setErrors({});
    setSubmitError("");
    setCommentError("");
  }, [open, card]);

  const handleClose = () => {
    if (saving || postingComment) return;
    onClose();
  };

  const handleSaveDetails = async () => {
    if (!card) return;
    setSubmitError("");
    const titleValidation = validateCardTitleInput({ title });
    const descValidation = validateCardDescriptionInput({ description });
    const nextErrors = {};
    if (!titleValidation.ok) Object.assign(nextErrors, titleValidation.errors);
    if (!descValidation.ok) Object.assign(nextErrors, descValidation.errors);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await updateCardForBoard(userId, boardId, card.id, {
        title: titleValidation.values.title,
        description: descValidation.values.description,
        memberIds,
        dueDate: dueDate ? dueDate : null,
        labels
      });
      await onUpdated();
    } catch (err) {
      if (err?.validationErrors) {
        setErrors(err.validationErrors);
      } else {
        setSubmitError(err?.message ?? "Could not save changes.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!card || !user) return;
    setCommentError("");
    const v = validateCommentInput({ body: commentBody });
    if (!v.ok) {
      setCommentError(v.errors.body ?? "Invalid comment.");
      return;
    }
    setPostingComment(true);
    try {
      await addCommentToCard(userId, boardId, card.id, {
        body: v.values.body,
        authorId: user.id,
        authorName: user.name ?? "User"
      });
      const next = await fetchCardsForBoard(userId, boardId);
      const refreshed = next.find((c) => c.id === card.id);
      setComments(Array.isArray(refreshed?.comments) ? [...refreshed.comments] : []);
      setCommentBody("");
      await onUpdated();
    } catch (err) {
      if (err?.validationErrors?.body) {
        setCommentError(err.validationErrors.body);
      } else {
        setCommentError(err?.message ?? "Could not add comment.");
      }
    } finally {
      setPostingComment(false);
    }
  };

  const toggleLabel = (label) => {
    setLabels((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]));
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Card details</DialogTitle>
      <DialogContent dividers>
        {!card ? (
          <Typography variant="body2" color="text.secondary">
            No card selected.
          </Typography>
        ) : (
          <Stack spacing={2.5}>
            {submitError ? <Alert severity="error">{submitError}</Alert> : null}

            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={Boolean(errors.title)}
              helperText={errors.title}
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={Boolean(errors.description)}
              helperText={errors.description}
              fullWidth
              multiline
              minRows={4}
            />

            <Autocomplete
              multiple
              options={memberOptions}
              getOptionLabel={memberLabel}
              value={memberOptions.filter((m) => memberIds.includes(m.id))}
              onChange={(_, value) => setMemberIds(value.map((m) => m.id))}
              renderInput={(params) => <TextField {...params} label="Members" placeholder="Assign people" />}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={memberLabel(option)} {...getTagProps({ index })} key={option.id} />
                ))
              }
            />

            <TextField
              label="Due date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Labels
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                {CARD_LABEL_OPTIONS.map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    color={labels.includes(label) ? "primary" : "default"}
                    variant={labels.includes(label) ? "filled" : "outlined"}
                    onClick={() => toggleLabel(label)}
                    size="small"
                  />
                ))}
              </Stack>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="flex-end">
              <Button
                color="error"
                variant="outlined"
                startIcon={<DeleteOutlineOutlinedIcon />}
                onClick={() => card && onRequestDelete(card)}
                disabled={saving || postingComment}
              >
                Delete card
              </Button>
              <Button variant="contained" onClick={handleSaveDetails} disabled={saving || postingComment}>
                Save changes
              </Button>
            </Stack>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
                Comments
              </Typography>
              {comments.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No comments yet. Be the first to add one.
                </Typography>
              ) : (
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  {comments
                    .slice()
                    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
                    .map((c) => (
                      <Box key={c.id} sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {c.authorName} · {new Date(c.createdAt).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>
                          {c.body}
                        </Typography>
                      </Box>
                    ))}
                </Stack>
              )}

              {commentError ? (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {commentError}
                </Alert>
              ) : null}

              <Stack spacing={1}>
                <TextField
                  label="New comment"
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                />
                <Button variant="outlined" onClick={handleAddComment} disabled={postingComment || saving}>
                  Add comment
                </Button>
              </Stack>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving || postingComment}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
