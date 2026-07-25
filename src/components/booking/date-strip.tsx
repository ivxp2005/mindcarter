import { useState } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useEdgeAutoScroll } from "../../hooks/use-edge-auto-scroll";
import {
  buildDateStrip,
  earliestBookable,
  isDayFull,
  parseISO,
  toISO,
  type BookedSlot,
} from "../../lib/booking-flow";

/** Fades the scroller's edges out only on sides that still have more to scroll to. */
function edgeFadeMask(canLeft: boolean, canRight: boolean): string | undefined {
  if (!canLeft && !canRight) return undefined;
  const stops = [
    "transparent 0",
    canLeft ? "black 24px" : "black 0",
    canRight ? "black calc(100% - 24px)" : "black 100%",
    "transparent 100%",
  ];
  return `linear-gradient(to right, ${stops.join(", ")})`;
}

/**
 * Horizontal 14-day date strip (BookMyShow-style) + a compact popover
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
  const { ref, canLeft, canRight, onPointerMove, onPointerLeave, scrollByPage } =
    useEdgeAutoScroll<HTMLDivElement>();

  return (
    <div>
      <div
        className="group/strip relative"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <RadioGroup.Root
          ref={ref}
          value={inStrip ? selected : ""}
          onValueChange={(v) => v && onSelect(v)}
          aria-label="Select a date"
          className="flex gap-2 overflow-x-auto px-0.5 pb-2 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            scrollSnapType: "x proximity",
            WebkitMaskImage: edgeFadeMask(canLeft, canRight),
            maskImage: edgeFadeMask(canLeft, canRight),
          }}
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

        {canLeft && (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={() => scrollByPage(-1)}
            className="absolute left-0 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/90 opacity-0 shadow-sm backdrop-blur transition-all duration-200 ease-out hover:bg-muted group-hover/strip:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {canRight && (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={() => scrollByPage(1)}
            className="absolute right-0 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/90 opacity-0 shadow-sm backdrop-blur transition-all duration-200 ease-out hover:bg-muted group-hover/strip:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="mt-1 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <CalendarDays className="h-3.5 w-3.5" /> Full calendar
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${calendarOpen ? "rotate-180" : ""}`}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
          <Calendar
            mode="single"
            className="[--cell-size:2.25rem]"
            selected={selected ? parseISO(selected) : undefined}
            defaultMonth={selected ? parseISO(selected) : earliestBookable()}
            onSelect={(d) => {
              if (!d) return;
              onSelect(toISO(d));
              setCalendarOpen(false);
            }}
            disabled={{ before: earliestBookable() }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
