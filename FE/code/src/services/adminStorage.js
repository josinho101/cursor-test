import { initialUsers, initialWorkspaces } from "./adminMockData.js";

const USERS_STORAGE_KEY = "app.admin.users";
const WORKSPACES_STORAGE_KEY = "app.admin.workspaces";

export function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return initialUsers;
    return JSON.parse(raw);
  } catch {
    return initialUsers;
  }
}

export function writeUsers(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // Ignore
  }
}

export function readWorkspaces() {
  try {
    const raw = localStorage.getItem(WORKSPACES_STORAGE_KEY);
    if (!raw) return initialWorkspaces;
    return JSON.parse(raw);
  } catch {
    return initialWorkspaces;
  }
}

export function writeWorkspaces(workspaces) {
  try {
    localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(workspaces));
  } catch {
    // Ignore
  }
}
