import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
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
import { CardDetailsDialog } from "./cardDetailsDialog.jsx";
import { CreateListDialog } from "./createListDialog.jsx";
import { DeleteCardDialog } from "./deleteCardDialog.jsx";
import { DeleteListDialog } from "./deleteListDialog.jsx";
import { RenameListDialog } from "./renameListDialog.jsx";
import { SharedEmpty } from "./sharedEmpty.jsx";
import { SharedError } from "./sharedError.jsx";
import { SharedLoading } from "./sharedLoading.jsx";
import { fetchCardsForBoard, persistCardOrderByList, sortCardsForList } from "../services/cardService.js";
import { fetchListsForBoard, reorderListsForBoard } from "../services/listService.js";

/**
 * @param {import("../services/listStorage.js").StoredList[]} lists
 * @param {import("../services/cardStorage.js").StoredCard[]} cards
 * @returns {Record<string, string[]>}
 */
function buildCardItemsByListId(lists, cards) {
  /** @type {Record<string, string[]>} */
  const map = {};
  for (const list of lists) {
    map[list.id] = sortCardsForList(cards, list.id).map((c) => c.id);
  }
  return map;
}

/**
 * @param {Record<string, string[]>} items
 * @param {string[]} listIds
 * @param {import("@dnd-kit/core").UniqueIdentifier} activeId
 * @param {import("@dnd-kit/core").UniqueIdentifier} overId
 * @returns {Record<string, string[]> | null}
 */
function applyCardDrag(items, listIds, activeId, overId) {
  const activeKey = String(activeId);
  const overKey = String(overId);

  const findContainer = (id) => {
    const s = String(id);
    if (s.startsWith("DROP__")) return s.slice(6);
    if (listIds.includes(s)) return s;
    for (const listId of listIds) {
      if (items[listId]?.includes(s)) return listId;
    }
    return null;
  };

  const activeContainer = findContainer(activeKey);
  const overContainer = findContainer(overKey);
  if (!activeContainer || !overContainer) return null;

  /** @type {Record<string, string[]>} */
  const next = {};
  for (const lid of listIds) {
    next[lid] = [...(items[lid] ?? [])];
  }

  const overIsListOrDrop = overKey.startsWith("DROP__") || listIds.includes(overKey);

  const activeList = next[activeContainer];
  const fromIndex = activeList.indexOf(activeKey);
  if (fromIndex === -1) return null;

  if (activeContainer === overContainer) {
    if (overIsListOrDrop) {
      const copy = [...activeList];
      const [moved] = copy.splice(fromIndex, 1);
      copy.push(moved);
      next[activeContainer] = copy;
      return next;
    }
    const toIndex = activeList.indexOf(overKey);
    if (toIndex === -1) return null;
    if (fromIndex === toIndex) return null;
    next[activeContainer] = arrayMove(activeList, fromIndex, toIndex);
    return next;
  }

  next[activeContainer] = activeList.filter((id) => id !== activeKey);

  let dest = [...next[overContainer]].filter((id) => id !== activeKey);

  let insertAt = dest.length;
  if (!overIsListOrDrop) {
    const idx = dest.indexOf(overKey);
    if (idx !== -1) insertAt = idx;
  }
  dest.splice(insertAt, 0, activeKey);
  next[overContainer] = dest;
  return next;
}

/**
 * @param {{
 *   userId: string,
 *   boardId: string,
 *   assignableMembers: { id: string, name: string }[]
 * }} props
 */
export function BoardListsSection({ userId, boardId, assignableMembers }) {
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reorderError, setReorderError] = useState("");
  const [cardOrderError, setCardOrderError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [renameList, setRenameList] = useState(null);
  const [deleteList, setDeleteList] = useState(null);
  const [detailsCard, setDetailsCard] = useState(null);
  const [deleteCard, setDeleteCard] = useState(null);

  const memberDirectory = useMemo(() => {
    const m = new Map();
    for (const member of assignableMembers ?? []) {
      m.set(member.id, member);
    }
    return m;
  }, [assignableMembers]);

  const reloadBoardData = useCallback(async () => {
    if (!userId || !boardId) {
      setLists([]);
      setCards([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError("");
    try {
      const [listsNext, cardsNext] = await Promise.all([
        fetchListsForBoard(userId, boardId),
        fetchCardsForBoard(userId, boardId)
      ]);
      setLists(listsNext);
      setCards(cardsNext);
    } catch (err) {
      setLoadError(err?.message ?? "Could not load board columns.");
      setLists([]);
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [userId, boardId]);

  useEffect(() => {
    void reloadBoardData();
  }, [reloadBoardData]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setReorderError("");
    setCardOrderError("");

    if (!over) return;

    const activeIsList = lists.some((l) => l.id === active.id);
    if (activeIsList) {
      if (!lists.some((l) => l.id === over.id)) {
        return;
      }
      if (active.id === over.id) return;
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
      return;
    }

    const listIds = lists.map((l) => l.id);
    if (!listIds.length) return;

    const items = buildCardItemsByListId(lists, cards);
    const nextItems = applyCardDrag(items, listIds, active.id, over.id);
    if (!nextItems) return;

    const previousCards = cards;
    try {
      const updated = await persistCardOrderByList(userId, boardId, nextItems);
      setCards(updated);
    } catch (err) {
      setCardOrderError(err?.message ?? "Could not save card order.");
      setCards(previousCards);
      void reloadBoardData();
    }
  };

  if (!userId || !boardId) {
    return null;
  }

  const detailsCardLive = detailsCard ? cards.find((c) => c.id === detailsCard.id) ?? detailsCard : null;

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
        <SharedError title="Could not load lists" message={loadError} onRetry={reloadBoardData} />
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
          {cardOrderError ? (
            <Typography variant="body2" color="error">
              {cardOrderError}
            </Typography>
          ) : null}
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <SortableContext items={lists.map((l) => l.id)} strategy={horizontalListSortingStrategy}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  overflowX: "auto",
                  pb: 1,
                  alignItems: "flex-start",
                  flexWrap: "nowrap"
                }}
              >
                {lists.map((list) => (
                  <BoardListColumn
                    key={list.id}
                    list={list}
                    cards={sortCardsForList(cards, list.id)}
                    memberDirectory={memberDirectory}
                    userId={userId}
                    boardId={boardId}
                    onRename={(l) => setRenameList(l)}
                    onDelete={(l) => setDeleteList(l)}
                    onOpenCardDetails={(c) => setDetailsCard(c)}
                    onCardsChanged={reloadBoardData}
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
        onCreated={reloadBoardData}
      />

      {renameList ? (
        <RenameListDialog
          open={Boolean(renameList)}
          userId={userId}
          boardId={boardId}
          listId={renameList.id}
          initialName={renameList.name}
          onClose={() => setRenameList(null)}
          onRenamed={reloadBoardData}
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
          onDeleted={reloadBoardData}
        />
      ) : null}

      <CardDetailsDialog
        open={Boolean(detailsCard)}
        userId={userId}
        boardId={boardId}
        card={detailsCardLive}
        assignableMembers={assignableMembers ?? []}
        onClose={() => setDetailsCard(null)}
        onUpdated={reloadBoardData}
        onRequestDelete={(c) => {
          setDetailsCard(null);
          setDeleteCard(c);
        }}
      />

      {deleteCard ? (
        <DeleteCardDialog
          open={Boolean(deleteCard)}
          userId={userId}
          boardId={boardId}
          cardId={deleteCard.id}
          cardTitle={deleteCard.title}
          onClose={() => setDeleteCard(null)}
          onDeleted={reloadBoardData}
        />
      ) : null}
    </Stack>
  );
}
