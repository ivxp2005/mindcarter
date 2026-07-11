export type MeetingKind =
  "Individual therapy" | "Assessment review" | "Group coaching" | "Executive coaching" | "Intake";
export type MeetingMode = "Video" | "In-person" | "Phone";
export type MeetingStatus = "upcoming" | "completed" | "canceled";

export interface Meeting {
  id: string;
  date: string;
  time: string;
  durationMin: number;
  patientId: string | null;
  patientName: string;
  kind: MeetingKind;
  mode: MeetingMode;
  status: MeetingStatus;
  notes?: string;
}

export type PatientStatus = "Active" | "New" | "Inactive";

export interface Patient {
  id: string;
  name: string;
  initials: string;
  status: PatientStatus;
  primaryConcern: string;
  lastSession: string | null;
  nextSession: string | null;
  totalSessions: number;
  email: string;
  phone: string;
  tags: string[];
}

export type DiaryStatus = "pending_review" | "reviewed";

export interface DiaryEntry {
  id: string;
  patientId: string | null;
  patientName: string;
  title: string;
  status: DiaryStatus;
  submitted: string;
  excerpt: string;
  content: string;
  clinicianNote?: string;
}

export type NotificationKind = "meeting" | "diary" | "message" | "system";

export interface PortalNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
  actionTo?: string;
  actionSearch?: Record<string, string>;
}

export interface WeeklySessions {
  week: string;
  sessions: number;
}

export interface SessionTypeSlice {
  type: MeetingKind;
  value: number;
}

export interface PatientGrowthPoint {
  month: string;
  patients: number;
}

export interface PsychologistProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  license: string;
  specialties: string[];
  bio: string;
  hours: { day: string; range: string }[];
  notificationPrefs: {
    emailDigests: boolean;
    sessionReminders: boolean;
    diaryAlerts: boolean;
    marketing: boolean;
  };
}
