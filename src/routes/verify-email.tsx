import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";
import { resendOtpFn, verifyOtpFn } from "../lib/auth.server";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>): { email?: string } => ({
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  head: () => ({
    meta: [{ title: "Verify your email — Mindcarter" }, { name: "robots", content: "noindex" }],
  }),
  component: VerifyEmailPage,
});

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { email } = Route.useSearch();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    timerRef.current = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div className="max-w-sm">
          <p className="text-sm text-muted-foreground">
            We couldn't find an email to verify.{" "}
            <Link
              to="/signup"
              className="font-semibold text-foreground underline underline-offset-2"
            >
              Start over
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    const result = await verifyOtpFn({ data: { email, code } });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate({ to: "/patient" });
  };

  const handleResend = async () => {
    setError(null);
    setResendMessage(null);
    const result = await resendOtpFn({ data: { email } });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setResendMessage("A new code has been sent.");
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand text-brand-foreground">
          <MailCheck className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-2xl font-black tracking-tight">Verify your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the 6-digit code we sent to{" "}
          <span className="font-semibold text-foreground">{email}</span>.
        </p>

        <div className="mt-8 flex justify-center">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}
        {resendMessage && !error && (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {resendMessage}
          </p>
        )}

        <button
          onClick={handleVerify}
          disabled={loading || code.length !== 6}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Verifying…" : "Verify email"}
        </button>

        <p className="mt-6 text-xs text-muted-foreground">
          Didn't get a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0}
            className="font-semibold text-foreground underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </p>
      </div>
    </div>
  );
}
