/**
 * auth.server.ts — Real, DB-backed authentication for all three roles
 * (patient / psychologist / admin).
 *
 * Session scheme: an HMAC-SHA256-signed, self-verifying cookie token
 * (`userId|role|expiresAt` + signature) — the same shape as the original
 * prototype's admin-only scheme in the now-deleted src/lib/auth.ts, extended
 * to cover every role. The signature lets us reject tampered/expired tokens
 * without a DB hit; a hash of the token is additionally stored in the
 * `sessions` table so a session can be revoked (sign-out, or an admin
 * suspending a user) even before it naturally expires — verification always
 * re-checks that row plus the user's current `status` in the DB, so a
 * suspended account is locked out immediately rather than only once its
 * token expires.
 *
 * `createSessionToken`/`COOKIE_NAME`/`COOKIE_MAX_AGE_SECONDS` are exported so
 * the Google OAuth callback route (src/routes/auth/google.callback.ts) — a
 * raw `server.handlers` route, not a createServerFn — can issue the exact
 * same session token/cookie without duplicating the signing logic; it can't
 * use `setCookie`/`getCookie` itself since it returns a manually-built
 * `Response` rather than going through the h3-event cookie helpers.
 */
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import {
  deleteCookie,
  getCookie,
  getRequestHeader,
  getRequestIP,
  setCookie,
} from "@tanstack/react-start/server";
import { compare, hash as bcryptHash } from "bcryptjs";
import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "../db/client.server";
import { emailOtps, passwordResetTokens, patientProfiles, sessions, users } from "../db/schema";
import { loginSchema, otpSchema, resetPasswordSchema, signupSchema } from "./auth-schemas";
import type { SessionUser, UserRole } from "./auth-types";
import { sendOtpEmail, sendPasswordResetEmail } from "./email.server";

const SESSION_SECRET = process.env.SESSION_SECRET ?? "mc-dev-secret-CHANGE-BEFORE-PRODUCTION";
export const COOKIE_NAME = "__mc_session";
// Separate cookie for the admin console (src/routes/portal-management-access.tsx)
// so an admin session and a patient/psychologist session can coexist in the
// same browser instead of overwriting each other.
export const ADMIN_COOKIE_NAME = "__mc_admin_session";
export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours
const BCRYPT_COST = 12;

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

// ─── Password hashing ──────────────────────────────────────────────────────

export function hashPassword(password: string): Promise<string> {
  return bcryptHash(password, BCRYPT_COST);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}

// ─── Low-level crypto (HMAC signing, token hashing) ────────────────────────

async function getHmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface TokenPayload {
  userId: string;
  role: UserRole;
  expiresAt: number;
}

