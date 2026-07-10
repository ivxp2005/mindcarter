import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Lock, UserPlus, LogIn } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Mindcarter" },
      { name: "description", content: "Sign in to your Mindcarter patient or psychologist portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [role, setRole] = useState<"patient" | "psychologist">("patient");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const navigate = useNavigate();

  // Reset to sign-in when switching to psychologist
  const handleRoleChange = (r: "patient" | "psychologist") => {
    setRole(r);
    if (r === "psychologist") setMode("signin");
  };

  const isSignup = role === "patient" && mode === "signup";

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden overflow-hidden bg-foreground text-background lg:block">
        <div
          className="absolute inset-0 opacity-[0.08]"
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">Portal</p>
            <h1 className="mt-4 max-w-md text-4xl font-black leading-[1.05] tracking-tight">
              {isSignup
                ? "Start your journey — create your patient account."
                : "Continue your work — in a place that's yours."}
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-background/70">
              {isSignup
                ? "Join thousands of patients managing their mental wellness with Mindcarter."
                : "Secure, HIPAA-aligned access to sessions, assessments, reports and messages."}
            </p>
          </div>
          <p className="text-xs text-background/50">© {new Date().getFullYear()} Mindcarter</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <Link to="/" className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            ← Back to site
          </Link>

          <h2 className="mt-6 text-3xl font-black tracking-tight">
            {isSignup ? "Create account" : "Sign in"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignup
              ? "Register as a new patient on Mindcarter."
              : "One account for patients and psychologists."}
          </p>

          {/* Role tabs */}
          <div className="mt-8 inline-flex rounded-full border border-border bg-muted p-1">
            {(["patient", "psychologist"] as const).map((r) => (
              <button
                key={r}
                id={`role-tab-${r}`}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition ${
                  role === r ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Sign-in form */}
          {!isSignup && (
            <form
              key="signin"
              onSubmit={(e) => {
                e.preventDefault();
                localStorage.setItem("mc_role", role);
                navigate({ to: "/" });
              }}
              className="mt-8 space-y-5"
            >
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Email</span>
                <input
                  id="signin-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Password</span>
                <input
                  id="signin-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                />
              </label>
              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" className="rounded border-border" /> Remember me
                </label>
                <a href="#" className="font-semibold text-foreground">Forgot password?</a>
              </div>
              <button
                id="signin-submit"
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
              >
                <LogIn className="h-4 w-4" /> Sign in as {role}
              </button>
              <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" /> Encrypted end-to-end
              </p>

              {/* Create account link — patients only */}
              {role === "patient" && (
                <p className="text-center text-xs text-muted-foreground">
                  New patient?{" "}
                  <button
                    id="switch-to-signup"
                    type="button"
                    onClick={() => setMode("signup")}
                    className="font-semibold text-foreground underline-offset-2 hover:underline"
                  >
                    Create an account
                  </button>
                </p>
              )}
            </form>
          )}

          {/* Sign-up form — patients only */}
          {isSignup && (
            <form
              key="signup"
              onSubmit={(e) => {
                e.preventDefault();
                localStorage.setItem("mc_role", "patient");
                navigate({ to: "/" });
              }}
              className="mt-8 space-y-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">First name</span>
                  <input
                    id="signup-first-name"
                    type="text"
                    required
                    placeholder="Jane"
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Last name</span>
                  <input
                    id="signup-last-name"
                    type="text"
                    required
                    placeholder="Doe"
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Email</span>
                <input
                  id="signup-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Password</span>
                <input
                  id="signup-password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Confirm password</span>
                <input
                  id="signup-confirm-password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Repeat password"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                />
              </label>
              <label className="inline-flex items-start gap-2 text-xs text-muted-foreground">
                <input id="signup-terms" type="checkbox" required className="mt-0.5 rounded border-border" />
                <span>
                  I agree to the{" "}
                  <a href="#" className="font-semibold text-foreground hover:underline">Terms of Service</a>{" "}
                  and{" "}
                  <a href="#" className="font-semibold text-foreground hover:underline">Privacy Policy</a>.
                </span>
              </label>
              <button
                id="signup-submit"
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
              >
                <UserPlus className="h-4 w-4" /> Create patient account <ArrowRight className="h-4 w-4" />
              </button>
              <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" /> Encrypted end-to-end
              </p>
              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <button
                  id="switch-to-signin"
                  type="button"
                  onClick={() => setMode("signin")}
                  className="font-semibold text-foreground underline-offset-2 hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}