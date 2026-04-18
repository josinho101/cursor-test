import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Avatar,
  AvatarGroup,
  Box,
  Card,
  CardActionArea,
  Chip,
  IconButton,
  Stack,
  Typography
} from "@mui/material";
import DragIndicatorOutlinedIcon from "@mui/icons-material/DragIndicatorOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";

/**
 * @param {{
 *   card: import("../services/cardStorage.js").StoredCard,
 *   memberDirectory: Map<string, { id: string, name: string }>,
 *   onOpen: (card: import("../services/cardStorage.js").StoredCard) => void
 * }} props
 */
export function TaskCard({ card, memberDirectory, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", listId: card.listId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1
  };

  const dueLabel = card.dueDate ? String(card.dueDate).slice(0, 10) : "";
  const labelChips = (Array.isArray(card.labels) ? card.labels : []).slice(0, 3);
  const extraLabels = (Array.isArray(card.labels) ? card.labels.length : 0) - labelChips.length;
  const memberIds = Array.isArray(card.memberIds) ? card.memberIds : [];
  const members = memberIds.map((id) => memberDirectory.get(id)).filter(Boolean);

  return (
    <Card
      ref={setNodeRef}
      variant="outlined"
      sx={{
        ...style,
        borderRadius: 1.5,
        bgcolor: "background.paper"
      }}
    >
      <Stack direction="row" spacing={0.5} alignItems="flex-start" sx={{ pl: 0.5, pt: 0.5 }}>
        <IconButton
          size="small"
          aria-label={`Reorder card ${card.title}`}
          title="Drag to move or reorder"
          {...attributes}
          {...listeners}
          sx={{ cursor: "grab", mt: 0.25 }}
        >
          <DragIndicatorOutlinedIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CardActionArea onClick={() => onOpen(card)} sx={{ borderRadius: 1, px: 1, py: 1 }}>
            <Stack spacing={1} alignItems="stretch">
              <Typography variant="subtitle2" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                {card.title}
              </Typography>

              {labelChips.length > 0 ? (
                <Stack direction="row" flexWrap="wrap" gap={0.5}>
                  {labelChips.map((label) => (
                    <Chip key={label} label={label} size="small" variant="outlined" />
                  ))}
                  {extraLabels > 0 ? (
                    <Chip label={`+${extraLabels}`} size="small" variant="filled" color="default" />
                  ) : null}
                </Stack>
              ) : null}

              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                {dueLabel ? (
                  <Chip
                    size="small"
                    icon={<EventOutlinedIcon />}
                    label={dueLabel}
                    variant="outlined"
                    color="secondary"
                  />
                ) : (
                  <span />
                )}
                {members.length > 0 ? (
                  <AvatarGroup max={3} sx={{ justifyContent: "flex-end" }}>
                    {members.map((m) => (
                      <Avatar key={m.id} title={m.name} sx={{ width: 26, height: 26, fontSize: 12 }}>
                        {initials(m.name)}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                ) : null}
              </Stack>
            </Stack>
          </CardActionArea>
        </Box>
      </Stack>
    </Card>
  );
}

/**
 * @param {string} name
 */
function initials(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}
