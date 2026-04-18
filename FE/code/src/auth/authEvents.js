export const authSessionInvalidatedEvent = "app:auth:session-invalidated";

const bannerKey = "app.auth.banner";

export function requestAuthSessionReset(message) {
  if (typeof window === "undefined") return;
  if (message) {
    try {
      sessionStorage.setItem(bannerKey, message);
    } catch {
      // ignore
    }
  }
  window.dispatchEvent(new CustomEvent(authSessionInvalidatedEvent));
}

export function consumeAuthBannerMessage() {
  if (typeof window === "undefined") return null;
  try {
    const value = sessionStorage.getItem(bannerKey);
    if (value) sessionStorage.removeItem(bannerKey);
    return value;
  } catch {
    return null;
  }
}
