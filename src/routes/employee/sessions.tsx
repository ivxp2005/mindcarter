import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Video, MapPin, Phone, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Badge } from "../../components/ui/badge";
import { GradientAvatar } from "../../components/gradient-avatar";
import { CountUp } from "../../components/count-up";
import { ScrollReveal } from "../../components/scroll-reveal";
import { usePatientData } from "../../lib/patient-store";
import { todayISO, type PatientSession, type SessionStatus } from "../../lib/patient";

export const Route = createFileRoute("/employee/sessions")({
  validateSearch: (search: Record<string, unknown>): { open?: string } => ({
    open: typeof search.open === "string" ? search.open : undefined,
  }),
  component: SessionsPage,
});

/** Premium ease-out — matches the marketing site's motion language. */
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const MODE_ICON = { Video, "In-person": MapPin, Phone } as const;

/** A session can still carry status "upcoming" after its date has passed if
 *  nobody explicitly marked it complete/canceled — treat it as elapsed so the
 *  UI (tab placement, badge, action buttons) reflects reality instead of a
 *  stale status field. */
function isElapsed(s: PatientSession): boolean {
  return s.status === "upcoming" && s.date < todayISO();
}

function effectiveStatus(s: PatientSession): SessionStatus {
  return isElapsed(s) ? "completed" : s.status;
}

function statusBadge(status: SessionStatus) {
  if (status === "upcoming") return <Badge variant="secondary">Upcoming</Badge>;
  if (status === "completed") return <Badge variant="outline">Completed</Badge>;
  return <Badge variant="destructive">Canceled</Badge>;
}

function SessionsPage() {
  const { open } = Route.useSearch();
  const navigate = useNavigate();
  const { sessions, upcoming, past, canceled, openReschedule, cancelSession } = usePatientData();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "canceled">("upcoming");
  const [selected, setSelected] = useState<string | null>(open ?? null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(parseISODate(todayISO()));

  useEffect(() => {
    if (open) setSelected(open);
  }, [open]);

  const rowsByTab = { upcoming, past, canceled };

  const totalSessions = sessions.length;
  const avgDuration = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + s.durationMin, 0) / sessions.length)
    : 0;

  const nextUp = upcoming[0];

  const detail = sessions.find((s) => s.id === selected) ?? null;
  const closeDialog = () => {
    setSelected(null);
    navigate({ to: "/employee/sessions", search: {} });
  };

  const handleJoin = (s: PatientSession) => {
    if (!s.meetLink) return;
    window.open(s.meetLink, "_blank", "noopener,noreferrer");
  };
  const handleReschedule = (s: PatientSession) => {
    closeDialog();
    openReschedule(s);
  };
  const confirmCancelSession = () => {
    if (!detail) return;
    cancelSession(detail.id);
    toast.success(`Your ${formatDate(detail.date)} session was canceled.`);
    setConfirmCancel(false);
    closeDialog();
  };

  function formatDate(dateStr: string) {
    if (dateStr === todayISO()) return "Today";
    return parseISODate(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  const sessionDates = sessions.map((s) => parseISODate(s.date));

  const stats = [
    { label: "Total sessions", value: totalSessions, suffix: "" },
    { label: "Avg duration", value: avgDuration, suffix: "m" },
    { label: "Canceled", value: canceled.length, suffix: "" },
  ];

  return (
    <div className="space-y-4">
      {/* ─────────────────────────── Hero band ─────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-foreground text-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand/25 blur-3xl"
          animate={{ scale: [1, 1.18, 1], x: [0, 24, 0], y: [0, -14, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative flex flex-col gap-8 p-8 sm:p-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-background/60">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Schedule
            </p>
            <h1 className="font-display mt-3 overflow-hidden text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.75, ease: EASE_OUT }}
              >
                Sessions
              </motion.span>
            </h1>
            <motion.p
              className="mt-3 max-w-md text-sm text-background/60"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
            >
              Every appointment with your care team — upcoming, past and canceled — in one place.
            </motion.p>
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32, ease: EASE_OUT }}
            >
              <Link
                to="/employee/book"
                className="inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-lg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95"
              >
                Book a new session
              </Link>
            </motion.div>
          </div>

          {nextUp && (
            <motion.button
              onClick={() => setSelected(nextUp.id)}
              className="group w-full max-w-xs rounded-2xl border border-background/15 bg-background/10 p-5 text-left backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand/40 hover:bg-background/[0.14]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28, ease: EASE_OUT }}
            >
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-background/50">
                <Sparkles className="h-3 w-3 text-brand" /> Next session
              </p>
              <div className="mt-3 flex items-center gap-3">
                <GradientAvatar name={nextUp.psychologistName} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{nextUp.psychologistName}</p>
                  <p className="text-xs text-background/60">{nextUp.kind}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-background/60">
                <span className="font-mono">
                  {formatDate(nextUp.date)} · {nextUp.time}
                </span>
                <span>{nextUp.durationMin} min</span>
              </div>
              <span className="mt-4 inline-block text-[11px] font-semibold text-brand transition-transform duration-200 group-hover:translate-x-0.5">
                View details →
              </span>
            </motion.button>
          )}
        </div>
      </section>

      {/* ─────────────────────────── Stat tiles ─────────────────────────── */}
      <ScrollReveal>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-background p-5 text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]"
            >
              <p className="text-2xl font-black tracking-tight sm:text-3xl">
                <CountUp value={s.value} />
                {s.suffix}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* ─────────────────────── Table + calendar ─────────────────────── */}
      <div className="grid min-w-0 gap-4 overflow-x-hidden lg:grid-cols-[1.3fr_1fr]">
        <ScrollReveal className="min-w-0 rounded-2xl border border-border bg-background p-6">
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
                        <TableRow
                          key={s.id}
                          className="group cursor-pointer transition-colors hover:bg-muted/60"
                          onClick={() => setSelected(s.id)}
                        >
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
                          <TableCell>{statusBadge(effectiveStatus(s))}</TableCell>
                          <TableCell className="text-right">
                            <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold transition group-hover:bg-foreground group-hover:text-background">
                              View
                            </span>
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
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="min-w-0">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-background p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Calendar</h2>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Has session
              </span>
            </div>
            <Calendar
              mode="single"
              selected={calendarDate}
              onSelect={setCalendarDate}
              disabled={{ before: parseISODate(todayISO()) }}
              modifiers={{ hasSession: sessionDates }}
              modifiersClassNames={{
                hasSession:
                  "relative after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-brand",
              }}
              className="w-full"
            />
          </section>
        </ScrollReveal>
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
              <div className="flex items-center gap-2">{statusBadge(effectiveStatus(detail))}</div>
              <Link
                to="/employee/care-team"
                className="text-sm font-semibold text-foreground underline underline-offset-2"
              >
                View care team profile →
              </Link>
              {effectiveStatus(detail) === "upcoming" && (
                <DialogFooter>
                  <button
                    onClick={() => setConfirmCancel(true)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-muted active:translate-y-0 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReschedule(detail)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-muted active:translate-y-0 active:scale-95"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleJoin(detail)}
                    disabled={!detail.meetLink}
                    title={detail.meetLink ? undefined : "Join link isn't ready yet"}
                    className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {detail.meetLink ? "Join session" : "Link not ready yet"}
                  </button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Cancel this session with {detail?.psychologistName}
              {detail ? ` on ${formatDate(detail.date)} at ${detail.time}` : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>Your payment will be refunded.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Never mind</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelSession}>Cancel session</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
