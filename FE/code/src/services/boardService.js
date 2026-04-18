import { readBoardsDocument, writeBoardsDocument } from "./boardStorage.js";

const NAME_MAX = 120;
const DESCRIPTION_MAX = 2000;

function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `board-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

/**
 * @param {{ name: unknown, description: unknown }} input
 * @returns {{ ok: boolean, errors: Record<string, string>, values: { name: string, description: string } }}
 */
export function validateBoardInput(input) {
  const errors = {};
  const name = String(input?.name ?? "").trim();
  const description = String(input?.description ?? "").trim();

  if (!name) {
    errors.name = "Board name is required.";
  } else if (name.length > NAME_MAX) {
    errors.name = `Board name must be ${NAME_MAX} characters or fewer.`;
  }

  if (description.length > DESCRIPTION_MAX) {
    errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: { name, description }
  };
}

/**
 * @param {string} userId
 * @returns {Promise<import("./boardStorage.js").StoredBoard[]>}
 */
export async function fetchBoardsForUser(userId) {
  const { boards } = readBoardsDocument(userId);
  const normalized = boards.filter((b) => b && typeof b.id === "string");
  normalized.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  return normalized;
}

/**
 * @param {string} userId
 * @param {string} boardId
 * @returns {Promise<import("./boardStorage.js").StoredBoard | null>}
 */
export async function fetchBoardById(userId, boardId) {
  const boards = await fetchBoardsForUser(userId);
  return boards.find((b) => b.id === boardId) ?? null;
}

/**
 * @param {string} userId
 * @param {{ name: unknown, description: unknown }} input
 * @returns {Promise<import("./boardStorage.js").StoredBoard>}
 */
export async function createBoardForUser(userId, input) {
  const validation = validateBoardInput(input);
  if (!validation.ok) {
    const err = new Error("Validation failed");
    err.validationErrors = validation.errors;
    throw err;
  }

  const doc = readBoardsDocument(userId);
  const ts = nowIso();
  const board = {
    id: newId(),
    name: validation.values.name,
    description: validation.values.description,
    createdAt: ts,
    updatedAt: ts
  };
  doc.boards.push(board);
  writeBoardsDocument(userId, doc);
  return board;
}

/**
 * @param {string} userId
 * @param {string} boardId
 * @param {{ name: unknown, description: unknown }} input
 * @returns {Promise<import("./boardStorage.js").StoredBoard>}
 */
export async function updateBoardForUser(userId, boardId, input) {
  const validation = validateBoardInput(input);
  if (!validation.ok) {
    const err = new Error("Validation failed");
    err.validationErrors = validation.errors;
    throw err;
  }

  const doc = readBoardsDocument(userId);
  const idx = doc.boards.findIndex((b) => b.id === boardId);
  if (idx === -1) {
    throw new Error("Board not found.");
  }

  const updated = {
    ...doc.boards[idx],
    name: validation.values.name,
    description: validation.values.description,
    updatedAt: nowIso()
  };
  doc.boards[idx] = updated;
  writeBoardsDocument(userId, doc);
  return updated;
}

/**
 * @param {string} userId
 * @param {string} boardId
 * @returns {Promise<void>}
 */
export async function deleteBoardForUser(userId, boardId) {
  const doc = readBoardsDocument(userId);
  const next = doc.boards.filter((b) => b.id !== boardId);
  if (next.length === doc.boards.length) {
    throw new Error("Board not found.");
  }
  writeBoardsDocument(userId, { boards: next });
}
