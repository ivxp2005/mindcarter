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

// Branded shell shared by every transactional email: a light band centering a
// white card with a yellow brand accent, the wordmark, and the footer. Uses
// table-based layout + inline styles so it renders reliably in Gmail/Outlook.
// The signature is unchanged so callers only supply the inner body HTML.
function wrapperHtml(bodyHtml: string): string {
  const year = new Date().getFullYear();
  return `
    <div style="background: #f5f5f4; margin: 0; padding: 32px 16px; font-family: -apple-system, Helvetica, Arial, sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="100%" style="max-width: 480px; margin: 0 auto; background: #ffffff; border: 1px solid #ececec; border-radius: 12px; overflow: hidden;">
        <tr>
          <td style="height: 4px; background: #f4c430; line-height: 4px; font-size: 0;">&nbsp;</td>
        </tr>
        <tr>
          <td style="padding: 32px 32px 36px; color: #111;">
            <p style="font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #f4c430; margin: 0 0 20px;">Mindcarter</p>
            ${bodyHtml}
            <div style="border-top: 1px solid #ececec; margin: 32px 0 0; padding-top: 20px;">
              <p style="font-size: 12px; color: #6b6b6b; margin: 0 0 6px;">If you didn't request this, you can safely ignore this email.</p>
              <p style="font-size: 12px; color: #9a9a9a; margin: 0;">© ${year} Mindcarter</p>
            </div>
          </td>
        </tr>
      </table>
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

/** Human-friendly label for a booking's DB mode. */
function modeLabel(mode: string): string {
  if (mode === "in_person") return "In person";
  if (mode === "phone") return "Phone call";
  return "Video call";
}

/** A single label/value row inside the session-details card. */
function detailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 8px 0; font-size: 13px; color: #6b6b6b; vertical-align: top; white-space: nowrap;">${label}</td>
      <td style="padding: 8px 0 8px 16px; font-size: 14px; font-weight: 600; color: #111; text-align: right;">${value}</td>
    </tr>`;
}

export const sendBookingConfirmedEmail = createServerOnlyFn(
  async (params: {
    to: string;
    patientName: string;
    psychologistName: string;
    startInstant: Date;
    meetLink: string | null;
    durationMin: number;
    mode: string;
    sessionKind: string;
    portalUrl: string;
  }): Promise<void> => {
    const resend = getResendClient();
    const when = formatIst(params.startInstant);

    const detailsCard = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #f5f5f4; border: 1px solid #ececec; border-radius: 10px; margin: 20px 0 8px; padding: 6px 18px;">
        ${detailRow("Clinician", params.psychologistName)}
        ${detailRow("Date &amp; time", when)}
        ${detailRow("Duration", `${params.durationMin} min`)}
        ${detailRow("Session type", params.sessionKind)}
        ${detailRow("Mode", modeLabel(params.mode))}
      </table>`;

    const joinBlock = params.meetLink
      ? `
      <p style="margin: 20px 0 8px;">
        <a href="${params.meetLink}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-size: 14px; font-weight: 600;">Join on Google Meet</a>
      </p>
      <p style="font-size: 13px; color: #6b6b6b; word-break: break-all;">Or paste this link into your browser: ${params.meetLink}</p>`
      : `<p style="font-size: 13px; color: #6b6b6b; margin: 20px 0 0;">Your video link will be shared with you before the session.</p>`;

    const result = await resend.emails.send({
      from: getFromAddress(),
      to: params.to,
      subject: "Your Mindcarter session is confirmed",
      html: wrapperHtml(`
      <h1 style="font-size: 22px; margin: 0 0 4px;">Session confirmed</h1>
      <p style="display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #111; background: #f4c430; border-radius: 999px; padding: 4px 12px; margin: 8px 0 16px;">Booking confirmed</p>
      <p style="font-size: 14px; line-height: 1.6; color: #333; margin: 0;">Hi ${params.patientName}, your session with <strong>${params.psychologistName}</strong> is confirmed. Here are the details:</p>
      ${detailsCard}
      <p style="margin: 24px 0 8px;">
        <a href="${params.portalUrl}" style="display: inline-block; background: #f4c430; color: #111; text-decoration: none; padding: 13px 26px; border-radius: 999px; font-size: 14px; font-weight: 700;">View my session</a>
      </p>
      <p style="font-size: 13px; color: #6b6b6b; margin: 0 0 4px;">Manage or review this booking anytime in your Mindcarter portal.</p>
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
