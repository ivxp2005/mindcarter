/**
 * One-time bootstrap script for creating the first admin account.
 *
 * Patient and psychologist accounts are self-service via the signup form on
 * /login, but admin accounts intentionally are not (portal-management-access
 * is a hidden, unlinked route by design — see its file header) — this
 * script is the only way to create one.
 *
 * Usage:
 *   SEED_ADMIN_EMAIL=you@example.com npm run db:seed
 *
 * SEED_ADMIN_PASSWORD is optional — if omitted, a random password is
 * generated and printed once. SEED_ADMIN_NAME defaults to
 * "System Administrator". Safe to re-run: if the email already exists,
 * nothing is changed.
 */
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./client.server";
import { users } from "./schema";
import { hashPassword } from "../lib/auth.server";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    console.error(
      "SEED_ADMIN_EMAIL is required, e.g.:\n  SEED_ADMIN_EMAIL=you@example.com npm run db:seed",
    );
    process.exit(1);
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    console.log(`An account already exists for ${email} — nothing changed.`);
    process.exit(0);
  }

  const name = process.env.SEED_ADMIN_NAME?.trim() || "System Administrator";
  const generatedPassword = randomBytes(12).toString("base64url");
  const password = process.env.SEED_ADMIN_PASSWORD || generatedPassword;

  const passwordHash = await hashPassword(password);
  await db.insert(users).values({
    email,
    passwordHash,
    role: "admin",
    name,
    status: "active",
  });

  console.log(`Created admin account for ${email}.`);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(`Generated password (save this now, it will not be shown again): ${password}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
