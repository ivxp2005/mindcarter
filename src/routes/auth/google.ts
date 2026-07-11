import { createFileRoute } from "@tanstack/react-router";
import { generateCodeVerifier, generateState } from "arctic";
import {
  GOOGLE_OAUTH_SCOPES,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  getGoogleClient,
  shortLivedCookie,
} from "../../lib/oauth.server";

// Patient-only entry point — kicks off the Google consent redirect. Sets
// short-lived state + PKCE verifier cookies that google.callback.ts checks.
export const Route = createFileRoute("/auth/google")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const google = getGoogleClient(origin);

        const state = generateState();
        const codeVerifier = generateCodeVerifier();
        const authUrl = google.createAuthorizationURL(state, codeVerifier, GOOGLE_OAUTH_SCOPES);

        const headers = new Headers({ Location: authUrl.toString() });
        headers.append("Set-Cookie", shortLivedCookie(OAUTH_STATE_COOKIE, state));
        headers.append("Set-Cookie", shortLivedCookie(OAUTH_VERIFIER_COOKIE, codeVerifier));

        return new Response(null, { status: 302, headers });
      },
    },
  },
});
