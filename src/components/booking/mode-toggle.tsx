import * as RadioGroup from "@radix-ui/react-radio-group";
import { MapPin, Phone, Video } from "lucide-react";
import { MODES } from "../../lib/booking-flow";
import type { PatientSession } from "../../lib/patient";

const MODE_ICONS: Record<PatientSession["mode"], React.ElementType> = {
  Video: Video,
  "In-person": MapPin,
  Phone: Phone,
};

/** Segmented Video / In-person / Phone toggle with icons. */
export function ModeToggle({
  selected,
  onSelect,
}: {
  selected: PatientSession["mode"];
  onSelect: (mode: PatientSession["mode"]) => void;
}) {
  return (
    <RadioGroup.Root
      value={selected}
      onValueChange={(v) => v && onSelect(v as PatientSession["mode"])}
      aria-label="Session mode"
      className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-muted/40 p-1 sm:inline-flex sm:rounded-full"
    >
      {MODES.map((mode) => {
        const Icon = MODE_ICONS[mode];
        return (
          <RadioGroup.Item
            key={mode}
            value={mode}
            className={`flex min-w-0 items-center justify-center gap-1 rounded-full px-1.5 py-2 text-xs font-semibold outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 sm:gap-1.5 sm:px-4 sm:text-sm ${
              selected === mode
                ? "bg-foreground text-background shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{mode}</span>
          </RadioGroup.Item>
        );
      })}
    </RadioGroup.Root>
  );
}
