import type {
  CareTeamMember,
  JournalEntry,
  MoodPoint,
  PatientProfile,
  PatientSession,
  PortalNotification,
} from "./types";

// Fixed literal "today" so the portal's mock data stays deterministic instead
// of drifting relative to the real clock. Matches the psychologist portal's
// TODAY (src/lib/psychologist/data.ts) so cross-portal mock data lines up.
export const TODAY = "2024-07-10";

export const CARE_TEAM: CareTeamMember[] = [
  {
    id: "cw-1",
    name: "Dr. Aditi Carter",
    title: "Clinical Psychologist, PsyD",
    specialties: ["Cognitive Behavioral Therapy", "Anxiety", "Trauma-Informed Care"],
    bio: "Dr. Carter has spent over a decade helping individuals build resilience through evidence-based, research-backed therapy.",
    email: "aditi@psych.com",
    phone: "+1 555-0102",
    primary: true,
    nextSession: "2024-07-10",
    totalSessions: 12,
    price: 1000,
    rating: 4.9,
  },
  {
    id: "cw-2",
    name: "Dr. Marcus Vale",
    title: "Organizational Psychologist",
    specialties: ["Leadership", "Workplace Stress", "Culture"],
    bio: "Dr. Vale works with professionals navigating workplace stress, leadership transitions and burnout.",
    email: "marcus.vale@psych.com",
    phone: "+1 555-0131",
    primary: false,
    nextSession: null,
    totalSessions: 3,
    price: 1200,
    rating: 4.8,
  },
];

export const SESSIONS: PatientSession[] = [
  {
    id: "s-1",
    date: TODAY,
    time: "09:00",
    durationMin: 50,
    psychologistId: "cw-1",
    psychologistName: "Dr. Aditi Carter",
    psychologistTitle: "Clinical Psychologist",
    kind: "Individual therapy",
    mode: "Video",
    status: "upcoming",
    notes: "Follow-up on sleep hygiene homework from last session.",
    price: 1000,
  },
  {
    id: "s-2",
    date: "2024-07-03",
    time: "09:00",
    durationMin: 50,
    psychologistId: "cw-1",
    psychologistName: "Dr. Aditi Carter",
    psychologistTitle: "Clinical Psychologist",
    kind: "Individual therapy",
    mode: "Video",
    status: "completed",
    price: 1000,
  },
  {
    id: "s-3",
    date: "2024-06-26",
    time: "14:00",
    durationMin: 50,
    psychologistId: "cw-1",
    psychologistName: "Dr. Aditi Carter",
    psychologistTitle: "Clinical Psychologist",
    kind: "Individual therapy",
    mode: "Video",
    status: "completed",
    price: 1000,
  },
  {
    id: "s-4",
    date: "2024-06-14",
    time: "11:00",
    durationMin: 60,
    psychologistId: "cw-2",
    psychologistName: "Dr. Marcus Vale",
    psychologistTitle: "Organizational Psychologist",
    kind: "Assessment",
    mode: "In-person",
    status: "completed",
    price: 1200,
  },
  {
    id: "s-5",
    date: "2024-06-08",
    time: "16:00",
    durationMin: 45,
    psychologistId: "cw-2",
    psychologistName: "Dr. Marcus Vale",
    psychologistTitle: "Organizational Psychologist",
    kind: "Follow-up",
    mode: "Phone",
    status: "canceled",
    price: 1200,
  },
  {
    id: "s-6",
    date: "2024-07-17",
    time: "09:00",
    durationMin: 50,
    psychologistId: "cw-1",
    psychologistName: "Dr. Aditi Carter",
    psychologistTitle: "Clinical Psychologist",
    kind: "Individual therapy",
    mode: "Video",
    status: "upcoming",
    notes: "Discuss progress on grounding exercises.",
    price: 1000,
  },
  {
    id: "s-7",
    date: "2024-07-24",
    time: "09:00",
    durationMin: 50,
    psychologistId: "cw-1",
    psychologistName: "Dr. Aditi Carter",
    psychologistTitle: "Clinical Psychologist",
    kind: "Individual therapy",
    mode: "Video",
    status: "upcoming",
    price: 1000,
  },
];

