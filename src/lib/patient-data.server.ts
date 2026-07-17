/**
 * patient-data.server.ts — DB-backed data layer for the employee (patient) portal.
 *
 * Every handler is scoped to the logged-in patient via `getSessionUser()`; a
 * non-patient session is rejected. DB rows are mapped to the portal's existing
 * TS shapes (PatientSession / JournalEntry / PortalNotification / care member)
 * so the client store and pages need no shape changes. Enum↔label mapping
 * (booking status/mode/kind, notification kind) lives here.
 */
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, gte, ne, sql } from "drizzle-orm";
import { db } from "../db/client.server";
import {
  bookings,
  careTeamMembers,
  diaryEntries,
  notifications,
  patientProfiles,
  psychologistProfiles,
  users,
} from "../db/schema";
import { getSessionUser } from "./auth.server";
import { phoneSchema } from "./auth-schemas";
import type {
  JournalEntry,
  Mood,
  PatientSession,
  PortalNotification,
  SessionStatus,
} from "./patient";

// ─── DTOs returned to the client ────────────────────────────────────────────

export interface CareTeamMemberDTO {
  id: string;
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  rating: number;
  price: number;
  email: string;
  phone: string;
  primary: boolean;
}

export interface PatientProfileDTO {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  preferredLanguage: string;
  notificationPrefs: {
    sessionReminders: boolean;
    journalPrompts: boolean;
    careTeamMessages: boolean;
    marketing: boolean;
  };
  onboardingComplete: boolean;
}

export interface PortalData {
  sessions: PatientSession[];
  careTeam: CareTeamMemberDTO[];
  journal: JournalEntry[];
  notifications: PortalNotification[];
  profile: PatientProfileDTO | null;
}

const EMPTY_PORTAL: PortalData = {
  sessions: [],
  careTeam: [],
  journal: [],
  notifications: [],
  profile: null,
};

const DEFAULT_PREFS = {
  sessionReminders: true,
  journalPrompts: true,
  careTeamMessages: true,
  marketing: false,
};

// ─── Enum ↔ label mapping ───────────────────────────────────────────────────

type BookingStatus = "scheduled" | "completed" | "canceled" | "refunded";
type BookingMode = "video" | "in_person" | "phone";
type SessionKind =
  | "individual_therapy"
  | "group_coaching"
  | "assessment_review"
  | "executive_coaching"
  | "intake"
  | "follow_up";
type NotifKind = "meeting" | "diary" | "message" | "system";

function toPortalStatus(s: BookingStatus): SessionStatus {
  if (s === "completed") return "completed";
  if (s === "canceled" || s === "refunded") return "canceled";
  return "upcoming";
}

const MODE_TO_PORTAL: Record<BookingMode, PatientSession["mode"]> = {
  video: "Video",
  in_person: "In-person",
  phone: "Phone",
};
const MODE_TO_DB: Record<string, BookingMode> = {
  Video: "video",
  "In-person": "in_person",
  Phone: "phone",
};

const KIND_TO_LABEL: Record<SessionKind, string> = {
  individual_therapy: "Individual Therapy",
  group_coaching: "Group Coaching",
  assessment_review: "Assessment",
  executive_coaching: "Executive Coaching",
  intake: "Intake",
  follow_up: "Follow-up",
};
const LABEL_TO_KIND: Record<string, SessionKind> = {
  "Individual Therapy": "individual_therapy",
  "Group Coaching": "group_coaching",
  Assessment: "assessment_review",
  "Executive Coaching": "executive_coaching",
  Intake: "intake",
  "Follow-up": "follow_up",
};

const NOTIF_KIND_TO_PORTAL: Record<NotifKind, PortalNotification["kind"]> = {
  meeting: "session",
  diary: "journal",
  message: "message",
  system: "system",
};

// ─── Time-of-day: 12h UI slot ("09:00 AM") ↔ SQL time ("09:00:00") ──────────

function to24h(slot: string): string {
  const m = slot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return slot; // already 24h or unknown — store as-is
  let hour = parseInt(m[1], 10);
  const min = m[2];
  const ampm = m[3].toUpperCase();
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${min}:00`;
}

function to12h(sqlTime: string): string {
  const m = sqlTime.match(/^(\d{2}):(\d{2})/);
  if (!m) return sqlTime;
  let hour = parseInt(m[1], 10);
  const min = m[2];
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${String(hour).padStart(2, "0")}:${min} ${ampm}`;
}

