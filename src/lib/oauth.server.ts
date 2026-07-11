import { Google } from "arctic";

/** Built per-request from the request's own origin, so it works unchanged
 * across localhost dev and whatever domain this deploys to — no separate
 * GOOGLE_REDIRECT_URI env var to keep in sync. */
export function getGoogleClient(requestOrigin: string): Google {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set");
  }
  return new Google(clientId, clientSecret, `${requestOrigin}/auth/google/callback`);
}

export const GOOGLE_OAUTH_SCOPES = ["openid", "email", "profile"];

export const OAUTH_STATE_COOKIE = "g_oauth_state";
export const OAUTH_VERIFIER_COOKIE = "g_oauth_verifier";
export const OAUTH_COOKIE_MAX_AGE_SECONDS = 600; // 10 minutes — just long enough for the redirect round-trip

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

export function shortLivedCookie(name: string, value: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${OAUTH_COOKIE_MAX_AGE_SECONDS}${secure}`;
}

export function expiredCookie(name: string): string {
  return `${name}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}
