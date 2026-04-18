import React, { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates
} from "@dnd-kit/sortable";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import { BoardListColumn } from "./boardListColumn.jsx";
import { CreateListDialog } from "./createListDialog.jsx";
import { DeleteListDialog } from "./deleteListDialog.jsx";
import { RenameListDialog } from "./renameListDialog.jsx";
import { SharedEmpty } from "./sharedEmpty.jsx";
import { SharedError } from "./sharedError.jsx";
import { SharedLoading } from "./sharedLoading.jsx";
import { fetchListsForBoard, reorderListsForBoard } from "../services/listService.js";

/**
 * @param {{ userId: string, boardId: string }} props
 */
export function BoardListsSection({ userId, boardId }) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reorderError, setReorderError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [renameList, setRenameList] = useState(null);
  const [deleteList, setDeleteList] = useState(null);

  const reloadLists = useCallback(async () => {
    if (!userId || !boardId) {
      setLists([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError("");
    try {
      const next = await fetchListsForBoard(userId, boardId);
      setLists(next);
    } catch (err) {
      setLoadError(err?.message ?? "Could not load lists.");
      setLists([]);
    } finally {
      setLoading(false);
    }
  }, [userId, boardId]);

  useEffect(() => {
    void reloadLists();
  }, [reloadLists]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event) => {
    setReorderError("");
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = lists.findIndex((l) => l.id === active.id);
    const newIndex = lists.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previous = lists;
    const reordered = arrayMove(lists, oldIndex, newIndex);
    setLists(reordered);
    try {
      await reorderListsForBoard(
        userId,
        boardId,
        reordered.map((l) => l.id)
      );
    } catch (err) {
      setReorderError(err?.message ?? "Could not save list order.");
      setLists(previous);
    }
  };

  if (!userId || !boardId) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        <Typography variant="h6" fontWeight={800}>
          Lists
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ alignSelf: { xs: "stretch", sm: "center" } }}
        >
          Add list
        </Button>
      </Stack>

      {loading ? <SharedLoading label="Loading lists..." /> : null}

      {!loading && loadError ? (
        <SharedError title="Could not load lists" message={loadError} onRetry={reloadLists} />
      ) : null}

      {!loading && !loadError && lists.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 0 }}>
          <SharedEmpty
            title="No lists on this board"
            description="Create a list to start organizing work in columns."
            actionLabel="Create first list"
            onAction={() => setCreateOpen(true)}
          />
        </Paper>
      ) : null}

      {!loading && !loadError && lists.length > 0 ? (
        <Stack spacing={1}>
          {reorderError ? (
            <Typography variant="body2" color="error">
              {reorderError}
            </Typography>
          ) : null}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={lists.map((l) => l.id)} strategy={horizontalListSortingStrategy}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  overflowX: "auto",
                  pb: 1,
                  alignItems: "stretch",
                  flexWrap: "nowrap"
                }}
              >
                {lists.map((list) => (
                  <BoardListColumn
                    key={list.id}
                    list={list}
                    onRename={(l) => setRenameList(l)}
                    onDelete={(l) => setDeleteList(l)}
                  />
                ))}
              </Box>
            </SortableContext>
          </DndContext>
        </Stack>
      ) : null}

      <CreateListDialog
        open={createOpen}
        userId={userId}
        boardId={boardId}
        onClose={() => setCreateOpen(false)}
        onCreated={reloadLists}
      />

      {renameList ? (
        <RenameListDialog
          open={Boolean(renameList)}
          userId={userId}
          boardId={boardId}
          listId={renameList.id}
          initialName={renameList.name}
          onClose={() => setRenameList(null)}
          onRenamed={reloadLists}
        />
      ) : null}

      {deleteList ? (
        <DeleteListDialog
          open={Boolean(deleteList)}
          userId={userId}
          boardId={boardId}
          listId={deleteList.id}
          listName={deleteList.name}
          onClose={() => setDeleteList(null)}
          onDeleted={reloadLists}
        />
      ) : null}
    </Stack>
  );
}
