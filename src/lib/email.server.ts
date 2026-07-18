import { createServerOnlyFn } from "@tanstack/react-start";
import { Resend } from "resend";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  return new Resend(apiKey);
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM || "Mindcarter <onboarding@resend.dev>";
}

function wrapperHtml(bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #111;">
      <p style="font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #f4c430; margin: 0 0 16px;">Mindcarter</p>
      ${bodyHtml}
      <p style="font-size: 12px; color: #6b6b6b; margin-top: 32px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
}

// resend's SDK does NOT throw on a failed send — it returns { data, error }.
// Surface that error as a real throw, otherwise callers (signupFn etc.) have
// no way to know the email never went out.
function assertSent(result: { data: unknown; error: { message: string } | null }, context: string) {
  if (result.error) {
    console.error(`[email.server] ${context} failed:`, result.error);
    throw new Error(`Failed to send email (${context}): ${result.error.message}`);
  }
}

export const sendOtpEmail = createServerOnlyFn(async (to: string, code: string): Promise<void> => {
  const resend = getResendClient();
  const result = await resend.emails.send({
    from: getFromAddress(),
    to,
    subject: `${code} is your Mindcarter verification code`,
    html: wrapperHtml(`
      <h1 style="font-size: 22px; margin: 0 0 12px;">Verify your email</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #333;">Enter this code to finish creating your account:</p>
      <p style="font-size: 32px; font-weight: 800; letter-spacing: 0.15em; margin: 20px 0;">${code}</p>
      <p style="font-size: 13px; color: #6b6b6b;">This code expires in 10 minutes.</p>
    `),
  });
  assertSent(result, "OTP email");
});

/** Friendly IST rendering of a session start, e.g. "Mon, 20 Jul 2026 · 09:00 AM IST". */
function formatIst(instant: Date): string {
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(instant);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(instant);
  return `${date} · ${time} IST`;
}

export const sendBookingConfirmedEmail = createServerOnlyFn(
  async (params: {
    to: string;
    patientName: string;
    psychologistName: string;
    startInstant: Date;
    meetLink: string | null;
  }): Promise<void> => {
    const resend = getResendClient();
    const when = formatIst(params.startInstant);
    const joinBlock = params.meetLink
      ? `
      <p style="margin: 24px 0;">
        <a href="${params.meetLink}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-size: 14px; font-weight: 600;">Join on Google Meet</a>
      </p>
      <p style="font-size: 13px; color: #6b6b6b; word-break: break-all;">Or paste this link into your browser: ${params.meetLink}</p>`
      : `<p style="font-size: 13px; color: #6b6b6b;">Your video link will be shared with you before the session.</p>`;

    const result = await resend.emails.send({
      from: getFromAddress(),
      to: params.to,
      subject: "Your Mindcarter session is confirmed",
      html: wrapperHtml(`
      <h1 style="font-size: 22px; margin: 0 0 12px;">Session confirmed</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #333;">Hi ${params.patientName}, your session with <strong>${params.psychologistName}</strong> is confirmed.</p>
      <p style="font-size: 15px; font-weight: 700; margin: 16px 0 0;">${when}</p>
      ${joinBlock}
    `),
    });
    assertSent(result, "booking confirmation email");
  },
);

export const sendPasswordResetEmail = createServerOnlyFn(
  async (to: string, resetUrl: string): Promise<void> => {
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: getFromAddress(),
      to,
      subject: "Reset your Mindcarter password",
      html: wrapperHtml(`
      <h1 style="font-size: 22px; margin: 0 0 12px;">Reset your password</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #333;">Click the button below to set a new password:</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-size: 14px; font-weight: 600;">Reset password</a>
      </p>
      <p style="font-size: 13px; color: #6b6b6b;">This link expires in 30 minutes.</p>
    `),
    });
    assertSent(result, "password reset email");
  },
);
