import { buildUnsignedJwt } from "../utils/jwtUtils.js";

const MOCK_USER = {
  email: "user@example.com",
  password: "User123!",
  id: "user-1",
  name: "Demo User",
  role: "user"
};

const MOCK_ADMIN = {
  email: "admin@example.com",
  password: "Admin123!",
  id: "admin-1",
  name: "Demo Admin",
  role: "admin"
};

function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (!raw || typeof raw !== "string") return "";
  return raw.replace(/\/+$/, "");
}

async function readErrorMessage(response) {
  try {
    const data = await response.json();
    if (data && typeof data.message === "string") return data.message;
    if (data && typeof data.error === "string") return data.error;
  } catch {
    // ignore
  }
  return response.statusText || "Request failed";
}

function sessionFromApiPayload(data) {
  const accessToken =
    data?.access_token ?? data?.accessToken ?? data?.token ?? data?.jwt ?? null;
  const refreshToken = data?.refresh_token ?? data?.refreshToken ?? null;
  if (!accessToken || typeof accessToken !== "string") {
    throw new Error("Login response did not include an access token.");
  }
  return {
    accessToken,
    refreshToken: typeof refreshToken === "string" ? refreshToken : null
  };
}

function mockLogin({ email, password }) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const candidate =
    normalizedEmail === MOCK_ADMIN.email.toLowerCase() && password === MOCK_ADMIN.password
      ? MOCK_ADMIN
      : normalizedEmail === MOCK_USER.email.toLowerCase() && password === MOCK_USER.password
        ? MOCK_USER
        : null;

  if (!candidate) {
    throw new Error("Invalid email or password.");
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const exp = nowSeconds + 60 * 60;

  const token = buildUnsignedJwt({
    sub: candidate.id,
    email: candidate.email,
    name: candidate.name,
    role: candidate.role,
    iat: nowSeconds,
    exp
  });

  return {
    accessToken: token,
    refreshToken: null
  };
}

/**
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ accessToken: string, refreshToken: string | null }>}
 */
export async function loginWithCredentials({ email, password }) {
  const base = getApiBaseUrl();
  if (!base) {
    return mockLogin({ email, password });
  }

  const response = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data = await response.json();
  return sessionFromApiPayload(data);
}

export function getMockLoginHints() {
  return {
    userEmail: MOCK_USER.email,
    userPassword: MOCK_USER.password,
    adminEmail: MOCK_ADMIN.email,
    adminPassword: MOCK_ADMIN.password
  };
}
