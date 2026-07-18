import { createFileRoute } from "@tanstack/react-router";
import { generateCodeVerifier, generateState } from "arctic";
import { getSessionUser } from "../../../lib/auth.server";
import {
  CALENDAR_STATE_COOKIE,
  CALENDAR_VERIFIER_COOKIE,
  createCalendarAuthUrl,
} from "../../../lib/google-calendar.server";
import { shortLivedCookie } from "../../../lib/oauth.server";

// Psychologist-only — kicks off the Google Calendar consent redirect (offline
// access, calendar.events scope). Guarded inside the handler via getSessionUser()
// since server-route handlers bypass the /psychologist layout's beforeLoad.
export const Route = createFileRoute("/psychologist/settings/connect-calendar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser();
        if (!user || user.role !== "psychologist") {
          return new Response(null, { status: 302, headers: { Location: "/login" } });
        }

        const origin = new URL(request.url).origin;
        const state = generateState();
        const codeVerifier = generateCodeVerifier();
        const authUrl = createCalendarAuthUrl(origin, state, codeVerifier);

        const headers = new Headers({ Location: authUrl.toString() });
        headers.append("Set-Cookie", shortLivedCookie(CALENDAR_STATE_COOKIE, state));
        headers.append("Set-Cookie", shortLivedCookie(CALENDAR_VERIFIER_COOKIE, codeVerifier));

        return new Response(null, { status: 302, headers });
      },
    },
  },
});
