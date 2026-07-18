import { todayISO, type PatientSession } from "./patient";

// ─────────────────────────────────────────────────────────────────────────────
// Shared booking constants + pure helpers, used by the /employee/book pages and
// the reschedule dialog so slot rules can never drift between the two.
//
// KIND labels must stay byte-identical to the keys of LABEL_TO_KIND in
// src/lib/patient-data.server.ts — the server silently falls back to
// "individual_therapy" for any unknown label.
// ─────────────────────────────────────────────────────────────────────────────

export const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

export interface SessionKindOption {
  label: string;
  durationMin: number;
  blurb: string;
}

export const KINDS: SessionKindOption[] = [
  { label: "Individual Therapy", durationMin: 50, blurb: "One-on-one time focused on you." },
  { label: "Executive Coaching", durationMin: 60, blurb: "Leadership and workplace growth." },
  { label: "Assessment", durationMin: 60, blurb: "Structured evaluation and review." },
  { label: "Follow-up", durationMin: 50, blurb: "Check in on progress since last time." },
];

export const MODES: PatientSession["mode"][] = ["Video", "In-person", "Phone"];

/** Soft, per-tab slot hold — availability is finally confirmed at payment. */
export const HOLD_MS = 10 * 60_000;

export function parseISO(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Earliest bookable day — tomorrow; today and past days are unavailable. */
export function earliestBookable(): Date {
  const t = parseISO(todayISO());
  t.setDate(t.getDate() + 1);
  return t;
}

function slotHour(slot: string): number {
  const m = slot.match(/^(\d{1,2}):\d{2}\s*(AM|PM)$/i);
  if (!m) return 0;
  let hour = parseInt(m[1], 10) % 12;
  if (m[2].toUpperCase() === "PM") hour += 12;
  return hour;
}

/** Morning < 12 PM, Afternoon 12–4:59 PM, Evening 5 PM+. Empty groups omitted. */
export function groupSlots(slots: string[]): { label: string; slots: string[] }[] {
  const morning = slots.filter((s) => slotHour(s) < 12);
  const afternoon = slots.filter((s) => slotHour(s) >= 12 && slotHour(s) < 17);
  const evening = slots.filter((s) => slotHour(s) >= 17);
  return [
    { label: "Morning", slots: morning },
    { label: "Afternoon", slots: afternoon },
    { label: "Evening", slots: evening },
  ].filter((g) => g.slots.length > 0);
}

export interface DateStripDay {
  iso: string;
  weekday: string; // "Mon"
  dayNum: number; // 22
  month: string; // "Jul"
  label: "Today" | "Tomorrow" | null;
  disabled: boolean; // today/past — earliest bookable is tomorrow
}

export function buildDateStrip(days = 14): DateStripDay[] {
  const out: DateStripDay[] = [];
  const cursor = parseISO(todayISO());
  for (let i = 0; i < days; i++) {
    out.push({
      iso: toISO(cursor),
      weekday: cursor.toLocaleDateString(undefined, { weekday: "short" }),
      dayNum: cursor.getDate(),
      month: cursor.toLocaleDateString(undefined, { month: "short" }),
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : null,
      disabled: i === 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

export type BookedSlot = { date: string; time: string };

/** Free = clinician isn't booked then (any patient) and neither is the patient. */
export function isSlotFree(
  iso: string,
  slot: string,
  clinicianBooked: BookedSlot[],
  isSlotTaken: (date: string, time: string) => boolean,
): boolean {
  const takenByClinician = clinicianBooked.some((s) => s.date === iso && s.time === slot);
  return !takenByClinician && !isSlotTaken(iso, slot);
}

export function isDayFull(
  iso: string,
  clinicianBooked: BookedSlot[],
  isSlotTaken: (date: string, time: string) => boolean,
): boolean {
  return TIME_SLOTS.every((slot) => !isSlotFree(iso, slot, clinicianBooked, isSlotTaken));
}

/** First free slot within the horizon, derived from real booked data — never
 *  fabricated. Null past the horizon → render "Limited availability". */
export function deriveNextAvailable(
  clinicianBooked: BookedSlot[],
  isSlotTaken: (date: string, time: string) => boolean,
  horizonDays = 14,
): { iso: string; time: string; label: string } | null {
  const cursor = earliestBookable();
  for (let i = 0; i < horizonDays; i++) {
    const iso = toISO(cursor);
    const free = TIME_SLOTS.find((slot) => isSlotFree(iso, slot, clinicianBooked, isSlotTaken));
    if (free) {
      const dayLabel =
        i === 0
          ? "Tomorrow"
          : cursor.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
      return { iso, time: free, label: `${dayLabel} · ${free}` };
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return null;
}

export function formatINR(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

export function formatLongDate(iso: string): string {
  return parseISO(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Add-to-calendar (ICS, floating local times per the app's convention) ────

function icsStamp(iso: string, time12h: string, addMinutes = 0): string {
  const d = parseISO(iso);
  const m = time12h.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m) {
    let hour = parseInt(m[1], 10) % 12;
    if (m[3].toUpperCase() === "PM") hour += 12;
    d.setHours(hour, parseInt(m[2], 10) + addMinutes, 0, 0);
  }
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
}

export function buildSessionICS(input: {
  clinicianName: string;
  dateISO: string;
  time: string;
  durationMin: number;
  kind: string;
  mode: string;
}): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mindcarter//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@mindcarter`,
    `DTSTART:${icsStamp(input.dateISO, input.time)}`,
    `DTEND:${icsStamp(input.dateISO, input.time, input.durationMin)}`,
    `SUMMARY:${input.kind} with ${input.clinicianName} — Mindcarter`,
    `DESCRIPTION:${input.mode} session (${input.durationMin} min)`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadICS(filename: string, ics: string): void {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
