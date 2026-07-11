import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { requestPasswordResetFn } from "../lib/auth.server";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{ title: "Reset your password — Mindcarter" }, { name: "robots", content: "noindex" }],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await requestPasswordResetFn({ data: { email } });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground"
        >
          ← Back to sign in
        </Link>

        <span className="mt-6 grid h-12 w-12 place-items-center rounded-xl bg-brand text-brand-foreground">
          <KeyRound className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-2xl font-black tracking-tight">Forgot your password?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the email on your account and we'll send you a link to reset it.
        </p>

        {submitted ? (
          <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            If an account exists for that email, we've sent a reset link. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground transition"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
