import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, ChevronRight, Star } from "lucide-react";
import { Textarea } from "../../../components/ui/textarea";
import { GradientAvatar } from "../../../components/gradient-avatar";
import { DateStrip } from "../../../components/booking/date-strip";
import { TimeSlotGrid } from "../../../components/booking/time-slot-grid";
import { SessionTypePicker } from "../../../components/booking/session-type-picker";
import { ModeToggle } from "../../../components/booking/mode-toggle";
import { BookingSummaryRail } from "../../../components/booking/booking-summary-rail";
import { MobileSummaryBar } from "../../../components/booking/mobile-summary-bar";
import { PaymentStep } from "../../../components/booking/payment-step";
import {
  ConfirmationStep,
  type ConfirmedBooking,
} from "../../../components/booking/confirmation-step";
import { usePatientData } from "../../../lib/patient-store";
import { getClinicianBookedSlotsFn } from "../../../lib/patient-data.server";
import { HOLD_MS, KINDS } from "../../../lib/booking-flow";
import type { PatientSession } from "../../../lib/patient";

export const Route = createFileRoute("/employee/book/$clinicianId")({
  component: BookingDetailPage,
});

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type Step = "select" | "pay" | "confirmed";

const STEP_LABELS: { key: Step; label: string }[] = [
  { key: "select", label: "Choose time" },
  { key: "pay", label: "Pay" },
  { key: "confirmed", label: "Confirmed" },
];

