import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MOOD_LABEL,
  todayISO,
  type JournalEntry,
  type Mood,
  type PatientSession,
  type PortalNotification,
} from "./patient";
import {
  addJournalEntryFn,
  bookSessionFn,
  cancelSessionFn,
  checkInMoodFn,
  completeSessionFn,
  getAllCliniciansFn,
  getPortalDataFn,
  markAllReadFn,
  markNotificationReadFn,
  rescheduleSessionFn,
  updateProfileFn,
  type CareTeamMemberDTO,
  type PatientProfileDTO,
  type PortalData,
} from "./patient-data.server";
import {
  getMyTicketsFn,
  replyToTicketFn,
  submitTicketFn,
  type TicketDTO,
} from "./support-data.server";

// ─────────────────────────────────────────────────────────────────────────────
// Single reactive source of truth for the employee portal — now DB-backed.
//
// One TanStack Query (`["patient-portal"]`) loads everything for the logged-in
// patient from Supabase via `getPortalDataFn`; mutations call the matching
// server functions and invalidate that query so every page/shell stays in sync
// with no reload. All stats (streak, avg mood, entries, unread, per-clinician
// session counts, mood trend) are DERIVED here from the fetched rows, so they
// can never drift.
// ─────────────────────────────────────────────────────────────────────────────

const QUERY_KEY = ["patient-portal"] as const;
const TICKETS_QUERY_KEY = ["patient-support-tickets"] as const;

export type { CareTeamMemberDTO, PatientProfileDTO, TicketDTO };
export type EnrichedCareMember = CareTeamMemberDTO & {
  sessionCount: number;
  nextSession: string | null;
};

export interface BookSessionInput {
  psychologistId: string;
  date: string; // ISO yyyy-mm-dd
  time: string;
  kind: string;
  mode: PatientSession["mode"];
  durationMin: number;
}

export function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** A slot is taken if a non-canceled session already exists for that clinician,
 *  date and time. */
function slotTaken(
  sessions: PatientSession[],
  psychologistId: string,
  date: string,
  time: string,
): boolean {
  return sessions.some(
    (s) =>
      s.status !== "canceled" &&
      s.psychologistId === psychologistId &&
      s.date === date &&
      s.time === time,
  );
}

function bySchedule(a: PatientSession, b: PatientSession): number {
  return a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date);
}

