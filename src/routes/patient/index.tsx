import { createFileRoute, Link } from "@tanstack/react-router";
import type { Mood } from "../../lib/patient";
import {
  CalendarHeart,
  Flame,
  NotebookPen,
  Bell,
  ArrowUpRight,
  Sparkles,
  Video,
  MapPin,
  Phone,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../../components/scroll-reveal";
import { GradientAvatar } from "../../components/gradient-avatar";
import { useSession } from "../../lib/use-session";
import {
  CARE_TEAM,
  JOURNAL_ENTRIES,
  MOOD_EMOJI,
  MOOD_TREND,
  NOTIFICATIONS,
  SESSIONS,
  TODAY,
  WELLNESS_STATS,
} from "../../lib/patient";

export const Route = createFileRoute("/patient/")({
  component: PatientDashboard,
});

function formatDate(dateStr: string) {
  if (dateStr === TODAY) return "Today";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const MODE_ICON = { Video, "In-person": MapPin, Phone } as const;

function PatientDashboard() {
  const { data: session } = useSession();
  const firstName = session?.name?.split(" ")[0] ?? "there";

  const upcomingSessions = SESSIONS.filter((s) => s.status === "upcoming").sort(
    (a, b) =>
      a.date === b.date
        ? a.time.localeCompare(b.time)
        : a.date.localeCompare(b.date),
  );
  const nextSession = upcomingSessions[0];
  const primaryCarer = CARE_TEAM.find((c) => c.primary) ?? CARE_TEAM[0];
  const recentEntries = JOURNAL_ENTRIES.slice(0, 4);
  const unreadNotifications = NOTIFICATIONS.filter((n) => !n.read).length;

  const stats = [
    {
      icon: CalendarHeart,
      l: "Next session",
      v: nextSession ? formatDate(nextSession.date) : "None booked",
      to: "/patient/sessions",
    },
    {
      icon: Flame,
      l: "Wellness streak",
      v: `${WELLNESS_STATS.streakDays} days`,
      to: "/patient/journal",
    },
    {
      icon: NotebookPen,
      l: "Journal entries this month",
      v: String(WELLNESS_STATS.entriesThisMonth),
      to: "/patient/journal",
    },
    {
      icon: Bell,
      l: "Notifications",
      v: String(unreadNotifications),
      to: "/patient/notifications",
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl bg-foreground text-background">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand/25 blur-3xl" />
        <div className="relative flex flex-col gap-8 p-8 sm:p-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-background/60">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              Your wellness space
            </p>
            <h1 className="mt-3 max-w-lg text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-3 max-w-md text-sm text-background/60">
              {nextSession
                ? `Your next session with ${nextSession.psychologistName} is ${formatDate(nextSession.date)} at ${nextSession.time}.`
                : "You don't have an upcoming session booked yet \u2014 find time with your care team."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/patient/sessions"
                className="rounded-full border border-background/25 px-4 py-2.5 text-sm font-semibold transition hover:bg-background/10"
              >
                View all sessions
              </Link>
              <Link
                to="/booking"
                search={{
                  name: primaryCarer.name,
                  role: primaryCarer.title,
                  price: primaryCarer.price,
                }}
                className="rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
              >
                Book a new session
              </Link>
            </div>
          </div>

          {nextSession && (
            <div className="w-full max-w-xs rounded-2xl border border-background/15 bg-background/10 p-5 backdrop-blur-md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-background/50">
                Up next
              </p>
              <div className="mt-3 flex items-center gap-3">
                <GradientAvatar name={nextSession.psychologistName} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{nextSession.psychologistName}</p>
                  <p className="text-xs text-background/60">{nextSession.kind}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-background/60">
                <span className="font-mono">
                  {formatDate(nextSession.date)} · {nextSession.time}
                </span>
                <span className="flex items-center gap-1">
                  <Video className="h-3 w-3" /> {nextSession.mode}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      <ScrollReveal>
        {/* ── KPI row ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to={stats[0].to}
            className="group relative overflow-hidden rounded-2xl border border-border bg-background p-6 transition hover:-translate-y-0.5 hover:border-brand/40 lg:col-span-2"
          >
            <div className="flex items-start justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-brand-foreground">
                <CalendarHeart className="h-4 w-4" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
            </div>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-black tracking-tight">{stats[0].v}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stats[0].l}</p>
              </div>
              <div className="h-14 w-28">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOOD_TREND}>
                    <defs>
                      <linearGradient id="dashMoodSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      dataKey="mood"
                      type="monotone"
                      stroke="var(--brand)"
                      strokeWidth={2}
                      fill="url(#dashMoodSpark)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Link>

          {stats.slice(1).map((s) => (
            <Link
              key={s.l}
              to={s.to}
              className="group rounded-2xl border border-border bg-background p-6 transition hover:-translate-y-0.5 hover:border-brand/40"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background">
                  <s.icon className="h-4 w-4" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </div>
              <p className="mt-6 text-3xl font-black tracking-tight">{s.v}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
            </Link>
          ))}
        </div>

        {/* ── Lower panels ── */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          {/* Upcoming sessions */}
          <section className="rounded-2xl border border-border bg-background p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upcoming sessions</h2>
              <Link
                to="/patient/sessions"
                className="text-xs font-semibold text-muted-foreground transition hover:text-foreground"
              >
                View all
              </Link>
            </div>
            <div className="relative mt-6 space-y-6 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-border">
              {upcomingSessions.map((s) => {
                const ModeIcon = MODE_ICON[s.mode];
                return (
                  <div key={s.id} className="relative flex items-start gap-4 pl-0">
                    <span className="relative z-10 mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-background bg-brand text-[10px] font-bold text-brand-foreground">
                      {formatDate(s.date).slice(0, 3)}
                    </span>
                    <div className="flex flex-1 items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <GradientAvatar name={s.psychologistName} size="sm" />
                        <div>
                          <p className="text-sm font-semibold">{s.psychologistName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(s.date)} · {s.time} · {s.kind}
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/patient/sessions"
                        search={{ open: s.id }}
                        className="shrink-0 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold transition hover:bg-muted"
                      >
                        Open
                      </Link>
                    </div>
                  </div>
                );
              })}
              {upcomingSessions.length === 0 && (
                <p className="text-sm text-muted-foreground">No upcoming sessions booked.</p>
              )}
            </div>
          </section>

          {/* Recent journal entries */}
          <section className="rounded-2xl border border-border bg-background p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent journal entries</h2>
              <Link
                to="/patient/journal"
                className="text-xs font-semibold text-muted-foreground transition hover:text-foreground"
              >
                View all
              </Link>
            </div>
            <StaggerContainer className="mt-4 space-y-3" staggerDelay={0.05}>
              {recentEntries.map((j) => (
                <StaggerItem key={j.id}>
                  <Link
                    to="/patient/journal"
                    search={{ open: j.id }}
                    className="flex items-start gap-3 rounded-xl border-l-4 border-l-brand/50 bg-muted/30 p-3 text-sm transition hover:bg-muted"
                  >
                    <span className="text-lg leading-none" aria-hidden>
                      {MOOD_EMOJI[j.mood]}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{j.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(j.date)}</p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        </div>
      </ScrollReveal>
    </div>
  );
}
