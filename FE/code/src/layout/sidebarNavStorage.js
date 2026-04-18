const storageKey = "app.sidebarNavCollapsed";

export function getStoredSidebarNavCollapsed() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw === "true") return true;
    if (raw === "false") return false;
  } catch {
    // ignore
  }
  return false;
}

export function setStoredSidebarNavCollapsed(collapsed) {
  try {
    localStorage.setItem(storageKey, collapsed ? "true" : "false");
  } catch {
    // ignore
  }
}
