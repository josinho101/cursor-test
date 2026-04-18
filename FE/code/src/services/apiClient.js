import { readAuthSession } from "./authSessionStorage.js";
import { requestAuthSessionReset } from "../auth/authEvents.js";

/**
 * Fetch helper that attaches the stored access token and reacts to 401 responses.
 * @param {RequestInfo | URL} input
 * @param {RequestInit} [init]
 */
export async function authorizedFetch(input, init = {}) {
  const session = readAuthSession();
  const headers = new Headers(init.headers ?? {});
  if (session?.accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const response = await fetch(input, { ...init, headers });

  if (response.status === 401) {
    requestAuthSessionReset("Your session is no longer valid. Please sign in again.");
  }

  return response;
}
