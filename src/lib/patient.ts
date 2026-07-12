export const TODAY = new Date().toISOString().slice(0, 10);

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
  actionSearch?: Record<string, unknown>;
}

// ─── Care team ────────────────────────────────────────────────────────────────

export const CARE_TEAM = [
  {
    id: "ct-1",
    name: "Dr. Aditi Carter",
    title: "Clinical Psychologist",
    bio: "Specialising in CBT and trauma-informed care with over 12 years of experience working with individuals and organisations across Asia and the UK.",
    specialties: ["CBT", "Trauma", "Anxiety", "Depression"],
    totalSessions: 18,
    rating: 4.9,
    nextSession: TODAY,
    email: "aditi.carter@mindcarter.com",
    phone: "+91 98400 12345",
    primary: true,
    price: 1000,
  },
  {
    id: "ct-2",
    name: "Dr. Marcus Vale",
    title: "Organizational Psychologist",
    bio: "Executive coach and organisational psychologist focusing on leadership, team culture and workplace behaviour change.",
    specialties: ["Leadership", "Culture", "Conflict Resolution"],
    totalSessions: 6,
    rating: 4.8,
    nextSession: null,
    email: "marcus.vale@mindcarter.com",
    phone: "+91 98400 67890",
    primary: false,
    price: 1200,
  },
] as const;

// ─── Sessions ─────────────────────────────────────────────────────────────────

function daysFromToday(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export const SESSIONS: PatientSession[] = [
  {
    id: "s-1",
    psychologistId: "ct-1",
    psychologistName: "Dr. Aditi Carter",
    date: TODAY,
    time: "10:00 AM",
    kind: "Individual Therapy",
    mode: "Video",
    durationMin: 50,
    status: "upcoming",
    notes: "Continue working on cognitive restructuring exercises from last session.",
  },
  {
    id: "s-2",
    psychologistId: "ct-1",
    psychologistName: "Dr. Aditi Carter",
    date: daysFromToday(7),
    time: "10:00 AM",
    kind: "Individual Therapy",
    mode: "Video",
    durationMin: 50,
    status: "upcoming",
  },
  {
    id: "s-3",
    psychologistId: "ct-2",
    psychologistName: "Dr. Marcus Vale",
    date: daysFromToday(14),
    time: "2:00 PM",
    kind: "Executive Coaching",
    mode: "In-person",
    durationMin: 60,
    status: "upcoming",
  },
  {
    id: "s-4",
    psychologistId: "ct-1",
    psychologistName: "Dr. Aditi Carter",
    date: daysFromToday(-7),
    time: "10:00 AM",
    kind: "Individual Therapy",
    mode: "Video",
    durationMin: 50,
    status: "completed",
    notes: "Discussed sleep hygiene and introduced body-scan meditation.",
  },
  {
    id: "s-5",
    psychologistId: "ct-1",
    psychologistName: "Dr. Aditi Carter",
    date: daysFromToday(-14),
    time: "10:00 AM",
    kind: "Individual Therapy",
    mode: "Video",
    durationMin: 50,
    status: "completed",
  },
  {
    id: "s-6",
    psychologistId: "ct-2",
    psychologistName: "Dr. Marcus Vale",
    date: daysFromToday(-21),
    time: "3:00 PM",
    kind: "Executive Coaching",
    mode: "Phone",
    durationMin: 45,
    status: "canceled",
  },
];

// ─── Journal ──────────────────────────────────────────────────────────────────

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

export const MOOD_TREND: { week: string; mood: number }[] = [
  { week: "Wk 1", mood: 2.8 },
  { week: "Wk 2", mood: 3.1 },
  { week: "Wk 3", mood: 2.9 },
  { week: "Wk 4", mood: 3.4 },
  { week: "Wk 5", mood: 3.7 },
  { week: "Wk 6", mood: 3.5 },
  { week: "Wk 7", mood: 4.0 },
  { week: "Wk 8", mood: 4.2 },
];

export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "j-1",
    date: TODAY,
    mood: 4,
    title: "Better sleep after the breathing exercises",
    content:
      "Tried the 4-7-8 breathing technique Dr. Carter recommended before bed. Actually slept through the night for once. Woke up feeling rested — a rare win.\n\nThe anxiety around the project deadline is still there but feels more manageable today.",
    tags: ["sleep", "breathing", "anxiety"],
  },
  {
    id: "j-2",
    date: daysFromToday(-2),
    mood: 3,
    title: "Rough afternoon but recovered",
    content:
      "Had a difficult conversation with my manager. Noticed myself catastrophising — identified the thought pattern mid-spiral which feels like progress.\n\nUsed the reframing worksheet. Helped a little.",
    tags: ["work", "cbt", "thoughts"],
  },
  {
    id: "j-3",
    date: daysFromToday(-5),
    mood: 5,
    title: "Really good day",
    content:
      "No particular reason — just woke up energised. Went for a walk in the morning. Small things felt enjoyable again. Logging this so I can look back on it when things feel harder.",
    tags: ["energy", "positive"],
  },
  {
    id: "j-4",
    date: daysFromToday(-9),
    mood: 2,
    title: "Low energy, hard to focus",
    content:
      "Struggled to concentrate all day. Nothing catastrophic happened — just felt flat and detached. Will mention to Dr. Carter at next session.",
    tags: ["low mood", "focus"],
  },
  {
    id: "j-5",
    date: daysFromToday(-12),
    mood: 3,
    title: "Post-session reflection",
    content:
      "Session with Dr. Carter today focused on childhood patterns. A lot to process. Feeling a bit tender but also like something clicked.",
    tags: ["therapy", "reflection"],
  },
];

export const WELLNESS_STATS = {
  streakDays: 12,
  avgMood: 3.6,
  entriesThisMonth: JOURNAL_ENTRIES.length,
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const NOTIFICATIONS: PortalNotification[] = [
  {
    id: "n-1",
    kind: "session",
    title: "Session today at 10:00 AM",
    body: "Your session with Dr. Aditi Carter starts in 2 hours. Join via the Sessions page.",
    time: "8:00 AM",
    read: false,
    actionTo: "/patient/sessions",
  },
  {
    id: "n-2",
    kind: "journal",
    title: "Daily check-in reminder",
    body: "How are you feeling today? Log your mood to keep your streak going.",
    time: "Yesterday",
    read: false,
    actionTo: "/patient/journal",
  },
  {
    id: "n-3",
    kind: "message",
    title: "Message from Dr. Aditi Carter",
    body: "Hi! Just a reminder to complete the thought record sheet before our next session.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "n-4",
    kind: "session",
    title: "Upcoming session in 7 days",
    body: "You have a session booked with Dr. Aditi Carter next week.",
    time: "3 days ago",
    read: true,
    actionTo: "/patient/sessions",
  },
  {
    id: "n-5",
    kind: "system",
    title: "Welcome to Mindcarter",
    body: "Your account is active. Explore your dashboard, sessions and wellness journal.",
    time: "1 week ago",
    read: true,
  },
];

// ─── Profile extras ───────────────────────────────────────────────────────────

export const PROFILE_EXTRA = {
  address: "12 Wellness Lane, Kochi, Kerala 682001",
  dob: "1993-04-15",
  emergencyContactName: "Priya Nair",
  emergencyContactPhone: "+91 98400 99999",
  notificationPrefs: {
    sessionReminders: true,
    journalPrompts: true,
    careTeamMessages: true,
    marketing: false,
  },
};
