import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, LogIn, User, Stethoscope } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Mindcarter" },
      { name: "description", content: "Sign in to your Mindcarter account — patient or psychologist portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

type Role = "patient" | "psychologist";

const ROLE_CONFIG: Record<Role, {
  label: string;
  icon: React.ElementType;
  tagline: string;
  portalDesc: string;
  panelHeading: string;
  panelSub: string;
  redirectTo: string;
}> = {
  patient: {
    label: "Patient",
    icon: User,
    tagline: "Your mental wellness journey",
    portalDesc: "Access your sessions, progress and wellness tools.",
    panelHeading: "Your healing journey starts here.",
    panelSub: "Secure, private access to your wellness dashboard, session history and personal progress.",
    redirectTo: "/",
  },
  psychologist: {
    label: "Psychologist",
    icon: Stethoscope,
    tagline: "Clinical portal",
    portalDesc: "Secure, HIPAA-aligned access to your schedule, patients and sessions.",
    panelHeading: "Continue your work — in a place that's yours.",
    panelSub: "Secure, HIPAA-aligned access to your schedule, patients and sessions.",
    redirectTo: "/psychologist",
  },
};

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("patient");
  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;

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

          {/* Sign-in form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              localStorage.setItem("mc_role", role);
              navigate({ to: cfg.redirectTo as "/" });
            }}
            className="mt-6 space-y-5"
          >
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Email
              </span>
              <input
                id="signin-email"
                type="email"
                required
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground transition"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Password
              </span>
              <input
                id="signin-password"
                type="password"
                required
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground transition"
              />
            </label>
            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="rounded border-border" /> Remember me
              </label>
              <a href="#" className="font-semibold text-foreground">
                Forgot password?
              </a>
            </div>
            <button
              id="signin-submit"
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              <LogIn className="h-4 w-4" />
              Sign in as {ROLE_CONFIG[role].label}
            </button>
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> Encrypted end-to-end
            </p>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            New to Mindcarter?{" "}
            <Link to="/contact" className="font-semibold text-foreground underline underline-offset-2">
              Book a consultation
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
