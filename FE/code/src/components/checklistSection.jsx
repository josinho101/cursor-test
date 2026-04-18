import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";
import PlaylistAddOutlinedIcon from "@mui/icons-material/PlaylistAddOutlined";

function newClientId(prefix) {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function progressForChecklists(checklists) {
  const items = (Array.isArray(checklists) ? checklists : []).flatMap((c) => (Array.isArray(c?.items) ? c.items : []));
  const total = items.length;
  const completed = items.reduce((sum, it) => sum + (it?.completed ? 1 : 0), 0);
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percent };
}

function normalizeForSave(checklists) {
  const rows = Array.isArray(checklists) ? checklists : [];
  return rows
    .filter((c) => c && typeof c.id === "string")
    .map((c) => {
      const items = Array.isArray(c.items) ? c.items : [];
      return {
        id: String(c.id),
        title: String(c.title ?? ""),
        items: items
          .filter((it) => it && typeof it.id === "string")
          .map((it, index) => ({
            id: String(it.id),
            text: String(it.text ?? ""),
            completed: Boolean(it.completed),
            position: index
          }))
      };
    });
}

/**
 * @param {{
 *  checklists: import("../services/cardStorage.js").StoredCard["checklists"] | undefined,
 *  disabled?: boolean,
 *  onChange: (nextChecklists: import("../services/cardStorage.js").StoredCard["checklists"]) => void
 * }} props
 */
export function ChecklistSection({ checklists, disabled, onChange }) {
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newItemByChecklistId, setNewItemByChecklistId] = useState({});

  const safeChecklists = useMemo(() => (Array.isArray(checklists) ? checklists : []), [checklists]);
  const progress = useMemo(() => progressForChecklists(safeChecklists), [safeChecklists]);

  const commit = (next) => onChange(normalizeForSave(next));

  const handleCreateChecklist = () => {
    const title = String(newChecklistTitle ?? "").trim();
    if (!title) return;
    commit([
      ...safeChecklists,
      {
        id: newClientId("chk"),
        title,
        items: []
      }
    ]);
    setNewChecklistTitle("");
  };

  const handleAddItem = (checklistId) => {
    const raw = newItemByChecklistId[checklistId];
    const text = String(raw ?? "").trim();
    if (!text) return;

    commit(
      safeChecklists.map((c) =>
        c.id !== checklistId
          ? c
          : {
              ...c,
              items: [
                ...(Array.isArray(c.items) ? c.items : []),
                { id: newClientId("item"), text, completed: false, position: 0 }
              ]
            }
      )
    );
    setNewItemByChecklistId((prev) => ({ ...prev, [checklistId]: "" }));
  };

  const handleToggleItem = (checklistId, itemId) => {
    commit(
      safeChecklists.map((c) =>
        c.id !== checklistId
          ? c
          : {
              ...c,
              items: (Array.isArray(c.items) ? c.items : []).map((it) =>
                it.id !== itemId ? it : { ...it, completed: !it.completed }
              )
            }
      )
    );
  };

  const handleMoveItem = (checklistId, itemId, direction) => {
    const list = safeChecklists.find((c) => c.id === checklistId);
    const items = Array.isArray(list?.items) ? [...list.items] : [];
    const fromIndex = items.findIndex((it) => it.id === itemId);
    if (fromIndex === -1) return;
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= items.length) return;
    const nextItems = items.slice();
    const [moved] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, moved);

    commit(
      safeChecklists.map((c) => (c.id !== checklistId ? c : { ...c, items: nextItems }))
    );
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={800}>
          Checklist
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {progress.percent}% ({progress.completed}/{progress.total})
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={progress.percent}
        sx={{ height: 8, borderRadius: 99, mb: 2 }}
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
        <TextField
          label="New checklist"
          value={newChecklistTitle}
          onChange={(e) => setNewChecklistTitle(e.target.value)}
          fullWidth
          disabled={disabled}
        />
        <Button
          variant="outlined"
          startIcon={<PlaylistAddOutlinedIcon />}
          onClick={handleCreateChecklist}
          disabled={disabled || !String(newChecklistTitle ?? "").trim()}
        >
          Add
        </Button>
      </Stack>

      {safeChecklists.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No checklist yet. Add one to start tracking subtasks.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {safeChecklists.map((c, cIndex) => (
            <Box key={c.id}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {c.title || `Checklist ${cIndex + 1}`}
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1 }}>
                <TextField
                  label="Add item"
                  value={newItemByChecklistId[c.id] ?? ""}
                  onChange={(e) => setNewItemByChecklistId((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  fullWidth
                  disabled={disabled}
                />
                <Button
                  variant="outlined"
                  onClick={() => handleAddItem(c.id)}
                  disabled={disabled || !String(newItemByChecklistId[c.id] ?? "").trim()}
                >
                  Add item
                </Button>
              </Stack>

              {Array.isArray(c.items) && c.items.length ? (
                <Stack spacing={0.5}>
                  {c.items.map((it, index) => (
                    <Stack
                      key={it.id}
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ p: 0.75, border: 1, borderColor: "divider", borderRadius: 1 }}
                    >
                      <Checkbox
                        checked={Boolean(it.completed)}
                        onChange={() => handleToggleItem(c.id, it.id)}
                        disabled={disabled}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          textDecoration: it.completed ? "line-through" : "none",
                          color: it.completed ? "text.secondary" : "text.primary"
                        }}
                      >
                        {it.text}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleMoveItem(c.id, it.id, "up")}
                        disabled={disabled || index === 0}
                        aria-label="Move up"
                      >
                        <ArrowUpwardOutlinedIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleMoveItem(c.id, it.id, "down")}
                        disabled={disabled || index === c.items.length - 1}
                        aria-label="Move down"
                      >
                        <ArrowDownwardOutlinedIcon fontSize="inherit" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No items yet.
                </Typography>
              )}

              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

