import * as RadioGroup from "@radix-ui/react-radio-group";
import { Clock } from "lucide-react";
import {
  TIME_SLOTS,
  groupSlots,
  isSlotFree,
  formatLongDate,
  type BookedSlot,
} from "../../lib/booking-flow";

/**
 * Time-slot chip grid grouped Morning / Afternoon / Evening. Taken slots stay
 * visible — dimmed, struck through and disabled — so availability is legible.
 */
export function TimeSlotGrid({
  dateISO,
  selected,
  onSelect,
  clinicianBooked,
  isSlotTaken,
  durationMin,
}: {
  dateISO: string | null;
  selected: string | null;
  onSelect: (time: string) => void;
  clinicianBooked: BookedSlot[];
  isSlotTaken: (date: string, time: string) => boolean;
  durationMin: number;
}) {
  if (!dateISO) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
        Pick a date to see available times.
      </p>
    );
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <RadioGroup.Root
      value={selected ?? ""}
      onValueChange={(v) => v && onSelect(v)}
      aria-label={`Available times for ${formatLongDate(dateISO)}`}
      className="space-y-4"
    >
      {groupSlots(TIME_SLOTS).map((group) => (
        <div key={group.label}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {group.label}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {group.slots.map((slot) => {
              const free = isSlotFree(dateISO, slot, clinicianBooked, isSlotTaken);
              return (
                <RadioGroup.Item
                  key={slot}
                  value={slot}
                  disabled={!free}
                  aria-label={free ? slot : `${slot}, unavailable`}
                  className={`rounded-full px-4 py-2 text-sm font-semibold outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 ${
                    selected === slot
                      ? "bg-brand text-brand-foreground shadow-md"
                      : free
                        ? "border border-border bg-background hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md"
                        : "cursor-not-allowed border border-border text-muted-foreground line-through opacity-50"
                  }`}
                >
                  {slot}
                </RadioGroup.Item>
              );
            })}
          </div>
        </div>
      ))}
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" /> {durationMin}-minute session · times shown in {timezone}
      </p>
    </RadioGroup.Root>
  );
}
