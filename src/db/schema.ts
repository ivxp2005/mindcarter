import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ─── Enums ──────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["patient", "psychologist", "admin"]);

export const userStatusEnum = pgEnum("user_status", ["active", "suspended", "pending"]);

export const weekdayEnum = pgEnum("weekday", [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

// db-audit.md decision: session_kind and mode are two separate columns —
// both portal-management-access.tsx and psychologist/meetings.tsx read/write
// these same two fields on the same bookings table, no separate Meeting type.
export const sessionKindEnum = pgEnum("session_kind", [
  "individual_therapy",
  "group_coaching",
  "assessment_review",
  "executive_coaching",
  "intake",
]);

export const bookingModeEnum = pgEnum("booking_mode", ["video", "in_person", "phone"]);

// Canonicalized from db-audit.md's noted union (admin: Scheduled/Completed/
// Canceled/Refunded; psychologist portal: upcoming/completed/canceled).
export const bookingStatusEnum = pgEnum("booking_status", [
  "scheduled",
  "completed",
  "canceled",
  "refunded",
]);

export const diaryStatusEnum = pgEnum("diary_status", ["pending_review", "reviewed"]);

export const notificationKindEnum = pgEnum("notification_kind", [
  "meeting",
  "diary",
  "message",
  "system",
]);

// ─── users ──────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  // Nullable: Google-OAuth-only accounts have no password.
  passwordHash: text("password_hash"),
  googleId: varchar("google_id", { length: 255 }).unique(),
  role: roleEnum("role").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  status: userStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── sessions (auth) ────────────────────────────────────────────────────────
// db-audit.md decision: use the HMAC-signed session-token scheme already in
// src/lib/auth.ts, extended to cover all three roles. This table backs that
// scheme so tokens are revocable/lookup-able server-side (the token itself
// is self-verifying via HMAC; we store a hash of it here, not the raw token).

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  userAgent: text("user_agent"),
  ip: varchar("ip", { length: 45 }),
});

// ─── email_otps ─────────────────────────────────────────────────────────────
// Backs signup email verification. Stores a hash of the 6-digit code, never
// the raw value — same pattern as `sessions.tokenHash`.

export const emailOtps = pgTable("email_otps", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  codeHash: text("code_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  attempts: integer("attempts").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── password_reset_tokens ──────────────────────────────────────────────────

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── patient_profiles ───────────────────────────────────────────────────────
// Deliberately separate from `users` — portal-management-access.tsx states
// clinical notes must never be surfaced to the admin, so this table (and
// diary_entries) should carry stricter access control than the base users
// table admin already reads.

export const patientProfiles = pgTable("patient_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  primaryConcern: text("primary_concern"),
  tags: text("tags").array(),
  totalSessions: integer("total_sessions").notNull().default(0),
});

// ─── psychologist_profiles ──────────────────────────────────────────────────
// db-audit.md flags the public-directory fields (languages, price, photo,
// nextAvailable, career-hours counter) as an open question ("likely belong
// here too, or a thin view") rather than a firm decision — deliberately
// omitted here pending that call.

export const psychologistProfiles = pgTable("psychologist_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }),
  licenseNumber: varchar("license_number", { length: 100 }),
  specialties: text("specialties").array(),
  bio: text("bio"),
  yearsExperience: integer("years_experience"),
});

// ─── availability_slots ─────────────────────────────────────────────────────

export const availabilitySlots = pgTable("availability_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  psychologistId: uuid("psychologist_id")
    .notNull()
    .references(() => psychologistProfiles.userId, { onDelete: "cascade" }),
  dayOfWeek: weekdayEnum("day_of_week").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
});

// ─── bookings ───────────────────────────────────────────────────────────────
// db-audit.md's central reconciliation: one table replaces both admin's
// `Booking` and the psychologist portal's `Meeting`.

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => users.id, { onDelete: "set null" }),
  psychologistId: uuid("psychologist_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  groupLabel: varchar("group_label", { length: 255 }),
  scheduledDate: date("scheduled_date").notNull(),
  scheduledTime: time("scheduled_time").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  sessionKind: sessionKindEnum("session_kind").notNull(),
  mode: bookingModeEnum("mode").notNull(),
  status: bookingStatusEnum("status").notNull().default("scheduled"),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  videoRoomUrl: text("video_room_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── diary_entries ──────────────────────────────────────────────────────────

export const diaryEntries = pgTable("diary_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  status: diaryStatusEnum("status").notNull().default("pending_review"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  content: text("content").notNull(),
  clinicianNote: text("clinician_note"),
});

// ─── notifications ──────────────────────────────────────────────────────────

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: notificationKindEnum("kind").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  actionUrl: text("action_url"),
  actionParams: jsonb("action_params"),
});

// ─── Relations ──────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  patientProfile: one(patientProfiles, {
    fields: [users.id],
    references: [patientProfiles.userId],
  }),
  psychologistProfile: one(psychologistProfiles, {
    fields: [users.id],
    references: [psychologistProfiles.userId],
  }),
  sessions: many(sessions),
  emailOtps: many(emailOtps),
  passwordResetTokens: many(passwordResetTokens),
  bookingsAsPatient: many(bookings, { relationName: "patientBookings" }),
  bookingsAsPsychologist: many(bookings, { relationName: "psychologistBookings" }),
  diaryEntriesAsPatient: many(diaryEntries, { relationName: "patientDiaryEntries" }),
  diaryEntriesAsAuthor: many(diaryEntries, { relationName: "authoredDiaryEntries" }),
  notifications: many(notifications),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const emailOtpsRelations = relations(emailOtps, ({ one }) => ({
  user: one(users, {
    fields: [emailOtps.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const patientProfilesRelations = relations(patientProfiles, ({ one }) => ({
  user: one(users, {
    fields: [patientProfiles.userId],
    references: [users.id],
  }),
}));

export const psychologistProfilesRelations = relations(psychologistProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [psychologistProfiles.userId],
    references: [users.id],
  }),
  availabilitySlots: many(availabilitySlots),
}));

export const availabilitySlotsRelations = relations(availabilitySlots, ({ one }) => ({
  psychologist: one(psychologistProfiles, {
    fields: [availabilitySlots.psychologistId],
    references: [psychologistProfiles.userId],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  patient: one(users, {
    fields: [bookings.patientId],
    references: [users.id],
    relationName: "patientBookings",
  }),
  psychologist: one(users, {
    fields: [bookings.psychologistId],
    references: [users.id],
    relationName: "psychologistBookings",
  }),
}));

export const diaryEntriesRelations = relations(diaryEntries, ({ one }) => ({
  patient: one(users, {
    fields: [diaryEntries.patientId],
    references: [users.id],
    relationName: "patientDiaryEntries",
  }),
  author: one(users, {
    fields: [diaryEntries.authorId],
    references: [users.id],
    relationName: "authoredDiaryEntries",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