function timeAgo(d: Date): string {
  const ms = Date.now() - d.getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function clampMood(n: number | null): Mood {
  const v = Math.min(5, Math.max(1, Math.round(n ?? 3)));
  return v as Mood;
}

// ─── Auth guard ─────────────────────────────────────────────────────────────

async function requirePatientId(): Promise<string | null> {
  const user = await getSessionUser();
  if (!user || user.role !== "patient") return null;
  return user.id;
}

// ─── Read ───────────────────────────────────────────────────────────────────

export const getPortalDataFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<PortalData> => {
    const meId = await requirePatientId();
    if (!meId) return EMPTY_PORTAL;

    const [sessionRows, careRows, journalRows, notifRows, userRow, profileRow] = await Promise.all([
      db
        .select({
          id: bookings.id,
          psychologistId: bookings.psychologistId,
          psychologistName: users.name,
          date: bookings.scheduledDate,
          time: bookings.scheduledTime,
          kind: bookings.sessionKind,
          mode: bookings.mode,
          durationMin: bookings.durationMinutes,
          status: bookings.status,
          notes: bookings.notes,
        })
        .from(bookings)
        .innerJoin(users, eq(bookings.psychologistId, users.id))
        .where(eq(bookings.patientId, meId)),
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          title: psychologistProfiles.title,
          bio: psychologistProfiles.bio,
          specialties: psychologistProfiles.specialties,
          rating: psychologistProfiles.rating,
          price: psychologistProfiles.price,
          isPrimary: careTeamMembers.isPrimary,
        })
        .from(careTeamMembers)
        .innerJoin(users, eq(careTeamMembers.psychologistId, users.id))
        .leftJoin(psychologistProfiles, eq(psychologistProfiles.userId, users.id))
        .where(eq(careTeamMembers.patientId, meId)),
      db
        .select()
        .from(diaryEntries)
        .where(eq(diaryEntries.patientId, meId))
        .orderBy(desc(diaryEntries.entryDate)),
      db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, meId))
        .orderBy(desc(notifications.createdAt)),
      db.select().from(users).where(eq(users.id, meId)).limit(1),
      db.select().from(patientProfiles).where(eq(patientProfiles.userId, meId)).limit(1),
    ]);

    const sessions: PatientSession[] = sessionRows.map((r) => ({
      id: r.id,
      psychologistId: r.psychologistId,
      psychologistName: r.psychologistName,
      date: r.date,
      time: to12h(r.time),
      kind: KIND_TO_LABEL[r.kind as SessionKind] ?? r.kind,
      mode: MODE_TO_PORTAL[r.mode as BookingMode],
      durationMin: r.durationMin,
      status: toPortalStatus(r.status as BookingStatus),
      notes: r.notes ?? undefined,
    }));

    const careTeam: CareTeamMemberDTO[] = careRows.map((r) => ({
      id: r.id,
      name: r.name,
      title: r.title ?? "Clinician",
      bio: r.bio ?? "",
      specialties: r.specialties ?? [],
      rating: r.rating ? Number(r.rating) : 0,
      price: r.price ? Number(r.price) : 0,
      email: r.email,
      phone: r.phone ?? "",
      primary: r.isPrimary,
    }));

    const journal: JournalEntry[] = journalRows.map((r) => ({
      id: r.id,
      date: r.entryDate,
      mood: clampMood(r.mood),
      title: r.title,
      content: r.content,
      tags: r.tags ?? [],
    }));

    const portalNotifications: PortalNotification[] = notifRows.map((r) => ({
      id: r.id,
      kind: NOTIF_KIND_TO_PORTAL[r.kind as NotifKind],
      title: r.title,
      body: r.body,
      time: timeAgo(r.createdAt),
      read: r.read,
      actionTo: r.actionUrl ?? undefined,
      actionSearch:
        (r.actionParams as Record<string, string | number | boolean> | null) ?? undefined,
    }));

    const u = userRow[0];
    const p = profileRow[0];
    const profile: PatientProfileDTO | null = u
      ? {
          name: u.name,
          email: u.email,
          phone: u.phone ?? "",
          dateOfBirth: p?.dateOfBirth ?? "",
          address: p?.address ?? "",
          emergencyContactName: p?.emergencyContactName ?? "",
          emergencyContactPhone: p?.emergencyContactPhone ?? "",
          preferredLanguage: p?.preferredLanguage ?? "",
          notificationPrefs: {
            ...DEFAULT_PREFS,
            ...((p?.notificationPrefs as Partial<typeof DEFAULT_PREFS> | null) ?? {}),
          },
          onboardingComplete: p?.onboardingComplete ?? false,
        }
      : null;

    return { sessions, careTeam, journal, notifications: portalNotifications, profile };
  },
);

