import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Video, MapPin, Phone, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Calendar } from "../../components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { GradientAvatar } from "../../components/gradient-avatar";
import {
  CARE_TEAM,
  SESSIONS,
  TODAY,
  type PatientSession,
  type SessionStatus,
} from "../../lib/patient";

export const Route = createFileRoute("/patient/sessions")({
  validateSearch: (search: Record<string, unknown>): { open?: string } => ({
    open: typeof search.open === "string" ? search.open : undefined,
  }),
  component: SessionsPage,
});

function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const MODE_ICON = { Video, "In-person": MapPin, Phone } as const;

function statusBadge(status: SessionStatus) {
  if (status === "upcoming") return <Badge variant="secondary">Upcoming</Badge>;
  if (status === "completed") return <Badge variant="outline">Completed</Badge>;
  return <Badge variant="destructive">Canceled</Badge>;
}

function SessionsPage() {
  const { open } = Route.useSearch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "canceled">("upcoming");
  const [selected, setSelected] = useState<string | null>(open ?? null);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(parseISODate(TODAY));

  useEffect(() => {
    if (open) setSelected(open);
  }, [open]);

  const upcoming = SESSIONS.filter((s) => s.status === "upcoming");
  const past = SESSIONS.filter((s) => s.status === "completed");
  const canceled = SESSIONS.filter((s) => s.status === "canceled");
  const rowsByTab = { upcoming, past, canceled };

  const totalSessions = SESSIONS.length;
  const avgDuration = Math.round(
    SESSIONS.reduce((sum, s) => sum + s.durationMin, 0) / SESSIONS.length,
  );

  const nextUp = upcoming[0];

  const detail = SESSIONS.find((s) => s.id === selected) ?? null;
  const closeDialog = () => {
    setSelected(null);
    navigate({ to: "/patient/sessions", search: {} });
  };

  const handleJoin = (s: PatientSession) => {
    toast.success(`Joining session with ${s.psychologistName}…`, {
      description: "Connecting to video room (mock).",
    });
  };
  const handleReschedule = (s: PatientSession) => {
    toast(`Reschedule request sent to ${s.psychologistName} (mock).`);
    closeDialog();
  };
  const handleCancel = (s: PatientSession) => {
    toast(`Cancellation request sent for your ${formatDate(s.date)} session (mock).`);
    closeDialog();
  };

  function formatDate(dateStr: string) {
    if (dateStr === TODAY) return "Today";
    return parseISODate(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  const sessionDates = SESSIONS.map((s) => parseISODate(s.date));
  const primaryCarer = CARE_TEAM.find((c) => c.primary) ?? CARE_TEAM[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Schedule
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Sessions</h1>
        </div>
        <Link
          to="/booking"
          search={{ name: primaryCarer.name, role: primaryCarer.title, price: primaryCarer.price }}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
        >
          Book a new session
        </Link>
      </div>

      {nextUp && (
        <section className="relative overflow-hidden rounded-3xl bg-foreground p-6 text-background sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/25 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <GradientAvatar name={nextUp.psychologistName} size="xl" />
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-background/50">
                  <Sparkles className="h-3 w-3 text-brand" /> Next session
                </p>
                <p className="mt-1 text-xl font-black tracking-tight">{nextUp.psychologistName}</p>
                <p className="text-sm text-background/60">
                  {nextUp.kind} · {formatDate(nextUp.date)} at {nextUp.time} · {nextUp.durationMin}{" "}
                  min
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelected(nextUp.id)}
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
            >
              View details
            </button>
          </div>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-2xl border border-border bg-background p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
              <TabsTrigger value="canceled">Canceled ({canceled.length})</TabsTrigger>
            </TabsList>
            {(["upcoming", "past", "canceled"] as const).map((tab) => (
              <TabsContent key={tab} value={tab}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Psychologist</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rowsByTab[tab].map((s) => {
                      const ModeIcon = MODE_ICON[s.mode];
                      return (
                        <TableRow key={s.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <GradientAvatar name={s.psychologistName} size="sm" />
                              <span className="font-medium">{s.psychologistName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                            {formatDate(s.date)} · {s.time}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{s.kind}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <ModeIcon className="h-3.5 w-3.5" /> {s.mode}
                            </span>
                          </TableCell>
                          <TableCell>{statusBadge(s.status)}</TableCell>
                          <TableCell className="text-right">
                            <button
                              onClick={() => setSelected(s.id)}
                              className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold transition hover:bg-muted"
                            >
                              View
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {rowsByTab[tab].length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                          No sessions here.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-background p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Calendar</h2>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Has session
              </span>
            </div>
            <Calendar
              mode="single"
              selected={calendarDate}
              onSelect={setCalendarDate}
              modifiers={{ hasSession: sessionDates }}
              modifiersClassNames={{
                hasSession:
                  "relative after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-brand",
              }}
              className="w-full"
            />
          </section>
          <section className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-background py-4 text-center">
            <div>
              <p className="text-xl font-black">{totalSessions}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                Total sessions
              </p>
            </div>
            <div className="border-x border-border">
              <p className="text-xl font-black">{avgDuration}m</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                Avg duration
              </p>
            </div>
            <div>
              <p className="text-xl font-black">{canceled.length}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                Canceled
              </p>
            </div>
          </section>
        </div>
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          {detail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <GradientAvatar name={detail.psychologistName} size="lg" />
                  <div>
                    <DialogTitle>{detail.psychologistName}</DialogTitle>
                    <DialogDescription>
                      {detail.kind} · {detail.mode} · {formatDate(detail.date)} at {detail.time} (
                      {detail.durationMin} min)
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              {detail.notes && <p className="text-sm text-muted-foreground">{detail.notes}</p>}
              <div className="flex items-center gap-2">{statusBadge(detail.status)}</div>
              <Link
                to="/patient/care-team"
                className="text-sm font-semibold text-foreground underline underline-offset-2"
              >
                View care team profile →
              </Link>
              {detail.status === "upcoming" && (
                <DialogFooter>
                  <button
                    onClick={() => handleCancel(detail)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReschedule(detail)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleJoin(detail)}
                    className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
                  >
                    Join session
                  </button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
