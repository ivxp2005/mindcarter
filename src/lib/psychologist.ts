// Shared types for the psychologist portal. The actual data now comes from
// the DB via `psychologist-data.server.ts` / `psychologist-store.tsx` — this
// file holds only the TS shapes those layers map DB rows into.

export type MeetingStatus = "upcoming" | "completed" | "canceled";
export type PatientStatus = "Active" | "New" | "Inactive";
export type NotificationKind = "meeting" | "diary" | "message" | "system";

export interface Meeting {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  kind: string;
  mode: "Video" | "In-person" | "Phone";
  durationMin: number;
  status: MeetingStatus;
  notes?: string;
  /** Google Meet join link. Undefined for confirmed sessions whose clinician
   *  hasn't connected a calendar — those need a link added manually. */
  meetLink?: string;
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