/** Lightweight status check used by the /employee route guard — avoids loading
 *  the whole portal payload just to decide whether to redirect. */
export const getOnboardingStatusFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ onboardingComplete: boolean }> => {
    const meId = await requirePatientId();
    if (!meId) return { onboardingComplete: false };

    const [row] = await db
      .select({ onboardingComplete: patientProfiles.onboardingComplete })
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, meId))
      .limit(1);

    return { onboardingComplete: row?.onboardingComplete ?? false };
  },
);

/** Every active psychologist in the system — used to populate the booking
 *  dialog, which lets a patient book any clinician, not just their existing
 *  care team (booking auto-adds the clinician to their care team). */
export const getAllCliniciansFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<CareTeamMemberDTO[]> => {
    const meId = await requirePatientId();
    if (!meId) return [];

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        title: psychologistProfiles.title,
        bio: psychologistProfiles.bio,
        specialties: psychologistProfiles.specialties,
        rating: psychologistProfiles.rating,
        price: psychologistProfiles.price,
      })
      .from(users)
      .leftJoin(psychologistProfiles, eq(psychologistProfiles.userId, users.id))
      .where(and(eq(users.role, "psychologist"), eq(users.status, "active")));

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      title: r.title ?? "Clinician",
      bio: r.bio ?? "",
      specialties: r.specialties ?? [],
      rating: r.rating ? Number(r.rating) : 0,
      price: r.price ? Number(r.price) : 0,
      email: r.email,
      phone: r.phone ?? "",
      primary: false,
    }));
  },
);

/** Every non-canceled, today-or-future booking for one clinician, across ALL
 *  patients — so the booking dialog can grey out slots another patient already
 *  took. Returns only busy date/time pairs (no patient identity). */
export const getClinicianBookedSlotsFn = createServerFn({ method: "GET" })
  .validator((d: unknown) => d as { psychologistId: string })
  .handler(async ({ data }): Promise<{ date: string; time: string }[]> => {
    const meId = await requirePatientId();
    if (!meId || !data.psychologistId) return [];

    const rows = await db
      .select({ date: bookings.scheduledDate, time: bookings.scheduledTime })
      .from(bookings)
      .where(
        and(
          eq(bookings.psychologistId, data.psychologistId),
          ne(bookings.status, "canceled"),
          gte(bookings.scheduledDate, todayISO()),
        ),
      );

    return rows.map((r) => ({ date: r.date, time: to12h(r.time) }));
  });

// ─── Mutations ──────────────────────────────────────────────────────────────

