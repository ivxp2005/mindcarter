import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, LogIn, User, Stethoscope } from "lucide-react";
import { useState } from "react";
import { loginFn, resendOtpFn } from "../lib/auth.server";
import type { UserRole } from "../lib/auth-types";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_state: "Google sign-in expired or was tampered with. Please try again.",
  oauth_profile: "Couldn't read your Google profile. Please try again.",
  oauth_unverified_email: "Your Google email isn't verified. Please verify it with Google first.",
  oauth_denied: "Google sign-in was cancelled or denied.",
  oauth_failed: "Google sign-in failed. Please try again or use your email and password.",
};

const NOTICE_MESSAGES: Record<string, string> = {
  reset_success: "Your password has been reset. Sign in with your new password.",
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { error?: string; notice?: string } => ({
    error: typeof search.error === "string" ? search.error : undefined,
    notice: typeof search.notice === "string" ? search.notice : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Mindcarter" },
      {
        name: "description",
        content: "Sign in to your Mindcarter account — patient or psychologist portal.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

type Role = "patient" | "psychologist";

const ROLE_CONFIG: Record<
  Role,
  {
    label: string;
    icon: React.ElementType;
    tagline: string;
    portalDesc: string;
    panelHeading: string;
    panelSub: string;
  }
> = {
  patient: {
    label: "Patient",
    icon: User,
    tagline: "Your mental wellness journey",
    portalDesc: "Access your sessions, progress and wellness tools.",
    panelHeading: "Your healing journey starts here.",
    panelSub:
      "Secure, private access to your wellness dashboard, session history and personal progress.",
  },
  psychologist: {
    label: "Psychologist",
    icon: Stethoscope,
    tagline: "Clinical portal",
    portalDesc: "Secure, HIPAA-aligned access to your schedule, patients and sessions.",
    panelHeading: "Continue your work — in a place that's yours.",
    panelSub: "Secure, HIPAA-aligned access to your schedule, patients and sessions.",
  },
};

const ROLE_REDIRECT: Record<UserRole, string> = {
  patient: "/client",
  psychologist: "/psychologist",
  admin: "/",
};

function LoginPage() {
  const navigate = useNavigate();
  const { error: oauthError, notice } = Route.useSearch();
  const [role, setRole] = useState<Role>("patient");
  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const displayedError =
    error ?? (oauthError ? (OAUTH_ERROR_MESSAGES[oauthError] ?? oauthError) : null);
  const noticeMessage = notice ? (NOTICE_MESSAGES[notice] ?? null) : null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPendingEmail(null);
    const result = await loginFn({ data: { email, password } });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      if (result.reason === "pending_verification") {
        setPendingEmail(result.email);
      }
      return;
    }
    navigate({ to: ROLE_REDIRECT[result.role] });
  };

  const handleResendVerification = async () => {
    if (!pendingEmail) return;
    const result = await resendOtpFn({ data: { email: pendingEmail } });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate({ to: "/verify-email", search: { email: pendingEmail } });
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden overflow-hidden bg-foreground text-background lg:flex lg:flex-col">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-brand text-brand-foreground">
              <span className="text-sm font-black">M</span>
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Mindcarter.</span>
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">
              {cfg.tagline}
            </p>
            <h1 className="mt-4 max-w-md text-4xl font-black leading-[1.05] tracking-tight">
              {cfg.panelHeading}
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-background/70">
              {cfg.panelSub}
            </p>
          </div>
          <p className="text-xs text-background/50">© {new Date().getFullYear()} Mindcarter</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground"
          >
            ← Back to site
          </Link>

          <h2 className="mt-6 text-3xl font-black tracking-tight">Sign in</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Choose your role to access the right portal.
          </p>

          {noticeMessage && (
            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {noticeMessage}
            </p>
          )}

          {/* Role selector tabs */}
          <div
            className="mt-6 flex gap-1 rounded-2xl p-1"
            style={{
              background: "rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.07)",
            }}
          >
            {(["patient", "psychologist"] as Role[]).map((r) => {
              const RoleIcon = ROLE_CONFIG[r].icon;
              const active = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
                  style={{
                    background: active ? "#fff" : "transparent",
                    color: active ? "#111" : "rgba(0,0,0,0.45)",
                    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  <RoleIcon className="h-4 w-4" />
                  {ROLE_CONFIG[r].label}
                </button>
              );
            })}
          </div>

          {/* Portal description */}
          <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5" />
            {cfg.portalDesc}
          </p>

          {role === "patient" && (
            <>
              <a
                href="/auth/google"
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold transition hover:bg-muted"
              >
                <GoogleIcon />
                Continue with Google
              </a>
              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  or
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          {/* Sign-in form */}
          <form
            onSubmit={handleSignIn}
            className={role === "patient" ? "space-y-5" : "mt-6 space-y-5"}
          >
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Email
              </span>
              <input
                id="signin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground transition"
              />
            </label>
            <label className="block">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Password
                </span>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-foreground underline underline-offset-2"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="signin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground transition"
              />
            </label>

            {displayedError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <p>{displayedError}</p>
                {pendingEmail && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="mt-1.5 font-semibold underline underline-offset-2"
                  >
                    Resend verification email
                  </button>
                )}
              </div>
            )}

            <button
              id="signin-submit"
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Please wait…" : `Sign in as ${cfg.label}`}
            </button>
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> Encrypted end-to-end
            </p>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            {role === "patient" ? (
              <>
                New to Mindcarter?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-foreground underline underline-offset-2"
                >
                  Create an account
                </Link>
              </>
            ) : (
              "Psychologist accounts are created by the practice admin."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}
