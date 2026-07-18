import { CalendarDays, Clock, Lock, ShieldCheck, Timer } from "lucide-react";
import { GradientAvatar } from "../gradient-avatar";
import { KINDS, formatINR, formatLongDate } from "../../lib/booking-flow";
import type { CareTeamMemberDTO } from "../../lib/patient-store";
import type { PatientSession } from "../../lib/patient";

export interface BookingSelections {
  date: string | null;
  time: string | null;
  kind: string;
  mode: PatientSession["mode"];
}

export function missingHint(sel: BookingSelections): string | null {
  if (!sel.date && !sel.time) return "Pick a date and time to continue.";
  if (!sel.date) return "Pick a date to continue.";
  if (!sel.time) return "Pick a time to continue.";
  return null;
}

export function formatCountdown(msLeft: number): string {
  const total = Math.max(0, Math.ceil(msLeft / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Sticky booking summary (BookMyShow seat-summary analog): clinician
 * mini-card, current selections, price, soft-hold countdown and the Pay CTA.
 */
export function BookingSummaryRail({
  clinician,
  selections,
  holdMsLeft,
  onPay,
  paying,
}: {
  clinician: CareTeamMemberDTO;
  selections: BookingSelections;
  /** null = no slot held */
  holdMsLeft: number | null;
  onPay: () => void;
  paying?: boolean;
}) {
  const kind = KINDS.find((k) => k.label === selections.kind) ?? KINDS[0];
  const hint = missingHint(selections);
  const hasPrice = clinician.price > 0;

  return (
    <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <GradientAvatar name={clinician.name} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-bold">{clinician.name}</p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {clinician.title}
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex items-start justify-between gap-3">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" /> Date
          </dt>
          <dd
            className={`text-right font-semibold ${selections.date ? "" : "text-muted-foreground/60"}`}
          >
            {selections.date ? formatLongDate(selections.date) : "Not selected"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Time
          </dt>
          <dd className={`font-semibold ${selections.time ? "" : "text-muted-foreground/60"}`}>
            {selections.time ?? "Not selected"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Type</dt>
          <dd className="font-semibold">
            {kind.label} · {kind.durationMin} min
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Mode</dt>
          <dd className="font-semibold">{selections.mode}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">Session fee</p>
        <p className="text-xl font-black tracking-tight">
          {hasPrice ? formatINR(clinician.price) : "Confirmed at booking"}
        </p>
      </div>

      {/* Soft hold — per-tab only; the server's clash check at payment is the
          real arbiter of availability. */}
      <div aria-live="polite">
        {holdMsLeft !== null && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand/10 px-3 py-2.5">
            <Timer className="h-4 w-4 shrink-0 text-foreground" />
            <p className="text-xs leading-snug text-foreground">
              Slot held for{" "}
              <span className="font-bold tabular-nums" aria-hidden>
                {formatCountdown(holdMsLeft)}
              </span>{" "}
              — we keep your selection in this tab; availability is confirmed when you pay.
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onPay}
        disabled={hint !== null || paying}
        className="mt-4 w-full rounded-full bg-brand py-3 text-sm font-bold text-brand-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        {hasPrice ? `Pay now · ${formatINR(clinician.price)}` : "Confirm booking"}
      </button>
      {hint && <p className="mt-2 text-center text-xs text-muted-foreground">{hint}</p>}

      <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <Lock className="h-3 w-3" /> Secure, confidential checkout
        </p>
        <p className="flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3" /> Reschedule or cancel anytime from Sessions
        </p>
      </div>
    </div>
  );
}