export const bookSessionFn = createServerFn({ method: "POST" })
  .validator(
    (data: unknown) =>
      data as {
        psychologistId: string;
        date: string;
        time: string;
        kind: string;
        mode: string;
        durationMin: number;
      },
  )
  .handler(async ({ data }) => {
    const meId = await requirePatientId();
    if (!meId) return { ok: false as const, error: "Not authorized." };

    if (data.date <= todayISO()) {
      return { ok: false as const, error: "That date is in the past." };
    }

    const sqlTime = to24h(data.time);

    // Slot free? (same clinician, date, time, not canceled)
    const clash = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.psychologistId, data.psychologistId),
          eq(bookings.scheduledDate, data.date),
          eq(bookings.scheduledTime, sqlTime),
          ne(bookings.status, "canceled"),
        ),
      )
      .limit(1);
    if (clash.length > 0) {
      return { ok: false as const, error: "That slot is already taken." };
    }

    // The patient can't attend two sessions at once (any clinician).
    const selfClash = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.patientId, meId),
          eq(bookings.scheduledDate, data.date),
          eq(bookings.scheduledTime, sqlTime),
          ne(bookings.status, "canceled"),
        ),
      )
      .limit(1);
    if (selfClash.length > 0) {
      return { ok: false as const, error: "That slot is already taken." };
    }

    const profileRow = await db
      .select({ price: psychologistProfiles.price })
      .from(psychologistProfiles)
      .where(eq(psychologistProfiles.userId, data.psychologistId))
      .limit(1);
    const amount = profileRow[0]?.price ?? null;

    const psychRow = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, data.psychologistId))
      .limit(1);
    const psychName = psychRow[0]?.name ?? "your clinician";

    // Booking with a clinician who isn't on the patient's care team yet adds
    // them to it (primary if it's the patient's first-ever clinician).
    const existingCare = await db
      .select({ id: careTeamMembers.id })
      .from(careTeamMembers)
      .where(
        and(
          eq(careTeamMembers.patientId, meId),
          eq(careTeamMembers.psychologistId, data.psychologistId),
        ),
      )
      .limit(1);
    if (existingCare.length === 0) {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(careTeamMembers)
        .where(eq(careTeamMembers.patientId, meId));
      await db.insert(careTeamMembers).values({
        patientId: meId,
        psychologistId: data.psychologistId,
        isPrimary: count === 0,
      });
    }

    const [inserted] = await db
      .insert(bookings)
      .values({
        patientId: meId,
        psychologistId: data.psychologistId,
        scheduledDate: data.date,
        scheduledTime: sqlTime,
        durationMinutes: data.durationMin,
        sessionKind: LABEL_TO_KIND[data.kind] ?? "individual_therapy",
        mode: MODE_TO_DB[data.mode] ?? "video",
        status: "scheduled",
        amount,
      })
      .returning({ id: bookings.id });

    await db.insert(notifications).values({
      userId: meId,
      kind: "meeting",
      title: "Session booked",
      body: `Your ${data.kind} with ${psychName} on ${data.date} at ${data.time} is confirmed.`,
      actionUrl: "/employee/sessions",
      actionParams: { open: inserted.id },
    });

    return { ok: true as const, id: inserted.id };
  });

export const cancelSessionFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    const meId = await requirePatientId();
    if (!meId) return { ok: false as const, error: "Not authorized." };

    const rows = await db
      .select({
        scheduledDate: bookings.scheduledDate,
        psychologistId: bookings.psychologistId,
      })
      .from(bookings)
      .where(and(eq(bookings.id, data.id), eq(bookings.patientId, meId)))
      .limit(1);
    if (rows.length === 0) return { ok: false as const, error: "Session not found." };

    await db
      .update(bookings)
      .set({ status: "canceled", updatedAt: new Date() })
      .where(and(eq(bookings.id, data.id), eq(bookings.patientId, meId)));

    const psychRow = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, rows[0].psychologistId))
      .limit(1);

    await db.insert(notifications).values({
      userId: meId,
      kind: "meeting",
      title: "Session canceled",
      body: `Your session with ${psychRow[0]?.name ?? "your clinician"} on ${rows[0].scheduledDate} was canceled.`,
      actionUrl: "/employee/sessions",
    });

    return { ok: true as const };
  });

export const completeSessionFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    const meId = await requirePatientId();
    if (!meId) return { ok: false as const, error: "Not authorized." };
    await db
      .update(bookings)
      .set({ status: "completed", updatedAt: new Date() })
      .where(and(eq(bookings.id, data.id), eq(bookings.patientId, meId)));
    return { ok: true as const };
  });

export const rescheduleSessionFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string; date: string; time: string; mode: string })
  .handler(async ({ data }) => {
    const meId = await requirePatientId();
    if (!meId) return { ok: false as const, error: "Not authorized." };
    if (data.date <= todayISO()) {
      return { ok: false as const, error: "That date is in the past." };
    }

    const sqlTime = to24h(data.time);

    // The session being moved — need its clinician to check that clinician's
    // slots aren't already taken by another patient.
    const [target] = await db
      .select({ psychologistId: bookings.psychologistId })
      .from(bookings)
      .where(and(eq(bookings.id, data.id), eq(bookings.patientId, meId)))
      .limit(1);
    if (!target) return { ok: false as const, error: "Session not found." };

    // Slot free for this clinician? (any patient, not canceled, excluding this one)
    const clinicianClash = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.psychologistId, target.psychologistId),
          eq(bookings.scheduledDate, data.date),
          eq(bookings.scheduledTime, sqlTime),
          ne(bookings.status, "canceled"),
          ne(bookings.id, data.id),
        ),
      )
      .limit(1);
    if (clinicianClash.length > 0) {
      return { ok: false as const, error: "That slot is already taken." };
    }

    // The patient can't attend two sessions at once — exclude the one being moved.
    const selfClash = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.patientId, meId),
          eq(bookings.scheduledDate, data.date),
          eq(bookings.scheduledTime, sqlTime),
          ne(bookings.status, "canceled"),
          ne(bookings.id, data.id),
        ),
      )
      .limit(1);
    if (selfClash.length > 0) {
      return { ok: false as const, error: "That slot is already taken." };
    }

    await db
      .update(bookings)
      .set({
        scheduledDate: data.date,
        scheduledTime: sqlTime,
        mode: MODE_TO_DB[data.mode] ?? "video",
        updatedAt: new Date(),
      })
      .where(and(eq(bookings.id, data.id), eq(bookings.patientId, meId)));
    return { ok: true as const };
  });

