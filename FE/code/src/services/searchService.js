import { fetchBoardsForUser } from "./boardService.js";
import { fetchCardsForBoard } from "./cardService.js";
import { fetchListsForBoard } from "./listService.js";

/**
 * @param {string} raw
 */
function normalizeQuery(raw) {
  return String(raw ?? "")
    .trim()
    .toLowerCase();
}

/**
 * @param {Map<string, { id: string, name: string }>} memberById
 * @param {import("./cardStorage.js").StoredCard} card
 * @param {string} q
 */
function cardMatchesQuery(card, q, memberById) {
  if (!q) return false;

  const title = String(card.title ?? "").toLowerCase();
  const description = String(card.description ?? "").toLowerCase();
  if (title.includes(q) || description.includes(q)) {
    return true;
  }

  for (const label of Array.isArray(card.labels) ? card.labels : []) {
    if (String(label).toLowerCase().includes(q)) {
      return true;
    }
  }

  const due = card.dueDate ? String(card.dueDate).toLowerCase() : "";
  if (due && due.includes(q)) {
    return true;
  }

  const memberIds = Array.isArray(card.memberIds) ? card.memberIds : [];
  for (const mid of memberIds) {
    const member = memberById.get(mid);
    if (member && String(member.name).toLowerCase().includes(q)) {
      return true;
    }
  }

  return false;
}

/**
 * @param {import("./boardStorage.js").StoredBoard} board
 * @param {string} q
 */
function boardMatchesQuery(board, q) {
  if (!q) return false;
  const name = String(board.name ?? "").toLowerCase();
  const description = String(board.description ?? "").toLowerCase();
  return name.includes(q) || description.includes(q);
}

/**
 * @param {string} userId
 * @param {string} queryRaw
 * @param {{ id: string, name: string }[]} assignableMembers
 * @returns {Promise<{
 *   query: string,
 *   boardMatches: import("./boardStorage.js").StoredBoard[],
 *   cardMatches: {
 *     board: import("./boardStorage.js").StoredBoard,
 *     list: import("./listStorage.js").StoredList,
 *     card: import("./cardStorage.js").StoredCard
 *   }[]
 * }>}
 */
export async function searchBoardsAndCards(userId, queryRaw, assignableMembers) {
  const trimmed = String(queryRaw ?? "").trim();
  const q = normalizeQuery(queryRaw);

  /** @type {Map<string, { id: string, name: string }>} */
  const memberById = new Map();
  for (const m of assignableMembers ?? []) {
    if (m?.id) memberById.set(m.id, { id: m.id, name: String(m.name ?? "") });
  }

  if (!userId || !q) {
    return { query: trimmed, boardMatches: [], cardMatches: [] };
  }

  const boards = await fetchBoardsForUser(userId);

  /** @type {import("./boardStorage.js").StoredBoard[]} */
  const boardMatches = [];
  /** @type {{ board: import("./boardStorage.js").StoredBoard, list: import("./listStorage.js").StoredList, card: import("./cardStorage.js").StoredCard }[]} */
  const cardMatches = [];

  for (const board of boards) {
    if (boardMatchesQuery(board, q)) {
      boardMatches.push(board);
    }

    const [lists, cards] = await Promise.all([
      fetchListsForBoard(userId, board.id),
      fetchCardsForBoard(userId, board.id)
    ]);

    /** @type {Map<string, import("./listStorage.js").StoredList>} */
    const listById = new Map();
    for (const list of lists) {
      listById.set(list.id, list);
    }

    for (const card of cards) {
      if (!cardMatchesQuery(card, q, memberById)) continue;
      const list =
        listById.get(card.listId) ??
        ({
          id: card.listId,
          name: "Unknown list",
          position: 0,
          createdAt: "",
          updatedAt: ""
        });
      cardMatches.push({ board, list, card });
    }
  }

  return { query: trimmed, boardMatches, cardMatches };
}
