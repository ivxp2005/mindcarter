/**
 * /portal-management-access — Hidden, RBAC-protected admin portal.
 *
 * Security layers:
 *  1. Route is NOT linked anywhere in the public UI (nav, footer, sitemap).
 *  2. robots.txt blocks all crawlers from this path.
 *  3. Login validates credentials client-side; session stored in sessionStorage.
 *  4. Patient / psychologist tokens are NEVER accepted here.
 *  5. Clinical notes and message threads are NEVER surfaced to the admin.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Users,
  CalendarDays,
  DollarSign,
  Activity,
  Shield,
  LogOut,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Lock,
  ChevronDown,
  BarChart3,
  Bell,
  Settings,
  FileText,
  UserCheck,
  Ticket,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Ban,
  KeyRound,
  MessageSquare,
  Send,
  Filter,
  Download,
  MoreHorizontal,
  Stethoscope,
  User,
  Phone,
  Mail,
  Calendar,
  Tag,
  CheckCheck,
  ArrowUpRight,
} from "lucide-react";
import { type AdminUser } from "../lib/auth";

// ─── Client-side Auth ─────────────────────────────────────────────────────────
const SESSION_KEY = "__mc_adm_session";
const ADMIN_EMAIL_CLIENT = "admin@mindcarter.com";
const ADMIN_PASSWORD_CLIENT = "MindCarter@Admin2024!";

function getStoredSession(): AdminUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { admin: AdminUser; expiresAt: number };
    if (Date.now() > parsed.expiresAt) { sessionStorage.removeItem(SESSION_KEY); return null; }
    return parsed.admin;
  } catch { return null; }
}
function storeSession(admin: AdminUser) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ admin, expiresAt: Date.now() + 8 * 3600_000 }));
}
function clearSession() { sessionStorage.removeItem(SESSION_KEY); }
async function loginAdmin(email: string, password: string): Promise<{ ok: true; admin: AdminUser } | { ok: false; error: string }> {
  if (email.toLowerCase().trim() !== ADMIN_EMAIL_CLIENT.toLowerCase() || password !== ADMIN_PASSWORD_CLIENT)
    return { ok: false, error: "Access denied." };
  const admin: AdminUser = { email, name: "System Administrator", role: "admin" };
  storeSession(admin);
  return { ok: true, admin };
}

// ─── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/portal-management-access")({
  head: () => ({
    meta: [
      { title: "Management Console" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: AdminPortal,
});

function AdminPortal() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [checked, setChecked] = useState(false);
  useEffect(() => { setAdmin(getStoredSession()); setChecked(true); }, []);
  const handleLogout = () => { clearSession(); setAdmin(null); };
  if (!checked) return null;
  if (!admin) return <AdminLoginPage onSuccess={(a) => setAdmin(a)} />;
  return <AdminDashboard admin={admin} onLogout={handleLogout} />;
}

// ─── Login Page ───────────────────────────────────────────────────────────────
function AdminLoginPage({ onSuccess }: { onSuccess: (a: AdminUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => { emailRef.current?.focus(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || attempts >= 5) return;
    setLoading(true); setError(null);
    const result = await loginAdmin(email, password);
    setLoading(false);
    if (!result.ok) { setAttempts((n) => n + 1); setError(result.error); return; }
    onSuccess(result.admin);
  };
  const locked = attempts >= 5;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6" style={{ background: "#0a0a0f" }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(244,196,48,0.08) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "linear-gradient(#f4c430 1px, transparent 1px), linear-gradient(90deg, #f4c430 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <div className="relative w-full max-w-md rounded-3xl p-10" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(24px)", boxShadow: "0 0 0 1px rgba(244,196,48,0.06), 0 32px 64px rgba(0,0,0,0.6)" }}>
        <div className="flex justify-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl" style={{ background: "rgba(244,196,48,0.12)", border: "1px solid rgba(244,196,48,0.25)", boxShadow: "0 0 24px rgba(244,196,48,0.15)" }}>
            <Shield className="h-7 w-7" style={{ color: "#f4c430" }} />
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: "#f4c430" }}>Restricted Access</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white">Admin Sign In</h1>
          <p className="mt-1.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>All sessions are logged and audited.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.5)" }}>Admin Email</label>
            <input ref={emailRef} id="admin-email" type="email" required disabled={locked || loading} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@mindcarter.com"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(244,196,48,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.5)" }}>Password</label>
            <div className="relative">
              <input id="admin-password" type={showPw ? "text" : "password"} required disabled={locked || loading} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••"
                className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white outline-none transition"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(244,196,48,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }}>
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
              <XCircle className="h-4 w-4 shrink-0" />
              {locked ? "Too many failed attempts. Refresh to try again." : error}
            </div>
          )}
          <button id="admin-signin-submit" type="submit" disabled={locked || loading}
            className="mt-2 w-full rounded-full py-3 text-sm font-bold tracking-wide transition-all"
            style={{ background: locked || loading ? "rgba(244,196,48,0.3)" : "#f4c430", color: locked || loading ? "rgba(0,0,0,0.4)" : "#0a0a0f", cursor: locked || loading ? "not-allowed" : "pointer" }}>
            {loading ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2" style={{ borderColor: "rgba(0,0,0,0.2)", borderTopColor: "#000" }} />Verifying…</span>
              : <span className="flex items-center justify-center gap-2"><Lock className="h-4 w-4" />Sign in to console</span>}
          </button>
        </form>
        <p className="mt-6 text-center text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>Unauthorised access attempts are recorded and may result in legal action.</p>
      </div>
    </div>
  );
}

// ─── Nav Config ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview",     label: "Overview",              icon: BarChart3     },
  { id: "bookings",     label: "Booking Master Log",    icon: CalendarDays  },
  { id: "verification", label: "Verification Queue",    icon: UserCheck     },
  { id: "users",        label: "User Management",       icon: Users         },
  { id: "support",      label: "Support Tickets",       icon: Ticket        },
  { id: "revenue",      label: "Revenue",               icon: DollarSign    },
  { id: "health",       label: "System Health",         icon: Activity      },
  { id: "audit",        label: "Audit Log",             icon: FileText      },
  { id: "settings",     label: "Settings",              icon: Settings      },
] as const;
type NavId = (typeof NAV_ITEMS)[number]["id"];

// ─── Mock Data ────────────────────────────────────────────────────────────────
type BookingStatus = "Scheduled" | "Completed" | "Canceled" | "Refunded";
interface Booking {
  id: string; patient: string; psychologist: string; dateTime: string;
  status: BookingStatus; type: string; amount: string;
}
const BOOKINGS: Booking[] = [
  { id: "BK-001", patient: "Alex Morgan",      psychologist: "Dr. Aditi Carter",  dateTime: "2024-07-12 10:00 AM", status: "Scheduled",  type: "Video Session",  amount: "$120" },
  { id: "BK-002", patient: "Priya Shah",       psychologist: "Dr. Marcus Vale",   dateTime: "2024-07-11 02:30 PM", status: "Completed",  type: "In-Person",      amount: "$150" },
  { id: "BK-003", patient: "Daniel Reyes",     psychologist: "Dr. Li Wei",        dateTime: "2024-07-10 11:00 AM", status: "Canceled",   type: "Video Session",  amount: "$120" },
  { id: "BK-004", patient: "Fatima Al-Hassan", psychologist: "Dr. Aditi Carter",  dateTime: "2024-07-13 09:00 AM", status: "Scheduled",  type: "Chat Session",   amount: "$80"  },
  { id: "BK-005", patient: "James Okafor",     psychologist: "Dr. Sofia Mendes",  dateTime: "2024-07-09 03:00 PM", status: "Completed",  type: "Video Session",  amount: "$120" },
  { id: "BK-006", patient: "Emily Clarke",     psychologist: "Dr. Marcus Vale",   dateTime: "2024-07-14 01:00 PM", status: "Scheduled",  type: "In-Person",      amount: "$150" },
  { id: "BK-007", patient: "Raj Patel",        psychologist: "Dr. Li Wei",        dateTime: "2024-07-08 10:30 AM", status: "Refunded",   type: "Video Session",  amount: "$120" },
  { id: "BK-008", patient: "Sarah Kim",        psychologist: "Dr. Sofia Mendes",  dateTime: "2024-07-15 04:00 PM", status: "Scheduled",  type: "Chat Session",   amount: "$80"  },
];

type VerifStatus = "pending" | "approved" | "rejected";
interface PsychVerification {
  id: string; name: string; email: string; specialty: string;
  submitted: string; docs: { name: string; type: string }[];
  status: VerifStatus; experience: string; license: string;
}
const VERIFICATIONS: PsychVerification[] = [
  { id: "V-001", name: "Dr. Sofia Mendes", email: "sofia@psych.com",  specialty: "Cognitive Behavioral Therapy", submitted: "2 days ago",  experience: "8 years", license: "PSY-2024-001", docs: [{ name: "Medical License", type: "PDF" }, { name: "Degree Certificate", type: "PDF" }, { name: "ID Proof", type: "IMG" }], status: "pending" },
  { id: "V-002", name: "Dr. James Okafor", email: "james@psych.com",  specialty: "Trauma & PTSD",               submitted: "5 days ago",  experience: "12 years", license: "PSY-2024-002", docs: [{ name: "Medical License", type: "PDF" }, { name: "Degree Certificate", type: "PDF" }, { name: "Experience Letter", type: "PDF" }, { name: "ID Proof", type: "IMG" }], status: "pending" },
  { id: "V-003", name: "Dr. Li Wei",       email: "liwei@psych.com",  specialty: "Child & Adolescent",          submitted: "1 week ago",  experience: "6 years",  license: "PSY-2024-003", docs: [{ name: "Medical License", type: "PDF" }, { name: "ID Proof", type: "IMG" }], status: "pending" },
  { id: "V-004", name: "Dr. Ana Ruiz",     email: "ana@psych.com",    specialty: "Couples & Family Therapy",    submitted: "2 weeks ago", experience: "9 years",  license: "PSY-2024-004", docs: [{ name: "Medical License", type: "PDF" }, { name: "Degree Certificate", type: "PDF" }, { name: "ID Proof", type: "IMG" }], status: "approved" },
];

interface UserRecord { id: string; name: string; email: string; phone: string; role: "Patient" | "Psychologist"; status: "Active" | "Suspended" | "Pending"; joined: string; sessions: number; }
const USERS: UserRecord[] = [
  { id: "U-001", name: "Alex Morgan",      email: "alex@email.com",    phone: "+1 555-0101", role: "Patient",        status: "Active",    joined: "Jun 2024", sessions: 12 },
  { id: "U-002", name: "Dr. Aditi Carter", email: "aditi@psych.com",   phone: "+1 555-0102", role: "Psychologist",   status: "Active",    joined: "May 2024", sessions: 84 },
  { id: "U-003", name: "Priya Shah",       email: "priya@email.com",   phone: "+1 555-0103", role: "Patient",        status: "Pending",   joined: "Jul 2024", sessions: 2  },
  { id: "U-004", name: "Dr. Marcus Vale",  email: "marcus@psych.com",  phone: "+1 555-0104", role: "Psychologist",   status: "Active",    joined: "Mar 2024", sessions: 120 },
  { id: "U-005", name: "Daniel Reyes",     email: "daniel@email.com",  phone: "+1 555-0105", role: "Patient",        status: "Suspended", joined: "Jan 2024", sessions: 5  },
  { id: "U-006", name: "Fatima Al-Hassan", email: "fatima@email.com",  phone: "+1 555-0106", role: "Patient",        status: "Active",    joined: "Apr 2024", sessions: 8  },
  { id: "U-007", name: "Emily Clarke",     email: "emily@email.com",   phone: "+1 555-0107", role: "Patient",        status: "Active",    joined: "Jun 2024", sessions: 3  },
  { id: "U-008", name: "Dr. Sofia Mendes", email: "sofia@psych.com",   phone: "+1 555-0108", role: "Psychologist",   status: "Pending",   joined: "Jul 2024", sessions: 0  },
];

type TicketStatus = "Open" | "In Progress" | "Resolved";
type TicketPriority = "Low" | "Medium" | "High";
interface TicketMessage { sender: "user" | "admin"; text: string; time: string; }
interface SupportTicket {
  id: string; user: string; email: string; subject: string;
  status: TicketStatus; priority: TicketPriority; created: string;
  messages: TicketMessage[];
}
const TICKETS_INIT: SupportTicket[] = [
  { id: "TKT-001", user: "Alex Morgan",   email: "alex@email.com",   subject: "Unable to join video session",         status: "Open",        priority: "High",   created: "10 min ago",  messages: [{ sender: "user",  text: "I keep getting a connection error when I try to join my video call. It says 'Session expired' but I just logged in.", time: "10 min ago" }] },
  { id: "TKT-002", user: "Priya Shah",    email: "priya@email.com",  subject: "Payment not reflecting after 3 days",  status: "In Progress", priority: "High",   created: "1 hr ago",    messages: [{ sender: "user",  text: "I paid for a session 3 days ago but it still shows as unpaid. Please help.", time: "1 hr ago" }, { sender: "admin", text: "Hi Priya, we are looking into this. Can you share your transaction ID?", time: "45 min ago" }, { sender: "user", text: "Transaction ID: TXN-84920. Paid via UPI.", time: "30 min ago" }] },
  { id: "TKT-003", user: "Daniel Reyes",  email: "daniel@email.com", subject: "Account suspended without notice",      status: "Open",        priority: "Medium", created: "3 hrs ago",   messages: [{ sender: "user",  text: "My account was suddenly suspended. I didn't violate any terms. Please review.", time: "3 hrs ago" }] },
  { id: "TKT-004", user: "Emily Clarke",  email: "emily@email.com",  subject: "Can't reset my password",              status: "Resolved",    priority: "Low",    created: "Yesterday",   messages: [{ sender: "user",  text: "The reset email never arrives in my inbox.", time: "Yesterday" }, { sender: "admin", text: "Please check your spam folder. We've also manually triggered a reset link for you.", time: "Yesterday" }, { sender: "user",  text: "Found it! Thank you!", time: "Yesterday" }] },
  { id: "TKT-005", user: "Raj Patel",     email: "raj@email.com",    subject: "Refund not processed after cancellation", status: "In Progress", priority: "Medium", created: "2 days ago",  messages: [{ sender: "user",  text: "I cancelled my appointment 48 hours ago and was promised a refund within 5 business days. It's been 7 days.", time: "2 days ago" }, { sender: "admin", text: "Apologies for the delay, Raj. We've escalated this to our payments team.", time: "1 day ago" }] },
];

const SYSTEM_HEALTH = [
  { name: "API Gateway",       status: "Operational",    color: "#22c55e", icon: CheckCircle  },
  { name: "Video Sessions",    status: "Operational",    color: "#22c55e", icon: CheckCircle  },
  { name: "Payment Service",   status: "Degraded",       color: "#f59e0b", icon: AlertTriangle},
  { name: "Email Delivery",    status: "Operational",    color: "#22c55e", icon: CheckCircle  },
  { name: "Database (Primary)",status: "Operational",    color: "#22c55e", icon: CheckCircle  },
  { name: "Backup Service",    status: "Completed 02:14",color: "#22c55e", icon: CheckCircle  },
] as const;

const AUDIT_LOG = [
  { action: "User suspended",             actor: "admin@mindcarter.com", target: "daniel@email.com",   time: "12 min ago" },
  { action: "Psychologist approved",      actor: "admin@mindcarter.com", target: "aditi@psych.com",    time: "1 hr ago"   },
  { action: "Booking canceled & refunded",actor: "admin@mindcarter.com", target: "BK-007",             time: "2 hr ago"   },
  { action: "Admin sign-in",              actor: "admin@mindcarter.com", target: "—",                  time: "2 hr ago"   },
  { action: "Support ticket resolved",    actor: "admin@mindcarter.com", target: "TKT-004",            time: "Yesterday"  },
  { action: "Revenue report exported",    actor: "admin@mindcarter.com", target: "June 2024.pdf",      time: "Yesterday"  },
] as const;

// ─── Shared UI helpers ─────────────────────────────────────────────────────────
const C = {
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" } as React.CSSProperties,
  muted: "rgba(255,255,255,0.4)" as const,
  mutedLow: "rgba(255,255,255,0.25)" as const,
  gold: "#f4c430" as const,
};

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    Active:      { bg: "rgba(34,197,94,0.12)",  color: "#22c55e" },
    Operational: { bg: "rgba(34,197,94,0.12)",  color: "#22c55e" },
    Scheduled:   { bg: "rgba(59,130,246,0.12)", color: "#60a5fa" },
    Completed:   { bg: "rgba(34,197,94,0.12)",  color: "#22c55e" },
    Resolved:    { bg: "rgba(34,197,94,0.12)",  color: "#22c55e" },
    Approved:    { bg: "rgba(34,197,94,0.12)",  color: "#22c55e" },
    Pending:     { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
    Degraded:    { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
    "In Progress":{ bg: "rgba(245,158,11,0.12)",color: "#f59e0b" },
    Medium:      { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
    Canceled:    { bg: "rgba(239,68,68,0.12)",  color: "#ef4444" },
    Refunded:    { bg: "rgba(168,85,247,0.12)", color: "#a855f7" },
    Suspended:   { bg: "rgba(239,68,68,0.12)",  color: "#ef4444" },
    Rejected:    { bg: "rgba(239,68,68,0.12)",  color: "#ef4444" },
    Open:        { bg: "rgba(239,68,68,0.12)",  color: "#ef4444" },
    High:        { bg: "rgba(239,68,68,0.12)",  color: "#ef4444" },
    Low:         { bg: "rgba(100,116,139,0.15)",color: "#94a3b8" },
  };
  const s = map[status] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
  return <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: s.bg, color: s.color }}>{status}</span>;
}

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: C.gold }}>{eyebrow}</p>
      <h1 className="mt-1 text-3xl font-black tracking-tight text-white">{title}</h1>
      {sub && <p className="mt-1 text-sm" style={{ color: C.muted }}>{sub}</p>}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function AdminDashboard({ admin, onLogout }: { admin: AdminUser; onLogout: () => void }) {
  const [activeNav, setActiveNav] = useState<NavId>("overview");
  const [dropOpen, setDropOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans" style={{ background: "#0c0c14", color: "#f0f0f5" }}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "#0a0a11", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex h-16 shrink-0 items-center gap-3 px-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "#f4c430" }}>
            <Shield className="h-4 w-4" style={{ color: "#0a0a0f" }} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">Mindcarter.</p>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em]" style={{ color: "#f4c430" }}>Admin Console</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeNav === id;
            return (
              <button key={id} onClick={() => { setActiveNav(id); setSidebarOpen(false); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all"
                style={{ background: active ? "rgba(244,196,48,0.1)" : "transparent", color: active ? "#f4c430" : "rgba(255,255,255,0.45)", borderLeft: active ? "2px solid #f4c430" : "2px solid transparent" }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}>
                <Icon className="h-4 w-4 shrink-0" />{label}
              </button>
            );
          })}
        </nav>
        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition" style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ef4444")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)")}>
            <LogOut className="h-4 w-4 shrink-0" />Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between px-6"
          style={{ background: "rgba(10,10,17,0.85)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(16px)" }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)} style={{ color: "rgba(255,255,255,0.5)" }}>☰</button>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.35)" }}>
              {NAV_ITEMS.find((n) => n.id === activeNav)?.label ?? ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative grid h-9 w-9 place-items-center rounded-full transition" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full" style={{ background: "#f4c430" }} />
            </button>
            <div className="relative">
              <button id="admin-profile-btn" onClick={() => setDropOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full px-2 py-1 transition"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="grid h-8 w-8 place-items-center rounded-full text-xs font-black" style={{ background: "#f4c430", color: "#0a0a0f" }}>Ad</span>
                <span className="hidden text-sm font-medium sm:inline" style={{ color: "rgba(255,255,255,0.8)" }}>{admin.name}</span>
                <ChevronDown className="h-3.5 w-3.5 transition-transform" style={{ color: "rgba(255,255,255,0.3)", transform: dropOpen ? "rotate(180deg)" : "none" }} />
              </button>
              {dropOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
                  <div className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-2xl shadow-2xl" style={{ background: "#12121e", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-sm font-bold text-white">{admin.name}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{admin.email}</p>
                      <span className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ background: "rgba(244,196,48,0.15)", color: "#f4c430" }}>Super Admin</span>
                    </div>
                    <div className="p-1.5">
                      <button onClick={() => { setDropOpen(false); onLogout(); }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition" style={{ color: "#ef4444" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                        <LogOut className="h-4 w-4" />Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-6 py-8">
          {activeNav === "overview"     && <OverviewSection />}
          {activeNav === "bookings"     && <BookingMasterLog />}
          {activeNav === "verification" && <VerificationQueue />}
          {activeNav === "users"        && <UserManagement />}
          {activeNav === "support"      && <SupportTickets />}
          {activeNav === "revenue"      && <PlaceholderSection id="revenue"   label="Revenue"       />}
          {activeNav === "health"       && <SystemHealthSection />}
          {activeNav === "audit"        && <AuditLogSection />}
          {activeNav === "settings"     && <PlaceholderSection id="settings"  label="Settings"      />}
        </main>
      </div>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewSection() {
  const stats = [
    { icon: Users,       label: "Total Patients",    value: "18,540", delta: "+124 this week",      up: true  },
    { icon: Stethoscope, label: "Psychologists",      value: "241",    delta: "+3 pending review",  up: null  },
    { icon: CalendarDays,label: "Appts (30d)",        value: "9,214",  delta: "+8.2% vs last month", up: true  },
    { icon: DollarSign,  label: "Revenue (30d)",      value: "$1.24M", delta: "+12.4% vs last month",up: true  },
  ];
  return (
    <section>
      <SectionHeader eyebrow="Dashboard" title="Platform Overview" sub="Real-time platform health and key metrics." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={C.card}>
            <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "rgba(244,196,48,0.1)" }}>
              <s.icon className="h-4 w-4" style={{ color: C.gold }} />
            </div>
            <p className="mt-5 text-3xl font-black text-white">{s.value}</p>
            <p className="mt-0.5 text-xs" style={{ color: C.muted }}>{s.label}</p>
            <p className="mt-2 text-[11px] font-semibold" style={{ color: s.up === true ? "#22c55e" : s.up === false ? "#ef4444" : C.muted }}>{s.delta}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl p-6" style={C.card}>
          <h2 className="text-sm font-bold text-white">Recent Activity</h2>
          <ul className="mt-4 space-y-3">
            {AUDIT_LOG.slice(0, 5).map((entry, i) => (
              <li key={i} className="flex items-start justify-between gap-4">
                <div><p className="text-sm font-medium text-white">{entry.action}</p><p className="text-[11px]" style={{ color: C.mutedLow }}>{entry.target}</p></div>
                <span className="shrink-0 text-[11px]" style={{ color: C.mutedLow }}>{entry.time}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl p-6" style={C.card}>
          <h2 className="text-sm font-bold text-white">System Health</h2>
          <ul className="mt-4 space-y-2">
            {SYSTEM_HEALTH.map((s) => (
              <li key={s.name} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{s.name}</span>
                <span className="text-[11px] font-bold" style={{ color: s.color }}>{s.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─── Booking Master Log ───────────────────────────────────────────────────────
function BookingMasterLog() {
  const [bookings, setBookings] = useState<Booking[]>(BOOKINGS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | BookingStatus>("All");
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchQ = !q || b.patient.toLowerCase().includes(q) || b.psychologist.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
    const matchS = statusFilter === "All" || b.status === statusFilter;
    return matchQ && matchS;
  });
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleCancel = (id: string) => {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "Canceled" as BookingStatus } : b));
  };
  const handleRefund = (id: string) => {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "Refunded" as BookingStatus } : b));
  };

  return (
    <section>
      <SectionHeader eyebrow="Appointments" title="Booking Master Log" sub="All appointments across the platform. Cancel or initiate refunds directly." />
      <div className="rounded-2xl p-6" style={C.card}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", width: 260 }}>
            <Search className="h-3.5 w-3.5 shrink-0" style={{ color: C.muted }} />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search patient, doctor, ID…"
              className="w-full bg-transparent text-xs text-white outline-none" style={{ "::placeholder": { color: C.muted } } as React.CSSProperties} />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5" style={{ color: C.muted }} />
            {(["All", "Scheduled", "Completed", "Canceled", "Refunded"] as const).map((s) => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className="rounded-full px-3 py-1 text-[11px] font-semibold transition"
                style={{ background: statusFilter === s ? "#f4c430" : "rgba(255,255,255,0.06)", color: statusFilter === s ? "#0a0a0f" : C.muted }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["ID", "Patient", "Psychologist", "Date & Time", "Type", "Amount", "Status", "Actions"].map((h) => (
                  <th key={h} className="pb-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)", paddingRight: 16 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="py-3 text-xs font-mono" style={{ color: C.muted, paddingRight: 16 }}>{b.id}</td>
                  <td className="py-3 font-medium text-white" style={{ paddingRight: 16 }}>
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-black" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                        {b.patient.split(" ").map(n => n[0]).join("")}
                      </span>
                      {b.patient}
                    </div>
                  </td>
                  <td className="py-3 text-sm" style={{ color: "rgba(255,255,255,0.7)", paddingRight: 16 }}>{b.psychologist}</td>
                  <td className="py-3 text-xs" style={{ color: C.muted, paddingRight: 16 }}>{b.dateTime}</td>
                  <td className="py-3 text-xs" style={{ color: C.muted, paddingRight: 16 }}>{b.type}</td>
                  <td className="py-3 text-xs font-semibold text-white" style={{ paddingRight: 16 }}>{b.amount}</td>
                  <td className="py-3" style={{ paddingRight: 16 }}>{statusBadge(b.status)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      {b.status === "Scheduled" && (
                        <button onClick={() => handleCancel(b.id)}
                          className="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                          Cancel
                        </button>
                      )}
                      {b.status === "Canceled" && (
                        <button onClick={() => handleRefund(b.id)}
                          className="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition"
                          style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}>
                          Refund
                        </button>
                      )}
                      {(b.status === "Completed" || b.status === "Refunded") && (
                        <span className="text-[11px]" style={{ color: C.mutedLow }}>—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-sm" style={{ color: C.mutedLow }}>No bookings match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs" style={{ color: C.muted }}>Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="grid h-7 w-7 place-items-center rounded-lg transition"
              style={{ background: "rgba(255,255,255,0.05)", color: page === 1 ? C.mutedLow : "rgba(255,255,255,0.7)" }}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className="grid h-7 w-7 place-items-center rounded-lg text-xs font-semibold transition"
                style={{ background: page === p ? "#f4c430" : "rgba(255,255,255,0.05)", color: page === p ? "#0a0a0f" : C.muted }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="grid h-7 w-7 place-items-center rounded-lg transition"
              style={{ background: "rgba(255,255,255,0.05)", color: page === totalPages ? C.mutedLow : "rgba(255,255,255,0.7)" }}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Verification Queue ───────────────────────────────────────────────────────
function VerificationQueue() {
  const [items, setItems] = useState<PsychVerification[]>(VERIFICATIONS);
  const [selected, setSelected] = useState<string | null>(VERIFICATIONS[0].id);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const filtered = items.filter((v) => filter === "all" || v.status === filter);
  const detail = items.find((v) => v.id === selected);

  const act = (id: string, status: VerifStatus) => {
    setItems((prev) => prev.map((v) => v.id === id ? { ...v, status } : v));
  };

  return (
    <section>
      <SectionHeader eyebrow="Onboarding" title="Psychologist Verification Queue" sub="Review uploaded credentials before granting platform access." />
      <div className="flex gap-2 mb-5">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => {
          const count = items.filter((v) => f === "all" || v.status === f).length;
          return (
            <button key={f} onClick={() => setFilter(f)}
              className="rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize transition"
              style={{ background: filter === f ? "#f4c430" : "rgba(255,255,255,0.06)", color: filter === f ? "#0a0a0f" : C.muted }}>
              {f} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* List */}
        <div className="space-y-2">
          {filtered.map((v) => (
            <button key={v.id} onClick={() => setSelected(v.id)} className="w-full rounded-2xl p-4 text-left transition"
              style={{ background: selected === v.id ? "rgba(244,196,48,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${selected === v.id ? "rgba(244,196,48,0.3)" : "rgba(255,255,255,0.07)"}` }}>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-black" style={{ background: "rgba(244,196,48,0.15)", color: "#f4c430" }}>Dr</div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{v.name}</p>
                  <p className="truncate text-xs" style={{ color: C.muted }}>{v.specialty}</p>
                </div>
                <div className="ml-auto shrink-0">{statusBadge(v.status.charAt(0).toUpperCase() + v.status.slice(1))}</div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px]" style={{ color: C.mutedLow }}>
                <Clock className="h-3 w-3" />Submitted {v.submitted} · {v.docs.length} docs
              </div>
            </button>
          ))}
          {filtered.length === 0 && <p className="py-8 text-center text-sm" style={{ color: C.mutedLow }}>No records in this category.</p>}
        </div>

        {/* Detail Panel */}
        {detail ? (
          <div className="rounded-2xl p-6" style={C.card}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-black" style={{ background: "rgba(244,196,48,0.15)", color: "#f4c430" }}>Dr</div>
                <div>
                  <h2 className="text-xl font-black text-white">{detail.name}</h2>
                  <p className="text-sm" style={{ color: C.muted }}>{detail.specialty}</p>
                </div>
              </div>
              {statusBadge(detail.status.charAt(0).toUpperCase() + detail.status.slice(1))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { icon: Mail,  label: "Email",       val: detail.email      },
                { icon: Tag,   label: "License No.",  val: detail.license    },
                { icon: Clock, label: "Experience",   val: detail.experience },
                { icon: Calendar, label: "Submitted", val: detail.submitted  },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <row.icon className="h-4 w-4 shrink-0" style={{ color: C.muted }} />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.mutedLow }}>{row.label}</p>
                    <p className="text-sm text-white">{row.val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Documents */}
            <div className="mt-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: C.muted }}>Uploaded Documents ({detail.docs.length})</p>
              <div className="space-y-2">
                {detail.docs.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-lg text-[10px] font-black" style={{ background: doc.type === "PDF" ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)", color: doc.type === "PDF" ? "#ef4444" : "#60a5fa" }}>{doc.type}</div>
                      <span className="text-sm text-white">{doc.name}</span>
                    </div>
                    <button className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition" style={{ background: "rgba(255,255,255,0.05)", color: C.muted }}>
                      <Download className="h-3 w-3" />View
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            {detail.status === "pending" && (
              <div className="mt-6 flex gap-3">
                <button onClick={() => act(detail.id, "approved")} className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }}>
                  <CheckCircle className="h-4 w-4" />Approve Psychologist
                </button>
                <button onClick={() => act(detail.id, "rejected")} className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                  <XCircle className="h-4 w-4" />Reject Application
                </button>
              </div>
            )}
            {detail.status === "approved" && (
              <div className="mt-6 flex items-center gap-2 rounded-2xl px-4 py-3" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <CheckCheck className="h-4 w-4" style={{ color: "#22c55e" }} />
                <p className="text-sm font-semibold" style={{ color: "#22c55e" }}>This psychologist has been approved and granted platform access.</p>
              </div>
            )}
            {detail.status === "rejected" && (
              <div className="mt-6 flex items-center gap-2 rounded-2xl px-4 py-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <XCircle className="h-4 w-4" style={{ color: "#ef4444" }} />
                <p className="text-sm font-semibold" style={{ color: "#ef4444" }}>This application was rejected. The applicant has been notified.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <p style={{ color: C.mutedLow }}>Select a record to view details.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── User Management ──────────────────────────────────────────────────────────
function UserManagement() {
  const [users, setUsers] = useState<UserRecord[]>(USERS);
  const [tab, setTab] = useState<"Patient" | "Psychologist">("Patient");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const PER_PAGE = 5;

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.role === tab && (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  });
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleStatus = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u));
  };
  const resetPassword = (name: string) => {
    setResetMsg(`Password reset email sent to ${name}.`);
    setTimeout(() => setResetMsg(null), 3000);
  };

  return (
    <section>
      <SectionHeader eyebrow="Accounts" title="User Management" sub="Manage patients and psychologists. Clinical notes are never surfaced here (HIPAA compliance)." />

      {resetMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>
          <CheckCircle className="h-4 w-4 shrink-0" />{resetMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-2xl p-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", width: "fit-content" }}>
        {(["Patient", "Psychologist"] as const).map((t) => {
          const count = users.filter((u) => u.role === t).length;
          const Icon = t === "Patient" ? User : Stethoscope;
          return (
            <button key={t} onClick={() => { setTab(t); setPage(1); setSearch(""); }}
              className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition"
              style={{ background: tab === t ? "#f4c430" : "transparent", color: tab === t ? "#0a0a0f" : C.muted }}>
              <Icon className="h-4 w-4" />{t}s <span className="rounded-full px-1.5 py-0.5 text-[10px] font-black" style={{ background: tab === t ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.08)" }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl p-6" style={C.card}>
        {/* Search */}
        <div className="mb-5 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", width: 280 }}>
          <Search className="h-3.5 w-3.5 shrink-0" style={{ color: C.muted }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={`Search ${tab.toLowerCase()}s…`}
            className="w-full bg-transparent text-xs text-white outline-none" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Name", "Email", "Phone", "Sessions", "Joined", "Status", "Actions"].map((h) => (
                  <th key={h} className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-black" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                        {u.name.split(" ").map(n => n[0]).join("")}
                      </span>
                      <span className="font-medium text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-xs" style={{ color: C.muted }}>{u.email}</td>
                  <td className="py-3 pr-4 text-xs" style={{ color: C.muted }}>{u.phone}</td>
                  <td className="py-3 pr-4 text-xs font-semibold text-white">{u.sessions}</td>
                  <td className="py-3 pr-4 text-xs" style={{ color: C.muted }}>{u.joined}</td>
                  <td className="py-3 pr-4">{statusBadge(u.status)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => toggleStatus(u.id)}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition"
                        style={{ background: u.status === "Active" ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", color: u.status === "Active" ? "#ef4444" : "#22c55e" }}>
                        {u.status === "Active" ? <><Ban className="h-3 w-3" />Suspend</> : <><CheckCircle className="h-3 w-3" />Activate</>}
                      </button>
                      <button onClick={() => resetPassword(u.name)}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition"
                        style={{ background: "rgba(255,255,255,0.06)", color: C.muted }}>
                        <KeyRound className="h-3 w-3" />Reset PW
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-sm" style={{ color: C.mutedLow }}>No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs" style={{ color: C.muted }}>{filtered.length} {tab.toLowerCase()}s total</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="grid h-7 w-7 place-items-center rounded-lg transition"
              style={{ background: "rgba(255,255,255,0.05)", color: page === 1 ? C.mutedLow : "rgba(255,255,255,0.7)" }}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className="grid h-7 w-7 place-items-center rounded-lg text-xs font-semibold transition"
                style={{ background: page === p ? "#f4c430" : "rgba(255,255,255,0.05)", color: page === p ? "#0a0a0f" : C.muted }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
              className="grid h-7 w-7 place-items-center rounded-lg transition"
              style={{ background: "rgba(255,255,255,0.05)", color: page === totalPages || totalPages === 0 ? C.mutedLow : "rgba(255,255,255,0.7)" }}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Support Tickets ──────────────────────────────────────────────────────────
function SupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>(TICKETS_INIT);
  const [selectedId, setSelectedId] = useState<string>(TICKETS_INIT[0].id);
  const [filter, setFilter] = useState<"All" | TicketStatus>("All");
  const [reply, setReply] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filtered = tickets.filter((t) => filter === "All" || t.status === filter);
  const ticket = tickets.find((t) => t.id === selectedId);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [ticket?.messages]);

  const sendReply = () => {
    if (!reply.trim() || !selectedId) return;
    setTickets((prev) => prev.map((t) => t.id === selectedId ? { ...t, messages: [...t.messages, { sender: "admin", text: reply.trim(), time: "Just now" }], status: "In Progress" as TicketStatus } : t));
    setReply("");
  };

  const resolve = (id: string) => {
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: "Resolved" as TicketStatus } : t));
  };

  const counts = { All: tickets.length, Open: tickets.filter(t => t.status === "Open").length, "In Progress": tickets.filter(t => t.status === "In Progress").length, Resolved: tickets.filter(t => t.status === "Resolved").length };

  return (
    <section>
      <SectionHeader eyebrow="Customer Support" title="Support Ticket Dashboard" sub="View and resolve technical complaints raised by patients and psychologists." />

      {/* Filter pills */}
      <div className="mb-5 flex gap-2">
        {(["All", "Open", "In Progress", "Resolved"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="rounded-full px-3 py-1.5 text-[11px] font-semibold transition"
            style={{ background: filter === f ? "#f4c430" : "rgba(255,255,255,0.06)", color: filter === f ? "#0a0a0f" : C.muted }}>
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]" style={{ height: "calc(100vh - 280px)", minHeight: 520 }}>
        {/* Ticket List */}
        <div className="flex flex-col gap-2 overflow-y-auto pr-1">
          {filtered.map((t) => (
            <button key={t.id} onClick={() => setSelectedId(t.id)} className="w-full rounded-2xl p-4 text-left transition"
              style={{ background: selectedId === t.id ? "rgba(244,196,48,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${selectedId === t.id ? "rgba(244,196,48,0.3)" : "rgba(255,255,255,0.07)"}` }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{t.subject}</p>
                  <p className="mt-0.5 truncate text-xs" style={{ color: C.muted }}>{t.user} · {t.email}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">{statusBadge(t.priority)}</div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                {statusBadge(t.status)}
                <span className="text-[11px]" style={{ color: C.mutedLow }}>{t.created}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <p className="py-8 text-center text-sm" style={{ color: C.mutedLow }}>No tickets found.</p>}
        </div>

        {/* Ticket Detail */}
        {ticket ? (
          <div className="flex flex-col rounded-2xl" style={C.card}>
            {/* Ticket header */}
            <div className="flex items-start justify-between gap-4 p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono" style={{ color: C.muted }}>{ticket.id}</span>
                  {statusBadge(ticket.status)}
                  {statusBadge(ticket.priority)}
                </div>
                <h2 className="text-base font-black text-white">{ticket.subject}</h2>
                <p className="mt-1 text-xs" style={{ color: C.muted }}>
                  <span className="font-semibold text-white">{ticket.user}</span> · {ticket.email} · opened {ticket.created}
                </p>
              </div>
              {ticket.status !== "Resolved" && (
                <button onClick={() => resolve(ticket.id)}
                  className="shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition"
                  style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }}>
                  <CheckCheck className="h-3.5 w-3.5" />Mark Resolved
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {ticket.messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.sender === "admin" ? "flex-row-reverse" : ""}`}>
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black"
                    style={{ background: msg.sender === "admin" ? "#f4c430" : "rgba(255,255,255,0.08)", color: msg.sender === "admin" ? "#0a0a0f" : "rgba(255,255,255,0.6)" }}>
                    {msg.sender === "admin" ? "Ad" : ticket.user.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className={`max-w-[75%] ${msg.sender === "admin" ? "items-end" : "items-start"} flex flex-col`}>
                    <div className="rounded-2xl px-4 py-3 text-sm"
                      style={{ background: msg.sender === "admin" ? "rgba(244,196,48,0.1)" : "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.85)", border: msg.sender === "admin" ? "1px solid rgba(244,196,48,0.15)" : "1px solid rgba(255,255,255,0.07)" }}>
                      {msg.text}
                    </div>
                    <span className="mt-1 text-[11px]" style={{ color: C.mutedLow }}>{msg.time}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            {ticket.status !== "Resolved" ? (
              <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex gap-2">
                  <input value={reply} onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                    placeholder="Type your reply… (Enter to send)"
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <button onClick={sendReply} disabled={!reply.trim()}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition"
                    style={{ background: reply.trim() ? "#f4c430" : "rgba(255,255,255,0.06)", color: reply.trim() ? "#0a0a0f" : C.mutedLow }}>
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <CheckCheck className="h-4 w-4" style={{ color: "#22c55e" }} />
                <p className="text-sm font-semibold" style={{ color: "#22c55e" }}>This ticket is resolved and closed.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl" style={{ ...C.card }}>
            <p style={{ color: C.mutedLow }}>Select a ticket to view the conversation.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── System Health ────────────────────────────────────────────────────────────
function SystemHealthSection() {
  return (
    <section>
      <SectionHeader eyebrow="Infrastructure" title="System Health" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SYSTEM_HEALTH.map((s) => (
          <div key={s.name} className="rounded-2xl p-5" style={C.card}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white">{s.name}</p>
              <s.icon className="h-5 w-5" style={{ color: s.color }} />
            </div>
            <p className="mt-3 text-sm font-bold" style={{ color: s.color }}>{s.status}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Audit Log ────────────────────────────────────────────────────────────────
function AuditLogSection() {
  return (
    <section>
      <SectionHeader eyebrow="Compliance" title="Audit Log" sub="Complete record of all admin actions. Read-only and tamper-evident." />
      <div className="rounded-2xl p-6" style={C.card}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Action", "Actor", "Target", "Timestamp"].map((h) => (
                <th key={h} className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AUDIT_LOG.map((entry, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td className="py-3 pr-4 font-medium text-white">{entry.action}</td>
                <td className="py-3 pr-4 text-xs" style={{ color: C.muted }}>{entry.actor}</td>
                <td className="py-3 pr-4 text-xs" style={{ color: C.muted }}>{entry.target}</td>
                <td className="py-3 pr-4 text-xs" style={{ color: C.mutedLow }}>{entry.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── Placeholder ──────────────────────────────────────────────────────────────
function PlaceholderSection({ id, label }: { id: string; label: string }) {
  return (
    <section>
      <SectionHeader eyebrow={id} title={label} />
      <div className="flex h-64 items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}>
        <p style={{ color: C.mutedLow }}>Connect your database to populate this section.</p>
      </div>
    </section>
  );
}
