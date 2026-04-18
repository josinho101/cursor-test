const storageKey = "app.themeMode";

export function getStoredThemeMode() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw === "light" || raw === "dark") return raw;
  } catch {
    // ignore
  }
  return "dark";
}

export function setStoredThemeMode(mode) {
  try {
    localStorage.setItem(storageKey, mode);
  } catch {
    // ignore
  }
}

