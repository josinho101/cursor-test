const storageVersion = "v1";

/**
 * @param {string} userId
 */
function boardsStorageKey(userId) {
  return `app.boards.${storageVersion}:${userId}`;
}

/**
 * @typedef {{ id: string, name: string, description: string, createdAt: string, updatedAt: string }} StoredBoard
 */

/**
 * @param {string} userId
 * @returns {{ boards: StoredBoard[] }}
 */
export function readBoardsDocument(userId) {
  if (!userId) return { boards: [] };
  try {
    const raw = localStorage.getItem(boardsStorageKey(userId));
    if (!raw) return { boards: [] };
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.boards)) return { boards: [] };
    return { boards: data.boards };
  } catch {
    return { boards: [] };
  }
}

/**
 * @param {string} userId
 * @param {{ boards: StoredBoard[] }} doc
 */
export function writeBoardsDocument(userId, doc) {
  if (!userId) return;
  try {
    localStorage.setItem(boardsStorageKey(userId), JSON.stringify({ boards: doc.boards }));
  } catch {
    // ignore quota / private mode
  }
}
