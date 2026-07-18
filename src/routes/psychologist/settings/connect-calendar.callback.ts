import { createFileRoute } from "@tanstack/react-router";
import { OAuth2RequestError } from "arctic";
import { getSessionUser } from "../../../lib/auth.server";
import {
  CALENDAR_STATE_COOKIE,
  CALENDAR_VERIFIER_COOKIE,
  exchangeCalendarCode,
  storeCalendarConnection,
} from "../../../lib/google-calendar.server";
import { expiredCookie, parseCookies } from "../../../lib/oauth.server";

function redirectTo(path: string, headers: Headers): Response {
  headers.set("Location", path);
  return new Response(null, { status: 302, headers });
}

export const Route = createFileRoute("/psychologist/settings/connect-calendar/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser();
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        const cookies = parseCookies(request.headers.get("cookie"));
        const storedState = cookies[CALENDAR_STATE_COOKIE];
        const codeVerifier = cookies[CALENDAR_VERIFIER_COOKIE];

        // Always clear the short-lived OAuth cookies, whatever the outcome.
        const headers = new Headers();
        headers.append("Set-Cookie", expiredCookie(CALENDAR_STATE_COOKIE));
        headers.append("Set-Cookie", expiredCookie(CALENDAR_VERIFIER_COOKIE));

        if (!user || user.role !== "psychologist") {
          return redirectTo("/login", headers);
        }
        if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
          return redirectTo("/psychologist/profile?calendar=error", headers);
        }

        try {
          const tokens = await exchangeCalendarCode(url.origin, code, codeVerifier);
          await storeCalendarConnection(user.id, tokens);
          return redirectTo("/psychologist/profile?calendar=connected", headers);
        } catch (err) {
          if (err instanceof OAuth2RequestError) {
            return redirectTo("/psychologist/profile?calendar=denied", headers);
          }
          console.error("[connect-calendar] callback failed:", err);
          return redirectTo("/psychologist/profile?calendar=error", headers);
        }
      },
    },
  },
});
