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
import { TIME_SLOTS, MODES, earliestBookable } from "../lib/booking-flow";
import type { PatientSession } from "../lib/patient";

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Reschedule dialog — a single instance lives inside PatientDataProvider and is
 * opened via `openReschedule(session)`. New bookings go through the multi-page
 * flow at /employee/book instead; rescheduling stays a light date/time/mode
 * edit here since the session is already paid for.
 */
export function RescheduleSessionDialog() {
  const {
    bookingOpen,
    rescheduleSessionId,
    sessions,
    closeBooking,
    rescheduleSession,
    isSlotTaken,
  } = usePatientData();

  const editing = sessions.find((s) => s.id === rescheduleSessionId) ?? null;

  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>("");
  const [mode, setMode] = useState<PatientSession["mode"]>("Video");

  // Re-seed the form each time the dialog opens.
  useEffect(() => {
    if (!bookingOpen || !editing) return;
    setDate(parseISODate(editing.date));
    setTime(editing.time);
    setMode(editing.mode);
  }, [bookingOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Slots this clinician is already booked for, across ALL patients — so a slot
  // another patient took shows as unavailable here too.
  const psychId = editing?.psychologistId ?? "";
  const { data: clinicianSlots = [] } = useQuery({
    queryKey: ["clinician-booked", psychId],
    queryFn: () => getClinicianBookedSlotsFn({ data: { psychologistId: psychId } }),
    enabled: !!psychId && bookingOpen,
  });

  const isoDate = date ? toISO(date) : "";
  const canSubmit = !!editing && !!isoDate && !!time;

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

  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!canSubmit || submitting || !editing) return;
    setSubmitting(true);
    try {
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={bookingOpen} onOpenChange={(o) => !o && closeBooking()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule session</DialogTitle>
          <DialogDescription>
            Pick a new date and time for this session. Past dates and taken slots are unavailable.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
                disabled={{ before: earliestBookable() }}
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

          {/* Mode */}
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
            {submitting ? "Rescheduling…" : "Confirm reschedule"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
