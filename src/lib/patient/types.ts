export type SessionKind =
  "Individual therapy" | "Follow-up" | "Assessment" | "Group session" | "Intake";
export type SessionMode = "Video" | "In-person" | "Phone";
export type SessionStatus = "upcoming" | "completed" | "canceled";

export interface PatientSession {
  id: string;
  date: string;
  time: string;
  durationMin: number;
  psychologistId: string;
  psychologistName: string;
  psychologistTitle: string;
  kind: SessionKind;
  mode: SessionMode;
  status: SessionStatus;
  notes?: string;
  price: number;
}

export interface CareTeamMember {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  bio: string;
  email: string;
  phone: string;
  primary: boolean;
  nextSession: string | null;
  totalSessions: number;
  price: number;
  rating: number;
}

export type Mood = 1 | 2 | 3 | 4 | 5;

export interface JournalEntry {
  id: string;
  date: string;
  mood: Mood;
  title: string;
  content: string;
  tags: string[];
}

export type NotificationKind = "session" | "journal" | "message" | "system";

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

export interface MoodPoint {
  week: string;
  mood: number;
}

export interface PatientProfile {
  dob: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  preferredLanguage: string;
  address: string;
  notificationPrefs: {
    sessionReminders: boolean;
    journalPrompts: boolean;
    careTeamMessages: boolean;
    marketing: boolean;
  };
}
