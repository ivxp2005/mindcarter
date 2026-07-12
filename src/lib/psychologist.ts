export const TODAY = new Date().toISOString().slice(0, 10);

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
}

export interface DiaryEntry {
  id: string;
  patientName: string;
  patientId: string;
  title: string;
  excerpt: string;
  content: string;
  submitted: string;
  status: "pending_review" | "reviewed";
  clinicianNote?: string;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysFromToday(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

// ─── Meetings ─────────────────────────────────────────────────────────────────

export const MEETINGS: Meeting[] = [
  {
    id: "m-1",
    patientId: "p-1",
    patientName: "Riya Menon",
    date: TODAY,
    time: "09:00 AM",
    kind: "Individual Therapy",
    mode: "Video",
    durationMin: 50,
    status: "upcoming",
    notes: "Session 6 — continue CBT thought records.",
  },
  {
    id: "m-2",
    patientId: "p-2",
    patientName: "Arjun Pillai",
    date: TODAY,
    time: "11:00 AM",
    kind: "Follow-up",
    mode: "Video",
    durationMin: 30,
    status: "upcoming",
  },
  {
    id: "m-3",
    patientId: "p-3",
    patientName: "Sneha Iyer",
    date: TODAY,
    time: "02:00 PM",
    kind: "Initial Assessment",
    mode: "In-person",
    durationMin: 60,
    status: "upcoming",
  },
  {
    id: "m-4",
    patientId: "p-4",
    patientName: "Kiran Thomas",
    date: TODAY,
    time: "04:00 PM",
    kind: "Individual Therapy",
    mode: "Video",
    durationMin: 50,
    status: "completed",
  },
  {
    id: "m-5",
    patientId: "p-1",
    patientName: "Riya Menon",
    date: daysFromToday(7),
    time: "09:00 AM",
    kind: "Individual Therapy",
    mode: "Video",
    durationMin: 50,
    status: "upcoming",
  },
  {
    id: "m-6",
    patientId: "p-5",
    patientName: "Aditya Nair",
    date: daysFromToday(3),
    time: "10:00 AM",
    kind: "Executive Coaching",
    mode: "In-person",
    durationMin: 60,
    status: "upcoming",
  },
  {
    id: "m-7",
    patientId: "p-2",
    patientName: "Arjun Pillai",
    date: daysFromToday(-7),
    time: "11:00 AM",
    kind: "Individual Therapy",
    mode: "Video",
    durationMin: 50,
    status: "completed",
    notes: "Patient showed significant improvement in mood regulation.",
  },
  {
    id: "m-8",
    patientId: "p-3",
    patientName: "Sneha Iyer",
    date: daysFromToday(-14),
    time: "03:00 PM",
    kind: "Initial Assessment",
    mode: "In-person",
    durationMin: 60,
    status: "completed",
  },
  {
    id: "m-9",
    patientId: "p-6",
    patientName: "Divya Krishnan",
    date: daysFromToday(-3),
    time: "01:00 PM",
    kind: "Individual Therapy",
    mode: "Phone",
    durationMin: 45,
    status: "canceled",
  },
];

// ─── Patients ─────────────────────────────────────────────────────────────────

export const PATIENTS: {
  id: string;
  name: string;
  email: string;
  phone: string;
  primaryConcern: string;
  status: PatientStatus;
  totalSessions: number;
  nextSession: string | null;
  tags: string[];
}[] = [
  {
    id: "p-1",
    name: "Riya Menon",
    email: "riya.menon@email.com",
    phone: "+91 98400 11111",
    primaryConcern: "Anxiety & panic attacks",
    status: "Active",
    totalSessions: 12,
    nextSession: TODAY,
    tags: ["CBT", "Anxiety", "Panic"],
  },
  {
    id: "p-2",
    name: "Arjun Pillai",
    email: "arjun.pillai@email.com",
    phone: "+91 98400 22222",
    primaryConcern: "Depression & low motivation",
    status: "Active",
    totalSessions: 8,
    nextSession: TODAY,
    tags: ["Depression", "Behavioural Activation"],
  },
  {
    id: "p-3",
    name: "Sneha Iyer",
    email: "sneha.iyer@email.com",
    phone: "+91 98400 33333",
    primaryConcern: "Work stress & burnout",
    status: "New",
    totalSessions: 1,
    nextSession: TODAY,
    tags: ["Burnout", "Stress"],
  },
  {
    id: "p-4",
    name: "Kiran Thomas",
    email: "kiran.thomas@email.com",
    phone: "+91 98400 44444",
    primaryConcern: "Relationship difficulties",
    status: "Active",
    totalSessions: 15,
    nextSession: TODAY,
    tags: ["Relationships", "Communication"],
  },
  {
    id: "p-5",
    name: "Aditya Nair",
    email: "aditya.nair@email.com",
    phone: "+91 98400 55555",
    primaryConcern: "Leadership & executive performance",
    status: "Active",
    totalSessions: 9,
    nextSession: daysFromToday(3),
    tags: ["Coaching", "Leadership"],
  },
  {
    id: "p-6",
    name: "Divya Krishnan",
    email: "divya.krishnan@email.com",
    phone: "+91 98400 66666",
    primaryConcern: "Grief & loss",
    status: "Inactive",
    totalSessions: 4,
    nextSession: null,
    tags: ["Grief", "Trauma"],
  },
];

// ─── Practice stats ───────────────────────────────────────────────────────────

export const PRACTICE_STATS = {
  todaysMeetings: MEETINGS.filter((m) => m.date === TODAY).length,
  activePatients: PATIENTS.filter((p) => p.status === "Active").length,
  diariesPending: 3,
  notificationsTotal: 5,
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const WEEKLY_SESSIONS: { week: string; sessions: number }[] = [
  { week: "Wk 1", sessions: 18 },
  { week: "Wk 2", sessions: 22 },
  { week: "Wk 3", sessions: 19 },
  { week: "Wk 4", sessions: 25 },
  { week: "Wk 5", sessions: 21 },
  { week: "Wk 6", sessions: 28 },
  { week: "Wk 7", sessions: 24 },
  { week: "Wk 8", sessions: 27 },
];

export const SESSION_TYPE_BREAKDOWN: { type: string; value: number }[] = [
  { type: "Individual Therapy", value: 48 },
  { type: "Follow-up", value: 22 },
  { type: "Initial Assessment", value: 14 },
  { type: "Executive Coaching", value: 10 },
  { type: "Group Session", value: 6 },
];

export const PATIENT_GROWTH: { month: string; patients: number }[] = [
  { month: "Nov", patients: 28 },
  { month: "Dec", patients: 31 },
  { month: "Jan", patients: 34 },
  { month: "Feb", patients: 37 },
  { month: "Mar", patients: 40 },
  { month: "Apr", patients: 43 },
  { month: "May", patients: 47 },
  { month: "Jun", patients: 50 },
  { month: "Jul", patients: 54 },
];

// ─── Diaries ──────────────────────────────────────────────────────────────────

export const DIARIES: DiaryEntry[] = [
  {
    id: "d-1",
    patientName: "Riya Menon",
    patientId: "p-1",
    title: "Breathing exercises helped today",
    excerpt: "Used the box-breathing technique before the presentation. It worked.",
    content:
      "I was terrified about presenting to the senior team but remembered the box-breathing technique we practiced. Did it in the bathroom beforehand. Actually went okay — no panic attack. Feeling cautiously proud.",
    submitted: "Today",
    status: "pending_review",
  },
  {
    id: "d-2",
    patientName: "Arjun Pillai",
    patientId: "p-2",
    title: "Difficult week with family",
    excerpt: "Arguments at home made it hard to focus on my goals.",
    content:
      "Had a big argument with my father about my career choices. Felt the old hopelessness returning. Tried to use the thought record — managed to catch myself catastrophising but still felt very low by evening.\n\nWonder if this is something we should talk about in our next session.",
    submitted: "Yesterday",
    status: "pending_review",
  },
  {
    id: "d-3",
    patientName: "Kiran Thomas",
    patientId: "p-4",
    title: "Better communication this week",
    excerpt: "Tried the 'I' statement technique in a difficult conversation.",
    content:
      "My partner and I had a disagreement about finances. Instead of shutting down, I tried the 'I feel...' framing we discussed. It didn't resolve everything but the conversation stayed calm. That's new for us.",
    submitted: "2 days ago",
    status: "reviewed",
    clinicianNote: "Good progress on assertive communication. Reinforce this in next session.",
  },
  {
    id: "d-4",
    patientName: "Riya Menon",
    patientId: "p-1",
    title: "Sleep getting better",
    excerpt: "Following the sleep hygiene checklist — third night in a row of decent sleep.",
    content:
      "Third night in a row where I slept more than 6 hours. Following the checklist — phone off at 10pm, no caffeine after 2pm, same wake-up time every day. Body feels less on edge in the mornings.",
    submitted: "4 days ago",
    status: "reviewed",
    clinicianNote: "Excellent adherence to sleep hygiene protocol. Continue monitoring.",
  },
];

// ─── Notifications ────────────────────────────────────────────────────────────

export const NOTIFICATIONS: PortalNotification[] = [
  {
    id: "pn-1",
    kind: "meeting",
    title: "Session starting in 30 minutes",
    body: "Your 09:00 AM session with Riya Menon is coming up.",
    time: "8:30 AM",
    read: false,
    actionTo: "/psychologist/meetings",
  },
  {
    id: "pn-2",
    kind: "diary",
    title: "New diary submission from Riya Menon",
    body: '"Breathing exercises helped today" — submitted 20 minutes ago.',
    time: "9:40 AM",
    read: false,
    actionTo: "/psychologist/diaries",
  },
  {
    id: "pn-3",
    kind: "diary",
    title: "New diary submission from Arjun Pillai",
    body: '"Difficult week with family" — submitted yesterday.',
    time: "Yesterday",
    read: false,
    actionTo: "/psychologist/diaries",
  },
  {
    id: "pn-4",
    kind: "message",
    title: "Message from practice admin",
    body: "CPD training session scheduled for next Friday at 3 PM.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "pn-5",
    kind: "system",
    title: "Monthly summary ready",
    body: "Your July practice report is available in Analytics.",
    time: "1 week ago",
    read: true,
    actionTo: "/psychologist/analytics",
  },
];

// ─── Profile ──────────────────────────────────────────────────────────────────

export const PROFILE = {
  name: "Dr. Aditi Carter",
  title: "Clinical Psychologist",
  email: "aditi.carter@mindcarter.com",
  phone: "+91 98400 12345",
  license: "RCI/2012/04821",
  specialties: ["CBT", "Trauma-informed care", "Anxiety", "Depression", "Executive coaching"],
  hours: [
    { day: "Monday", range: "9:00 AM – 6:00 PM" },
    { day: "Tuesday", range: "9:00 AM – 6:00 PM" },
    { day: "Wednesday", range: "9:00 AM – 4:00 PM" },
    { day: "Thursday", range: "9:00 AM – 6:00 PM" },
    { day: "Friday", range: "9:00 AM – 3:00 PM" },
  ],
  notificationPrefs: {
    emailDigests: true,
    sessionReminders: true,
    diaryAlerts: true,
    marketing: false,
  },
};
