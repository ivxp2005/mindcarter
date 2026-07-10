// Mock API layer for the Patient Portal.
// Swap the internals of each function with Supabase queries later.
// TODO: Supabase — replace mock delays + arrays with real queries/inserts.

const delay = <T>(data: T, ms = 350) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(data), ms));

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  location: string;
  photo: string;
  bio: string;
  languages: string[];
  experience: number;
};

export type BookingStatus = "confirmed" | "pending" | "completed" | "cancelled";
export type Booking = {
  id: string;
  doctor: string;
  service: string;
  date: string;
  time: string;
  mode: string;
  status: BookingStatus;
  past: boolean;
};

export type AssessmentStatus = "not_started" | "in_progress" | "completed";
export type Assessment = {
  id: string;
  title: string;
  category: string;
  duration: string;
  status: AssessmentStatus;
  progress: number;
  score?: number;
  summary?: string;
};

export type Report = {
  id: string;
  title: string;
  date: string;
  type: string;
  size: string;
  score: number;
};

export type Conversation = {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
};

export type Message = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
};

export type Profile = {
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  dob: string;
  address: string;
  notifications: { email: boolean; sms: boolean; product: boolean };
};

const DOCTORS: Doctor[] = [
  { id: "d1", name: "Dr. Aditi Carter", specialty: "Clinical Psychology", rating: 4.9, reviews: 214, location: "Mumbai · Video", photo: "https://i.pravatar.cc/240?img=47", bio: "CBT, trauma-informed care and anxiety spectrum. 12+ years working with high-performing professionals.", languages: ["English", "Hindi"], experience: 12 },
  { id: "d2", name: "Dr. Marcus Vale", specialty: "Executive Coaching", rating: 4.8, reviews: 168, location: "Bengaluru · Studio", photo: "https://i.pravatar.cc/240?img=12", bio: "Leadership psychology for founders and C-suite. Prior work with F500 leadership pipelines.", languages: ["English"], experience: 15 },
  { id: "d3", name: "Dr. Sara Iqbal", specialty: "Cognitive Behavioural Therapy", rating: 4.7, reviews: 132, location: "Remote", photo: "https://i.pravatar.cc/240?img=32", bio: "Specialises in stress, burnout and workplace anxiety. Bilingual practice.", languages: ["English", "Urdu"], experience: 9 },
  { id: "d4", name: "Dr. Ethan Rowe", specialty: "Organizational Psychology", rating: 4.9, reviews: 96, location: "London · Video", photo: "https://i.pravatar.cc/240?img=15", bio: "Team dynamics, culture design and change psychology.", languages: ["English"], experience: 11 },
  { id: "d5", name: "Dr. Priya Nair", specialty: "Family & Couples Therapy", rating: 4.6, reviews: 74, location: "Delhi · Studio", photo: "https://i.pravatar.cc/240?img=45", bio: "Systemic and Gottman-method practitioner. Warm, structured sessions.", languages: ["English", "Malayalam"], experience: 8 },
  { id: "d6", name: "Dr. Leo Yamamoto", specialty: "Neuropsychology", rating: 4.8, reviews: 58, location: "Remote", photo: "https://i.pravatar.cc/240?img=20", bio: "Assessment-led care for attention, executive function and cognition.", languages: ["English", "Japanese"], experience: 14 },
];

const BOOKINGS: Booking[] = [
  { id: "b1", doctor: "Dr. Aditi Carter", service: "Individual therapy", date: "Tue, Mar 12", time: "10:00", mode: "Video", status: "confirmed", past: false },
  { id: "b2", doctor: "Dr. Marcus Vale", service: "Executive coaching", date: "Fri, Mar 15", time: "15:30", mode: "Studio", status: "pending", past: false },
  { id: "b3", doctor: "Dr. Sara Iqbal", service: "CBT session", date: "Mon, Feb 26", time: "09:00", mode: "Video", status: "completed", past: true },
  { id: "b4", doctor: "Dr. Priya Nair", service: "Couples therapy", date: "Wed, Feb 14", time: "18:00", mode: "Studio", status: "completed", past: true },
  { id: "b5", doctor: "Dr. Ethan Rowe", service: "Leadership review", date: "Fri, Feb 02", time: "11:30", mode: "Video", status: "cancelled", past: true },
];