async function signToken(payload: TokenPayload): Promise<string> {
  const raw = `${payload.userId}|${payload.role}|${payload.expiresAt}`;
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${btoa(raw)}.${sigB64}`;
}

async function verifyTokenSignature(token: string): Promise<TokenPayload | null> {
  try {
    const dotIdx = token.lastIndexOf(".");
    if (dotIdx === -1) return null;

    const rawB64 = token.slice(0, dotIdx);
    const raw = atob(rawB64);
    const [userId, role, expiresAtStr] = raw.split("|");
    const expiresAt = parseInt(expiresAtStr, 10);
    if (!userId || !role || Number.isNaN(expiresAt)) return null;
    if (Date.now() > expiresAt) return null;

    const key = await getHmacKey();
    const sigBytes = Uint8Array.from(atob(token.slice(dotIdx + 1)), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(raw));
    if (!valid) return null;

    return { userId, role: role as UserRole, expiresAt };
  } catch {
    return null;
  }
}

function generateOtpCode(): string {
  const value = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return value.toString().padStart(6, "0");
}

function generateResetToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Shared by signupFn and resendOtpFn so the code/hash/email logic lives in
 * one place. */
const createAndSendOtp = createServerOnlyFn(
  async (userId: string, email: string): Promise<void> => {
    const code = generateOtpCode();
    const codeHash = await sha256Hex(code);
    await db.insert(emailOtps).values({
      userId,
      codeHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });
    await sendOtpEmail(email, code);
  },
);

// ─── Session lifecycle ──────────────────────────────────────────────────────

/** Signs a token and records it in `sessions`, but does not set any cookie —
 * used by both the cookie-setting `issueSession` below and the OAuth
 * callback route, which sets the cookie itself on a raw `Response`. */
export const createSessionToken = createServerOnlyFn(
  async (userId: string, role: UserRole): Promise<string> => {
    const expiresAt = Date.now() + COOKIE_MAX_AGE_SECONDS * 1000;
    const token = await signToken({ userId, role, expiresAt });
    const tokenHash = await sha256Hex(token);

    await db.insert(sessions).values({
      userId,
      tokenHash,
      expiresAt: new Date(expiresAt),
      userAgent: getRequestHeader("user-agent") ?? null,
      ip: getRequestIP() ?? null,
    });

    return token;
  },
);

async function issueSessionCookie(
  userId: string,
  role: UserRole,
  cookieName: string,
): Promise<void> {
  const token = await createSessionToken(userId, role);
  setCookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

const issueSession = createServerOnlyFn(async (userId: string, role: UserRole): Promise<void> =>
  issueSessionCookie(userId, role, COOKIE_NAME),
);

const issueAdminSession = createServerOnlyFn(
  async (userId: string, role: UserRole): Promise<void> =>
    issueSessionCookie(userId, role, ADMIN_COOKIE_NAME),
);

async function resolveSessionUser(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;

  const payload = await verifyTokenSignature(token);
  if (!payload) return null;

  const tokenHash = await sha256Hex(token);
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1);

  const row = rows[0];
  if (!row || row.status !== "active") return null;

  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

export const getSessionUser = createServerOnlyFn(async (): Promise<SessionUser | null> =>
  resolveSessionUser(getCookie(COOKIE_NAME)),
);

export const getAdminSessionUser = createServerOnlyFn(async (): Promise<SessionUser | null> =>
  resolveSessionUser(getCookie(ADMIN_COOKIE_NAME)),
);

async function destroySessionCookie(cookieName: string): Promise<void> {
  const token = getCookie(cookieName);
  if (token) {
    const tokenHash = await sha256Hex(token);
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }
  deleteCookie(cookieName, { path: "/" });
}

const destroySession = createServerOnlyFn(async (): Promise<void> =>
  destroySessionCookie(COOKIE_NAME),
);

const destroyAdminSession = createServerOnlyFn(async (): Promise<void> =>
  destroySessionCookie(ADMIN_COOKIE_NAME),
);

// ─── Google OAuth account lookup/creation ──────────────────────────────────
// Used by src/routes/auth/google.callback.ts. Google sign-in is patient-only
// (per product decision — psychologist accounts are provisioned separately),
// so this never creates or matches a non-patient account.

export const findOrCreateGoogleUser = createServerOnlyFn(
  async (params: {
    googleId: string;
    email: string;
    name: string;
  }): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> => {
    const email = params.email.trim().toLowerCase();

    const byGoogleId = await db
      .select()
      .from(users)
      .where(eq(users.googleId, params.googleId))
      .limit(1);
    if (byGoogleId[0]) {
      const user = byGoogleId[0];
      if (user.status !== "active") return { ok: false, error: "This account is not active." };
      return {
        ok: true,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      };
    }

    const byEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (byEmail[0]) {
      const user = byEmail[0];
      if (user.role !== "patient") {
        return {
          ok: false,
          error: "This email belongs to a non-patient account. Sign in with your password instead.",
        };
      }
      if (user.status !== "active") return { ok: false, error: "This account is not active." };
      // Link this Google identity to the existing password-based account.
      await db.update(users).set({ googleId: params.googleId }).where(eq(users.id, user.id));
      return {
        ok: true,
        user: { id: user.id, email: user.email, name: user.name, role: "patient" },
      };
    }

    const [user] = await db
      .insert(users)
      .values({
        email,
        googleId: params.googleId,
        passwordHash: null,
        role: "patient",
        name: params.name.trim() || email,
      })
      .returning();
    await db.insert(patientProfiles).values({ userId: user.id });

    return { ok: true, user: { id: user.id, email: user.email, name: user.name, role: "patient" } };
  },
);

/** Shared credential check used by both `loginFn` and `adminLoginFn` — looks
 * up the user, checks status/password, but does not issue any session. */
async function authenticate(
  email: string,
  password: string,
): Promise<
  | { ok: true; user: typeof users.$inferSelect }
  | { ok: false; error: string; reason: "pending_verification"; email: string }
  | { ok: false; error: string; reason?: undefined }
> {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];

  if (!user) return { ok: false, error: "Invalid email or password." };
  if (user.status === "pending") {
    return {
      ok: false,
      reason: "pending_verification",
      email: user.email,
      error: "Please verify your email to sign in.",
    };
  }
  if (user.status !== "active") {
    return { ok: false, error: "This account is not active. Contact support." };
  }
  if (!user.passwordHash) {
    return {
      ok: false,
      error: "This account uses Google sign-in. Continue with Google instead.",
    };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { ok: false, error: "Invalid email or password." };

  return { ok: true, user };
}

// ─── Server functions (callable from client components/routes) ────────────

export const meFn = createServerFn({ method: "GET" }).handler(async () => {
  return getSessionUser();
});

export const adminMeFn = createServerFn({ method: "GET" }).handler(async () => {
  return getAdminSessionUser();
});

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { email: string; password: string })
  .handler(async ({ data }) => {
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false as const, error: parsed.error.issues[0].message };
    }

    const result = await authenticate(parsed.data.email, parsed.data.password);
    if (!result.ok) return result;
    // Admin credentials never work on the public login form — admins sign in
    // at the hidden /portal-management-access console only.
    if (result.user.role === "admin") {
      return { ok: false as const, error: "Invalid email or password." };
    }

    await issueSession(result.user.id, result.user.role);
    return { ok: true as const, role: result.user.role, name: result.user.name };
  });

export const adminLoginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { email: string; password: string })
  .handler(async ({ data }) => {
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false as const, error: parsed.error.issues[0].message };
    }

    const result = await authenticate(parsed.data.email, parsed.data.password);
    if (!result.ok) return result;
    // Only admin accounts can sign in here — patient/psychologist credentials
    // get the same generic rejection as a wrong password.
    if (result.user.role !== "admin") {
      return { ok: false as const, error: "Invalid email or password." };
    }

    await issueAdminSession(result.user.id, result.user.role);
    return { ok: true as const, role: result.user.role, name: result.user.name };
  });

// Patient-only: psychologist accounts are provisioned separately (seed
// script / admin), not self-service.
export const signupFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { name: string; email: string; password: string })
  .handler(async ({ data }) => {
    const parsed = signupSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false as const, error: parsed.error.issues[0].message };
    }
    const { name, email, password } = parsed.data;

    const existing = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing.length > 0) {
      const error = existing[0].passwordHash
        ? "An account with this email already exists."
        : "An account with this email already exists — continue with Google to sign in.";
      return { ok: false as const, error };
    }

    const passwordHash = await hashPassword(password);
    // TODO: email verification (OTP) — infra is built (createAndSendOtp,
    // verifyOtpFn, resendOtpFn, /verify-email) but not wired in yet. To
    // re-enable: set status: "pending" below and call
    // `await createAndSendOtp(user.id, user.email)` instead of
    // `issueSession`, then navigate signup.tsx to /verify-email again.
    const [user] = await db
      .insert(users)
      .values({ email, passwordHash, role: "patient", name })
      .returning();
    await db.insert(patientProfiles).values({ userId: user.id });

    await issueSession(user.id, user.role);
    return { ok: true as const, role: user.role, name: user.name };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  await destroySession();
  return { ok: true as const };
});

export const adminLogoutFn = createServerFn({ method: "POST" }).handler(async () => {
  await destroyAdminSession();
  return { ok: true as const };
});

// ─── Email verification (OTP) ──────────────────────────────────────────────

export const verifyOtpFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { email: string; code: string })
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const codeParsed = otpSchema.safeParse(data.code);
    if (!codeParsed.success) {
      return { ok: false as const, error: codeParsed.error.issues[0].message };
    }

    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];
    if (!user || user.status !== "pending") {
      return { ok: false as const, error: "Invalid or already-verified account." };
    }

    const otpRows = await db
      .select()
      .from(emailOtps)
      .where(eq(emailOtps.userId, user.id))
      .orderBy(desc(emailOtps.createdAt))
      .limit(1);
    const otp = otpRows[0];
    if (!otp || otp.expiresAt < new Date()) {
      return { ok: false as const, error: "This code has expired. Request a new one." };
    }
    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      return { ok: false as const, error: "Too many attempts. Request a new code." };
    }

    const codeHash = await sha256Hex(codeParsed.data);
    if (codeHash !== otp.codeHash) {
      const attempts = otp.attempts + 1;
      await db.update(emailOtps).set({ attempts }).where(eq(emailOtps.id, otp.id));
      const remaining = OTP_MAX_ATTEMPTS - attempts;
      return {
        ok: false as const,
        error: `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      };
    }

    await db.delete(emailOtps).where(eq(emailOtps.userId, user.id));
    await db.update(users).set({ status: "active" }).where(eq(users.id, user.id));
    await issueSession(user.id, user.role);
    return { ok: true as const };
  });

