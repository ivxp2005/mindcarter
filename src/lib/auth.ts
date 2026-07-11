/**
 * auth.ts — Role definitions and session-token utilities for MindCarter.
 *
 * PRODUCTION NOTE:
 *   Replace ADMIN_EMAIL / ADMIN_PASSWORD with a real DB lookup (Supabase,
 *   Postgres, etc.) and store SESSION_SECRET in an env var:
 *     process.env.ADMIN_SESSION_SECRET
 */

// ─── Role types ───────────────────────────────────────────────────────────────
export type UserRole = "patient" | "psychologist" | "admin";

export interface AdminUser {
  email: string;
  name: string;
  role: "admin";
}

// ─── Admin credentials ────────────────────────────────────────────────────────
// TODO: Move these to .env and use a hashed password with bcrypt in production.
export const ADMIN_EMAIL =
  (typeof process !== "undefined" && process.env.ADMIN_EMAIL) ||
  "admin@mindcarter.com";
export const ADMIN_PASSWORD =
  (typeof process !== "undefined" && process.env.ADMIN_PASSWORD) ||
  "MindCarter@Admin2024!";

// ─── Session config ───────────────────────────────────────────────────────────
export const SESSION_SECRET =
  (typeof process !== "undefined" && process.env.ADMIN_SESSION_SECRET) ||
  "mc-dev-secret-CHANGE-BEFORE-PRODUCTION";
export const COOKIE_NAME = "__mc_adm";
export const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

// ─── HMAC token helpers (Web Crypto — no external deps) ───────────────────────

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(email: string): Promise<string> {
  const expiresAt = Date.now() + COOKIE_MAX_AGE * 1000;
  const payload = `${email}|${expiresAt}`;
  const key = await getKey();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  // token = base64url(payload) + "." + base64url(sig)
  return `${btoa(payload)}.${sigB64}`;
}

export async function verifySessionToken(
  token: string,
): Promise<AdminUser | null> {
  try {
    const dotIdx = token.lastIndexOf(".");
    if (dotIdx === -1) return null;

    const payloadB64 = token.slice(0, dotIdx);
    const payload = atob(payloadB64);
    const [email, expiresStr] = payload.split("|");

    if (Date.now() > parseInt(expiresStr, 10)) return null; // expired

    // Reconstruct and compare signature
    const key = await getKey();
    const sigBytes = Uint8Array.from(atob(token.slice(dotIdx + 1)), (c) =>
      c.charCodeAt(0),
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(payload),
    );
    if (!valid) return null;

    return { email, name: "System Administrator", role: "admin" };
  } catch {
    return null;
  }
}
