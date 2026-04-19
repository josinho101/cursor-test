import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
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
import { BoardViewFiltersBar } from "./boardViewFiltersBar.jsx";
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
 *   list: import("../services/listStorage.js").StoredList,
 *   cardCount: number
 * }} props
 */
function ListDragGhost({ list, cardCount }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        width: 280,
        borderRadius: 3,
        opacity: 0.96,
        boxShadow: 8,
        bgcolor: "background.paper"
      }}
    >
      <Stack sx={{ px: 1.25, py: 1, borderBottom: 1, borderColor: "divider", bgcolor: "action.hover" }}>
        <Typography variant="subtitle1" fontWeight={800} noWrap>
          {list.name}
        </Typography>
      </Stack>
      <Box sx={{ p: 1.25 }}>
        <Typography variant="body2" color="text.secondary">
          {cardCount} {cardCount === 1 ? "card" : "cards"}
        </Typography>
      </Box>
    </Paper>
  );
}

/**
 * @param {{
 *   card: import("../services/cardStorage.js").StoredCard,
 *   memberCount: number
 * }} props
 */
function CardDragGhost({ card, memberCount }) {
  const dueLabel = card.dueDate ? String(card.dueDate).slice(0, 10) : "";
  return (
    <Paper
      variant="outlined"
      sx={{
        minWidth: 240,
        maxWidth: 320,
        borderRadius: 2,
        p: 1.25,
        opacity: 0.96,
        boxShadow: 8,
        bgcolor: "background.paper"
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} sx={{ wordBreak: "break-word" }}>
        {card.title}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
        {dueLabel ? (
          <Typography variant="caption" color="text.secondary">
            Due {dueLabel}
          </Typography>
        ) : null}
        {memberCount > 0 ? (
          <Typography variant="caption" color="text.secondary">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}

/**
 * @param {{
 *   userId: string,
 *   boardId: string,
 *   assignableMembers: { id: string, name: string }[],
 *   openCardIdFromQuery?: string,
 *   onConsumedOpenCardFromQuery?: () => void
 * }} props
 */
export function BoardListsSection({
  userId,
  boardId,
  assignableMembers,
  openCardIdFromQuery = "",
  onConsumedOpenCardFromQuery
}) {
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
  const [activeDrag, setActiveDrag] = useState(null);
  const [filterMemberIds, setFilterMemberIds] = useState([]);
  const [filterListIds, setFilterListIds] = useState([]);

  const memberDirectory = useMemo(() => {
    const m = new Map();
    for (const member of assignableMembers ?? []) {
      m.set(member.id, member);
    }
    return m;
  }, [assignableMembers]);

  const filtersActive = filterMemberIds.length > 0 || filterListIds.length > 0;
  const cardDragDisabled = filtersActive;

  const filteredCards = useMemo(() => {
    let next = cards;
    if (filterMemberIds.length > 0) {
      next = next.filter((c) => {
        const mids = Array.isArray(c.memberIds) ? c.memberIds : [];
        return filterMemberIds.some((id) => mids.includes(id));
      });
    }
    if (filterListIds.length > 0) {
      next = next.filter((c) => filterListIds.includes(c.listId));
    }
    return next;
  }, [cards, filterMemberIds, filterListIds]);

  const visibleCardCount = useMemo(() => {
    return lists.reduce((sum, list) => sum + sortCardsForList(filteredCards, list.id).length, 0);
  }, [lists, filteredCards]);

  const hideListsDueToFilters = filtersActive && cards.length > 0 && visibleCardCount === 0;

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

  useEffect(() => {
    const id = String(openCardIdFromQuery ?? "").trim();
    if (!id) return;
    if (loading) return;
    const match = cards.find((c) => c.id === id);
    if (match) {
      setDetailsCard(match);
    }
    onConsumedOpenCardFromQuery?.();
  }, [openCardIdFromQuery, loading, cards, onConsumedOpenCardFromQuery]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    const activeId = String(event.active.id);
    const activeIsList = lists.some((l) => l.id === activeId);
    setActiveDrag({ type: activeIsList ? "list" : "card", id: activeId });
  };

  const handleDragCancel = () => {
    setActiveDrag(null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setReorderError("");
    setCardOrderError("");
    try {
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
    } finally {
      setActiveDrag(null);
    }
  };

  if (!userId || !boardId) {
    return null;
  }

  const detailsCardLive = detailsCard ? cards.find((c) => c.id === detailsCard.id) ?? detailsCard : null;
  const activeListGhost = activeDrag?.type === "list" ? lists.find((l) => l.id === activeDrag.id) ?? null : null;
  const activeCardGhost = activeDrag?.type === "card" ? cards.find((c) => c.id === activeDrag.id) ?? null : null;

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
          <BoardViewFiltersBar
            assignableMembers={assignableMembers ?? []}
            lists={lists}
            selectedMemberIds={filterMemberIds}
            onChangeMemberIds={setFilterMemberIds}
            selectedListIds={filterListIds}
            onChangeListIds={setFilterListIds}
            onClearAll={() => {
              setFilterMemberIds([]);
              setFilterListIds([]);
            }}
          />

          {filtersActive && cards.length > 0 && visibleCardCount === 0 ? (
            <Paper variant="outlined" sx={{ p: 0 }}>
              <SharedEmpty
                title="No cards match these filters"
                description="Try removing a filter or picking different lists and assignees."
                actionLabel="Clear filters"
                onAction={() => {
                  setFilterMemberIds([]);
                  setFilterListIds([]);
                }}
              />
            </Paper>
          ) : null}

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
          {!hideListsDueToFilters ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragCancel={handleDragCancel}
              onDragEnd={handleDragEnd}
            >
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
                      cards={sortCardsForList(filteredCards, list.id)}
                      memberDirectory={memberDirectory}
                      userId={userId}
                      boardId={boardId}
                      onRename={(l) => setRenameList(l)}
                      onDelete={(l) => setDeleteList(l)}
                      onOpenCardDetails={(c) => setDetailsCard(c)}
                      onCardsChanged={reloadBoardData}
                      cardDragDisabled={cardDragDisabled}
                      filtersActive={filtersActive}
                    />
                  ))}
                </Box>
              </SortableContext>
              <DragOverlay>
                {activeListGhost ? (
                  <ListDragGhost list={activeListGhost} cardCount={sortCardsForList(cards, activeListGhost.id).length} />
                ) : null}
                {activeCardGhost ? (
                  <CardDragGhost
                    card={activeCardGhost}
                    memberCount={Array.isArray(activeCardGhost.memberIds) ? activeCardGhost.memberIds.length : 0}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : null}
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