export const addJournalEntryFn = createServerFn({ method: "POST" })
  .validator(
    (data: unknown) => data as { title: string; content: string; mood: number; tags: string[] },
  )
  .handler(async ({ data }) => {
    const meId = await requirePatientId();
    if (!meId) return { ok: false as const, error: "Not authorized." };
    const [row] = await db
      .insert(diaryEntries)
      .values({
        patientId: meId,
        authorId: meId,
        title: data.title,
        content: data.content,
        mood: clampMood(data.mood),
        tags: data.tags,
        entryDate: todayISO(),
      })
      .returning({ id: diaryEntries.id });
    return { ok: true as const, id: row.id };
  });

export const checkInMoodFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { mood: number })
  .handler(async ({ data }) => {
    const meId = await requirePatientId();
    if (!meId) return { ok: false as const, error: "Not authorized." };
    const mood = clampMood(data.mood);
    const today = todayISO();

    const existing = await db
      .select({ id: diaryEntries.id })
      .from(diaryEntries)
      .where(and(eq(diaryEntries.patientId, meId), eq(diaryEntries.entryDate, today)))
      .limit(1);

    if (existing[0]) {
      await db.update(diaryEntries).set({ mood }).where(eq(diaryEntries.id, existing[0].id));
      return { ok: true as const, created: false };
    }

    await db.insert(diaryEntries).values({
      patientId: meId,
      authorId: meId,
      title: "Daily check-in",
      content: "Logged today's mood.",
      mood,
      tags: ["check-in"],
      entryDate: today,
    });
    return { ok: true as const, created: true };
  });

export const markNotificationReadFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    const meId = await requirePatientId();
    if (!meId) return { ok: false as const, error: "Not authorized." };
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, data.id), eq(notifications.userId, meId)));
    return { ok: true as const };
  });

export const markAllReadFn = createServerFn({ method: "POST" }).handler(async () => {
  const meId = await requirePatientId();
  if (!meId) return { ok: false as const, error: "Not authorized." };
  await db.update(notifications).set({ read: true }).where(eq(notifications.userId, meId));
  return { ok: true as const };
});

export const updateProfileFn = createServerFn({ method: "POST" })
  .validator(
    (data: unknown) =>
      data as {
        name: string;
        phone: string;
        dateOfBirth: string;
        address: string;
        emergencyContactName: string;
        emergencyContactPhone: string;
        preferredLanguage: string;
        notificationPrefs: Record<string, boolean>;
      },
  )
  .handler(async ({ data }) => {
    const meId = await requirePatientId();
    if (!meId) return { ok: false as const, error: "Not authorized." };

    const phoneCheck = phoneSchema.safeParse(data.phone);
    if (!phoneCheck.success) {
      return { ok: false as const, error: "Phone must be a 10-digit number." };
    }
    const emergencyPhoneCheck = phoneSchema.safeParse(data.emergencyContactPhone);
    if (!emergencyPhoneCheck.success) {
      return { ok: false as const, error: "Emergency contact phone must be a 10-digit number." };
    }

    await db
      .update(users)
      .set({ name: data.name, phone: data.phone || null })
      .where(eq(users.id, meId));

    const onboardingComplete = [
      data.name,
      data.phone,
      data.dateOfBirth,
      data.address,
      data.emergencyContactName,
      data.emergencyContactPhone,
    ].every((v) => v.trim().length > 0);

    await db
      .update(patientProfiles)
      .set({
        dateOfBirth: data.dateOfBirth || null,
        address: data.address || null,
        emergencyContactName: data.emergencyContactName || null,
        emergencyContactPhone: data.emergencyContactPhone || null,
        preferredLanguage: data.preferredLanguage || null,
        notificationPrefs: data.notificationPrefs,
        onboardingComplete,
      })
      .where(eq(patientProfiles.userId, meId));

    return { ok: true as const };
  });