export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "j-1",
    date: "2024-07-09",
    mood: 4,
    title: "Better sleep this week",
    content:
      "Stuck to the wind-down routine four nights running and noticed I fell asleep faster. Morning anxiety was still there but felt more manageable once I did the breathing exercise.",
    tags: ["Sleep", "Anxiety"],
  },
  {
    id: "j-2",
    date: "2024-07-07",
    mood: 3,
    title: "Tough day at work",
    content:
      "Presentation didn't go the way I wanted and I spiraled a bit afterward. Used the grounding technique from last session which helped bring my heart rate down.",
    tags: ["Work", "Stress"],
  },
  {
    id: "j-3",
    date: "2024-07-04",
    mood: 5,
    title: "Good weekend reset",
    content:
      "Spent time outdoors and away from screens. Felt the most present I have in weeks. Want to keep this up going into next week.",
    tags: ["Self-care"],
  },
  {
    id: "j-4",
    date: "2024-07-01",
    mood: 2,
    title: "Rough start to the month",
    content:
      "Anxiety was high most of the day, hard to concentrate. Noted it down instead of pushing through — will bring this up in the next session.",
    tags: ["Anxiety"],
  },
  {
    id: "j-5",
    date: "2024-06-27",
    mood: 4,
    title: "Session follow-through",
    content:
      "Practiced the delegation conversation we role-played. Went better than expected — team member was receptive.",
    tags: ["Work", "Progress"],
  },
  {
    id: "j-6",
    date: "2024-06-23",
    mood: 3,
    title: "Mixed feelings",
    content:
      "Some good moments, some low ones. Sleep was inconsistent. Trying not to judge the day just by the hard parts.",
    tags: ["Sleep"],
  },
];

export const NOTIFICATIONS: PortalNotification[] = [
  {
    id: "n-1",
    kind: "session",
    title: "Upcoming session reminder",
    body: "Your session with Dr. Aditi Carter is today at 09:00.",
    time: "1 hr ago",
    read: false,
    actionTo: "/patient/sessions",
    actionSearch: { open: "s-1" },
  },
  {
    id: "n-2",
    kind: "message",
    title: "New message from your care team",
    body: "Dr. Carter shared a grounding-exercise worksheet ahead of your next session.",
    time: "3 hr ago",
    read: false,
    actionTo: "/patient/care-team",
  },
  {
    id: "n-3",
    kind: "journal",
    title: "Journal streak",
    body: "You've logged your mood 5 days in a row — keep it going.",
    time: "Yesterday",
    read: false,
    actionTo: "/patient/journal",
  },
  {
    id: "n-4",
    kind: "system",
    title: "Profile updated",
    body: "Your notification preferences were saved successfully.",
    time: "2 days ago",
    read: true,
    actionTo: "/patient/profile",
  },
  {
    id: "n-5",
    kind: "session",
    title: "Session confirmed",
    body: "Your session with Dr. Aditi Carter on Jul 17, 09:00 is confirmed.",
    time: "3 days ago",
    read: true,
    actionTo: "/patient/sessions",
    actionSearch: { open: "s-6" },
  },
  {
    id: "n-6",
    kind: "system",
    title: "Welcome to Mindcarter",
    body: "Your patient portal is ready — book sessions, track your mood and message your care team.",
    time: "1 week ago",
    read: true,
  },
];

export const MOOD_TREND: MoodPoint[] = [
  { week: "May 20", mood: 3.1 },
  { week: "May 27", mood: 3.4 },
  { week: "Jun 3", mood: 3.0 },
  { week: "Jun 10", mood: 3.6 },
  { week: "Jun 17", mood: 3.8 },
  { week: "Jun 24", mood: 3.3 },
  { week: "Jul 1", mood: 3.9 },
  { week: "Jul 8", mood: 4.1 },
];

export const PROFILE_EXTRA: PatientProfile = {
  dob: "1994-03-18",
  emergencyContactName: "Jordan Blake",
  emergencyContactPhone: "+1 555-0199",
  preferredLanguage: "English",
  address: "221 Harbor View Rd, San Francisco, CA",
  notificationPrefs: {
    sessionReminders: true,
    journalPrompts: true,
    careTeamMessages: true,
    marketing: false,
  },
};

export const MOOD_EMOJI: Record<number, string> = {
  1: "😔",
  2: "🙁",
  3: "😐",
  4: "🙂",
  5: "😄",
};

export const MOOD_LABEL: Record<number, string> = {
  1: "Struggling",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
};

export const WELLNESS_STATS = {
  streakDays: 5,
  entriesThisMonth: JOURNAL_ENTRIES.filter((j) => j.date >= "2024-07-01").length,
  avgMood:
    Math.round(
      (JOURNAL_ENTRIES.reduce((sum, j) => sum + j.mood, 0) / JOURNAL_ENTRIES.length) * 10,
    ) / 10,
  upcomingSessions: SESSIONS.filter((s) => s.status === "upcoming").length,
};
