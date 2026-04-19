import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DragIndicatorOutlinedIcon from "@mui/icons-material/DragIndicatorOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import { CreateCardDialog } from "./createCardDialog.jsx";
import { TaskCard } from "./taskCard.jsx";

/**
 * @param {{
 *   list: import("../services/listStorage.js").StoredList,
 *   cards: import("../services/cardStorage.js").StoredCard[],
 *   memberDirectory: Map<string, { id: string, name: string }>,
 *   userId: string,
 *   boardId: string,
 *   onRename: (list: import("../services/listStorage.js").StoredList) => void,
 *   onDelete: (list: import("../services/listStorage.js").StoredList) => void,
 *   onOpenCardDetails: (card: import("../services/cardStorage.js").StoredCard) => void,
 *   onCardsChanged: () => void | Promise<void>,
 *   cardDragDisabled?: boolean,
 *   filtersActive?: boolean
 * }} props
 */
export function BoardListColumn({
  list,
  cards,
  memberDirectory,
  userId,
  boardId,
  onRename,
  onDelete,
  onOpenCardDetails,
  onCardsChanged,
  cardDragDisabled = false,
  filtersActive = false
}) {
  const [createOpen, setCreateOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: { type: "list" }
  });

  const dropId = `DROP__${list.id}`;
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: dropId,
    data: { type: "drop", listId: list.id }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1
  };

  const cardIds = cards.map((c) => c.id);

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
        alignSelf: "flex-start",
        outline: isOver ? "2px dashed" : "none",
        outlineColor: "primary.main",
        outlineOffset: 2
      }}
    >
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        flexShrink={0}
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

      <Box
        ref={setDropRef}
        sx={{
          p: 1,
          flex: "0 0 auto",
          minHeight: cards.length === 0 ? 120 : "unset",
          overflow: "visible",
          bgcolor: isOver ? "action.selected" : "transparent",
          transition: "background-color 120ms ease"
        }}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <Stack spacing={1}>
            {cards.map((card) => (
              <TaskCard
                key={card.id}
                card={card}
                memberDirectory={memberDirectory}
                onOpen={onOpenCardDetails}
                dragDisabled={cardDragDisabled}
              />
            ))}
          </Stack>
        </SortableContext>

        {cards.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 1, px: 1 }}>
            {filtersActive
              ? "No cards match the current filters in this list."
              : "No cards yet. Drag cards here or add one below."}
          </Typography>
        ) : null}
      </Box>

      <Box sx={{ p: 1, pt: 0, flexShrink: 0 }}>
        <Button
          fullWidth
          size="small"
          variant="text"
          startIcon={<AddOutlinedIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Add card
        </Button>
      </Box>

      <CreateCardDialog
        open={createOpen}
        userId={userId}
        boardId={boardId}
        listId={list.id}
        onClose={() => setCreateOpen(false)}
        onCreated={onCardsChanged}
      />
    </Paper>
  );
}
