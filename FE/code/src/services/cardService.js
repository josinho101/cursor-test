import { readCardsDocument, writeCardsDocument } from "./cardStorage.js";

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 5000;
const COMMENT_BODY_MAX = 2000;
const CHECKLIST_TITLE_MAX = 200;
const CHECKLIST_ITEM_TEXT_MAX = 500;

/** @type {readonly string[]} */
export const CARD_LABEL_OPTIONS = Object.freeze(["Bug", "Feature", "Docs", "Design", "Release"]);

function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `card-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

/**
 * @param {unknown} raw
 * @returns {import("./cardStorage.js").StoredCard["checklists"]}
 */
function normalizeChecklists(raw) {
  const checklists = Array.isArray(raw) ? raw : [];
  const normalized = [];

  for (const c of checklists) {
    const id = String(c?.id ?? "").trim();
    if (!id) continue;
    const title = String(c?.title ?? "").trim().slice(0, CHECKLIST_TITLE_MAX);

    const itemsRaw = Array.isArray(c?.items) ? c.items : [];
    const items = [];
    for (const item of itemsRaw) {
      const itemId = String(item?.id ?? "").trim();
      const text = String(item?.text ?? "").trim();
      if (!itemId || !text) continue;
      items.push({
        id: itemId,
        text: text.slice(0, CHECKLIST_ITEM_TEXT_MAX),
        completed: Boolean(item?.completed),
        position: 0
      });
    }
    items.forEach((it, index) => {
      it.position = index;
    });

    normalized.push({
      id,
      title,
      items
    });
  }

  return normalized;
}

/**
 * @param {import("./cardStorage.js").StoredCard[]} cards
 * @returns {import("./cardStorage.js").StoredCard[]}
 */
function normalizeCards(cards) {
  return cards.filter((c) => c && typeof c.id === "string" && typeof c.listId === "string");
}

/**
 * @param {import("./cardStorage.js").StoredCard[]} cards
 * @param {string} listId
 * @returns {import("./cardStorage.js").StoredCard[]}
 */
export function sortCardsForList(cards, listId) {
  return normalizeCards(cards)
    .filter((c) => c.listId === listId)
    .sort((a, b) => {
      const pa = Number(a.position) || 0;
      const pb = Number(b.position) || 0;
      if (pa !== pb) return pa - pb;
      return String(a.id).localeCompare(String(b.id));
    });
}

/**
 * @param {string} userId
 * @param {string} boardId
 * @returns {Promise<import("./cardStorage.js").StoredCard[]>}
 */
export async function fetchCardsForBoard(userId, boardId) {
  const { cards } = readCardsDocument(userId, boardId);
  return normalizeCards(cards);
}

/**
 * @param {{ title: unknown, description?: unknown }} input
 */
export function validateCardTitleInput(input) {
  const errors = {};
  const title = String(input?.title ?? "").trim();

  if (!title) {
    errors.title = "Card title is required.";
  } else if (title.length > TITLE_MAX) {
    errors.title = `Title must be ${TITLE_MAX} characters or fewer.`;
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: { title }
  };
}

/**
 * @param {{ description: unknown }} input
 */
export function validateCardDescriptionInput(input) {
  const errors = {};
  const description = String(input?.description ?? "").trim();

  if (description.length > DESCRIPTION_MAX) {
    errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: { description }
  };
}

/**
 * @param {string} userId
 * @param {string} boardId
 * @param {string} listId
 * @param {{ title: unknown }} input
 * @returns {Promise<import("./cardStorage.js").StoredCard>}
 */
export async function createCardForList(userId, boardId, listId, input) {
  const validation = validateCardTitleInput(input);
  if (!validation.ok) {
    const err = new Error("Validation failed");
    err.validationErrors = validation.errors;
    throw err;
  }

  const doc = readCardsDocument(userId, boardId);
  const inList = sortCardsForList(doc.cards, listId);
  const maxPos = inList.reduce((m, c) => Math.max(m, Number(c.position) || 0), -1);
  const ts = nowIso();
  const card = {
    id: newId(),
    listId,
    title: validation.values.title,
    description: "",
    position: maxPos + 1,
    memberIds: [],
    dueDate: null,
    labels: [],
    comments: [],
    checklists: [],
    createdAt: ts,
    updatedAt: ts
  };
  doc.cards.push(card);
  writeCardsDocument(userId, boardId, doc);
  return card;
}

/**
 * @param {string} userId
 * @param {string} boardId
 * @param {string} cardId
 * @param {{
 *   title?: unknown,
 *   description?: unknown,
 *   memberIds?: unknown,
 *   dueDate?: unknown,
 *   labels?: unknown,
 *   checklists?: unknown
 * }} patch
 * @returns {Promise<import("./cardStorage.js").StoredCard>}
 */
export async function updateCardForBoard(userId, boardId, cardId, patch) {
  const doc = readCardsDocument(userId, boardId);
  const idx = doc.cards.findIndex((c) => c.id === cardId);
  if (idx === -1) {
    throw new Error("Card not found.");
  }

  const current = doc.cards[idx];
  let next = { ...current };

  if (patch.title !== undefined) {
    const v = validateCardTitleInput({ title: patch.title });
    if (!v.ok) {
      const err = new Error("Validation failed");
      err.validationErrors = v.errors;
      throw err;
    }
    next.title = v.values.title;
  }

  if (patch.description !== undefined) {
    const v = validateCardDescriptionInput({ description: patch.description });
    if (!v.ok) {
      const err = new Error("Validation failed");
      err.validationErrors = v.errors;
      throw err;
    }
    next.description = v.values.description;
  }

  if (patch.memberIds !== undefined) {
    const raw = patch.memberIds;
    const ids = Array.isArray(raw) ? raw.map((x) => String(x)).filter(Boolean) : [];
    next.memberIds = [...new Set(ids)];
  }

  if (patch.dueDate !== undefined) {
    if (patch.dueDate === null || patch.dueDate === "") {
      next.dueDate = null;
    } else {
      const s = String(patch.dueDate);
      next.dueDate = s;
    }
  }

  if (patch.labels !== undefined) {
    const raw = patch.labels;
    const labels = Array.isArray(raw)
      ? raw.map((x) => String(x).trim()).filter((x) => CARD_LABEL_OPTIONS.includes(x))
      : [];
    next.labels = [...new Set(labels)];
  }

  if (patch.checklists !== undefined) {
    next.checklists = normalizeChecklists(patch.checklists);
  }

  next.updatedAt = nowIso();
  doc.cards[idx] = next;
  writeCardsDocument(userId, boardId, doc);
  return next;
}

/**
 * @param {string} userId
 * @param {string} boardId
 * @param {string} cardId
 * @returns {Promise<void>}
 */
export async function deleteCardForBoard(userId, boardId, cardId) {
  const doc = readCardsDocument(userId, boardId);
  const next = doc.cards.filter((c) => c.id !== cardId);
  if (next.length === doc.cards.length) {
    throw new Error("Card not found.");
  }
  const ts = nowIso();
  const byList = new Map();
  for (const c of normalizeCards(next)) {
    if (!byList.has(c.listId)) byList.set(c.listId, []);
    byList.get(c.listId).push(c);
  }
  for (const [, listCards] of byList) {
    listCards.sort((a, b) => (Number(a.position) || 0) - (Number(b.position) || 0));
    listCards.forEach((c, index) => {
      c.position = index;
      c.updatedAt = ts;
    });
  }
  writeCardsDocument(userId, boardId, { cards: next });
}

/**
 * @param {string} userId
 * @param {string} boardId
 * @param {string} listId
 * @returns {Promise<void>}
 */
export async function deleteCardsForList(userId, boardId, listId) {
  const doc = readCardsDocument(userId, boardId);
  const next = doc.cards.filter((c) => c.listId !== listId);
  writeCardsDocument(userId, boardId, { cards: next });
}

/**
 * @param {string} userId
 * @param {string} boardId
 * @param {Record<string, string[]>} itemsByListId
 * @returns {Promise<import("./cardStorage.js").StoredCard[]>}
 */
export async function persistCardOrderByList(userId, boardId, itemsByListId) {
  const doc = readCardsDocument(userId, boardId);
  const byId = new Map(doc.cards.map((c) => [c.id, { ...c }]));
  const ts = nowIso();

  for (const [listId, orderedIds] of Object.entries(itemsByListId)) {
    if (!Array.isArray(orderedIds)) continue;
    orderedIds.forEach((id, index) => {
      const row = byId.get(id);
      if (row) {
        byId.set(id, { ...row, listId, position: index, updatedAt: ts });
      }
    });
  }

  const nextCards = doc.cards.map((c) => byId.get(c.id) ?? c);
  writeCardsDocument(userId, boardId, { cards: nextCards });
  return fetchCardsForBoard(userId, boardId);
}

/**
 * @param {{ body: unknown }} input
 */
export function validateCommentInput(input) {
  const errors = {};
  const body = String(input?.body ?? "").trim();
  if (!body) {
    errors.body = "Comment cannot be empty.";
  } else if (body.length > COMMENT_BODY_MAX) {
    errors.body = `Comment must be ${COMMENT_BODY_MAX} characters or fewer.`;
  }
  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: { body }
  };
}

/**
 * @param {string} userId
 * @param {string} boardId
 * @param {string} cardId
 * @param {{ body: unknown, authorId: string, authorName: string }} input
 */
export async function addCommentToCard(userId, boardId, cardId, input) {
  const validation = validateCommentInput({ body: input?.body });
  if (!validation.ok) {
    const err = new Error("Validation failed");
    err.validationErrors = validation.errors;
    throw err;
  }

  const doc = readCardsDocument(userId, boardId);
  const idx = doc.cards.findIndex((c) => c.id === cardId);
  if (idx === -1) {
    throw new Error("Card not found.");
  }

  const row = doc.cards[idx];
  const comments = Array.isArray(row.comments) ? [...row.comments] : [];
  const ts = nowIso();
  comments.push({
    id: newId(),
    authorId: String(input.authorId ?? ""),
    authorName: String(input.authorName ?? "User"),
    body: validation.values.body,
    createdAt: ts
  });

  const updated = {
    ...row,
    comments,
    updatedAt: ts
  };
  doc.cards[idx] = updated;
  writeCardsDocument(userId, boardId, doc);
  return updated;
}
