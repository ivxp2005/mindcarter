/**
 * crypto.server.ts — symmetric encryption for secrets stored at rest.
 *
 * Used to protect the Google Calendar refresh token on psychologist_profiles:
 * the DB row holds ciphertext, never the raw long-lived token. The key is
 * derived from SESSION_SECRET (the same secret that HMAC-signs session cookies)
 * via scrypt, so there is no extra env var to manage — but it MUST be a real,
 * stable value in every environment or previously-encrypted tokens won't decrypt.
 */
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGO = "aes-256-gcm";
// Static, non-secret salt — SESSION_SECRET provides the entropy; the salt only
// domain-separates this key from any other scrypt use of the same secret.
const KEY_SALT = "mindcarter:calendar-token:v1";

function getKey(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return scryptSync(secret, KEY_SALT, 32);
}

/** Encrypts `plain` and returns `base64(iv):base64(authTag):base64(ciphertext)`. */
export function encryptSecret(plain: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("base64"), authTag.toString("base64"), ciphertext.toString("base64")].join(
    ":",
  );
}

/** Reverses `encryptSecret`. Throws if the payload is malformed or tampered. */
export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Malformed encrypted secret");
  }
  const key = getKey();
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const plain = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]);
  return plain.toString("utf8");
}
