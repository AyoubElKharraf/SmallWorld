/** Base URL de l’API (vide = chemins relatifs /api, pratique avec le proxy Vite). */
export function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export const AUTH_TOKEN_KEY = "sw_auth_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
}

/** fetch avec en-tête Authorization si un jeton est stocké. */
export function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const t = getToken();
  if (t) headers.set("Authorization", `Bearer ${t}`);
  if (!headers.has("Content-Type") && init.body && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  return fetch(apiUrl(path), { ...init, headers });
}
