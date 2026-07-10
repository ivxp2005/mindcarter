import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, LogIn } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Mindcarter" },
      { name: "description", content: "Sign in to your Mindcarter psychologist portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

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
              Continue your work — in a place that's yours.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-background/70">
              Secure, HIPAA-aligned access to your schedule, patients and sessions.
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

          <h2 className="mt-6 text-3xl font-black tracking-tight">Sign in</h2>
          <p className="mt-2 text-sm text-muted-foreground">Psychologist portal access.</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              localStorage.setItem("mc_role", "psychologist");
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
              <LogIn className="h-4 w-4" /> Sign in
            </button>
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> Encrypted end-to-end
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
