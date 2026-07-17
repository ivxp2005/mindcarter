import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { usePatientData, parseISODate } from "../lib/patient-store";
import { getClinicianBookedSlotsFn } from "../lib/patient-data.server";
import { todayISO, type PatientSession } from "../lib/patient";

const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];
const KINDS = ["Individual Therapy", "Executive Coaching", "Assessment", "Follow-up"];
const MODES: PatientSession["mode"][] = ["Video", "In-person", "Phone"];

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * In-portal booking dialog — a single instance lives inside PatientDataProvider
 * and is opened from anywhere via `openBooking()` / `openReschedule()`. Past
 * dates are disabled and already-taken slots are greyed, so a booking can never
 * land in the past or double-book a clinician.
 */
export function BookSessionDialog() {
  const {
    careTeam,
    clinicians,
    bookingOpen,
    bookingPresetId,
    rescheduleSessionId,
    sessions,
    closeBooking,
    bookSession,
    rescheduleSession,
    isSlotTaken,
  } = usePatientData();

  const isReschedule = !!rescheduleSessionId;
  const editing = sessions.find((s) => s.id === rescheduleSessionId) ?? null;

  const [psychId, setPsychId] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>("");
  const [kind, setKind] = useState<string>(KINDS[0]);
  const [mode, setMode] = useState<PatientSession["mode"]>("Video");

  // Re-seed the form each time the dialog opens.
  useEffect(() => {
    if (!bookingOpen) return;
    if (editing) {
      setPsychId(editing.psychologistId);
      setDate(parseISODate(editing.date));
      setTime(editing.time);
      setKind(editing.kind);
      setMode(editing.mode);
    } else {
      setPsychId(bookingPresetId ?? careTeam.find((m) => m.primary)?.id ?? clinicians[0]?.id ?? "");
      setDate(undefined);
      setTime("");
      setKind(KINDS[0]);
      setMode("Video");
    }
  }, [bookingOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Slots this clinician is already booked for, across ALL patients — so a slot
  // another patient took shows as unavailable here too.
  const { data: clinicianSlots = [] } = useQuery({
    queryKey: ["clinician-booked", psychId],
    queryFn: () => getClinicianBookedSlotsFn({ data: { psychologistId: psychId } }),
    enabled: !!psychId && bookingOpen,
  });

  const isoDate = date ? toISO(date) : "";
  const canSubmit = !!psychId && !!isoDate && !!time && !!kind;

  /** A slot is unavailable if this clinician is already booked for it (any
   *  patient) or the current patient has another session then — except the very
   *  slot being rescheduled, which the patient may keep. */
  const isSlotUnavailable = (slot: string): boolean => {
    if (!isoDate) return false;
    const isOwnEditingSlot = !!editing && editing.date === isoDate && editing.time === slot;
    if (isOwnEditingSlot) return false;
    const takenByClinician = clinicianSlots.some((s) => s.date === isoDate && s.time === slot);
    return takenByClinician || isSlotTaken(isoDate, slot);
  };

  // Earliest bookable day is tomorrow — today and all past days are unavailable.
  const tomorrow = parseISODate(todayISO());
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      if (isReschedule && editing) {
        const result = await rescheduleSession(editing.id, { date: isoDate, time, mode });
        if (!result.ok) {
          toast.error("Couldn't reschedule", {
            description: result.error ?? "Pick a future date and an open time.",
          });
          return;
        }
        toast.success("Session rescheduled", {
          description: `Now ${isoDate} at ${time}.`,
        });
        closeBooking();
        return;
      }
      const durationMin = kind === "Executive Coaching" || kind === "Assessment" ? 60 : 50;
      const result = await bookSession({
        psychologistId: psychId,
        date: isoDate,
        time,
        kind,
        mode,
        durationMin,
      });
      if (!result.ok) {
        toast.error("That slot isn't available", {
          description: result.error ?? "Pick a future date and an open time.",
        });
        return;
      }
      const name = clinicians.find((m) => m.id === psychId)?.name ?? "your clinician";
      toast.success("Session booked", {
        description: `${kind} with ${name} on ${isoDate} at ${time}.`,
      });
      closeBooking();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={bookingOpen} onOpenChange={(o) => !o && closeBooking()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isReschedule ? "Reschedule session" : "Book a session"}</DialogTitle>
          <DialogDescription>
            {isReschedule
              ? "Pick a new date and time for this session."
              : "Choose a clinician, date and time. Past dates and taken slots are unavailable."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Clinician */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Clinician
            </label>
            <Select value={psychId} onValueChange={setPsychId} disabled={isReschedule}>
              <SelectTrigger>
                <SelectValue placeholder="Select a clinician" />
              </SelectTrigger>
              <SelectContent>
                {clinicians.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} · {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Date
            </label>
            <div className="flex justify-center rounded-xl border border-border">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d);
                  setTime("");
                }}
                disabled={{ before: tomorrow }}
              />
            </div>
          </div>

          {/* Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Time
            </label>
            <Select value={time} onValueChange={setTime} disabled={!isoDate}>
              <SelectTrigger>
                <SelectValue placeholder={isoDate ? "Select a time" : "Pick a date first"} />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => {
                  const taken = isSlotUnavailable(slot);
                  return (
                    <SelectItem key={slot} value={slot} disabled={taken}>
                      {slot}
                      {taken ? " · booked" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Type + Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Type
              </label>
              <Select value={kind} onValueChange={setKind} disabled={isReschedule}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KINDS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Mode
              </label>
              <Select value={mode} onValueChange={(v) => setMode(v as PatientSession["mode"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODES.map((mo) => (
                    <SelectItem key={mo} value={mo}>
                      {mo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={closeBooking}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-muted active:translate-y-0 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canSubmit || submitting}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {submitting
              ? isReschedule
                ? "Rescheduling…"
                : "Booking…"
              : isReschedule
                ? "Confirm reschedule"
                : "Confirm booking"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
