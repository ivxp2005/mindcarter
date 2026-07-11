import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PasswordRequirements } from "../components/password-requirements";
import { signupFn } from "../lib/auth.server";
import { type SignupInput, signupSchema } from "../lib/auth-schemas";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — Mindcarter" },
      { name: "description", content: "Create your Mindcarter patient account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const passwordValue = watch("password");

  const onSubmit = async (data: SignupInput) => {
    setLoading(true);
    setServerError(null);
    const result = await signupFn({ data });
    setLoading(false);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    // Email verification (OTP) isn't wired into signup yet — see the TODO in
    // signupFn (src/lib/auth.server.ts). Once re-enabled, this goes back to
    // navigating to /verify-email instead.
    navigate({ to: "/patient" });
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
              Your mental wellness journey
            </p>
            <h1 className="mt-4 max-w-md text-4xl font-black leading-[1.05] tracking-tight">
              Your healing journey starts here.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-background/70">
              Secure, private access to your wellness dashboard, session history and personal
              progress.
            </p>
          </div>
          <p className="text-xs text-background/50">© {new Date().getFullYear()} Mindcarter</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <Link
            to="/login"
            className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground"
          >
            ← Back to sign in
          </Link>

          <h2 className="mt-6 text-3xl font-black tracking-tight">Create your account</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Set up your patient account to get started.
          </p>

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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Full name
              </span>
              <input
                type="text"
                {...register("name")}
                placeholder="Alex Morgan"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground transition"
              />
              {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>}
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Email
              </span>
              <input
                type="email"
                {...register("email")}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground transition"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
              )}
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Password
              </span>
              <input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground transition"
              />
              <PasswordRequirements password={passwordValue ?? ""} />
            </label>

            {serverError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              {loading ? "Creating account…" : "Create account"}
            </button>
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> Encrypted end-to-end
            </p>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-foreground underline underline-offset-2"
            >
              Sign in
            </Link>
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
