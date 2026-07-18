import * as RadioGroup from "@radix-ui/react-radio-group";
import { KINDS } from "../../lib/booking-flow";

/** Session type as selectable cards — label, duration, one-line blurb. The fee
 *  is per-clinician (same for every type), so it's shown once in the summary. */
export function SessionTypePicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (label: string) => void;
}) {
  return (
    <RadioGroup.Root
      value={selected}
      onValueChange={(v) => v && onSelect(v)}
      aria-label="Session type"
      className="grid gap-2 sm:grid-cols-2"
    >
      {KINDS.map((k) => (
        <RadioGroup.Item
          key={k.label}
          value={k.label}
          className={`rounded-2xl border p-4 text-left outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 ${
            selected === k.label
              ? "border-foreground bg-foreground text-background shadow-md"
              : "border-border bg-background hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold">{k.label}</span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                selected === k.label
                  ? "bg-brand text-brand-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {k.durationMin} min
            </span>
          </div>
          <p
            className={`mt-1 text-xs ${selected === k.label ? "text-background/70" : "text-muted-foreground"}`}
          >
            {k.blurb}
          </p>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
