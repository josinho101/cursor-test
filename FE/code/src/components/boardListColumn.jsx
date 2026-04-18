import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DragIndicatorOutlinedIcon from "@mui/icons-material/DragIndicatorOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

/**
 * @param {{
 *   list: import("../services/listStorage.js").StoredList,
 *   onRename: (list: import("../services/listStorage.js").StoredList) => void,
 *   onDelete: (list: import("../services/listStorage.js").StoredList) => void
 * }} props
 */
export function BoardListColumn({ list, onRename, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1
  };

  return (
    <Paper
      ref={setNodeRef}
      variant="outlined"
      sx={{
        ...style,
        minWidth: { xs: "min(100%, 280px)", sm: 280 },
        maxWidth: { xs: "100%", sm: 280 },
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        maxHeight: { xs: "none", md: "calc(100vh - 280px)" }
      }}
    >
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{
          px: 1,
          py: 1,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "action.hover"
        }}
      >
        <Tooltip title="Drag to reorder">
          <IconButton
            size="small"
            aria-label={`Reorder list ${list.name}`}
            {...attributes}
            {...listeners}
            sx={{ cursor: "grab" }}
          >
            <DragIndicatorOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography
          variant="subtitle1"
          fontWeight={800}
          sx={{ flex: 1, minWidth: 0, wordBreak: "break-word" }}
        >
          {list.name}
        </Typography>
        <Tooltip title="Rename list">
          <IconButton size="small" aria-label={`Rename list ${list.name}`} onClick={() => onRename(list)}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete list">
          <IconButton
            size="small"
            color="error"
            aria-label={`Delete list ${list.name}`}
            onClick={() => onDelete(list)}
          >
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Box sx={{ p: 1.5, flex: 1, overflow: "auto" }}>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
          No cards in this list yet.
        </Typography>
      </Box>
    </Paper>
  );
}
