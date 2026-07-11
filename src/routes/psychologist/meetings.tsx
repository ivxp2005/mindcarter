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
import { MEETINGS, TODAY, type Meeting, type MeetingStatus } from "../../lib/psychologist";

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
  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "past">("today");
  const [selected, setSelected] = useState<string | null>(open ?? null);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(parseISODate(TODAY));

  useEffect(() => {
    if (open) setSelected(open);
  }, [open]);

  const todayMeetings = MEETINGS.filter((m) => m.date === TODAY);
  const upcomingMeetings = MEETINGS.filter((m) => m.date > TODAY);
  const pastMeetings = MEETINGS.filter((m) => m.date < TODAY);
  const rowsByTab = { today: todayMeetings, upcoming: upcomingMeetings, past: pastMeetings };

  const meetingsThisWeek = MEETINGS.length;
  const avgDuration = Math.round(
    MEETINGS.reduce((sum, m) => sum + m.durationMin, 0) / MEETINGS.length,
  );
  const noShows = MEETINGS.filter((m) => m.status === "canceled").length;

  const nextUp = todayMeetings.find((m) => m.status === "upcoming");

  const detail = MEETINGS.find((m) => m.id === selected) ?? null;
  const closeDialog = () => {
    setSelected(null);
    navigate({ to: "/psychologist/meetings", search: {} });
  };

  const handleStart = (m: Meeting) => {
    toast.success(`Starting session with ${m.patientName}…`, {
      description: "Connecting to video room (mock).",
    });
  };
  const handleReschedule = (m: Meeting) => {
    toast(`Reschedule request sent for ${m.patientName} (mock).`);
    closeDialog();
  };

  const meetingDates = MEETINGS.map((m) => parseISODate(m.date));

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
                            {m.date === TODAY ? m.time : `${m.date} · ${m.time}`}
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
                      {detail.date === TODAY ? "Today" : detail.date} at {detail.time} (
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
              <DialogFooter>
                <button
                  onClick={() => handleReschedule(detail)}
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                >
                  Reschedule
                </button>
                <button
                  onClick={() => handleStart(detail)}
                  className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
                >
                  Start session
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
