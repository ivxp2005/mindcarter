/**
 * psychologist-data.server.ts — DB-backed data layer for the psychologist portal.
 *
 * Mirrors patient-data.server.ts: every handler is scoped to the logged-in
 * psychologist via `getSessionUser()`, DB rows are mapped to the portal's
 * existing TS shapes (Meeting / DiaryEntry / PortalNotification / patient
 * roster row) so the store and pages need no shape changes, and enum↔label
 * mapping (booking status/mode/kind) lives here.
 */
import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db/client.server";
import {
  availabilitySlots,
  bookings,
  careTeamMembers,
  diaryEntries,
  notifications,
  patientProfiles,
  psychologistProfiles,
  users,
} from "../db/schema";
import { getSessionUser } from "./auth.server";
import type {
  DiaryEntry,
  Meeting,
  MeetingStatus,
  NotificationKind,
  PatientStatus,
  PortalNotification,
} from "./psychologist";

// ─── DTOs returned to the client ────────────────────────────────────────────

export interface PatientRosterDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  primaryConcern: string;
  status: PatientStatus;
  totalSessions: number;
  nextSession: string | null;
  tags: string[];
}

export interface PsychologistProfileDTO {
  name: string;
  title: string;
  email: string;
  phone: string;
  license: string;
  specialties: string[];
  hours: { day: string; range: string }[];
  notificationPrefs: {
    emailDigests: boolean;
    sessionReminders: boolean;
    diaryAlerts: boolean;
    marketing: boolean;
  };
}

export interface PortalData {
  meetings: Meeting[];
  patients: PatientRosterDTO[];
  diaries: DiaryEntry[];
  notifications: PortalNotification[];
  profile: PsychologistProfileDTO | null;
}

const EMPTY_PORTAL: PortalData = {
  meetings: [],
  patients: [],
  diaries: [],
  notifications: [],
  profile: null,
};

