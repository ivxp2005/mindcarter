import { ChevronUp } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "../ui/drawer";
import {
  BookingSummaryRail,
  formatCountdown,
  missingHint,
  type BookingSelections,
} from "./booking-summary-rail";
import { formatINR } from "../../lib/booking-flow";
import type { CareTeamMemberDTO } from "../../lib/patient-store";

/**
 * Mobile stand-in for the sticky summary rail: a fixed bottom bar with price +
 * selected time + Pay now; tapping the chevron opens the full summary sheet.
 */
export function MobileSummaryBar({
  clinician,
  selections,
  holdMsLeft,
  onPay,
  paying,
}: {
  clinician: CareTeamMemberDTO;
  selections: BookingSelections;
  holdMsLeft: number | null;
  onPay: () => void;
  paying?: boolean;
}) {
  const hint = missingHint(selections);
  const hasPrice = clinician.price > 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <Drawer>
          <DrawerTrigger
            aria-label="Show booking summary"
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">
                {hasPrice ? formatINR(clinician.price) : "Fee confirmed at booking"}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {selections.time
                  ? `${selections.time}${holdMsLeft !== null ? ` · held ${formatCountdown(holdMsLeft)}` : ""}`
                  : (hint ?? "Ready to book")}
              </span>
            </span>
          </DrawerTrigger>
          <DrawerContent className="px-4 pb-6">
            <DrawerTitle className="sr-only">Booking summary</DrawerTitle>
            <div className="mx-auto mt-2 w-full max-w-md">
              <BookingSummaryRail
                clinician={clinician}
                selections={selections}
                holdMsLeft={holdMsLeft}
                onPay={onPay}
                paying={paying}
              />
            </div>
          </DrawerContent>
        </Drawer>
        <button
          onClick={onPay}
          disabled={hint !== null || paying}
          className="shrink-0 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground transition-all duration-200 ease-out active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {hasPrice ? "Pay now" : "Confirm"}
        </button>
      </div>
    </div>
  );
}