/** Consecutive days ending today (or yesterday, if today isn't logged yet). */
function computeStreak(journal: JournalEntry[]): number {
  const days = new Set(journal.map((e) => e.date));
  const cursor = parseISODate(todayISO());
  if (!days.has(toISO(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(toISO(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Per-day mood average, oldest→newest, over the last 8 weeks of real entries.
 *  Grouping by calendar day (not by week) so a check-in shows up as its own
 *  point immediately instead of being folded into a once-a-week bucket that
 *  hides everything logged since the last Monday. */
function computeMoodTrend(journal: JournalEntry[]): { day: string; mood: number }[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 56);
  const cutoffISO = toISO(cutoff);

  const byDay = new Map<string, { sum: number; n: number }>();
  for (const e of journal) {
    if (e.date < cutoffISO) continue;
    const cur = byDay.get(e.date) ?? { sum: 0, n: 0 };
    cur.sum += e.mood;
    cur.n += 1;
    byDay.set(e.date, cur);
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({
      day: parseISODate(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      mood: Math.round((v.sum / v.n) * 10) / 10,
    }));
}

interface PatientDataValue {
  // Raw collections
  sessions: PatientSession[];
  journal: JournalEntry[];
  notifications: PortalNotification[];
  profile: PatientProfileDTO | null;
  isLoading: boolean;
  // Derived
  upcoming: PatientSession[];
  past: PatientSession[];
  canceled: PatientSession[];
  careTeam: EnrichedCareMember[];
  /** Every active clinician in the system — for the booking dialog, which
   *  isn't limited to the patient's existing care team. */
  clinicians: CareTeamMemberDTO[];
  stats: {
    streakDays: number;
    avgMood: number;
    entriesThisMonth: number;
    unreadCount: number;
  };
  moodTrend: { day: string; mood: number }[];
  // Booking dialog state
  bookingOpen: boolean;
  bookingPresetId: string | null;
  rescheduleSessionId: string | null;
  // Actions
  openBooking: (psychologistId?: string) => void;
  openReschedule: (session: PatientSession) => void;
  closeBooking: () => void;
  bookSession: (input: BookSessionInput) => boolean;
  rescheduleSession: (
    id: string,
    input: { date: string; time: string; mode: PatientSession["mode"] },
  ) => void;
  cancelSession: (id: string) => void;
  completeSession: (id: string) => void;
  checkInMood: (mood: Mood) => void;
  addJournalEntry: (input: { title: string; content: string; mood: Mood; tags: string[] }) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  saveProfile: (input: {
    name: string;
    phone: string;
    dateOfBirth: string;
    address: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    preferredLanguage: string;
    notificationPrefs: Record<string, boolean>;
  }) => void;
  isSlotTaken: (psychologistId: string, date: string, time: string) => boolean;
  // Support tickets
  tickets: TicketDTO[];
  submitTicket: (input: {
    subject: string;
    priority: "low" | "medium" | "high";
    message: string;
  }) => void;
  replyToTicket: (ticketId: string, body: string) => void;
}

const PatientDataContext = createContext<PatientDataValue | null>(null);

export function PatientDataProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getPortalDataFn(),
    staleTime: 30_000,
  });
  const { data: cliniciansData } = useQuery({
    queryKey: ["all-clinicians"],
    queryFn: () => getAllCliniciansFn(),
    staleTime: 5 * 60_000,
  });
  const { data: ticketsData } = useQuery({
    queryKey: TICKETS_QUERY_KEY,
    queryFn: () => getMyTicketsFn(),
    staleTime: 30_000,
  });

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPresetId, setBookingPresetId] = useState<string | null>(null);
  const [rescheduleSessionId, setRescheduleSessionId] = useState<string | null>(null);

  const sessions = useMemo(() => data?.sessions ?? [], [data]);
  const journal = useMemo(() => data?.journal ?? [], [data]);
  const notifications = useMemo(() => data?.notifications ?? [], [data]);
  const careTeamBase = useMemo(() => data?.careTeam ?? [], [data]);
  const clinicians = useMemo(() => cliniciansData ?? [], [cliniciansData]);
  const tickets = useMemo(() => ticketsData ?? [], [ticketsData]);
  const profile = data?.profile ?? null;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  const patchData = (fn: (prev: PortalData) => PortalData) =>
    queryClient.setQueryData<PortalData>(QUERY_KEY, (prev) => (prev ? fn(prev) : prev));
  const invalidateTickets = () => queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY });

  // Mutations. Read/write actions optimistically patch the cache where it keeps
  // the UI instant (mood, notifications); the rest invalidate to refetch.
  const bookMut = useMutation({ mutationFn: bookSessionFn, onSuccess: invalidate });
  const cancelMut = useMutation({ mutationFn: cancelSessionFn, onSuccess: invalidate });
  const completeMut = useMutation({ mutationFn: completeSessionFn, onSuccess: invalidate });
  const rescheduleMut = useMutation({ mutationFn: rescheduleSessionFn, onSuccess: invalidate });
  const addEntryMut = useMutation({ mutationFn: addJournalEntryFn, onSuccess: invalidate });
  const checkInMut = useMutation({ mutationFn: checkInMoodFn, onSuccess: invalidate });
  const markReadMut = useMutation({ mutationFn: markNotificationReadFn, onSuccess: invalidate });
  const markAllMut = useMutation({ mutationFn: () => markAllReadFn(), onSuccess: invalidate });
  const profileMut = useMutation({ mutationFn: updateProfileFn, onSuccess: invalidate });
  const submitTicketMut = useMutation({ mutationFn: submitTicketFn, onSuccess: invalidateTickets });
  const replyTicketMut = useMutation({ mutationFn: replyToTicketFn, onSuccess: invalidateTickets });

  const derived = useMemo(() => {
    const today = todayISO();
    const isUpcoming = (s: PatientSession) => s.status === "upcoming" && s.date >= today;
    const isElapsed = (s: PatientSession) => s.status === "upcoming" && s.date < today;

    const upcoming = sessions.filter(isUpcoming).sort(bySchedule);
    const past = sessions.filter((s) => s.status === "completed" || isElapsed(s));
    const canceled = sessions.filter((s) => s.status === "canceled");

    const careTeam: EnrichedCareMember[] = careTeamBase.map((m) => {
      const own = sessions.filter((s) => s.psychologistId === m.id);
      const nextSession = own.filter(isUpcoming).sort(bySchedule)[0]?.date ?? null;
      return {
        ...m,
        sessionCount: own.filter((s) => s.status !== "canceled").length,
        nextSession,
      };
    });

    const moods = journal.map((e) => e.mood);
    const avgMood =
      moods.length === 0
        ? 0
        : Math.round((moods.reduce((sum, m) => sum + m, 0) / moods.length) * 10) / 10;
    const entriesThisMonth = journal.filter((e) =>
      e.date.startsWith(todayISO().slice(0, 7)),
    ).length;
    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
      upcoming,
      past,
      canceled,
      careTeam,
      stats: {
        streakDays: computeStreak(journal),
        avgMood,
        entriesThisMonth,
        unreadCount,
      },
      moodTrend: computeMoodTrend(journal),
    };
  }, [sessions, journal, notifications, careTeamBase]);

  const value = useMemo<PatientDataValue>(() => {
    return {
      sessions,
      journal,
      notifications,
      profile,
      isLoading,
      ...derived,
      clinicians,
      bookingOpen,
      bookingPresetId,
      rescheduleSessionId,
      openBooking: (psychologistId) => {
        setRescheduleSessionId(null);
        setBookingPresetId(psychologistId ?? null);
        setBookingOpen(true);
      },
      openReschedule: (session) => {
        setRescheduleSessionId(session.id);
        setBookingPresetId(session.psychologistId);
        setBookingOpen(true);
      },
      closeBooking: () => {
        setBookingOpen(false);
        setRescheduleSessionId(null);
        setBookingPresetId(null);
      },
      bookSession: (input) => {
        // Client-side guard for instant feedback; the server re-validates.
        if (input.date < todayISO()) return false;
        if (slotTaken(sessions, input.psychologistId, input.date, input.time)) return false;
        bookMut.mutate({ data: input });
        return true;
      },
      rescheduleSession: (id, input) =>
        rescheduleMut.mutate({
          data: { id, date: input.date, time: input.time, mode: input.mode },
        }),
      cancelSession: (id) => cancelMut.mutate({ data: { id } }),
      completeSession: (id) => completeMut.mutate({ data: { id } }),
      checkInMood: (mood) => {
        // Optimistic: upsert today's entry so streak/avg/graph move instantly.
        const today = todayISO();
        patchData((prev) => {
          const has = prev.journal.some((e) => e.date === today);
          const journalNext = has
            ? prev.journal.map((e) => (e.date === today ? { ...e, mood } : e))
            : [
                {
                  id: `optimistic-${Date.now()}`,
                  date: today,
                  mood,
                  title: "Daily check-in",
                  content: "Logged today's mood.",
                  tags: ["check-in"],
                } as JournalEntry,
                ...prev.journal,
              ];
          return { ...prev, journal: journalNext };
        });
        checkInMut.mutate({ data: { mood } });
      },
      addJournalEntry: (input) => addEntryMut.mutate({ data: input }),
      markNotificationRead: (id) => {
        patchData((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }));
        markReadMut.mutate({ data: { id } });
      },
      markAllRead: () => {
        patchData((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) => ({ ...n, read: true })),
        }));
        markAllMut.mutate();
      },
      saveProfile: (input) => profileMut.mutate({ data: input }),
      isSlotTaken: (psychologistId, date, time) => slotTaken(sessions, psychologistId, date, time),
      tickets,
      submitTicket: (input) => submitTicketMut.mutate({ data: input }),
      replyToTicket: (ticketId, body) => replyTicketMut.mutate({ data: { ticketId, body } }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sessions,
    journal,
    notifications,
    profile,
    isLoading,
    derived,
    clinicians,
    bookingOpen,
    bookingPresetId,
    rescheduleSessionId,
    tickets,
  ]);

  return <PatientDataContext.Provider value={value}>{children}</PatientDataContext.Provider>;
}

export function usePatientData(): PatientDataValue {
  const ctx = useContext(PatientDataContext);
  if (!ctx) {
    throw new Error("usePatientData must be used within a PatientDataProvider");
  }
  return ctx;
}
