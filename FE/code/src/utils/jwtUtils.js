/**
 * Client-side JWT helpers for display and expiry checks only.
 * Signature verification must happen on the server.
 */

export function encodeBase64UrlUtf8(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeBase64UrlJson(segment) {
  if (!segment || typeof segment !== "string") return null;
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/") + "==".slice((segment.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}

export function parseJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    return decodeBase64UrlJson(parts[1]);
  } catch {
    return null;
  }
}

export function isJwtExpired(payload, skewSeconds = 30) {
  if (!payload || typeof payload.exp !== "number") return false;
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}

export function buildUnsignedJwt(payloadObject) {
  const header = encodeBase64UrlUtf8(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = encodeBase64UrlUtf8(JSON.stringify(payloadObject));
  return `${header}.${payload}.`;
}
