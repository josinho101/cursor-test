import { readListsDocument, writeListsDocument } from "./listStorage.js";
import { deleteCardsForList } from "./cardService.js";

const NAME_MAX = 120;

function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `list-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

/**
 * @param {{ name: unknown }} input
 * @returns {{ ok: boolean, errors: Record<string, string>, values: { name: string } }}
 */
export function validateListNameInput(input) {
  const errors = {};
  const name = String(input?.name ?? "").trim();

  if (!name) {
    errors.name = "List name is required.";
  } else if (name.length > NAME_MAX) {
    errors.name = `List name must be ${NAME_MAX} characters or fewer.`;
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: { name }
  };
}

/**
 * @param {import("./listStorage.js").StoredList[]} lists
 * @returns {import("./listStorage.js").StoredList[]}
 */
function sortLists(lists) {
  return [...lists].sort((a, b) => {
    const pa = Number(a.position) || 0;
    const pb = Number(b.position) || 0;
    if (pa !== pb) return pa - pb;
    return String(a.id).localeCompare(String(b.id));
  });
}

/**
 * @param {string} userId
 * @param {string} boardId
 * @returns {Promise<import("./listStorage.js").StoredList[]>}
 */
export async function fetchListsForBoard(userId, boardId) {
  const { lists } = readListsDocument(userId, boardId);
  const normalized = lists.filter((l) => l && typeof l.id === "string" && typeof l.name === "string");
  return sortLists(normalized);
}

/**
 * @param {string} userId
 * @param {string} boardId
 * @param {{ name: unknown }} input
 * @returns {Promise<import("./listStorage.js").StoredList>}
 */
export async function createListForBoard(userId, boardId, input) {
  const validation = validateListNameInput(input);
  if (!validation.ok) {
    const err = new Error("Validation failed");
    err.validationErrors = validation.errors;
    throw err;
  }

  const doc = readListsDocument(userId, boardId);
  const sorted = sortLists(doc.lists.filter((l) => l && typeof l.id === "string"));
  const maxPos = sorted.reduce((m, l) => Math.max(m, Number(l.position) || 0), -1);
  const ts = nowIso();
  const list = {
    id: newId(),
    name: validation.values.name,
    position: maxPos + 1,
    createdAt: ts,
    updatedAt: ts
  };
  doc.lists.push(list);
  writeListsDocument(userId, boardId, doc);
  return list;
}

/**
 * @param {string} userId
 * @param {string} boardId
 * @param {string} listId
 * @param {{ name: unknown }} input
 * @returns {Promise<import("./listStorage.js").StoredList>}
 */
export async function updateListNameForBoard(userId, boardId, listId, input) {
  const validation = validateListNameInput(input);
  if (!validation.ok) {
    const err = new Error("Validation failed");
    err.validationErrors = validation.errors;
    throw err;
  }

  const doc = readListsDocument(userId, boardId);
  const idx = doc.lists.findIndex((l) => l.id === listId);
  if (idx === -1) {
    throw new Error("List not found.");
  }

  const updated = {
    ...doc.lists[idx],
    name: validation.values.name,
    updatedAt: nowIso()
  };
  doc.lists[idx] = updated;
  writeListsDocument(userId, boardId, doc);
  return updated;
}

/**
 * @param {string} userId
 * @param {string} boardId
 * @param {string[]} orderedListIds
 * @returns {Promise<import("./listStorage.js").StoredList[]>}
 */
export async function reorderListsForBoard(userId, boardId, orderedListIds) {
  if (!Array.isArray(orderedListIds) || orderedListIds.length === 0) {
    return fetchListsForBoard(userId, boardId);
  }

  const doc = readListsDocument(userId, boardId);
  const byId = new Map(doc.lists.map((l) => [l.id, l]));
  const seen = new Set();

  for (const id of orderedListIds) {
    if (typeof id !== "string" || !byId.has(id) || seen.has(id)) {
      throw new Error("Invalid list order.");
    }
    seen.add(id);
  }

  const allIds = sortLists(doc.lists.filter((l) => l && typeof l.id === "string")).map((l) => l.id);
  if (seen.size !== allIds.length) {
    throw new Error("Invalid list order.");
  }

  const ts = nowIso();
  orderedListIds.forEach((id, index) => {
    const row = byId.get(id);
    if (row) {
      byId.set(id, { ...row, position: index, updatedAt: ts });
    }
  });

  const nextLists = doc.lists.map((l) => byId.get(l.id) ?? l);
  writeListsDocument(userId, boardId, { lists: nextLists });
  return fetchListsForBoard(userId, boardId);
}

/**
 * @param {string} userId
 * @param {string} boardId
 * @param {string} listId
 * @returns {Promise<void>}
 */
export async function deleteListForBoard(userId, boardId, listId) {
  await deleteCardsForList(userId, boardId, listId);
  const doc = readListsDocument(userId, boardId);
  const next = doc.lists.filter((l) => l.id !== listId);
  if (next.length === doc.lists.length) {
    throw new Error("List not found.");
  }
  const sorted = sortLists(next);
  const ts = nowIso();
  sorted.forEach((l, index) => {
    l.position = index;
    l.updatedAt = ts;
  });
  writeListsDocument(userId, boardId, { lists: sorted });
}
