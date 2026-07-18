/**
 * google-calendar.server.ts — per-psychologist Google Calendar integration.
 *
 * Separate from the patient-login Google OAuth (src/routes/auth/google.*): this
 * flow asks a *psychologist* for the `calendar.events` scope with offline access
 * so we can create a Meet-enabled Calendar event on their calendar whenever one
 * of their bookings is confirmed.
 *
 * Reuses GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET. The long-lived refresh token is
 * stored AES-256-GCM-encrypted (crypto.server.ts); the short-lived access token +
 * its expiry are cached in plaintext and transparently refreshed here.
 *
 * We talk to the Calendar REST API with `fetch` and use `arctic` (already a
 * dependency, used by the login OAuth flow) for the code exchange / token
 * refresh — so there's no heavyweight `googleapis` dependency to add.
 */
import { Google, type OAuth2Tokens } from "arctic";
import { eq } from "drizzle-orm";
import { db } from "../db/client.server";
import { psychologistProfiles } from "../db/schema";
import { decryptSecret, encryptSecret } from "./crypto.server";

export const CALENDAR_OAUTH_SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

// Short-lived cookies for the connect round-trip — named distinctly from the
// login flow's g_oauth_* cookies so the two can't clobber each other.
export const CALENDAR_STATE_COOKIE = "gcal_oauth_state";
export const CALENDAR_VERIFIER_COOKIE = "gcal_oauth_verifier";

const CALENDAR_CALLBACK_PATH = "/psychologist/settings/connect-calendar/callback";
const IST_TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET = "+05:30";

export function calendarRedirectUri(origin: string): string {
  return `${origin}${CALENDAR_CALLBACK_PATH}`;
}

function getCalendarGoogleClient(origin: string): Google {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set");
  }
  return new Google(clientId, clientSecret, calendarRedirectUri(origin));
}

/** Consent URL for a psychologist connecting their calendar. `access_type=offline`
 *  + `prompt=consent` guarantee Google returns a refresh token every time. */
export function createCalendarAuthUrl(origin: string, state: string, codeVerifier: string): URL {
  const url = getCalendarGoogleClient(origin).createAuthorizationURL(
    state,
    codeVerifier,
    CALENDAR_OAUTH_SCOPES,
  );
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  return url;
}

export function exchangeCalendarCode(
  origin: string,
  code: string,
  codeVerifier: string,
): Promise<OAuth2Tokens> {
  return getCalendarGoogleClient(origin).validateAuthorizationCode(code, codeVerifier);
}

/** Persist the tokens from a successful connect, encrypting the refresh token. */
export async function storeCalendarConnection(
  psychologistId: string,
  tokens: OAuth2Tokens,
): Promise<void> {
  if (!tokens.hasRefreshToken()) {
    throw new Error("Google did not return a refresh token — re-consent required.");
  }
  await db
    .update(psychologistProfiles)
    .set({
      googleCalendarAccessToken: tokens.accessToken(),
      googleCalendarRefreshToken: encryptSecret(tokens.refreshToken()),
      googleCalendarTokenExpiresAt: tokens.accessTokenExpiresAt(),
      googleCalendarConnected: true,
    })
    .where(eq(psychologistProfiles.userId, psychologistId));
}

/** A valid access token for the psychologist, refreshing (and re-persisting) if
 *  the cached one is missing or within 60s of expiry. Throws if not connected. */
async function getValidAccessToken(psychologistId: string): Promise<string> {
  const [row] = await db
    .select({
      connected: psychologistProfiles.googleCalendarConnected,
      accessToken: psychologistProfiles.googleCalendarAccessToken,
      refreshToken: psychologistProfiles.googleCalendarRefreshToken,
      expiresAt: psychologistProfiles.googleCalendarTokenExpiresAt,
    })
    .from(psychologistProfiles)
    .where(eq(psychologistProfiles.userId, psychologistId))
    .limit(1);

  if (!row || !row.connected || !row.refreshToken) {
    throw new Error("This psychologist has not connected a Google Calendar.");
  }

  if (row.accessToken && row.expiresAt && row.expiresAt.getTime() - 60_000 > Date.now()) {
    return row.accessToken;
  }

  // Refresh — the redirect URI is irrelevant to the refresh grant, so any valid
  // origin works to construct the client.
  const origin = process.env.APP_ORIGIN ?? "http://localhost:3000";
  const tokens = await getCalendarGoogleClient(origin).refreshAccessToken(
    decryptSecret(row.refreshToken),
  );
  const accessToken = tokens.accessToken();
  await db
    .update(psychologistProfiles)
    .set({
      googleCalendarAccessToken: accessToken,
      googleCalendarTokenExpiresAt: tokens.accessTokenExpiresAt(),
    })
    .where(eq(psychologistProfiles.userId, psychologistId));
  return accessToken;
}

/** Build a UTC instant from an IST wall-clock date + time (the shape bookings
 *  store: "2026-07-20" + "09:00:00"). The explicit +05:30 offset makes this
 *  correct regardless of the server's own timezone. */
export function istInstant(dateISO: string, time: string): Date {
  const t = time.length === 5 ? `${time}:00` : time;
  return new Date(`${dateISO}T${t}${IST_OFFSET}`);
}

/** Format an instant as an RFC-3339 IST wall-clock string (…+05:30) for the
 *  Calendar API's `dateTime` field. */
function toIstRfc3339(instant: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}${IST_OFFSET}`;
}

export interface CreateMeetEventInput {
  psychologistId: string;
  patientEmail: string;
  patientName: string;
  startInstant: Date;
  endInstant: Date;
  summary: string;
}

/** Create a Meet-enabled event on the psychologist's primary calendar with the
 *  patient as an attendee. Returns the join link + Calendar event id. */
export async function createMeetEventForBooking(
  input: CreateMeetEventInput,
): Promise<{ meetLink: string | null; eventId: string | null }> {
  const accessToken = await getValidAccessToken(input.psychologistId);

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: input.summary,
        start: { dateTime: toIstRfc3339(input.startInstant), timeZone: IST_TIME_ZONE },
        end: { dateTime: toIstRfc3339(input.endInstant), timeZone: IST_TIME_ZONE },
        attendees: [{ email: input.patientEmail, displayName: input.patientName }],
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Calendar events.insert failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { id?: string; hangoutLink?: string };
  return { meetLink: data.hangoutLink ?? null, eventId: data.id ?? null };
}
