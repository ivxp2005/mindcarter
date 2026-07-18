import { useState } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Calendar } from "../ui/calendar";
import {
  buildDateStrip,
  earliestBookable,
  isDayFull,
  parseISO,
  toISO,
  type BookedSlot,
} from "../../lib/booking-flow";

/**
 * Horizontal 14-day date strip (BookMyShow-style) + an expandable month
 * calendar for dates further out. Today/past are disabled (earliest bookable
 * day is tomorrow); fully-booked days show "Full" and are disabled too.
 */
export function DateStrip({
  selected,
  onSelect,
  clinicianBooked,
  isSlotTaken,
}: {
  selected: string | null;
  onSelect: (iso: string) => void;
  clinicianBooked: BookedSlot[];
  isSlotTaken: (date: string, time: string) => boolean;
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const days = buildDateStrip(14);
  const inStrip = selected !== null && days.some((d) => d.iso === selected);

  return (
    <div>
      <RadioGroup.Root
        value={inStrip ? selected : ""}
        onValueChange={(v) => v && onSelect(v)}
        aria-label="Select a date"
        className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x proximity" }}
      >
        {days.map((d) => {
          const full = !d.disabled && isDayFull(d.iso, clinicianBooked, isSlotTaken);
          const disabled = d.disabled || full;
          return (
            <RadioGroup.Item
              key={d.iso}
              value={d.iso}
              disabled={disabled}
              aria-label={`${d.weekday} ${d.month} ${d.dayNum}${full ? ", fully booked" : ""}${d.disabled ? ", unavailable" : ""}`}
              style={{ scrollSnapAlign: "start" }}
              className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border px-2 py-2.5 outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 ${
                selected === d.iso
                  ? "border-foreground bg-foreground text-background"
                  : disabled
                    ? "cursor-not-allowed border-border text-muted-foreground/50"
                    : "border-border bg-background hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md"
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                {d.weekday}
              </span>
              <span className="mt-0.5 text-lg font-bold leading-none">{d.dayNum}</span>
              <span className="mt-1 text-[9px] font-medium uppercase tracking-wide opacity-70">
                {full ? "Full" : (d.label ?? d.month)}
              </span>
            </RadioGroup.Item>
          );
        })}
      </RadioGroup.Root>

      <button
        type="button"
        onClick={() => setCalendarOpen((v) => !v)}
        aria-expanded={calendarOpen}
        className="mt-1 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <CalendarDays className="h-3.5 w-3.5" /> Full calendar
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${calendarOpen ? "rotate-180" : ""}`}
        />
      </button>

      {calendarOpen && (
        <div className="mt-2 flex justify-center rounded-xl border border-border bg-background">
          <Calendar
            mode="single"
            selected={selected ? parseISO(selected) : undefined}
            onSelect={(d) => {
              if (!d) return;
              onSelect(toISO(d));
              setCalendarOpen(false);
            }}
            disabled={{ before: earliestBookable() }}
          />
        </div>
      )}
    </div>
  );
}
