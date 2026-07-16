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
import type { Meeting, MeetingStatus } from "../../lib/psychologist";
import { usePsychologistData } from "../../lib/psychologist-store";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** "09:00 AM" -> "09:00" for seeding a native <input type="time">. */
function to24hInput(slot: string): string {
  const m = slot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return slot;
  let hour = parseInt(m[1], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${m[2]}`;
}

export const Route = createFileRoute("/psychologist/meetings")({
  validateSearch: (search: Record<string, unknown>): { open?: string } => ({
    open: typeof search.open === "string" ? search.open : undefined,
  }),
  component: MeetingsPage,
});

function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const MODE_ICON = { Video, "In-person": MapPin, Phone } as const;

function statusBadge(status: MeetingStatus) {
  if (status === "upcoming") return <Badge variant="secondary">Upcoming</Badge>;
  if (status === "completed") return <Badge variant="outline">Completed</Badge>;
  return <Badge variant="destructive">Canceled</Badge>;
}

function MeetingsPage() {
  const { open } = Route.useSearch();
  const navigate = useNavigate();
  const { meetings, rescheduleMeeting, completeMeeting } = usePsychologistData();
  const today = todayISO();
  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "past">("today");
  const [selected, setSelected] = useState<string | null>(open ?? null);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(parseISODate(today));
  const [rescheduling, setRescheduling] = useState(false);
  const [rDate, setRDate] = useState("");
  const [rTime, setRTime] = useState("");

  useEffect(() => {
    if (open) setSelected(open);
  }, [open]);

  const todayMeetings = meetings.filter((m) => m.date === today);
  const upcomingMeetings = meetings.filter((m) => m.date > today);
  const pastMeetings = meetings.filter((m) => m.date < today);
  const rowsByTab = { today: todayMeetings, upcoming: upcomingMeetings, past: pastMeetings };

  const meetingsThisWeek = meetings.length;
  const avgDuration = meetings.length
    ? Math.round(meetings.reduce((sum, m) => sum + m.durationMin, 0) / meetings.length)
    : 0;
  const noShows = meetings.filter((m) => m.status === "canceled").length;

  const nextUp = todayMeetings.find((m) => m.status === "upcoming");

  const detail = meetings.find((m) => m.id === selected) ?? null;
  const closeDialog = () => {
    setSelected(null);
    setRescheduling(false);
    navigate({ to: "/psychologist/meetings", search: {} });
  };

  const handleStart = (m: Meeting) => {
    completeMeeting(m.id);
    toast.success(`Session with ${m.patientName} marked complete.`);
    closeDialog();
  };
  const openReschedule = (m: Meeting) => {
    setRDate(m.date);
    setRTime(to24hInput(m.time));
    setRescheduling(true);
  };
  const confirmReschedule = (m: Meeting) => {
    if (!rDate || !rTime) return;
    rescheduleMeeting(m.id, { date: rDate, time: rTime, mode: m.mode });
    toast.success(`Session with ${m.patientName} rescheduled.`);
    setRescheduling(false);
    closeDialog();
  };

  const meetingDates = meetings.map((m) => parseISODate(m.date));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Schedule
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Meetings</h1>
        </div>
      </div>

      {nextUp && (
        <section className="relative overflow-hidden rounded-3xl bg-foreground p-6 text-background sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/25 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <GradientAvatar name={nextUp.patientName} size="xl" />
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-background/50">
                  <Sparkles className="h-3 w-3 text-brand" /> Next up today
                </p>
                <p className="mt-1 text-xl font-black tracking-tight">{nextUp.patientName}</p>
                <p className="text-sm text-background/60">
                  {nextUp.kind} · {nextUp.time} · {nextUp.durationMin} min
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
              <TabsTrigger value="today">Today ({todayMeetings.length})</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming ({upcomingMeetings.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastMeetings.length})</TabsTrigger>
            </TabsList>
            {(["today", "upcoming", "past"] as const).map((tab) => (
              <TabsContent key={tab} value={tab}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rowsByTab[tab].map((m) => {
                      const ModeIcon = MODE_ICON[m.mode];
                      return (
                        <TableRow key={m.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <GradientAvatar name={m.patientName} size="sm" />
                              <span className="font-medium">{m.patientName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                            {m.date === today ? m.time : `${m.date} · ${m.time}`}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{m.kind}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <ModeIcon className="h-3.5 w-3.5" /> {m.mode}
                            </span>
                          </TableCell>
                          <TableCell>{statusBadge(m.status)}</TableCell>
                          <TableCell className="text-right">
                            <button
                              onClick={() => setSelected(m.id)}
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
                          No meetings here.
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
                <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Has meetings
              </span>
            </div>
            <Calendar
              mode="single"
              selected={calendarDate}
              onSelect={setCalendarDate}
              modifiers={{ hasMeeting: meetingDates }}
              modifiersClassNames={{
                hasMeeting:
                  "relative after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-brand",
              }}
              className="w-full"
            />
          </section>
          <section className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-background py-4 text-center">
            <div>
              <p className="text-xl font-black">{meetingsThisWeek}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                This week
              </p>
            </div>
            <div className="border-x border-border">
              <p className="text-xl font-black">{avgDuration}m</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                Avg duration
              </p>
            </div>
            <div>
              <p className="text-xl font-black">{noShows}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                No-shows
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
                  <GradientAvatar name={detail.patientName} size="lg" />
                  <div>
                    <DialogTitle>{detail.patientName}</DialogTitle>
                    <DialogDescription>
                      {detail.kind} · {detail.mode} ·{" "}
                      {detail.date === today ? "Today" : detail.date} at {detail.time} (
                      {detail.durationMin} min)
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              {detail.notes && <p className="text-sm text-muted-foreground">{detail.notes}</p>}
              <div className="flex items-center gap-2">{statusBadge(detail.status)}</div>
              {detail.patientId && (
                <Link
                  to="/psychologist/patients"
                  search={{ open: detail.patientId }}
                  className="text-sm font-semibold text-foreground underline underline-offset-2"
                >
                  View patient record →
                </Link>
              )}
              {rescheduling && (
                <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border p-3">
                  <label className="text-xs">
                    Date
                    <input
                      type="date"
                      value={rDate}
                      min={today}
                      onChange={(e) => setRDate(e.target.value)}
                      className="mt-1 block rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-foreground"
                    />
                  </label>
                  <label className="text-xs">
                    Time
                    <input
                      type="time"
                      value={rTime}
                      onChange={(e) => setRTime(e.target.value)}
                      className="mt-1 block rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-foreground"
                    />
                  </label>
                  <button
                    onClick={() => confirmReschedule(detail)}
                    className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
                  >
                    Confirm
                  </button>
                </div>
              )}
              <DialogFooter>
                {!rescheduling && (
                  <button
                    onClick={() => openReschedule(detail)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                  >
                    Reschedule
                  </button>
                )}
                {detail.status === "upcoming" && (
                  <button
                    onClick={() => handleStart(detail)}
                    className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
                  >
                    Start session
                  </button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
