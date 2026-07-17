import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarDays, Users, Notebook, Bell, ArrowUpRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../../components/scroll-reveal";
import { GradientAvatar } from "../../components/gradient-avatar";
import { usePsychologistData } from "../../lib/psychologist-store";

export const Route = createFileRoute("/psychologist/")({
  component: PsychologistDashboard,
});

function PsychologistDashboard() {
  const navigate = useNavigate();
  const { todayMeetings, diaryNotes, stats, weeklySessions, profile } = usePsychologistData();
  const nextMeeting = todayMeetings.find((m) => m.status === "upcoming");
  const recentNotes = diaryNotes.slice(0, 4);
  const firstName = profile?.name.split(" ").pop() ?? "there";

  const handleStartNext = () => {
    if (!nextMeeting) return;
    toast.success(`Starting session with ${nextMeeting.patientName}…`, {
      description: "Connecting to video room.",
    });
    navigate({ to: "/psychologist/meetings", search: { open: nextMeeting.id } });
  };

  const kpis = [
    {
      icon: CalendarDays,
      l: "Today's meetings",
      v: String(stats.todaysMeetings),
      to: "/psychologist/meetings",
    },
    {
      icon: Users,
      l: "Active patients",
      v: String(stats.activePatients),
      to: "/psychologist/patients",
    },
    {
      icon: Notebook,
      l: "Sessions to document",
      v: String(stats.sessionsToDocument),
      to: "/psychologist/diaries",
    },
    {
      icon: Bell,
      l: "Notifications",
      v: String(stats.notificationsTotal),
      to: "/psychologist/notifications",
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Hero */}
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
              Practice overview
            </p>
            <h1 className="mt-3 max-w-lg text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
              Good to see you, {firstName}.
            </h1>
            <p className="mt-3 max-w-md text-sm text-background/60">
              You have {todayMeetings.length} sessions on the calendar today.
            </p>
            <div className="mt-6 flex gap-2">
              <Link
                to="/psychologist/meetings"
                className="rounded-full border border-background/25 px-4 py-2.5 text-sm font-semibold transition hover:bg-background/10"
              >
                Open calendar
              </Link>
              <button
                onClick={handleStartNext}
                disabled={!nextMeeting}
                className="rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {nextMeeting ? "Start next session" : "No more sessions today"}
              </button>
            </div>
          </div>

          {nextMeeting && (
            <div className="w-full max-w-xs rounded-2xl border border-background/15 bg-background/10 p-5 backdrop-blur-md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-background/50">
                Up next
              </p>
              <div className="mt-3 flex items-center gap-3">
                <GradientAvatar name={nextMeeting.patientName} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{nextMeeting.patientName}</p>
                  <p className="text-xs text-background/60">{nextMeeting.kind}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-background/60">
                <span className="font-mono">{nextMeeting.time}</span>
                <span>
                  {nextMeeting.durationMin} min · {nextMeeting.mode}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      <ScrollReveal>
        {/* Bento KPI row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to={kpis[0].to}
            className="group relative overflow-hidden rounded-2xl border border-border bg-background p-6 transition hover:-translate-y-0.5 hover:border-brand/40 lg:col-span-2"
          >
            <div className="flex items-start justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-brand-foreground">
                <CalendarDays className="h-4 w-4" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
            </div>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-black tracking-tight">{kpis[0].v}</p>
                <p className="mt-1 text-sm text-muted-foreground">{kpis[0].l}</p>
              </div>
              <div className="h-14 w-28">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklySessions}>
                    <defs>
                      <linearGradient id="dashSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      dataKey="sessions"
                      type="monotone"
                      stroke="var(--brand)"
                      strokeWidth={2}
                      fill="url(#dashSpark)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Link>

          {kpis.slice(1).map((s) => (
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

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <section className="rounded-2xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold">Today's schedule</h2>
            <div className="relative mt-6 space-y-6 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-border">
              {todayMeetings.map((m) => (
                <div key={m.id} className="relative flex items-start gap-4 pl-0">
                  <span className="relative z-10 mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-background bg-brand text-[10px] font-bold text-brand-foreground">
                    {m.time.slice(0, 2)}
                  </span>
                  <div className="flex flex-1 items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <GradientAvatar name={m.patientName} size="sm" />
                      <div>
                        <p className="text-sm font-semibold">{m.patientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.time} · {m.kind}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/psychologist/meetings"
                      search={{ open: m.id }}
                      className="shrink-0 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold transition hover:bg-muted"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold">Recent session notes</h2>
            <StaggerContainer className="mt-4 space-y-3" staggerDelay={0.05}>
              {recentNotes.map((n) => (
                <StaggerItem key={n.id}>
                  <Link
                    to="/psychologist/diaries"
                    search={{ patient: n.patientId }}
                    className="block rounded-xl border-l-4 border-l-brand bg-muted/30 p-3 text-sm transition hover:bg-muted"
                  >
                    <p className="font-medium">{n.patientName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {n.sessionKind} · Noted {n.created}
                    </p>
                  </Link>
                </StaggerItem>
              ))}
              {recentNotes.length === 0 && (
                <p className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  No session notes yet.
                </p>
              )}
            </StaggerContainer>
          </section>
        </div>
      </ScrollReveal>
    </div>
  );
}
