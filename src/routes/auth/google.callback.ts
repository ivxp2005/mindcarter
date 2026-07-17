import { createFileRoute } from "@tanstack/react-router";
import { OAuth2RequestError } from "arctic";
import {
  COOKIE_MAX_AGE_SECONDS,
  COOKIE_NAME,
  createSessionToken,
  findOrCreateGoogleUser,
} from "../../lib/auth.server";
import {
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  expiredCookie,
  getGoogleClient,
  parseCookies,
} from "../../lib/oauth.server";

function redirectTo(path: string, extraHeaders: Headers): Response {
  extraHeaders.set("Location", path);
  return new Response(null, { status: 302, headers: extraHeaders });
}

export const Route = createFileRoute("/auth/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        const cookies = parseCookies(request.headers.get("cookie"));
        const storedState = cookies[OAUTH_STATE_COOKIE];
        const codeVerifier = cookies[OAUTH_VERIFIER_COOKIE];

        // Always clear the short-lived OAuth cookies, whatever the outcome.
        const headers = new Headers();
        headers.append("Set-Cookie", expiredCookie(OAUTH_STATE_COOKIE));
        headers.append("Set-Cookie", expiredCookie(OAUTH_VERIFIER_COOKIE));

        if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
          return redirectTo("/login?error=oauth_state", headers);
        }

        try {
          const google = getGoogleClient(url.origin);
          const tokens = await google.validateAuthorizationCode(code, codeVerifier);

          const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: { Authorization: `Bearer ${tokens.accessToken()}` },
          });
          if (!profileRes.ok) return redirectTo("/login?error=oauth_profile", headers);

          const profile = (await profileRes.json()) as {
            sub: string;
            email?: string;
            email_verified?: boolean;
            name?: string;
          };
          if (!profile.email || !profile.email_verified) {
            return redirectTo("/login?error=oauth_unverified_email", headers);
          }

          const result = await findOrCreateGoogleUser({
            googleId: profile.sub,
            email: profile.email,
            name: profile.name ?? profile.email,
          });
          if (!result.ok) {
            return redirectTo(`/login?error=${encodeURIComponent(result.error)}`, headers);
          }

          const sessionToken = await createSessionToken(result.user.id, result.user.role);
          const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
          headers.append(
            "Set-Cookie",
            `${COOKIE_NAME}=${sessionToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}${secure}`,
          );

          return redirectTo("/employee", headers);
        } catch (err) {
          if (err instanceof OAuth2RequestError) {
            return redirectTo("/login?error=oauth_denied", headers);
          }
          return redirectTo("/login?error=oauth_failed", headers);
        }
      },
    },
  },
});
