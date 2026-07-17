// Shared types and display maps for the employee (patient) portal. The actual
// data now comes from the DB via `patient-data.server.ts` / `patient-store.tsx`
// — this file holds only non-mock constants (today's date + mood emoji/labels)
// and the TS shapes those layers map DB rows into.

/** Always computed fresh — a module-level constant would freeze at whatever
 *  date the server process (or client bundle) first loaded, which drifts
 *  stale in a long-running dev/prod process. Call this at the point of use. */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** How long a mood check-in stays editable (from the first click) before it
 *  locks in permanently for the day. */
export const MOOD_LOCK_MS = 10_000;

export type Mood = 1 | 2 | 3 | 4 | 5;
export type SessionStatus = "upcoming" | "completed" | "canceled";
export type NotificationKind = "session" | "journal" | "message" | "system";

export interface PatientSession {
  id: string;
  psychologistId: string;
  psychologistName: string;
  date: string;
  time: string;
  kind: string;
  mode: "Video" | "In-person" | "Phone";
  durationMin: number;
  status: SessionStatus;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: Mood;
  title: string;
  content: string;
  tags: string[];
}

export interface PortalNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
  actionTo?: string;
  actionSearch?: Record<string, string | number | boolean>;
}

export const MOOD_EMOJI: Record<Mood, string> = {
  1: "😞",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "😊",
};

export const MOOD_LABEL: Record<Mood, string> = {
  1: "Very low",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
};
