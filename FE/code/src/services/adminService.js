import { readUsers, writeUsers, readWorkspaces, writeWorkspaces } from "./adminStorage.js";

// Users
export async function getUsers() {
  // simulate network latency
  await new Promise((r) => setTimeout(r, 400));
  return readUsers();
}

export async function updateUserRole(userId, newRole) {
  await new Promise((r) => setTimeout(r, 400));
  const users = readUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    users[index].role = newRole;
    writeUsers(users);
  }
  return users;
}

export async function deleteUser(userId) {
  await new Promise((r) => setTimeout(r, 400));
  const users = readUsers();
  const updated = users.filter((u) => u.id !== userId);
  writeUsers(updated);
  return updated;
}

// Workspaces
export async function getWorkspaces() {
  await new Promise((r) => setTimeout(r, 400));
  return readWorkspaces();
}

export async function updateWorkspace(workspaceId, newName) {
  await new Promise((r) => setTimeout(r, 400));
  const workspaces = readWorkspaces();
  const index = workspaces.findIndex((w) => w.id === workspaceId);
  if (index !== -1) {
    workspaces[index].name = newName;
    writeWorkspaces(workspaces);
  }
  return workspaces;
}

export async function deleteWorkspace(workspaceId) {
  await new Promise((r) => setTimeout(r, 400));
  const workspaces = readWorkspaces();
  const updated = workspaces.filter((w) => w.id !== workspaceId);
  writeWorkspaces(updated);
  return updated;
}
