const storageKey = "app.auth.session";

/**
 * @typedef {{ accessToken: string, refreshToken?: string | null }} AuthSession
 */

/** @returns {AuthSession | null} */
export function readAuthSession() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data.accessToken !== "string") return null;
    return {
      accessToken: data.accessToken,
      refreshToken: typeof data.refreshToken === "string" ? data.refreshToken : null
    };
  } catch {
    return null;
  }
}

/** @param {AuthSession} session */
export function writeAuthSession(session) {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken ?? null
      })
    );
  } catch {
    // ignore quota / private mode
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // ignore
  }
}
