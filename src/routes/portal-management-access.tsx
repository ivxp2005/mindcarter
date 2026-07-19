/**
 * /portal-management-access — Hidden, RBAC-protected admin portal.
 *
 * Security layers:
 *  1. Route is NOT linked anywhere in the public UI (nav, footer, sitemap).
 *  2. robots.txt blocks all crawlers from this path.
 *  3. Login validates credentials server-side against the users table
 *     (src/lib/auth.server.ts) via an HMAC-signed, DB-backed session cookie
 *     shared with the rest of the app — not a separate/weaker scheme.
 *  4. Patient / psychologist sessions are valid logins but are NOT accepted
 *     here — only role === "admin" is granted access to this dashboard.
 *  5. Clinical notes and message threads are NEVER surfaced to the admin.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  Ban,
  KeyRound,
  Send,
  Filter,
  MoreHorizontal,
  Stethoscope,
  User,
  CheckCheck,
  UserPlus,
  Trash2,
  RotateCcw,
  X,
} from "lucide-react";
import { adminLoginFn, adminLogoutFn, adminMeFn } from "../lib/auth.server";
import type { SessionUser } from "../lib/auth-types";
import {
  AdminDataProvider,
  useAdminData,
  type AdminUserDTO,
  type CreatePsychologistInput,
} from "../lib/admin-store";

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
  const [admin, setAdmin] = useState<SessionUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    adminMeFn().then((user) => {
      setAdmin(user && user.role === "admin" ? user : null);
      setChecked(true);
    });
  }, []);

  const handleLogout = async () => {
    await adminLogoutFn();
    setAdmin(null);
  };

  if (!checked) return null;
  if (!admin) return <AdminLoginPage onSuccess={(a) => setAdmin(a)} />;
  return (
    <AdminDataProvider>
      <AdminDashboard admin={admin} onLogout={handleLogout} />
    </AdminDataProvider>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
function AdminLoginPage({ onSuccess }: { onSuccess: (a: SessionUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || attempts >= 5) return;
    setLoading(true);
    setError(null);
    const result = await adminLoginFn({ data: { email, password } });
    setLoading(false);
    if (!result.ok) {
      setAttempts((n) => n + 1);
      setError(result.error);
      return;
    }
    const me = await adminMeFn();
    if (me) onSuccess(me);
  };
  const locked = attempts >= 5;

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6"
      style={{ background: "#0a0a0f" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(244,196,48,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#f4c430 1px, transparent 1px), linear-gradient(90deg, #f4c430 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="relative w-full max-w-md rounded-3xl p-10"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 0 0 1px rgba(244,196,48,0.06), 0 32px 64px rgba(0,0,0,0.6)",
        }}
      >
        <div className="flex justify-center">
          <div
            className="grid h-16 w-16 place-items-center rounded-2xl"
            style={{
              background: "rgba(244,196,48,0.12)",
              border: "1px solid rgba(244,196,48,0.25)",
              boxShadow: "0 0 24px rgba(244,196,48,0.15)",
            }}
          >
            <Shield className="h-7 w-7" style={{ color: "#f4c430" }} />
          </div>
        </div>
        <div className="mt-6 text-center">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.3em]"
            style={{ color: "#f4c430" }}
          >
            Restricted Access
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white">Admin Sign In</h1>
          <p className="mt-1.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            All sessions are logged and audited.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Admin Email
            </label>
            <input
              ref={emailRef}
              id="admin-email"
              type="email"
              required
              disabled={locked || loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mindcarter.com"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(244,196,48,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>
          <div>
            <label
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPw ? "text" : "password"}
                required
                disabled={locked || loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white outline-none transition"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(244,196,48,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && (
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171",
              }}
            >
              <XCircle className="h-4 w-4 shrink-0" />
              {locked ? "Too many failed attempts. Refresh to try again." : error}
            </div>
          )}
          <button
            id="admin-signin-submit"
            type="submit"
            disabled={locked || loading}
            className="mt-2 w-full rounded-full py-3 text-sm font-bold tracking-wide transition-all"
            style={{
              background: locked || loading ? "rgba(244,196,48,0.3)" : "#f4c430",
              color: locked || loading ? "rgba(0,0,0,0.4)" : "#0a0a0f",
              cursor: locked || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2"
                  style={{ borderColor: "rgba(0,0,0,0.2)", borderTopColor: "#000" }}
                />
                Verifying…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                Sign in to console
              </span>
            )}
          </button>
        </form>
        <p className="mt-6 text-center text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
          Unauthorised access attempts are recorded and may result in legal action.
        </p>
      </div>
    </div>
  );
}

// ─── Nav Config ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "bookings", label: "Booking Master Log", icon: CalendarDays },
  { id: "verification", label: "Verification Queue", icon: UserCheck },
  { id: "users", label: "User Management", icon: Users },
  { id: "support", label: "Support Tickets", icon: Ticket },
  { id: "revenue", label: "Revenue", icon: DollarSign },
  { id: "health", label: "System Health", icon: Activity },
  { id: "audit", label: "Audit Log", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
] as const;
type NavId = (typeof NAV_ITEMS)[number]["id"];

// ─── Mock Data ────────────────────────────────────────────────────────────────
type BookingStatus = "Scheduled" | "Completed" | "Canceled" | "Refunded";
type TicketStatus = "Open" | "In Progress" | "Resolved";

const SYSTEM_HEALTH = [
  { name: "API Gateway", status: "Operational", color: "#22c55e", icon: CheckCircle },
  { name: "Video Sessions", status: "Operational", color: "#22c55e", icon: CheckCircle },
  { name: "Payment Service", status: "Degraded", color: "#f59e0b", icon: AlertTriangle },
  { name: "Email Delivery", status: "Operational", color: "#22c55e", icon: CheckCircle },
  { name: "Database (Primary)", status: "Operational", color: "#22c55e", icon: CheckCircle },
  { name: "Backup Service", status: "Completed 02:14", color: "#22c55e", icon: CheckCircle },
] as const;

// ─── Shared UI helpers ─────────────────────────────────────────────────────────
const C = {
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
  } as React.CSSProperties,
  muted: "rgba(255,255,255,0.4)" as const,
  mutedLow: "rgba(255,255,255,0.25)" as const,
  gold: "#f4c430" as const,
};

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    Active: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
    Operational: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
    Scheduled: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa" },
    Completed: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
    Resolved: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
    Approved: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
    Pending: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
    Degraded: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
    "In Progress": { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
    Medium: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
    Canceled: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
    Refunded: { bg: "rgba(168,85,247,0.12)", color: "#a855f7" },
    Suspended: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
    Removed: { bg: "rgba(100,116,139,0.15)", color: "#94a3b8" },
    Rejected: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
    Open: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
    High: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
    Low: { bg: "rgba(100,116,139,0.15)", color: "#94a3b8" },
  };
  const s = map[status] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: C.gold }}>
        {eyebrow}
      </p>
      <h1 className="mt-1 text-3xl font-black tracking-tight text-white">{title}</h1>
      {sub && (
        <p className="mt-1 text-sm" style={{ color: C.muted }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function AdminDashboard({ admin, onLogout }: { admin: SessionUser; onLogout: () => void }) {
  const [activeNav, setActiveNav] = useState<NavId>("overview");
  const [dropOpen, setDropOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans" style={{ background: "#0c0c14", color: "#f0f0f5" }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "#0a0a11", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="flex h-16 shrink-0 items-center gap-3 px-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="grid h-9 w-9 place-items-center rounded-xl"
            style={{ background: "#f4c430" }}
          >
            <Shield className="h-4 w-4" style={{ color: "#0a0a0f" }} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">Mindcarter.</p>
            <p
              className="text-[9px] font-semibold uppercase tracking-[0.25em]"
              style={{ color: "#f4c430" }}
            >
              Admin Console
            </p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeNav === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveNav(id);
                  setSidebarOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all"
                style={{
                  background: active ? "rgba(244,196,48,0.1)" : "transparent",
                  color: active ? "#f4c430" : "rgba(255,255,255,0.45)",
                  borderLeft: active ? "2px solid #f4c430" : "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)";
                }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            );
          })}
        </nav>
        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
            style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ef4444")}
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)")
            }
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:pl-64">
        {/* Header */}
        <header
          className="sticky top-0 z-20 flex h-16 items-center justify-between px-6"
          style={{
            background: "rgba(10,10,17,0.85)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              ☰
            </button>
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              {NAV_ITEMS.find((n) => n.id === activeNav)?.label ?? ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="relative grid h-9 w-9 place-items-center rounded-full transition"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}
            >
              <Bell className="h-4 w-4" />
              <span
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
                style={{ background: "#f4c430" }}
              />
            </button>
            <div className="relative">
              <button
                id="admin-profile-btn"
                onClick={() => setDropOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full px-2 py-1 transition"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span
                  className="grid h-8 w-8 place-items-center rounded-full text-xs font-black"
                  style={{ background: "#f4c430", color: "#0a0a0f" }}
                >
                  Ad
                </span>
                <span
                  className="hidden text-sm font-medium sm:inline"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  {admin.name}
                </span>
                <ChevronDown
                  className="h-3.5 w-3.5 transition-transform"
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    transform: dropOpen ? "rotate(180deg)" : "none",
                  }}
                />
              </button>
              {dropOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
                  <div
                    className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-2xl shadow-2xl"
                    style={{ background: "#12121e", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <div
                      className="px-4 py-3"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <p className="text-sm font-bold text-white">{admin.name}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {admin.email}
                      </p>
                      <span
                        className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                        style={{ background: "rgba(244,196,48,0.15)", color: "#f4c430" }}
                      >
                        Super Admin
                      </span>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={() => {
                          setDropOpen(false);
                          onLogout();
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition"
                        style={{ color: "#ef4444" }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            "rgba(239,68,68,0.08)")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.background = "transparent")
                        }
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
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
          {activeNav === "overview" && <OverviewSection />}
          {activeNav === "bookings" && <BookingMasterLog />}
          {activeNav === "verification" && (
            <PlaceholderSection
              id="verification"
              label="Verification Queue"
              message="Coming soon — this will populate once psychologists can apply for verification directly. Psychologist accounts are currently added by the admin."
            />
          )}
          {activeNav === "users" && <UserManagement />}
          {activeNav === "support" && <SupportTickets />}
          {activeNav === "revenue" && <PlaceholderSection id="revenue" label="Revenue" />}
          {activeNav === "health" && <SystemHealthSection />}
          {activeNav === "audit" && <AuditLogSection />}
          {activeNav === "settings" && <AdminSettingsSection admin={admin} />}
        </main>
      </div>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewSection() {
  const { stats: real, pendingPsychologists, auditLog } = useAdminData();
  const stats = [
    {
      icon: Users,
      label: "Total Patients",
      value: real.totalPatients.toLocaleString(),
      delta: "Live count",
      up: null,
    },
    {
      icon: Stethoscope,
      label: "Psychologists",
      value: real.totalPsychologists.toLocaleString(),
      delta: `${pendingPsychologists.length} pending review`,
      up: null,
    },
    {
      icon: CalendarDays,
      label: "Appts (30d)",
      value: real.appts30d.toLocaleString(),
      delta: "Live count",
      up: null,
    },
    {
      icon: DollarSign,
      label: "Revenue (30d)",
      value: real.revenue30d,
      delta: "From completed bookings",
      up: null,
    },
  ];
  return (
    <section>
      <SectionHeader
        eyebrow="Dashboard"
        title="Platform Overview"
        sub="Real-time platform health and key metrics."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-5" style={C.card}>
            <div
              className="grid h-10 w-10 place-items-center rounded-xl"
              style={{ background: "rgba(244,196,48,0.1)" }}
            >
              <s.icon className="h-4 w-4" style={{ color: C.gold }} />
            </div>
            <p className="mt-5 text-3xl font-black text-white">{s.value}</p>
            <p className="mt-0.5 text-xs" style={{ color: C.muted }}>
              {s.label}
            </p>
            <p
              className="mt-2 text-[11px] font-semibold"
              style={{ color: s.up === true ? "#22c55e" : s.up === false ? "#ef4444" : C.muted }}
            >
              {s.delta}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl p-6" style={C.card}>
          <h2 className="text-sm font-bold text-white">Recent Activity</h2>
          <ul className="mt-4 space-y-3">
            {auditLog.slice(0, 5).map((entry, i) => (
              <li key={i} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">{entry.action}</p>
                  <p className="text-[11px]" style={{ color: C.mutedLow }}>
                    {entry.target}
                  </p>
                </div>
                <span className="shrink-0 text-[11px]" style={{ color: C.mutedLow }}>
                  {entry.time}
                </span>
              </li>
            ))}
            {auditLog.length === 0 && (
              <li className="text-sm" style={{ color: C.mutedLow }}>
                No recent activity.
              </li>
            )}
          </ul>
        </div>
        <div className="rounded-2xl p-6" style={C.card}>
          <h2 className="text-sm font-bold text-white">System Health</h2>
          <ul className="mt-4 space-y-2">
            {SYSTEM_HEALTH.map((s) => (
              <li
                key={s.name}
                className="flex items-center justify-between rounded-xl px-3 py-2"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                  {s.name}
                </span>
                <span className="text-[11px] font-bold" style={{ color: s.color }}>
                  {s.status}
                </span>
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
  const { bookings, cancelBooking, refundBooking } = useAdminData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | BookingStatus>("All");
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      b.patient.toLowerCase().includes(q) ||
      b.psychologist.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q);
    const matchS = statusFilter === "All" || b.status === statusFilter;
    return matchQ && matchS;
  });
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleCancel = (id: string) => cancelBooking(id);
  const handleRefund = (id: string) => refundBooking(id);

  return (
    <section>
      <SectionHeader
        eyebrow="Appointments"
        title="Booking Master Log"
        sub="All appointments across the platform. Cancel or initiate refunds directly."
      />
      <div className="rounded-2xl p-6" style={C.card}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              width: 260,
            }}
          >
            <Search className="h-3.5 w-3.5 shrink-0" style={{ color: C.muted }} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search patient, doctor, ID…"
              className="w-full bg-transparent text-xs text-white outline-none"
              style={{ "::placeholder": { color: C.muted } } as React.CSSProperties}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5" style={{ color: C.muted }} />
            {(["All", "Scheduled", "Completed", "Canceled", "Refunded"] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className="rounded-full px-3 py-1 text-[11px] font-semibold transition"
                style={{
                  background: statusFilter === s ? "#f4c430" : "rgba(255,255,255,0.06)",
                  color: statusFilter === s ? "#0a0a0f" : C.muted,
                }}
              >
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
                {[
                  "ID",
                  "Patient",
                  "Psychologist",
                  "Date & Time",
                  "Type",
                  "Amount",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="pb-3 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "rgba(255,255,255,0.3)", paddingRight: 16 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td
                    className="py-3 text-xs font-mono"
                    style={{ color: C.muted, paddingRight: 16 }}
                  >
                    {b.id}
                  </td>
                  <td className="py-3 font-medium text-white" style={{ paddingRight: 16 }}>
                    <div className="flex items-center gap-2">
                      <span
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-black"
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        {b.patient
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                      {b.patient}
                    </div>
                  </td>
                  <td
                    className="py-3 text-sm"
                    style={{ color: "rgba(255,255,255,0.7)", paddingRight: 16 }}
                  >
                    {b.psychologist}
                  </td>
                  <td className="py-3 text-xs" style={{ color: C.muted, paddingRight: 16 }}>
                    {b.dateTime}
                  </td>
                  <td className="py-3 text-xs" style={{ color: C.muted, paddingRight: 16 }}>
                    {b.type}
                  </td>
                  <td
                    className="py-3 text-xs font-semibold text-white"
                    style={{ paddingRight: 16 }}
                  >
                    {b.amount}
                  </td>
                  <td className="py-3" style={{ paddingRight: 16 }}>
                    {statusBadge(b.status)}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      {b.status === "Scheduled" && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          className="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
                        >
                          Cancel
                        </button>
                      )}
                      {b.status === "Canceled" && (
                        <button
                          onClick={() => handleRefund(b.id)}
                          className="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition"
                          style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}
                        >
                          Refund
                        </button>
                      )}
                      {(b.status === "Completed" || b.status === "Refunded") && (
                        <span className="text-[11px]" style={{ color: C.mutedLow }}>
                          —
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-sm"
                    style={{ color: C.mutedLow }}
                  >
                    No bookings match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs" style={{ color: C.muted }}>
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–
            {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="grid h-7 w-7 place-items-center rounded-lg transition"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: page === 1 ? C.mutedLow : "rgba(255,255,255,0.7)",
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="grid h-7 w-7 place-items-center rounded-lg text-xs font-semibold transition"
                style={{
                  background: page === p ? "#f4c430" : "rgba(255,255,255,0.05)",
                  color: page === p ? "#0a0a0f" : C.muted,
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="grid h-7 w-7 place-items-center rounded-lg transition"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: page === totalPages ? C.mutedLow : "rgba(255,255,255,0.7)",
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


// ─── User Management ──────────────────────────────────────────────────────────

const FORM_INPUT_CLASS = "w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none";
const FORM_INPUT_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
};

function RowActionsMenu({
  user,
  open,
  onToggle,
  onSuspendToggle,
  onResetPassword,
  onReactivate,
  onRequestRemove,
}: {
  user: AdminUserDTO;
  open: boolean;
  onToggle: () => void;
  onSuspendToggle: () => void;
  onResetPassword: () => void;
  onReactivate: () => void;
  onRequestRemove: () => void;
}) {
  const menuItemClass =
    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition";
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) setCoords({ top: rect.bottom + 6, right: window.innerWidth - rect.right });

    // Positions are computed once on open; close on scroll instead of
    // re-tracking, since the trigger row can scroll out of view too.
    const close = () => onToggle();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={onToggle}
        className="grid h-8 w-8 place-items-center rounded-lg transition"
        style={{ background: "rgba(255,255,255,0.06)", color: C.muted }}
        aria-label={`Actions for ${user.name}`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open &&
        coords &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[60]" onClick={onToggle} />
            <div
              className="fixed z-[61] w-52 overflow-hidden rounded-xl shadow-2xl"
              style={{
                top: coords.top,
                right: coords.right,
                background: "#16161f",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="p-1.5">
                {user.role === "Psychologist" ? (
                  user.status === "Removed" ? (
                    <button
                      onClick={onReactivate}
                      className={menuItemClass}
                      style={{ color: "#22c55e" }}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reactivate
                    </button>
                  ) : (
                    <button
                      onClick={onRequestRemove}
                      className={menuItemClass}
                      style={{ color: "#ef4444" }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove Psychologist
                    </button>
                  )
                ) : (
                  <button
                    onClick={onSuspendToggle}
                    className={menuItemClass}
                    style={{ color: user.status === "Active" ? "#ef4444" : "#22c55e" }}
                  >
                    {user.status === "Active" ? (
                      <Ban className="h-3.5 w-3.5" />
                    ) : (
                      <CheckCircle className="h-3.5 w-3.5" />
                    )}
                    {user.status === "Active" ? "Suspend" : "Activate"}
                  </button>
                )}
                <button
                  onClick={onResetPassword}
                  className={menuItemClass}
                  style={{ color: C.muted }}
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Reset Password
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}

function AddPsychologistModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: CreatePsychologistInput) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 8) {
      setError("Name, email, and an 8+ character password are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await onSubmit({
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim() || undefined,
      title: title.trim() || undefined,
      licenseNumber: licenseNumber.trim() || undefined,
      yearsExperience: yearsExperience ? Number(yearsExperience) : undefined,
      specialties: specialties.trim()
        ? specialties
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
    });
    setSubmitting(false);
    if (!result.ok) setError(result.error ?? "Could not create account.");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-3xl p-8"
        style={{
          background: "#12121e",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white">Add Psychologist</h2>
          <button onClick={onClose} style={{ color: C.muted }} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs" style={{ color: C.mutedLow }}>
          Creates a live account — they can sign in immediately with these credentials.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={FORM_INPUT_CLASS}
              style={FORM_INPUT_STYLE}
            />
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={FORM_INPUT_CLASS}
              style={FORM_INPUT_STYLE}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={FORM_INPUT_CLASS}
                style={{ ...FORM_INPUT_STYLE, paddingRight: "2.75rem" }}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition"
                style={{ color: C.muted }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <input
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={FORM_INPUT_CLASS}
              style={FORM_INPUT_STYLE}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={FORM_INPUT_CLASS}
              style={FORM_INPUT_STYLE}
            />
            <input
              placeholder="License number (optional)"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className={FORM_INPUT_CLASS}
              style={FORM_INPUT_STYLE}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Years of experience (optional)"
              type="number"
              min={0}
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              className={FORM_INPUT_CLASS}
              style={FORM_INPUT_STYLE}
            />
            <input
              placeholder="Specialties, comma separated (optional)"
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
              className={FORM_INPUT_CLASS}
              style={FORM_INPUT_STYLE}
            />
          </div>
          {error && (
            <p className="text-xs font-semibold" style={{ color: "#ef4444" }}>
              {error}
            </p>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-semibold transition"
              style={{ background: "rgba(255,255,255,0.06)", color: C.muted }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full px-5 py-2 text-sm font-bold transition disabled:opacity-50"
              style={{ background: "#f4c430", color: "#0a0a0f" }}
            >
              {submitting ? "Creating…" : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmRemoveModal({
  name,
  onCancel,
  onConfirm,
}: {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div className="fixed inset-0" onClick={onCancel} />
      <div
        className="relative w-full max-w-sm rounded-3xl p-8 text-center"
        style={{
          background: "#12121e",
          border: "1px solid rgba(239,68,68,0.2)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
        }}
      >
        <div
          className="mx-auto grid h-12 w-12 place-items-center rounded-2xl"
          style={{ background: "rgba(239,68,68,0.12)" }}
        >
          <Trash2 className="h-5 w-5" style={{ color: "#ef4444" }} />
        </div>
        <h2 className="mt-4 text-base font-black text-white">Remove {name}?</h2>
        <p className="mt-2 text-xs" style={{ color: C.muted }}>
          They'll be blocked from signing in and hidden from the active directory. Their booking and
          diary history is kept — you can reactivate them later.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm font-semibold transition"
            style={{ background: "rgba(255,255,255,0.06)", color: C.muted }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full px-5 py-2 text-sm font-bold transition"
            style={{ background: "#ef4444", color: "#fff" }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function UserManagement() {
  const {
    users,
    setUserStatus,
    resetUserPassword,
    addPsychologist,
    removePsychologist,
    reactivatePsychologist,
  } = useAdminData();
  const [tab, setTab] = useState<"Patient" | "Psychologist">("Patient");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [showRemoved, setShowRemoved] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<AdminUserDTO | null>(null);
  const PER_PAGE = 5;

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.role === tab &&
      (showRemoved || u.status !== "Removed") &&
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    );
  });
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleStatus = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    setUserStatus(id, target.status === "Active" ? "suspended" : "active");
    setOpenMenuId(null);
  };
  const resetPassword = (email: string, name: string) => {
    resetUserPassword(email);
    setResetMsg(`Password reset email sent to ${name}.`);
    setTimeout(() => setResetMsg(null), 3000);
    setOpenMenuId(null);
  };
  const handleReactivate = (id: string) => {
    reactivatePsychologist(id);
    setOpenMenuId(null);
  };
  const handleConfirmRemove = () => {
    if (!removeTarget) return;
    removePsychologist(removeTarget.id);
    setRemoveTarget(null);
  };
  const handleAddPsychologist = async (input: CreatePsychologistInput) => {
    const result = await addPsychologist(input);
    if (result.ok) {
      setAddOpen(false);
      setResetMsg(`${input.name} added as a psychologist.`);
      setTimeout(() => setResetMsg(null), 3000);
    }
    return result;
  };

  return (
    <section>
      <SectionHeader
        eyebrow="Accounts"
        title="User Management"
        sub="Manage patients and psychologists. Clinical notes are never surfaced here (HIPAA compliance)."
      />

      {resetMsg && (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.2)",
            color: "#22c55e",
          }}
        >
          <CheckCircle className="h-4 w-4 shrink-0" />
          {resetMsg}
        </div>
      )}

      {/* Tabs + Add Psychologist */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex gap-1 rounded-2xl p-1"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            width: "fit-content",
          }}
        >
          {(["Patient", "Psychologist"] as const).map((t) => {
            const count = users.filter(
              (u) => u.role === t && (showRemoved || u.status !== "Removed"),
            ).length;
            const Icon = t === "Patient" ? User : Stethoscope;
            return (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setPage(1);
                  setSearch("");
                  setOpenMenuId(null);
                }}
                className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition"
                style={{
                  background: tab === t ? "#f4c430" : "transparent",
                  color: tab === t ? "#0a0a0f" : C.muted,
                }}
              >
                <Icon className="h-4 w-4" />
                {t}s{" "}
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-black"
                  style={{ background: tab === t ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.08)" }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        {tab === "Psychologist" && (
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition"
            style={{ background: "#f4c430", color: "#0a0a0f" }}
          >
            <UserPlus className="h-4 w-4" />
            Add Psychologist
          </button>
        )}
      </div>

      <div className="rounded-2xl p-6" style={C.card}>
        {/* Toolbar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              width: 280,
            }}
          >
            <Search className="h-3.5 w-3.5 shrink-0" style={{ color: C.muted }} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={`Search ${tab.toLowerCase()}s…`}
              className="w-full bg-transparent text-xs text-white outline-none"
            />
          </div>
          {tab === "Psychologist" && (
            <label
              className="flex items-center gap-2 text-xs font-semibold"
              style={{ color: C.muted }}
            >
              <input
                type="checkbox"
                checked={showRemoved}
                onChange={(e) => {
                  setShowRemoved(e.target.checked);
                  setPage(1);
                }}
              />
              Show removed
            </label>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Name", "Email", "Phone", "Sessions", "Joined", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-black"
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        {u.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                      <span className="font-medium text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-xs" style={{ color: C.muted }}>
                    {u.email}
                  </td>
                  <td className="py-3 pr-4 text-xs" style={{ color: C.muted }}>
                    {u.phone}
                  </td>
                  <td className="py-3 pr-4 text-xs font-semibold text-white">{u.sessions}</td>
                  <td className="py-3 pr-4 text-xs" style={{ color: C.muted }}>
                    {u.joined}
                  </td>
                  <td className="py-3 pr-4">{statusBadge(u.status)}</td>
                  <td className="py-3">
                    <RowActionsMenu
                      user={u}
                      open={openMenuId === u.id}
                      onToggle={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                      onSuspendToggle={() => toggleStatus(u.id)}
                      onResetPassword={() => resetPassword(u.email, u.name)}
                      onReactivate={() => handleReactivate(u.id)}
                      onRequestRemove={() => {
                        setRemoveTarget(u);
                        setOpenMenuId(null);
                      }}
                    />
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-sm"
                    style={{ color: C.mutedLow }}
                  >
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs" style={{ color: C.muted }}>
            {filtered.length} {tab.toLowerCase()}s total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="grid h-7 w-7 place-items-center rounded-lg transition"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: page === 1 ? C.mutedLow : "rgba(255,255,255,0.7)",
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="grid h-7 w-7 place-items-center rounded-lg text-xs font-semibold transition"
                style={{
                  background: page === p ? "#f4c430" : "rgba(255,255,255,0.05)",
                  color: page === p ? "#0a0a0f" : C.muted,
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="grid h-7 w-7 place-items-center rounded-lg transition"
              style={{
                background: "rgba(255,255,255,0.05)",
                color:
                  page === totalPages || totalPages === 0 ? C.mutedLow : "rgba(255,255,255,0.7)",
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {addOpen && (
        <AddPsychologistModal onClose={() => setAddOpen(false)} onSubmit={handleAddPsychologist} />
      )}
      {removeTarget && (
        <ConfirmRemoveModal
          name={removeTarget.name}
          onCancel={() => setRemoveTarget(null)}
          onConfirm={handleConfirmRemove}
        />
      )}
    </section>
  );
}

// ─── Support Tickets ──────────────────────────────────────────────────────────
function SupportTickets() {
  const { tickets, replyToTicket, resolveTicket } = useAdminData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"All" | TicketStatus>("All");
  const [reply, setReply] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filtered = tickets.filter((t) => filter === "All" || t.status === filter);
  const ticket = tickets.find((t) => t.id === selectedId) ?? filtered[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const sendReply = () => {
    if (!reply.trim() || !ticket) return;
    replyToTicket(ticket.id, reply.trim());
    setReply("");
  };

  const resolve = (id: string) => {
    resolveTicket(id);
  };

  const counts = {
    All: tickets.length,
    Open: tickets.filter((t) => t.status === "Open").length,
    "In Progress": tickets.filter((t) => t.status === "In Progress").length,
    Resolved: tickets.filter((t) => t.status === "Resolved").length,
  };

  return (
    <section>
      <SectionHeader
        eyebrow="Customer Support"
        title="Support Ticket Dashboard"
        sub="View and resolve technical complaints raised by patients and psychologists."
      />

      {/* Filter pills */}
      <div className="mb-5 flex gap-2">
        {(["All", "Open", "In Progress", "Resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="rounded-full px-3 py-1.5 text-[11px] font-semibold transition"
            style={{
              background: filter === f ? "#f4c430" : "rgba(255,255,255,0.06)",
              color: filter === f ? "#0a0a0f" : C.muted,
            }}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      <div
        className="grid gap-4 lg:grid-cols-[320px_1fr]"
        style={{ height: "calc(100vh - 280px)", minHeight: 520 }}
      >
        {/* Ticket List */}
        <div className="flex flex-col gap-2 overflow-y-auto pr-1">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className="w-full rounded-2xl p-4 text-left transition"
              style={{
                background:
                  selectedId === t.id ? "rgba(244,196,48,0.08)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${selectedId === t.id ? "rgba(244,196,48,0.3)" : "rgba(255,255,255,0.07)"}`,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{t.subject}</p>
                  <p className="mt-0.5 truncate text-xs" style={{ color: C.muted }}>
                    {t.user} · {t.email}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {statusBadge(t.priority)}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                {statusBadge(t.status)}
                <span className="text-[11px]" style={{ color: C.mutedLow }}>
                  {t.created}
                </span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm" style={{ color: C.mutedLow }}>
              No tickets found.
            </p>
          )}
        </div>

        {/* Ticket Detail */}
        {ticket ? (
          <div className="flex flex-col rounded-2xl" style={C.card}>
            {/* Ticket header */}
            <div
              className="flex items-start justify-between gap-4 p-5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono" style={{ color: C.muted }}>
                    {ticket.id}
                  </span>
                  {statusBadge(ticket.status)}
                  {statusBadge(ticket.priority)}
                </div>
                <h2 className="text-base font-black text-white">{ticket.subject}</h2>
                <p className="mt-1 text-xs" style={{ color: C.muted }}>
                  <span className="font-semibold text-white">{ticket.user}</span> · {ticket.email} ·
                  opened {ticket.created}
                </p>
              </div>
              {ticket.status !== "Resolved" && (
                <button
                  onClick={() => resolve(ticket.id)}
                  className="shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition"
                  style={{
                    background: "rgba(34,197,94,0.12)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    color: "#22c55e",
                  }}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark Resolved
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {ticket.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.sender === "admin" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black"
                    style={{
                      background: msg.sender === "admin" ? "#f4c430" : "rgba(255,255,255,0.08)",
                      color: msg.sender === "admin" ? "#0a0a0f" : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {msg.sender === "admin"
                      ? "Ad"
                      : ticket.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                  </div>
                  <div
                    className={`max-w-[75%] ${msg.sender === "admin" ? "items-end" : "items-start"} flex flex-col`}
                  >
                    <div
                      className="rounded-2xl px-4 py-3 text-sm"
                      style={{
                        background:
                          msg.sender === "admin"
                            ? "rgba(244,196,48,0.1)"
                            : "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.85)",
                        border:
                          msg.sender === "admin"
                            ? "1px solid rgba(244,196,48,0.15)"
                            : "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      {msg.text}
                    </div>
                    <span className="mt-1 text-[11px]" style={{ color: C.mutedLow }}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            {ticket.status !== "Resolved" ? (
              <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendReply();
                      }
                    }}
                    placeholder="Type your reply… (Enter to send)"
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                  <button
                    onClick={sendReply}
                    disabled={!reply.trim()}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition"
                    style={{
                      background: reply.trim() ? "#f4c430" : "rgba(255,255,255,0.06)",
                      color: reply.trim() ? "#0a0a0f" : C.mutedLow,
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 p-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <CheckCheck className="h-4 w-4" style={{ color: "#22c55e" }} />
                <p className="text-sm font-semibold" style={{ color: "#22c55e" }}>
                  This ticket is resolved and closed.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div
            className="flex h-full items-center justify-center rounded-2xl"
            style={{ ...C.card }}
          >
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
            <p className="mt-3 text-sm font-bold" style={{ color: s.color }}>
              {s.status}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Audit Log ────────────────────────────────────────────────────────────────
function AuditLogSection() {
  const { auditLog } = useAdminData();
  return (
    <section>
      <SectionHeader
        eyebrow="Compliance"
        title="Audit Log"
        sub="Complete record of all admin actions. Read-only and tamper-evident."
      />
      <div className="rounded-2xl p-6" style={C.card}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Action", "Actor", "Target", "Timestamp"].map((h) => (
                <th
                  key={h}
                  className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {auditLog.map((entry, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td className="py-3 pr-4 font-medium text-white">{entry.action}</td>
                <td className="py-3 pr-4 text-xs" style={{ color: C.muted }}>
                  {entry.actor}
                </td>
                <td className="py-3 pr-4 text-xs" style={{ color: C.muted }}>
                  {entry.target}
                </td>
                <td className="py-3 pr-4 text-xs" style={{ color: C.mutedLow }}>
                  {entry.time}
                </td>
              </tr>
            ))}
            {auditLog.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm" style={{ color: C.mutedLow }}>
                  No destructive admin actions recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function AdminSettingsSection({ admin }: { admin: SessionUser }) {
  const { updateAdminProfile, changeAdminPassword } = useAdminData();
  const [name, setName] = useState(admin.name);
  const [nameMsg, setNameMsg] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const saveName = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminProfile(name.trim() || admin.name);
    setNameMsg("Name updated.");
    setTimeout(() => setNameMsg(null), 3000);
  };

  const submitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwMsg(null);
    setPwSubmitting(true);
    const result = await changeAdminPassword(currentPassword, newPassword);
    setPwSubmitting(false);
    if (result.ok) {
      setPwMsg("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPwMsg(null), 3000);
    } else {
      setPwError(result.error ?? "Could not change password.");
    }
  };

  return (
    <section>
      <SectionHeader
        eyebrow="Account"
        title="Settings"
        sub="Manage your admin account's name and password."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={saveName} className="rounded-2xl p-6" style={C.card}>
          <h2 className="text-sm font-bold text-white">Profile</h2>
          <label className="mt-4 block text-xs font-semibold" style={{ color: C.muted }}>
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
          <p className="mt-4 text-xs" style={{ color: C.mutedLow }}>
            Email: {admin.email}
          </p>
          <button
            type="submit"
            className="mt-5 rounded-full px-5 py-2.5 text-sm font-bold transition"
            style={{ background: "#f4c430", color: "#0a0a0f" }}
          >
            Save Name
          </button>
          {nameMsg && (
            <p className="mt-3 text-xs font-semibold" style={{ color: "#22c55e" }}>
              {nameMsg}
            </p>
          )}
        </form>

        <form onSubmit={submitPasswordChange} className="rounded-2xl p-6" style={C.card}>
          <h2 className="text-sm font-bold text-white">Change Password</h2>
          <label className="mt-4 block text-xs font-semibold" style={{ color: C.muted }}>
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrentPw ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl py-2.5 pl-4 pr-11 text-sm text-white outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowCurrentPw((v) => !v)}
              aria-label={showCurrentPw ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 mt-[3px] -translate-y-1/2 transition"
              style={{ color: C.muted }}
            >
              {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <label className="mt-4 block text-xs font-semibold" style={{ color: C.muted }}>
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPw ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              className="mt-1.5 w-full rounded-xl py-2.5 pl-4 pr-11 text-sm text-white outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowNewPw((v) => !v)}
              aria-label={showNewPw ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 mt-[3px] -translate-y-1/2 transition"
              style={{ color: C.muted }}
            >
              {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={pwSubmitting || !currentPassword || newPassword.length < 8}
            className="mt-5 rounded-full px-5 py-2.5 text-sm font-bold transition disabled:opacity-50"
            style={{ background: "#f4c430", color: "#0a0a0f" }}
          >
            {pwSubmitting ? "Changing…" : "Change Password"}
          </button>
          {pwMsg && (
            <p className="mt-3 text-xs font-semibold" style={{ color: "#22c55e" }}>
              {pwMsg}
            </p>
          )}
          {pwError && (
            <p className="mt-3 text-xs font-semibold" style={{ color: "#ef4444" }}>
              {pwError}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

// ─── Placeholder ──────────────────────────────────────────────────────────────
function PlaceholderSection({
  id,
  label,
  message = "Connect your database to populate this section.",
}: {
  id: string;
  label: string;
  message?: string;
}) {
  return (
    <section>
      <SectionHeader eyebrow={id} title={label} />
      <div
        className="flex h-64 items-center justify-center rounded-2xl"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}
      >
        <p style={{ color: C.mutedLow }}>{message}</p>
      </div>
    </section>
  );
}
