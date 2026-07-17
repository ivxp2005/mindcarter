import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Lock, NotebookPen, Quote } from "lucide-react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { GradientAvatar } from "../../components/gradient-avatar";
import { StaggerContainer, StaggerItem } from "../../components/scroll-reveal";
import { usePsychologistData } from "../../lib/psychologist-store";

export const Route = createFileRoute("/psychologist/diaries")({
  validateSearch: (search: Record<string, unknown>): { patient?: string } => ({
    patient: typeof search.patient === "string" ? search.patient : undefined,
  }),
  component: DiariesPage,
});

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatSessionDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DiariesPage() {
  const { patient: patientParam } = Route.useSearch();
  const { patients, meetings, diaryNotes, addDiaryNote } = usePsychologistData();

  const [selectedPatient, setSelectedPatient] = useState<string | null>(patientParam ?? null);
  const [sessionId, setSessionId] = useState<string>("");
  const [noteDraft, setNoteDraft] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (patientParam) setSelectedPatient(patientParam);
  }, [patientParam]);

  useEffect(() => {
    if (!selectedPatient && patients.length > 0) setSelectedPatient(patients[0].id);
  }, [selectedPatient, patients]);

  const today = todayISO();
  const notedBookingIds = useMemo(() => new Set(diaryNotes.map((n) => n.bookingId)), [diaryNotes]);

  /** Past / completed, non-canceled sessions for a patient that lack a note. */
  const eligibleSessionsFor = useMemo(
    () => (patientId: string) =>
      meetings
        .filter(
          (m) =>
            m.patientId === patientId &&
            m.status !== "canceled" &&
            m.date <= today &&
            !notedBookingIds.has(m.id),
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [meetings, notedBookingIds, today],
  );

  const detail = patients.find((p) => p.id === selectedPatient) ?? null;
  const patientNotes = detail ? diaryNotes.filter((n) => n.patientId === detail.id) : [];
  const eligibleSessions = detail ? eligibleSessionsFor(detail.id) : [];
  const selectedSession = eligibleSessions.find((m) => m.id === sessionId) ?? null;

  // Reset the composer whenever the open diary changes.
  useEffect(() => {
    setSessionId("");
    setNoteDraft("");
  }, [detail?.id]);

  const handleSaveClick = () => {
    if (!selectedSession || !noteDraft.trim()) return;
    setConfirmOpen(true);
  };

  const confirmSave = () => {
    if (!selectedSession || !noteDraft.trim()) return;
    addDiaryNote(selectedSession.id, noteDraft.trim());
    toast.success("Session note saved to the diary.");
    setConfirmOpen(false);
    setSessionId("");
    setNoteDraft("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Clinical notes
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Patient diaries</h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            One private diary per patient. Add a note after each session — once saved, a note is
            locked and can't be edited.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        {/* ── Patient list (each patient = one diary) ── */}
        <StaggerContainer className="space-y-2" staggerDelay={0.05}>
          {patients.map((p) => {
            const toDocument = eligibleSessionsFor(p.id).length;
            const noteCount = diaryNotes.filter((n) => n.patientId === p.id).length;
            return (
              <StaggerItem key={p.id}>
                <button
                  onClick={() => setSelectedPatient(p.id)}
                  className={`w-full rounded-2xl border-l-4 p-4 text-left transition ${
                    selectedPatient === p.id
                      ? "border-l-brand bg-brand/5"
                      : toDocument > 0
                        ? "border-l-brand/50 bg-background hover:bg-muted"
                        : "border-l-border bg-background hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <GradientAvatar name={p.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        {toDocument > 0 ? (
                          <Badge variant="secondary" className="shrink-0">
                            {toDocument} to document
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="shrink-0">
                            Up to date
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {p.primaryConcern || "No primary concern on file"}
                      </p>
                      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <NotebookPen className="h-3 w-3" />
                        {noteCount} {noteCount === 1 ? "note" : "notes"} in diary
                      </p>
                    </div>
                  </div>
                </button>
              </StaggerItem>
            );
          })}
          {patients.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No patients yet.
            </p>
          )}
        </StaggerContainer>

        {/* ── Selected patient's diary ── */}
        {detail ? (
          <section className="space-y-4">
            <div className="rounded-2xl border border-border bg-background p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <GradientAvatar name={detail.name} size="lg" />
                  <div>
                    <h2 className="text-xl font-black tracking-tight">{detail.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {detail.primaryConcern || "No primary concern on file"}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p className="text-2xl font-black text-foreground">{patientNotes.length}</p>
                  {patientNotes.length === 1 ? "note" : "notes"}
                </div>
              </div>

              {/* Add-note composer */}
              {eligibleSessions.length > 0 ? (
                <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-5">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    <NotebookPen className="h-3.5 w-3.5 text-brand" /> New session note
                  </p>
                  <div className="mt-3">
                    <Select value={sessionId} onValueChange={setSessionId}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Choose the session this note is for…" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleSessions.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {formatSessionDate(m.date)} · {m.kind} · {m.mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    rows={4}
                    placeholder="What did you learn about this patient in this session? Clinical observations, private notes…"
                    className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground"
                  />
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={handleSaveClick}
                      disabled={!selectedSession || !noteDraft.trim()}
                      className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Save note
                    </button>
                    <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Lock className="h-3 w-3" /> Saving is permanent — you can't edit it
                      afterwards.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                  {patientNotes.length > 0
                    ? "Every past session is documented. New notes unlock as more sessions take place."
                    : "No past sessions to document yet."}
                </div>
              )}
            </div>

            {/* Notes timeline (read-only, newest first) */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Diary — {patientNotes.length} {patientNotes.length === 1 ? "entry" : "entries"}
              </p>
              <StaggerContainer className="space-y-3" staggerDelay={0.05}>
                {patientNotes.map((n) => (
                  <StaggerItem key={n.id}>
                    <article className="rounded-2xl border border-border bg-background p-5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="flex items-center gap-2 text-sm font-semibold">
                          <CalendarClock className="h-4 w-4 text-brand" />
                          {formatSessionDate(n.sessionDate)}
                        </p>
                        <Badge
                          variant="outline"
                          className="flex shrink-0 items-center gap-1 text-muted-foreground"
                        >
                          <Lock className="h-3 w-3" /> Locked
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {n.sessionKind} · {n.sessionTime} · {n.sessionMode} · Noted {n.created}
                      </p>
                      <div className="relative mt-4 rounded-xl bg-muted/40 p-4">
                        <Quote className="h-4 w-4 text-brand/60" />
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
                          {n.content}
                        </p>
                      </div>
                    </article>
                  </StaggerItem>
                ))}
                {patientNotes.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    This diary is empty. Add a note for a past session to get started.
                  </p>
                )}
              </StaggerContainer>
            </div>
          </section>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
            Select a patient to open their diary.
          </div>
        )}
      </div>

      {/* Permanent-save confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save this note permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              Once saved, this session note can't be edited or deleted. Make sure it's complete
              before saving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>Save permanently</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
