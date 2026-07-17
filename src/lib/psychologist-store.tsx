import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Meeting, PortalNotification } from "./psychologist";
import {
  addDiaryNoteFn,
  cancelMeetingFn,
  completeMeetingFn,
  getPortalDataFn,
  logDiaryReminderFn,
  markAllReadFn,
  markNotificationReadFn,
  rescheduleMeetingFn,
  updateProfileFn,
  type PatientRosterDTO,
  type PortalData,
  type PsychologistProfileDTO,
  type SessionNoteDTO,
} from "./psychologist-data.server";
import {
  getMyTicketsFn,
  replyToTicketFn,
  submitTicketFn,
  type TicketDTO,
} from "./support-data.server";

// ─────────────────────────────────────────────────────────────────────────────
// Single reactive source of truth for the psychologist portal — DB-backed.
//
// One TanStack Query (`["psychologist-portal"]`) loads everything for the
// logged-in psychologist from Supabase via `getPortalDataFn`; mutations call
// the matching server functions and invalidate that query so every page/shell
// stays in sync with no reload. Practice-wide stats and the analytics charts
// are DERIVED here from the fetched rows, so they can never drift from what's
// actually in the meetings/diaries/notifications lists.
// ─────────────────────────────────────────────────────────────────────────────

const QUERY_KEY = ["psychologist-portal"] as const;
const TICKETS_QUERY_KEY = ["psychologist-support-tickets"] as const;

export type { PatientRosterDTO, PsychologistProfileDTO, SessionNoteDTO, TicketDTO };

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** ISO week start (Monday) for a yyyy-mm-dd date string. */
function weekStart(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function computeWeeklySessions(meetings: Meeting[]): { week: string; sessions: number }[] {
  const byWeek = new Map<string, number>();
  for (const m of meetings) {
    if (m.status === "canceled") continue;
    const key = weekStart(m.date);
    byWeek.set(key, (byWeek.get(key) ?? 0) + 1);
  }
  return [...byWeek.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-8)
    .map(([key, sessions]) => ({
      week: new Date(key).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      sessions,
    }));
}

function computeSessionTypeBreakdown(meetings: Meeting[]): { type: string; value: number }[] {
  const byType = new Map<string, number>();
  for (const m of meetings) {
    if (m.status === "canceled") continue;
    byType.set(m.kind, (byType.get(m.kind) ?? 0) + 1);
  }
  return [...byType.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, value]) => ({ type, value }));
}

function computePatientGrowth(patients: PatientRosterDTO[]): { month: string; patients: number }[] {
  // No per-patient join date is tracked, so this is a flat snapshot of the
  // current roster size — a real trend needs a `created_at` on the
  // patient/care-team link, which isn't part of today's schema.
  const month = new Date().toLocaleDateString(undefined, { month: "short" });
  return [{ month, patients: patients.length }];
}

interface PsychologistDataValue {
  meetings: Meeting[];
  patients: PatientRosterDTO[];
  diaryNotes: SessionNoteDTO[];
  notifications: PortalNotification[];
  profile: PsychologistProfileDTO | null;
  isLoading: boolean;
  todayMeetings: Meeting[];
  upcomingMeetings: Meeting[];
  pastMeetings: Meeting[];
  stats: {
    todaysMeetings: number;
    activePatients: number;
    sessionsToDocument: number;
    notificationsTotal: number;
    unreadCount: number;
  };
  weeklySessions: { week: string; sessions: number }[];
  sessionTypeBreakdown: { type: string; value: number }[];
  patientGrowth: { month: string; patients: number }[];
  rescheduleMeeting: (
    id: string,
    input: { date: string; time: string; mode: Meeting["mode"] },
  ) => void;
  completeMeeting: (id: string) => void;
  cancelMeeting: (id: string) => void;
  addDiaryNote: (bookingId: string, content: string) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  logDiaryReminder: (patientId: string) => void;
  saveProfile: (input: {
    name: string;
    title: string;
    phone: string;
    specialties: string[];
    notificationPrefs: Record<string, boolean>;
  }) => void;
  // Support tickets
  tickets: TicketDTO[];
  submitTicket: (input: {
    subject: string;
    priority: "low" | "medium" | "high";
    message: string;
  }) => void;
  replyToTicket: (ticketId: string, body: string) => void;
}

const PsychologistDataContext = createContext<PsychologistDataValue | null>(null);