function StepIndicator({ step }: { step: Step }) {
  const activeIdx = STEP_LABELS.findIndex((s) => s.key === step);
  return (
    <ol className="flex items-center gap-2" aria-label="Booking progress">
      {STEP_LABELS.map((s, i) => (
        <li key={s.key} className="flex items-center gap-2">
          {i > 0 && <span className="h-px w-6 bg-border" aria-hidden />}
          <span
            aria-current={i === activeIdx ? "step" : undefined}
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              i === activeIdx
                ? "text-foreground"
                : i < activeIdx
                  ? "text-muted-foreground"
                  : "text-muted-foreground/50"
            }`}
          >
            <span
              className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${
                i <= activeIdx ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
            {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function SectionHeading({ step, title }: { step: string; title: string }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="text-xs font-black uppercase tracking-[0.2em] text-brand">{step}</span>
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
    </div>
  );
}

function BookingDetailPage() {
  const { clinicianId } = Route.useParams();
  const { clinicians, isLoading, isSlotTaken, bookSession } = usePatientData();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const clinician = clinicians.find((c) => c.id === clinicianId) ?? null;

  const [step, setStep] = useState<Step>("select");
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [kind, setKind] = useState<string>(KINDS[0].label);
  const [mode, setMode] = useState<PatientSession["mode"]>("Video");
  const [notes, setNotes] = useState("");
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<ConfirmedBooking | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Same query key the listing page pre-warms and the store invalidates on
  // every booking write.
  const { data: clinicianBooked = [] } = useQuery({
    queryKey: ["clinician-booked", clinicianId],
    queryFn: () => getClinicianBookedSlotsFn({ data: { psychologistId: clinicianId } }),
    staleTime: 60_000,
  });

  // 1s tick while a slot is held.
  useEffect(() => {
    if (holdExpiresAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [holdExpiresAt]);

  // Soft-hold expiry: release the slot and prompt a re-pick. Per-tab only —
  // the server's clash check at payment remains the arbiter of availability.
  const expired = holdExpiresAt !== null && now >= holdExpiresAt;
  useEffect(() => {
    if (!expired) return;
    setHoldExpiresAt(null);
    setTime(null);
    setStep((s) => (s === "pay" ? "select" : s));
    queryClient.invalidateQueries({ queryKey: ["clinician-booked", clinicianId] });
    toast.error("Your held slot expired", { description: "Please pick a time again." });
  }, [expired, clinicianId, queryClient]);

  // Move focus to the step heading on step changes (a11y).
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: false });
  }, [step]);

  const holdMsLeft = holdExpiresAt !== null && time ? Math.max(0, holdExpiresAt - now) : null;

  const selectTime = (t: string) => {
    setTime(t);
    setHoldExpiresAt(Date.now() + HOLD_MS);
  };

  const selectDate = (iso: string) => {
    setDate(iso);
    setTime(null);
    setHoldExpiresAt(null);
  };

  const handlePay = () => {
    if (!date || !time) return;
    setStep("pay");
  };

  // TODO(payments): when a real provider is integrated, run its checkout here
  // before (or instead of) the simulated delay. bookSessionFn is the source of
  // truth — it re-validates the slot server-side and records the amount.
  const handleSubmitPayment = async () => {
    if (!clinician || !date || !time || submitting) return;
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 600)); // simulated processing
      const kindOption = KINDS.find((k) => k.label === kind) ?? KINDS[0];
      const result = await bookSession({
        psychologistId: clinician.id,
        date,
        time,
        kind: kindOption.label,
        mode,
        durationMin: kindOption.durationMin,
        notes: notes.trim() || undefined,
      });
      if (!result.ok) {
        // Likely a slot race — return to selection with everything but the
        // time intact, and refresh availability so the lost slot dims.
        setStep("select");
        setTime(null);
        setHoldExpiresAt(null);
        queryClient.invalidateQueries({ queryKey: ["clinician-booked", clinicianId] });
        toast.error("That slot isn't available anymore", {
          description: result.error ?? "Please pick another time.",
        });
        return;
      }
      setConfirmed({
        id: "id" in result && result.id ? String(result.id) : "",
        clinicianName: clinician.name,
        clinicianTitle: clinician.title,
        date,
        time,
        kind: kindOption.label,
        durationMin: kindOption.durationMin,
        mode,
        amount: clinician.price,
      });
      setHoldExpiresAt(null);
      setStep("confirmed");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndBrowse = () => {
    navigate({ to: "/employee/book" });
  };

  // ── Loading / not-found guards ────────────────────────────────────────────
  if (!clinician) {
    if (isLoading || clinicians.length === 0) {
      return (
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-3xl bg-muted/60" />
          <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
            <div className="h-96 animate-pulse rounded-2xl bg-muted/60" />
            <div className="h-96 animate-pulse rounded-2xl bg-muted/60" />
          </div>
        </div>
      );
    }
    return (
      <section className="mx-auto max-w-md rounded-2xl border border-border bg-background p-10 text-center">
        <p className="font-display text-2xl font-black">We couldn't find that clinician.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          They may no longer be accepting bookings.
        </p>
        <Link
          to="/employee/book"
          className="mt-6 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg"
        >
          Browse clinicians
        </Link>
      </section>
    );
  }

  const selections = { date, time, kind, mode };

  return (
    <div className={step === "select" ? "pb-24 lg:pb-0" : undefined}>
      {/* ── Header: back + breadcrumb + clinician summary ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
          <Link
            to="/employee/book"
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Book
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="font-semibold">{clinician.name}</span>
        </nav>
        <StepIndicator step={step} />
      </div>

      <div className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-background p-5">
        <GradientAvatar name={clinician.name} size="xl" />
        <div className="min-w-0">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-2xl font-black tracking-tight outline-none"
          >
            {clinician.name}
          </h1>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {clinician.title}
            {clinician.rating > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 normal-case tracking-normal">
                <Star className="h-3 w-3 fill-brand text-brand" /> {clinician.rating.toFixed(1)}
              </span>
            )}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {clinician.specialties.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          {step === "select" && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Past dates and taken slots are unavailable.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              className="grid items-start gap-6 lg:grid-cols-[1fr_380px]"
            >
              {/* ── Left column: guided steps ── */}
              <div className="space-y-8">
                <section className="space-y-3">
                  <SectionHeading step="01" title="Select a date" />
                  <DateStrip
                    selected={date}
                    onSelect={selectDate}
                    clinicianBooked={clinicianBooked}
                    isSlotTaken={isSlotTaken}
                  />
                </section>

                <section className="space-y-3">
                  <SectionHeading step="02" title="Pick a time" />
                  <TimeSlotGrid
                    dateISO={date}
                    selected={time}
                    onSelect={selectTime}
                    clinicianBooked={clinicianBooked}
                    isSlotTaken={isSlotTaken}
                    durationMin={(KINDS.find((k) => k.label === kind) ?? KINDS[0]).durationMin}
                  />
                </section>

                <section className="space-y-3">
                  <SectionHeading step="03" title="Session type & mode" />
                  <SessionTypePicker selected={kind} onSelect={setKind} />
                  <ModeToggle selected={mode} onSelect={setMode} />
                </section>

                <section className="space-y-2">
                  <label
                    htmlFor="booking-notes"
                    className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    Anything you'd like your clinician to know? (optional)
                  </label>
                  <Textarea
                    id="booking-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="Reason for visit, context, or anything else…"
                    className="bg-background"
                  />
                </section>
              </div>

              {/* ── Right column: sticky summary rail (desktop) ── */}
              <div className="hidden lg:sticky lg:top-24 lg:block">
                <BookingSummaryRail
                  clinician={clinician}
                  selections={selections}
                  holdMsLeft={holdMsLeft}
                  onPay={handlePay}
                />
              </div>
            </motion.div>
          )}

          {step === "pay" && (
            <motion.div
              key="pay"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              {date && time && (
                <PaymentStep
                  clinician={clinician}
                  selections={{ date, time, kind, mode }}
                  holdMsLeft={holdMsLeft}
                  onBack={() => setStep("select")}
                  onSubmit={handleSubmitPayment}
                  submitting={submitting}
                />
              )}
            </motion.div>
          )}

          {step === "confirmed" && confirmed && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              <ConfirmationStep booking={confirmed} onBookAnother={resetAndBrowse} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mobile: sticky bottom bar replaces the rail ── */}
      {step === "select" && (
        <MobileSummaryBar
          clinician={clinician}
          selections={selections}
          holdMsLeft={holdMsLeft}
          onPay={handlePay}
        />
      )}
    </div>
  );
}