export const resendOtpFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { email: string })
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];
    if (!user || user.status !== "pending") {
      return { ok: false as const, error: "Invalid or already-verified account." };
    }

    const latest = await db
      .select()
      .from(emailOtps)
      .where(eq(emailOtps.userId, user.id))
      .orderBy(desc(emailOtps.createdAt))
      .limit(1);
    const last = latest[0];
    if (last && Date.now() - last.createdAt.getTime() < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil(
        (RESEND_COOLDOWN_MS - (Date.now() - last.createdAt.getTime())) / 1000,
      );
      return {
        ok: false as const,
        error: `Please wait ${waitSeconds}s before requesting another code.`,
      };
    }

    await createAndSendOtp(user.id, user.email);
    return { ok: true as const };
  });

// ─── Forgot / reset password ────────────────────────────────────────────────

export const requestPasswordResetFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { email: string })
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];

    // Always return the same generic response — never reveal whether the
    // email exists, is Google-only, or is inactive.
    if (user && user.status === "active" && user.passwordHash) {
      const latest = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, user.id))
        .orderBy(desc(passwordResetTokens.createdAt))
        .limit(1);
      const last = latest[0];
      const withinCooldown = last && Date.now() - last.createdAt.getTime() < RESEND_COOLDOWN_MS;

      if (!withinCooldown) {
        const rawToken = generateResetToken();
        const tokenHash = await sha256Hex(rawToken);
        await db.insert(passwordResetTokens).values({
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        });
        const origin =
          getRequestHeader("origin") ?? process.env.APP_ORIGIN ?? "http://localhost:3000";
        await sendPasswordResetEmail(user.email, `${origin}/reset-password?token=${rawToken}`);
      }
    }

    return { ok: true as const };
  });

export const resetPasswordFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { token: string; password: string })
  .handler(async ({ data }) => {
    if (!data.token) {
      return { ok: false as const, error: "This link is invalid or has expired." };
    }
    const parsed = resetPasswordSchema.safeParse({ password: data.password });
    if (!parsed.success) {
      return { ok: false as const, error: parsed.error.issues[0].message };
    }

    const tokenHash = await sha256Hex(data.token);
    const rows = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);
    const record = rows[0];
    if (!record || record.usedAt) {
      return { ok: false as const, error: "This link is invalid or has expired." };
    }

    const passwordHash = await hashPassword(parsed.data.password);
    await db.update(users).set({ passwordHash }).where(eq(users.id, record.userId));
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, record.id));
    await db.delete(sessions).where(eq(sessions.userId, record.userId));

    return { ok: true as const };
  });
