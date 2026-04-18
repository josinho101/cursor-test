const storageVersion = "v1";

/**
 * @param {string} userId
 * @param {string} boardId
 */
function cardsStorageKey(userId, boardId) {
  return `app.cards.${storageVersion}:${userId}:${boardId}`;
}

/**
 * @typedef {{
 *   id: string,
 *   listId: string,
 *   title: string,
 *   description: string,
 *   position: number,
 *   memberIds: string[],
 *   dueDate: string | null,
 *   labels: string[],
 *   comments: { id: string, authorId: string, authorName: string, body: string, createdAt: string }[],
 *   checklists: {
 *     id: string,
 *     title: string,
 *     items: { id: string, text: string, completed: boolean, position: number }[]
 *   }[],
 *   createdAt: string,
 *   updatedAt: string
 * }} StoredCard
 */

/**
 * @param {string} userId
 * @param {string} boardId
 * @returns {{ cards: StoredCard[] }}
 */
export function readCardsDocument(userId, boardId) {
  if (!userId || !boardId) return { cards: [] };
  try {
    const raw = localStorage.getItem(cardsStorageKey(userId, boardId));
    if (!raw) return { cards: [] };
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.cards)) return { cards: [] };
    return { cards: data.cards };
  } catch {
    return { cards: [] };
  }
}

/**
 * @param {string} userId
 * @param {string} boardId
 * @param {{ cards: StoredCard[] }} doc
 */
export function writeCardsDocument(userId, boardId, doc) {
  if (!userId || !boardId) return;
  try {
    localStorage.setItem(cardsStorageKey(userId, boardId), JSON.stringify({ cards: doc.cards }));
  } catch {
    // ignore quota / private mode
  }
}

/**
 * @param {string} userId
 * @param {string} boardId
 */
export function clearCardsForBoard(userId, boardId) {
  if (!userId || !boardId) return;
  try {
    localStorage.removeItem(cardsStorageKey(userId, boardId));
  } catch {
    // ignore
  }
}
