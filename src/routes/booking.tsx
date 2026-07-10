import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, ShieldCheck, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "../components/site-shell";
import { PageHero } from "../components/page-hero";
import { ScrollReveal } from "../components/scroll-reveal";

export const Route = createFileRoute("/booking")({
  validateSearch: (search: Record<string, unknown>): { name?: string; role?: string; price?: number } => ({
    name: typeof search.name === "string" ? search.name : undefined,
    role: typeof search.role === "string" ? search.role : undefined,
    price: typeof search.price === "string" ? Number(search.price) : typeof search.price === "number" ? search.price : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Booking — Mindcarter" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BookingPage,
});

const PLATFORM_FEE = 49;

function BookingPage() {
  const { name, role, price } = Route.useSearch();

  const psychologist = name ?? "Mindcarter Clinician";
  const specialty = role ?? "General Consultation";
  const sessionFee = price ?? 1200;
  const total = sessionFee + PLATFORM_FEE;

  const [paid, setPaid] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const canSubmit = cardName.trim().length > 1 && cardNumber.replace(/\s/g, "").length >= 12 && expiry.length >= 4 && cvc.length >= 3;

  return (
    <SiteShell>
      <ScrollReveal yOffset={40}>
        <PageHero
          eyebrow="Booking"
          title="Complete your booking"
          description="Secure your session in a couple of minutes. You'll get a confirmation and a calendar invite right after."
        />
      </ScrollReveal>

      <section className="border-b border-border bg-background py-16">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          {/* ── Order summary ─────────────────────────────────── */}
          <div className="rounded-3xl border border-border bg-muted/30 p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Session</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">{psychologist}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{specialty}</p>

            <div className="mt-8 space-y-3 border-t border-border pt-6 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Session fee</span>
                <span className="font-semibold">₹{sessionFee.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Platform fee</span>
                <span className="font-semibold">₹{PLATFORM_FEE.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-base">
                <span className="font-bold">Total due today</span>
                <span className="font-black text-brand">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-border bg-background p-4 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              Payments are encrypted end-to-end. You can reschedule or cancel up to 24 hours before your session at no charge.
            </div>
          </div>

          {/* ── Payment form ──────────────────────────────────── */}
          <div className="rounded-3xl border border-border bg-background p-8">
            {paid ? (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-brand/15 text-brand">
                  <CheckCircle2 className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-xl font-bold tracking-tight">Booking confirmed</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  You're booked with {psychologist}. A confirmation and calendar invite have been sent to your inbox.
                </p>
                <Link
                  to="/"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-wide text-background transition hover:opacity-90"
                >
                  Back to home
                </Link>
              </div>
            ) : (
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!canSubmit) return;
                  // TODO: Supabase / payment provider — charge card, insert booking
                  setPaid(true);
                  toast.success("Payment successful", {
                    description: `₹${total.toLocaleString("en-IN")} charged for your session with ${psychologist}.`,
                  });
                }}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CreditCard className="h-4 w-4 text-brand" /> Card details
                </div>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Name on card</span>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Card number</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Expiry</span>
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">CVC</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="123"
                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full rounded-full bg-brand py-3.5 text-sm font-bold text-brand-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Pay ₹{total.toLocaleString("en-IN")}
                </button>

                <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" /> Secured, encrypted checkout
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
