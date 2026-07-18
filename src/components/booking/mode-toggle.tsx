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
      className="inline-flex rounded-full border border-border bg-muted/40 p-1"
    >
      {MODES.map((mode) => {
        const Icon = MODE_ICONS[mode];
        return (
          <RadioGroup.Item
            key={mode}
            value={mode}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 ${
              selected === mode
                ? "bg-foreground text-background shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" /> {mode}
          </RadioGroup.Item>
        );
      })}
    </RadioGroup.Root>
  );
}
