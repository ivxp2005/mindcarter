import { useState } from "react";
import { ArrowLeft, CreditCard, Lock, Timer } from "lucide-react";
import { GradientAvatar } from "../gradient-avatar";
import { formatCountdown } from "./booking-summary-rail";
import { KINDS, formatINR, formatLongDate } from "../../lib/booking-flow";
import type { CareTeamMemberDTO } from "../../lib/patient-store";
import type { PatientSession } from "../../lib/patient";

/**
 * Payment step.
 *
 * TODO(payments): integrate a real provider (Razorpay/Stripe) here. This card
 * form is a visual stub — no card data is transmitted or stored anywhere. The
 * `onSubmit` handler goes straight to bookSessionFn, which runs the real
 * server-side validation (slot clash checks) and inserts the booking; that is
 * the single place to swap in a provider's checkout + charge before booking.
 */
export function PaymentStep({
  clinician,
  selections,
  holdMsLeft,
  onBack,
  onSubmit,
  submitting,
}: {
  clinician: CareTeamMemberDTO;
  selections: { date: string; time: string; kind: string; mode: PatientSession["mode"] };
  holdMsLeft: number | null;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const kind = KINDS.find((k) => k.label === selections.kind) ?? KINDS[0];
  const hasPrice = clinician.price > 0;
  const formComplete =
    cardName.trim() && cardNumber.trim().length >= 12 && expiry.trim() && cvc.trim();

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10";
  const labelCls = "text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground";

  return (
    <div className="mx-auto max-w-md">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to time selection
      </button>

      {/* Condensed order summary */}
      <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <GradientAvatar name={clinician.name} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{clinician.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatLongDate(selections.date)} · {selections.time} · {kind.label} ·{" "}
              {selections.mode}
            </p>
          </div>
          <p className="shrink-0 text-lg font-black tracking-tight">
            {hasPrice ? formatINR(clinician.price) : "—"}
          </p>
        </div>
        {holdMsLeft !== null && (
          <p
            className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground"
            aria-live="polite"
          >
            <Timer className="h-3.5 w-3.5" /> Slot held for{" "}
            <span className="font-bold tabular-nums" aria-hidden>
              {formatCountdown(holdMsLeft)}
            </span>
          </p>
        )}
      </div>

      <form
        className="mt-5 space-y-4 rounded-2xl border border-border bg-background p-6 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          if (!submitting) onSubmit();
        }}
      >
        <p className="flex items-center gap-2 text-sm font-bold">
          <CreditCard className="h-4 w-4" /> Card details
        </p>

        <div className="space-y-1.5">
          <label htmlFor="pay-name" className={labelCls}>
            Name on card
          </label>
          <input
            id="pay-name"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            autoComplete="cc-name"
            required
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="pay-number" className={labelCls}>
            Card number
          </label>
          <input
            id="pay-number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/[^\d ]/g, ""))}
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            required
            className={inputCls}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="pay-expiry" className={labelCls}>
              Expiry
            </label>
            <input
              id="pay-expiry"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              required
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="pay-cvc" className={labelCls}>
              CVC
            </label>
            <input
              id="pay-cvc"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              required
              className={inputCls}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!formComplete || submitting}
          className="w-full rounded-full bg-brand py-3 text-sm font-bold text-brand-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {submitting
            ? "Processing…"
            : hasPrice
              ? `Pay ${formatINR(clinician.price)} & book`
              : "Confirm booking"}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Lock className="h-3 w-3" /> Demo checkout — no charge is made and card details are not
          stored.
        </p>
      </form>
    </div>
  );
}
