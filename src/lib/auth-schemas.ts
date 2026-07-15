import { z } from "zod";

// Shared between client forms (react-hook-form + zodResolver) and
// auth.server.ts (never trust client-side validation alone).

export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "At least one uppercase letter")
  .regex(/[a-z]/, "At least one lowercase letter")
  .regex(/[0-9]/, "At least one number")
  .regex(/[^A-Za-z0-9]/, "At least one special character");

// Common free-mail providers, keyed by the label before the first dot in the
// domain — catches typo'd TLDs like "gmail.ghshg" that a generic email regex
// (which only requires *some* dot-separated TLD) would otherwise accept.
const KNOWN_EMAIL_DOMAINS: Record<string, string> = {
  gmail: "gmail.com",
  googlemail: "googlemail.com",
  yahoo: "yahoo.com",
  ymail: "ymail.com",
  hotmail: "hotmail.com",
  outlook: "outlook.com",
  live: "live.com",
  icloud: "icloud.com",
  aol: "aol.com",
  msn: "msn.com",
  proton: "proton.me",
  protonmail: "protonmail.com",
};

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address")
  .refine((value) => {
    const domain = value.split("@")[1] ?? "";
    const provider = domain.split(".")[0];
    const expected = KNOWN_EMAIL_DOMAINS[provider];
    return !expected || domain === expected;
  }, "Check the email domain for typos (e.g. gmail.com)");

// Used for profile contact fields (patient phone, emergency contact phone) —
// digits-only, exactly 10, but empty is allowed since these fields are optional.
export const phoneSchema = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d{10}$/.test(v), "Enter a 10-digit phone number");

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: emailSchema,
  password: passwordSchema,
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const otpSchema = z.string().regex(/^\d{6}$/, "Enter the 6-digit code");

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