const ASSESSMENTS: Assessment[] = [
  { id: "a1", title: "Emotional Intelligence (EQ-i 2.0)", category: "Emotional", duration: "25 min", status: "completed", progress: 100, score: 118, summary: "Above-average awareness; growth in interpersonal regulation." },
  { id: "a2", title: "Personality (Big Five)", category: "Personality", duration: "15 min", status: "completed", progress: 100, score: 82, summary: "High openness and conscientiousness; moderate neuroticism." },
  { id: "a3", title: "Workplace Behaviour", category: "Organizational", duration: "20 min", status: "in_progress", progress: 45 },
  { id: "a4", title: "Stress & Burnout", category: "Wellbeing", duration: "10 min", status: "not_started", progress: 0 },
  { id: "a5", title: "Leadership 360°", category: "Leadership", duration: "40 min", status: "not_started", progress: 0 },
];

const REPORTS: Report[] = [
  { id: "r1", title: "EQ-i 2.0 — Full Report", date: "Mar 04, 2026", type: "Emotional", size: "1.4 MB", score: 82 },
  { id: "r2", title: "Big Five Personality Snapshot", date: "Feb 22, 2026", type: "Personality", size: "820 KB", score: 74 },
  { id: "r3", title: "Session Progress — Q1", date: "Feb 12, 2026", type: "Therapy", size: "612 KB", score: 68 },
  { id: "r4", title: "Baseline Wellbeing Index", date: "Jan 30, 2026", type: "Wellbeing", size: "540 KB", score: 61 },
];

const CONVERSATIONS: Conversation[] = [
  { id: "c1", name: "Dr. Aditi Carter", role: "Clinical Psychology", lastMessage: "Great — see you Tuesday at 10.", time: "10:24", unread: 2, avatar: "https://i.pravatar.cc/80?img=47" },
  { id: "c2", name: "Dr. Marcus Vale", role: "Executive Coaching", lastMessage: "Sharing the reflection worksheet.", time: "Yesterday", unread: 0, avatar: "https://i.pravatar.cc/80?img=12" },
  { id: "c3", name: "Mindcarter Concierge", role: "Support", lastMessage: "Your invoice for Feb is ready.", time: "Mon", unread: 0, avatar: "https://i.pravatar.cc/80?img=5" },
  { id: "c4", name: "Dr. Sara Iqbal", role: "CBT", lastMessage: "Try the breathing prompt tonight.", time: "Feb 26", unread: 0, avatar: "https://i.pravatar.cc/80?img=32" },
];

const THREADS: Record<string, Message[]> = {
  c1: [
    { id: "m1", from: "them", text: "Hi Alex — how are you feeling this week?", time: "10:12" },
    { id: "m2", from: "me", text: "Steadier. The journalling helped.", time: "10:18" },
    { id: "m3", from: "them", text: "Great — see you Tuesday at 10.", time: "10:24" },
  ],
  c2: [
    { id: "m1", from: "them", text: "Sharing the reflection worksheet.", time: "Yesterday" },
  ],
  c3: [
    { id: "m1", from: "them", text: "Your invoice for Feb is ready.", time: "Mon" },
  ],
  c4: [
    { id: "m1", from: "them", text: "Try the breathing prompt tonight.", time: "Feb 26" },
  ],
};

const PROFILE: Profile = {
  fullName: "Alex Morgan",
  email: "alex.morgan@example.com",
  phone: "+91 98765 43210",
  avatar: "https://i.pravatar.cc/160?img=68",
  dob: "1992-08-14",
  address: "12 Sea View Road, Mumbai",
  notifications: { email: true, sms: false, product: true },
};

// TODO: Supabase — replace with `supabase.from('doctors').select(...)`
export const listDoctors = () => delay(DOCTORS);
// TODO: Supabase — `.eq('id', id).maybeSingle()`
export const getDoctor = (id: string) => delay(DOCTORS.find((d) => d.id === id) ?? null);
// TODO: Supabase — `.from('bookings').select().eq('user_id', uid)`
export const listBookings = () => delay(BOOKINGS);
// TODO: Supabase — `.from('assessments_progress')...`
export const listAssessments = () => delay(ASSESSMENTS);
// TODO: Supabase — `.from('reports')...`
export const listReports = () => delay(REPORTS);
// TODO: Supabase — realtime channel on `messages` table
export const listConversations = () => delay(CONVERSATIONS);
// TODO: Supabase — `.from('messages').eq('conversation_id', id)`
export const listMessages = (id: string) => delay(THREADS[id] ?? []);
// TODO: Supabase — insert into `messages`
export const sendMessage = (id: string, text: string) =>
  delay<Message>({ id: crypto.randomUUID(), from: "me", text, time: "now" });
// TODO: Supabase — `.from('profiles').select().single()`
export const getProfile = () => delay(PROFILE);
// TODO: Supabase — `.from('profiles').update(...)`
export const updateProfile = (patch: Partial<Profile>) => delay({ ...PROFILE, ...patch });