const storageVersion = "v1";

/**
 * @param {string} userId
 * @param {string} boardId
 */
function listsStorageKey(userId, boardId) {
  return `app.lists.${storageVersion}:${userId}:${boardId}`;
}

/**
 * @typedef {{ id: string, name: string, position: number, createdAt: string, updatedAt: string }} StoredList
 */

/**
 * @param {string} userId
 * @param {string} boardId
 * @returns {{ lists: StoredList[] }}
 */
export function readListsDocument(userId, boardId) {
  if (!userId || !boardId) return { lists: [] };
  try {
    const raw = localStorage.getItem(listsStorageKey(userId, boardId));
    if (!raw) return { lists: [] };
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.lists)) return { lists: [] };
    return { lists: data.lists };
  } catch {
    return { lists: [] };
  }
}

/**
 * @param {string} userId
 * @param {string} boardId
 * @param {{ lists: StoredList[] }} doc
 */
export function writeListsDocument(userId, boardId, doc) {
  if (!userId || !boardId) return;
  try {
    localStorage.setItem(listsStorageKey(userId, boardId), JSON.stringify({ lists: doc.lists }));
  } catch {
    // ignore quota / private mode
  }
}

/**
 * @param {string} userId
 * @param {string} boardId
 */
export function clearListsForBoard(userId, boardId) {
  if (!userId || !boardId) return;
  try {
    localStorage.removeItem(listsStorageKey(userId, boardId));
  } catch {
    // ignore
  }
}