const DEFAULT_PREFS = {
  emailDigests: true,
  sessionReminders: true,
  diaryAlerts: true,
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

function toPortalStatus(s: BookingStatus): MeetingStatus {
  if (s === "completed") return "completed";
  if (s === "canceled" || s === "refunded") return "canceled";
  return "upcoming";
}

const MODE_TO_PORTAL: Record<BookingMode, Meeting["mode"]> = {
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

const DAY_TO_LABEL: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

// ─── Time-of-day: 12h UI slot ("09:00 AM") ↔ SQL time ("09:00:00") ──────────

function to24h(slot: string): string {
  const m = slot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return slot;
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

/** Coarse relative label for a calendar-day entryDate ("2026-07-16"). */
function daysAgoLabel(entryDate: string): string {
  const today = todayISO();
  if (entryDate === today) return "Today";
  const [y, m, d] = entryDate.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  const diffDays = Math.round(
    (Date.UTC(ty, tm - 1, td) - Date.UTC(y, m - 1, d)) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

function excerptOf(content: string): string {
  const trimmed = content.trim();
  return trimmed.length > 140 ? `${trimmed.slice(0, 140).trimEnd()}…` : trimmed;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Auth guard ─────────────────────────────────────────────────────────────

async function requirePsychologistId(): Promise<string | null> {
  const user = await getSessionUser();
  if (!user || user.role !== "psychologist") return null;
  return user.id;
}

/** Every patient with a booking or care-team link to this psychologist. */
async function getRosterPatientIds(meId: string): Promise<string[]> {
  const [bookingRows, careRows] = await Promise.all([
    db
      .select({ patientId: bookings.patientId })
      .from(bookings)
      .where(eq(bookings.psychologistId, meId)),
    db
      .select({ patientId: careTeamMembers.patientId })
      .from(careTeamMembers)
      .where(eq(careTeamMembers.psychologistId, meId)),
  ]);
  const ids = new Set<string>();
  for (const r of bookingRows) if (r.patientId) ids.add(r.patientId);
  for (const r of careRows) ids.add(r.patientId);
  return [...ids];
}

// ─── Read ───────────────────────────────────────────────────────────────────

export const getPortalDataFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<PortalData> => {
    const meId = await requirePsychologistId();
    if (!meId) return EMPTY_PORTAL;

    const rosterIds = await getRosterPatientIds(meId);

    const [meetingRows, patientRows, diaryRows, notifRows, userRow, profileRow, slotRows] =
      await Promise.all([
        db
          .select({
            id: bookings.id,
            patientId: bookings.patientId,
            patientName: users.name,
            date: bookings.scheduledDate,
            time: bookings.scheduledTime,
            kind: bookings.sessionKind,
            mode: bookings.mode,
            durationMin: bookings.durationMinutes,
            status: bookings.status,
            notes: bookings.notes,
          })
          .from(bookings)
          .innerJoin(users, eq(bookings.patientId, users.id))
          .where(eq(bookings.psychologistId, meId)),
        rosterIds.length === 0
          ? Promise.resolve([])
          : db
              .select({
                id: users.id,
                name: users.name,
                email: users.email,
                phone: users.phone,
                primaryConcern: patientProfiles.primaryConcern,
                tags: patientProfiles.tags,
              })
              .from(users)
              .leftJoin(patientProfiles, eq(patientProfiles.userId, users.id))
              .where(inArray(users.id, rosterIds)),
        rosterIds.length === 0
          ? Promise.resolve([])
          : db
              .select({
                id: diaryEntries.id,
                patientId: diaryEntries.patientId,
                patientName: users.name,
                title: diaryEntries.title,
                content: diaryEntries.content,
                status: diaryEntries.status,
                clinicianNote: diaryEntries.clinicianNote,
                entryDate: diaryEntries.entryDate,
              })
              .from(diaryEntries)
              .innerJoin(users, eq(diaryEntries.patientId, users.id))
              .where(inArray(diaryEntries.patientId, rosterIds)),
        db.select().from(notifications).where(eq(notifications.userId, meId)),
        db.select().from(users).where(eq(users.id, meId)).limit(1),
        db
          .select()
          .from(psychologistProfiles)
          .where(eq(psychologistProfiles.userId, meId))
          .limit(1),
        db.select().from(availabilitySlots).where(eq(availabilitySlots.psychologistId, meId)),
      ]);

    const meetings: Meeting[] = meetingRows.map((r) => ({
      id: r.id,
      patientId: r.patientId ?? "",
      patientName: r.patientName,
      date: r.date,
      time: to12h(r.time),
      kind: KIND_TO_LABEL[r.kind as SessionKind] ?? r.kind,
      mode: MODE_TO_PORTAL[r.mode as BookingMode],
      durationMin: r.durationMin,
      status: toPortalStatus(r.status as BookingStatus),
      notes: r.notes ?? undefined,
    }));

    const today = todayISO();
    const patients: PatientRosterDTO[] = patientRows.map((p) => {
      const own = meetings.filter((m) => m.patientId === p.id);
      const nonCanceled = own.filter((m) => m.status !== "canceled");
      const nextSession =
        own
          .filter((m) => m.status === "upcoming" && m.date >= today)
          .sort((a, b) => a.date.localeCompare(b.date))[0]?.date ?? null;
      let status: PatientStatus;
      if (nonCanceled.length <= 1) status = "New";
      else if (nextSession) status = "Active";
      else status = "Inactive";
      return {
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone ?? "",
        primaryConcern: p.primaryConcern ?? "",
        status,
        totalSessions: nonCanceled.length,
        nextSession,
        tags: p.tags ?? [],
      };
    });

    const diaries: DiaryEntry[] = diaryRows.map((d) => ({
      id: d.id,
      patientName: d.patientName,
      patientId: d.patientId,
      title: d.title,
      excerpt: excerptOf(d.content),
      content: d.content,
      submitted: daysAgoLabel(d.entryDate),
      status: d.status,
      clinicianNote: d.clinicianNote ?? undefined,
    }));

    const portalNotifications: PortalNotification[] = notifRows.map((r) => ({
      id: r.id,
      kind: r.kind as NotificationKind,
      title: r.title,
      body: r.body,
      time: timeAgo(r.createdAt),
      read: r.read,
      actionTo: r.actionUrl ?? undefined,
      actionSearch:
        (r.actionParams as Record<string, string | number | boolean> | null) ?? undefined,
    }));

    const hoursByDay = new Map<string, string[]>();
    for (const s of slotRows) {
      const label = DAY_TO_LABEL[s.dayOfWeek] ?? s.dayOfWeek;
      const range = `${to12h(s.startTime)} – ${to12h(s.endTime)}`;
      const arr = hoursByDay.get(label) ?? [];
      arr.push(range);
      hoursByDay.set(label, arr);
    }
    const DAY_ORDER = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const hours = DAY_ORDER.filter((d) => hoursByDay.has(d)).map((d) => ({
      day: d,
      range: hoursByDay.get(d)!.join(", "),
    }));

    const u = userRow[0];
    const pp = profileRow[0];
    const profile: PsychologistProfileDTO | null = u
      ? {
          name: u.name,
          title: pp?.title ?? "",
          email: u.email,
          phone: u.phone ?? "",
          license: pp?.licenseNumber ?? "",
          specialties: pp?.specialties ?? [],
          hours,
          notificationPrefs: {
            ...DEFAULT_PREFS,
            ...((pp?.notificationPrefs as Partial<typeof DEFAULT_PREFS> | null) ?? {}),
          },
        }
      : null;

    return { meetings, patients, diaries, notifications: portalNotifications, profile };
  },
);

// ─── Mutations ──────────────────────────────────────────────────────────────

export const rescheduleMeetingFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string; date: string; time: string; mode: string })
  .handler(async ({ data }) => {
    const meId = await requirePsychologistId();
    if (!meId) return { ok: false as const, error: "Not authorized." };
    if (data.date < todayISO()) {
      return { ok: false as const, error: "That date is in the past." };
    }
    await db
      .update(bookings)
      .set({
        scheduledDate: data.date,
        scheduledTime: to24h(data.time),
        mode: MODE_TO_DB[data.mode] ?? "video",
        updatedAt: new Date(),
      })
      .where(and(eq(bookings.id, data.id), eq(bookings.psychologistId, meId)));
    return { ok: true as const };
  });

export const completeMeetingFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    const meId = await requirePsychologistId();
    if (!meId) return { ok: false as const, error: "Not authorized." };
    await db
      .update(bookings)
      .set({ status: "completed", updatedAt: new Date() })
      .where(and(eq(bookings.id, data.id), eq(bookings.psychologistId, meId)));
    return { ok: true as const };
  });

export const cancelMeetingFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    const meId = await requirePsychologistId();
    if (!meId) return { ok: false as const, error: "Not authorized." };
    await db
      .update(bookings)
      .set({ status: "canceled", updatedAt: new Date() })
      .where(and(eq(bookings.id, data.id), eq(bookings.psychologistId, meId)));
    return { ok: true as const };
  });

