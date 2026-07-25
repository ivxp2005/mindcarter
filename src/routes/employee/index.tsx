import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarHeart,
  Flame,
  NotebookPen,
  Bell,
  ArrowUpRight,
  Sparkles,
  Video,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../../components/scroll-reveal";
import { GradientAvatar } from "../../components/gradient-avatar";
import { CountUp } from "../../components/count-up";
import { useSession } from "../../lib/use-session";
import { usePatientData } from "../../lib/patient-store";
import { MOOD_EMOJI, MOOD_LABEL, todayISO, type Mood } from "../../lib/patient";
import { useMoodCheckIn } from "../../lib/use-mood-checkin";
import { PortalHeroBg } from "../../components/portal-hero-bg";

export const Route = createFileRoute("/employee/")({
  component: EmployeeDashboard,
});

/** Premium ease-out — matches the marketing site's motion language. */
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function formatDate(dateStr: string) {
  if (dateStr === todayISO()) return "Today";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/** Small live wall-clock, mirrors the marketing home page's live pulse. */
function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-3 py-1.5 text-xs font-medium text-background/70 backdrop-blur">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75 motion-reduce:animate-none" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
      </span>
      Live · {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

function EmployeeDashboard() {
  const { data: session } = useSession();
  const firstName = session?.name?.split(" ")[0] ?? "there";

  const {
    upcoming: upcomingSessions,
    journal,
    stats,
    moodTrend,
    checkInMood,
  } = usePatientData();
  const nextSession = upcomingSessions[0];
  const recentEntries = journal.slice(0, 4);
  const unreadNotifications = stats.unreadCount;

  const { checkedInMood, isEditingWindow, isLockedIn, remainingSec, handleCheckIn } =
    useMoodCheckIn(journal, (m) => {
      checkInMood(m);
      toast.success(`Mood logged: ${MOOD_LABEL[m]} ${MOOD_EMOJI[m]}`);
    });
  // Show the check-in prompt only while nothing is logged yet today, or while
  // the 10s edit window from the first click this session is still open.
  const showMoodCheckIn = !isLockedIn;

  // The four headline metrics, described as data so every tile renders through
  // one layout. `context` is always derived from real state — no invented
  // trend percentages.
  const statTiles = [
    {
      label: "Next session",
      to: "/employee/sessions",
      icon: CalendarHeart,
      chip: "bg-brand text-brand-foreground",
      value: nextSession ? formatDate(nextSession.date) : "None booked",
      context: nextSession
        ? `${nextSession.psychologistName} · ${nextSession.time}`
        : "Book when you're ready",
    },
    {
      label: "Wellness streak",
      to: "/employee/journal",
      icon: Flame,
      chip: "bg-foreground text-background",
      pulse: true,
      value: (
        <>
          <CountUp value={stats.streakDays} /> days
        </>
      ),
      context: stats.streakDays > 0 ? "Keep it going" : "Check in to start one",
    },
    {
      label: "Journal entries",
      to: "/employee/journal",
      icon: NotebookPen,
      chip: "bg-foreground text-background",
      value: <CountUp value={stats.entriesThisMonth} />,
      context: "This month",
      spark: true,
    },
    {
      label: "Notifications",
      to: "/employee/notifications",
      icon: Bell,
      chip: "bg-foreground text-background",
      value: <CountUp value={unreadNotifications} />,
      context: unreadNotifications > 0 ? "Tap to review" : "You're all caught up",
    },
  ];

  return (
    <div className="space-y-4">
      {/* ─────────────────────────── Hero band ─────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-foreground text-background">
        <PortalHeroBg />
        {/* Drifting gold glow */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand/25 blur-3xl"
          animate={{ scale: [1, 1.18, 1], x: [0, 24, 0], y: [0, -14, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative flex flex-col gap-8 p-[clamp(1.5rem,5vw,2.5rem)] lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-background/60 sm:tracking-[0.24em]">
                <motion.span
                  animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand" />
                </motion.span>
                Your wellness space
              </p>
              <span className="hidden sm:inline-flex">
                <LiveClock />
              </span>
            </div>

            <h1 className="font-display mt-3 max-w-lg overflow-hidden break-words text-[clamp(1.75rem,1.1rem+2.6vw,3rem)] font-black leading-[1.05] tracking-tight">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.75, ease: EASE_OUT }}
              >
                Welcome back, {firstName}.
              </motion.span>
            </h1>
            <motion.p
              className="mt-3 max-w-md text-sm text-background/60"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
            >
              {nextSession
                ? `Your next session with ${nextSession.psychologistName} is ${formatDate(nextSession.date)} at ${nextSession.time}.`
                : "You don't have an upcoming session booked yet — find time with your care team."}
            </motion.p>
            <motion.div
              className="mt-6 flex flex-wrap gap-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32, ease: EASE_OUT }}
            >
              <Link
                to="/employee/book"
                className="rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-lg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95"
              >
                Book a new session
              </Link>
              <Link
                to="/employee/sessions"
                className="rounded-full border border-background/25 px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-background/10 active:translate-y-0 active:scale-95"
              >
                View all sessions
              </Link>
            </motion.div>
          </div>

          {nextSession && (
            <motion.div
              className="group w-full max-w-xs rounded-2xl border border-background/15 bg-background/10 p-5 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand/40 hover:bg-background/[0.14]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28, ease: EASE_OUT }}
            >
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-background/50">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
                </span>
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
            </motion.div>
          )}
        </div>
      </section>

      {/* ─────────────────────── Mood check-in strip ────────────────────── */}
      {showMoodCheckIn && (
        <ScrollReveal>
          <section className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">How are you feeling today?</p>
              <p className="text-xs text-muted-foreground">
                {checkedInMood
                  ? `Logged — feeling ${MOOD_LABEL[checkedInMood].toLowerCase()}. See you in the journal.`
                  : "A quick check-in keeps your streak alive."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {([1, 2, 3, 4, 5] as Mood[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleCheckIn(m)}
                    aria-label={MOOD_LABEL[m]}
                    title={MOOD_LABEL[m]}
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xl transition-all duration-200 ease-out hover:-translate-y-1 active:scale-90 sm:h-11 sm:w-11 sm:text-2xl ${
                      checkedInMood === m
                        ? "bg-brand/20 ring-2 ring-brand"
                        : "bg-muted hover:bg-muted/70"
                    }`}
                  >
                    {MOOD_EMOJI[m]}
                  </button>
                ))}
              </div>
              {isEditingWindow && (
                <span className="whitespace-nowrap rounded-full bg-muted px-2.5 py-1 text-xs font-semibold tabular-nums text-muted-foreground">
                  You can still change · {remainingSec}s
                </span>
              )}
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* ─────────────────────────── KPI tiles ─────────────────────────── */}
      <ScrollReveal>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statTiles.map((tile) => (
            <Link
              key={tile.label}
              to={tile.to}
              className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-background p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]"
            >
              <div className="flex items-start justify-between gap-2">
                {tile.pulse ? (
                  <motion.span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tile.chip}`}
                    animate={{ scale: [1, 1.12, 1], rotate: [0, -6, 6, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <tile.icon className="h-4 w-4" />
                  </motion.span>
                ) : (
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-rotate-3 ${tile.chip}`}
                  >
                    <tile.icon className="h-4 w-4" />
                  </span>
                )}
                <ArrowUpRight className="h-4 w-4 shrink-0 translate-y-1 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" />
              </div>

              <p className="mt-4 truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {tile.label}
              </p>
              <p className="mt-1 truncate text-2xl font-black tracking-tight sm:text-3xl">
                {tile.value}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{tile.context}</p>

              {tile.spark && (
                <div className="mt-auto pt-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                    Mood · 8 wks
                  </p>
                  <div className="mt-1 h-10 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={moodTrend} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                        <defs>
                          <linearGradient id="dashMoodSpark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <YAxis domain={[1, 5]} hide />
                        <Area
                          dataKey="mood"
                          type="monotone"
                          stroke="var(--brand)"
                          strokeWidth={2}
                          fill="url(#dashMoodSpark)"
                          isAnimationActive
                          animationDuration={1400}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </ScrollReveal>

      {/* ─────────────────────────── Lower panels ─────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        {/* Upcoming sessions timeline */}
        <ScrollReveal className="min-w-0 rounded-2xl border border-border bg-background p-6">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand">
                <CalendarHeart className="h-4 w-4" />
              </span>
              <h2 className="truncate text-base font-bold tracking-tight">Upcoming sessions</h2>
            </div>
            <Link
              to="/employee/sessions"
              className="group flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition-all duration-200 ease-out hover:border-brand/40 hover:text-foreground"
            >
              View all
              <ArrowUpRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <div className="relative mt-6 space-y-6">
            {/* Timeline connector — draws downward on reveal */}
            {upcomingSessions.length > 0 && (
              <motion.span
                aria-hidden
                className="absolute bottom-2 left-[15px] top-2 w-px origin-top bg-border"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: EASE_OUT }}
              />
            )}
            <StaggerContainer className="space-y-6" staggerDelay={0.08}>
              {upcomingSessions.map((s) => {
                const isToday = s.date === todayISO();
                return (
                  <StaggerItem key={s.id}>
                    <div className="relative flex items-start gap-4">
                      <span
                        className={`relative z-10 mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-background text-[10px] font-bold ${
                          isToday
                            ? "bg-brand text-brand-foreground"
                            : "bg-foreground text-background"
                        }`}
                      >
                        {isToday && (
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60 motion-reduce:animate-none" />
                        )}
                        <span className="relative">{formatDate(s.date).slice(0, 3)}</span>
                      </span>
                      <div className="group flex flex-1 items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 transition-all duration-200 ease-out hover:border-brand/40 hover:bg-muted">
                        <div className="flex min-w-0 items-center gap-3">
                          <GradientAvatar name={s.psychologistName} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{s.psychologistName}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {formatDate(s.date)} · {s.time} · {s.kind}
                            </p>
                          </div>
                        </div>
                        <Link
                          to="/employee/sessions"
                          search={{ open: s.id }}
                          className="shrink-0 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold transition hover:bg-foreground hover:text-background"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
            {upcomingSessions.length === 0 && (
              <p className="text-sm text-muted-foreground">No upcoming sessions booked.</p>
            )}
          </div>
        </ScrollReveal>

        {/* Recent journal entries */}
        <ScrollReveal className="min-w-0 rounded-2xl border border-border bg-background p-6">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand">
                <NotebookPen className="h-4 w-4" />
              </span>
              <h2 className="truncate text-base font-bold tracking-tight">Recent entries</h2>
            </div>
            <Link
              to="/employee/journal"
              className="group flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition-all duration-200 ease-out hover:border-brand/40 hover:text-foreground"
            >
              View all
              <ArrowUpRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <StaggerContainer className="mt-4 space-y-3" staggerDelay={0.05}>
            {recentEntries.map((j) => (
              <StaggerItem key={j.id}>
                <Link
                  to="/employee/journal"
                  search={{ open: j.id }}
                  className="group flex items-start gap-3 rounded-xl border-l-4 border-l-brand/50 bg-muted/30 p-3 text-sm transition-all duration-200 ease-out hover:translate-x-0.5 hover:border-l-brand hover:bg-muted"
                >
                  <span
                    className="text-lg leading-none transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-110"
                    aria-hidden
                  >
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
        </ScrollReveal>
      </div>
    </div>
  );
}
