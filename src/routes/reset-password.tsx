import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PasswordInput } from "../components/password-input";
import { PasswordRequirements } from "../components/password-requirements";
import { resetPasswordFn } from "../lib/auth.server";
import { type ResetPasswordInput, resetPasswordSchema } from "../lib/auth-schemas";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  head: () => ({
    meta: [{ title: "Set a new password — Mindcarter" }, { name: "robots", content: "noindex" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  });

  const passwordValue = watch("password");

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div className="max-w-sm">
          <p className="text-sm text-muted-foreground">
            This reset link is missing or invalid.{" "}
            <Link
              to="/forgot-password"
              className="font-semibold text-foreground underline underline-offset-2"
            >
              Request a new one
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true);
    setServerError(null);
    const result = await resetPasswordFn({ data: { token, password: data.password } });
    setLoading(false);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    navigate({ to: "/login", search: { notice: "reset_success" } });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand text-brand-foreground">
          <KeyRound className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-2xl font-black tracking-tight">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              New password
            </span>
            <PasswordInput
              {...register("password")}
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-border bg-background py-3 pl-4 pr-11 text-sm outline-none transition focus:border-foreground"
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
            )}
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
            {loading ? "Saving…" : "Save new password"}
          </button>
        </form>
      </div>
    </div>
  );
}