export const saveDiaryNoteFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string; note: string })
  .handler(async ({ data }) => {
    const meId = await requirePsychologistId();
    if (!meId) return { ok: false as const, error: "Not authorized." };
    const rosterIds = await getRosterPatientIds(meId);
    if (rosterIds.length === 0) return { ok: false as const, error: "Diary not found." };
    await db
      .update(diaryEntries)
      .set({ clinicianNote: data.note })
      .where(and(eq(diaryEntries.id, data.id), inArray(diaryEntries.patientId, rosterIds)));
    return { ok: true as const };
  });

export const markDiaryReviewedFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    const meId = await requirePsychologistId();
    if (!meId) return { ok: false as const, error: "Not authorized." };
    const rosterIds = await getRosterPatientIds(meId);
    if (rosterIds.length === 0) return { ok: false as const, error: "Diary not found." };
    await db
      .update(diaryEntries)
      .set({ status: "reviewed" })
      .where(and(eq(diaryEntries.id, data.id), inArray(diaryEntries.patientId, rosterIds)));
    return { ok: true as const };
  });

export const markNotificationReadFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    const meId = await requirePsychologistId();
    if (!meId) return { ok: false as const, error: "Not authorized." };
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, data.id), eq(notifications.userId, meId)));
    return { ok: true as const };
  });

export const markAllReadFn = createServerFn({ method: "POST" }).handler(async () => {
  const meId = await requirePsychologistId();
  if (!meId) return { ok: false as const, error: "Not authorized." };
  await db.update(notifications).set({ read: true }).where(eq(notifications.userId, meId));
  return { ok: true as const };
});

export const logDiaryReminderFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { patientId: string })
  .handler(async ({ data }) => {
    const meId = await requirePsychologistId();
    if (!meId) return { ok: false as const, error: "Not authorized." };
    const rosterIds = await getRosterPatientIds(meId);
    if (!rosterIds.includes(data.patientId)) {
      return { ok: false as const, error: "Patient not found." };
    }
    await db.insert(notifications).values({
      userId: data.patientId,
      kind: "diary",
      title: "Diary reminder",
      body: "Your clinician would like you to log a diary entry.",
      actionUrl: "/employee/journal",
    });
    return { ok: true as const };
  });

export const updateProfileFn = createServerFn({ method: "POST" })
  .validator(
    (data: unknown) =>
      data as {
        name: string;
        title: string;
        phone: string;
        specialties: string[];
        notificationPrefs: Record<string, boolean>;
      },
  )
  .handler(async ({ data }) => {
    const meId = await requirePsychologistId();
    if (!meId) return { ok: false as const, error: "Not authorized." };

    await db
      .update(users)
      .set({ name: data.name, phone: data.phone || null })
      .where(eq(users.id, meId));

    const existing = await db
      .select({ userId: psychologistProfiles.userId })
      .from(psychologistProfiles)
      .where(eq(psychologistProfiles.userId, meId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(psychologistProfiles).values({
        userId: meId,
        title: data.title || null,
        specialties: data.specialties,
        notificationPrefs: data.notificationPrefs,
      });
    } else {
      await db
        .update(psychologistProfiles)
        .set({
          title: data.title || null,
          specialties: data.specialties,
          notificationPrefs: data.notificationPrefs,
        })
        .where(eq(psychologistProfiles.userId, meId));
    }

    return { ok: true as const };
  });