export function PsychologistDataProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getPortalDataFn(),
    staleTime: 30_000,
  });
  const { data: ticketsData } = useQuery({
    queryKey: TICKETS_QUERY_KEY,
    queryFn: () => getMyTicketsFn(),
    staleTime: 30_000,
  });

  const meetings = useMemo(() => data?.meetings ?? [], [data]);
  const patients = useMemo(() => data?.patients ?? [], [data]);
  const diaryNotes = useMemo(() => data?.diaryNotes ?? [], [data]);
  const notifications = useMemo(() => data?.notifications ?? [], [data]);
  const tickets = useMemo(() => ticketsData ?? [], [ticketsData]);
  const profile = data?.profile ?? null;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  const patchData = (fn: (prev: PortalData) => PortalData) =>
    queryClient.setQueryData<PortalData>(QUERY_KEY, (prev) => (prev ? fn(prev) : prev));
  const invalidateTickets = () => queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY });

  const rescheduleMut = useMutation({ mutationFn: rescheduleMeetingFn, onSuccess: invalidate });
  const completeMut = useMutation({ mutationFn: completeMeetingFn, onSuccess: invalidate });
  const cancelMut = useMutation({ mutationFn: cancelMeetingFn, onSuccess: invalidate });
  const addNoteMut = useMutation({ mutationFn: addDiaryNoteFn, onSuccess: invalidate });
  const markReadMut = useMutation({ mutationFn: markNotificationReadFn, onSuccess: invalidate });
  const markAllMut = useMutation({ mutationFn: () => markAllReadFn(), onSuccess: invalidate });
  const logReminderMut = useMutation({ mutationFn: logDiaryReminderFn, onSuccess: invalidate });
  const profileMut = useMutation({ mutationFn: updateProfileFn, onSuccess: invalidate });
  const submitTicketMut = useMutation({ mutationFn: submitTicketFn, onSuccess: invalidateTickets });
  const replyTicketMut = useMutation({ mutationFn: replyToTicketFn, onSuccess: invalidateTickets });

  const derived = useMemo(() => {
    const today = todayISO();
    const todayMeetings = meetings.filter((m) => m.date === today);
    const upcomingMeetings = meetings.filter((m) => m.date > today && m.status === "upcoming");
    const pastMeetings = meetings.filter((m) => m.date < today || m.status === "completed");
    const activePatients = patients.filter((p) => p.status === "Active").length;
    // Past / completed sessions that don't yet have a clinical note.
    const notedBookingIds = new Set(diaryNotes.map((n) => n.bookingId));
    const sessionsToDocument = meetings.filter(
      (m) => m.status !== "canceled" && m.date <= today && !notedBookingIds.has(m.id),
    ).length;
    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
      todayMeetings,
      upcomingMeetings,
      pastMeetings,
      stats: {
        todaysMeetings: todayMeetings.length,
        activePatients,
        sessionsToDocument,
        notificationsTotal: notifications.length,
        unreadCount,
      },
      weeklySessions: computeWeeklySessions(meetings),
      sessionTypeBreakdown: computeSessionTypeBreakdown(meetings),
      patientGrowth: computePatientGrowth(patients),
    };
  }, [meetings, patients, diaryNotes, notifications]);

  const value = useMemo<PsychologistDataValue>(() => {
    return {
      meetings,
      patients,
      diaryNotes,
      notifications,
      profile,
      isLoading,
      ...derived,
      rescheduleMeeting: (id, input) =>
        rescheduleMut.mutate({
          data: { id, date: input.date, time: input.time, mode: input.mode },
        }),
      completeMeeting: (id) => completeMut.mutate({ data: { id } }),
      cancelMeeting: (id) => cancelMut.mutate({ data: { id } }),
      // Insert-only: notes are immutable once written, so there is no optimistic
      // patch to reconcile — just fire and re-fetch.
      addDiaryNote: (bookingId, content) => addNoteMut.mutate({ data: { bookingId, content } }),
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
      logDiaryReminder: (patientId) => logReminderMut.mutate({ data: { patientId } }),
      saveProfile: (input) => profileMut.mutate({ data: input }),
      tickets,
      submitTicket: (input) => submitTicketMut.mutate({ data: input }),
      replyToTicket: (ticketId, body) => replyTicketMut.mutate({ data: { ticketId, body } }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetings, patients, diaryNotes, notifications, profile, isLoading, derived, tickets]);

  return (
    <PsychologistDataContext.Provider value={value}>{children}</PsychologistDataContext.Provider>
  );
}

export function usePsychologistData(): PsychologistDataValue {
  const ctx = useContext(PsychologistDataContext);
  if (!ctx) {
    throw new Error("usePsychologistData must be used within a PsychologistDataProvider");
  }
  return ctx;
}
