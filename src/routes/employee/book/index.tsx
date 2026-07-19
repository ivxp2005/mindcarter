import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BadgeCheck, CalendarCheck2, Search, ShieldCheck, Zap } from "lucide-react";
import { StaggerContainer, StaggerItem } from "../../../components/scroll-reveal";
import { ClinicianCard } from "../../../components/booking/clinician-card";
import { usePatientData } from "../../../lib/patient-store";
import { getClinicianBookedSlotsFn } from "../../../lib/patient-data.server";
import { deriveNextAvailable } from "../../../lib/booking-flow";

export const Route = createFileRoute("/employee/book/")({
  component: BookListingPage,
});

/** Premium ease-out — matches the marketing site's motion language. */
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const TRUST_SIGNALS = [
  { icon: BadgeCheck, label: "Licensed, verified clinicians" },
  { icon: ShieldCheck, label: "Confidential & secure booking" },
  { icon: CalendarCheck2, label: "Reschedule anytime from Sessions" },
];

function BookListingPage() {
  const { clinicians, isLoading, isSlotTaken } = usePatientData();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<string | null>(null);

  // One cached booked-slots query per clinician (same key the booking detail
  // page reads, so "Book now" lands with slots already warm). If the roster
  // ever grows past ~20, replace with a single batched read-only server fn.
  const slotQueries = useQueries({
    queries: clinicians.map((c) => ({
      queryKey: ["clinician-booked", c.id],
      queryFn: () => getClinicianBookedSlotsFn({ data: { psychologistId: c.id } }),
      staleTime: 60_000,
    })),
  });

  const nextAvailable = useMemo(
    () =>
      clinicians.map((_, i) => {
        const q = slotQueries[i];
        if (!q || q.isPending) return { loading: true, value: null as string | null, iso: "" };
        const next = deriveNextAvailable(q.data ?? [], isSlotTaken);
        return { loading: false, value: next?.label ?? null, iso: next?.iso ?? "" };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clinicians, isSlotTaken, ...slotQueries.map((q) => q.dataUpdatedAt + (q.isPending ? 1 : 0))],
  );

  const specialties = useMemo(
    () => [...new Set(clinicians.flatMap((c) => c.specialties))].sort(),
    [clinicians],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clinicians.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.specialties.some((s) => s.toLowerCase().includes(q));
      const matchesSpecialty = !specialty || c.specialties.includes(specialty);
      return matchesQuery && matchesSpecialty;
    });
  }, [clinicians, query, specialty]);

  /** Soonest-available clinician across the roster (real data only). */
  const quickPick = useMemo(() => {
    let best: { id: string; iso: string; label: string } | null = null;
    for (let i = 0; i < clinicians.length; i++) {
      const c = clinicians[i];
      const n = nextAvailable[i];
      if (!n || n.loading || !n.value) continue;
      if (!best || n.iso < best.iso) {
        best = { id: c.id, iso: n.iso, label: n.value };
      }
    }
    return best;
  }, [clinicians, nextAvailable]);

  return (
    <div className="space-y-6">
      {/* ─────────────────────────── Hero band ─────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-foreground text-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand/25 blur-3xl"
          animate={{ scale: [1, 1.18, 1], x: [0, 24, 0], y: [0, -14, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative p-8 sm:p-10">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-background/60">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Book a session
          </p>
          <h1 className="font-display mt-3 max-w-xl overflow-hidden text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
            <motion.span
              className="block"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.75, ease: EASE_OUT }}
            >
              Find the right clinician for you.
            </motion.span>
          </h1>
          <motion.p
            className="mt-3 max-w-md text-sm text-background/60"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
          >
            Every clinician below is part of the Mindcarter network. Pick someone who fits, choose a
            time that works, and you're booked in minutes.
          </motion.p>
          <motion.div
            className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32, ease: EASE_OUT }}
          >
            {TRUST_SIGNALS.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-2 text-xs text-background/70">
                <Icon className="h-3.5 w-3.5 text-brand" /> {label}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────────────── Search + specialty filter ────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or specialty…"
            aria-label="Search clinicians"
            className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10"
          />
        </div>
        {quickPick && (
          <button
            onClick={() =>
              navigate({ to: "/employee/book/$clinicianId", params: { clinicianId: quickPick.id } })
            }
            className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md active:translate-y-0 active:scale-95"
          >
            <Zap className="h-4 w-4 text-brand" /> Next available · {quickPick.label}
          </button>
        )}
      </div>

      {specialties.length > 0 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Filter by specialty"
        >
          {[null, ...specialties].map((s) => {
            const active = specialty === s;
            return (
              <button
                key={s ?? "all"}
                onClick={() => setSpecialty(s)}
                aria-pressed={active}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ease-out ${
                  active
                    ? "bg-foreground text-background"
                    : "border border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {s ?? "All specialties"}
              </button>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────── Clinician grid ─────────────────────── */}
      {isLoading && clinicians.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl border border-border bg-muted/50"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No clinicians match your search. Try a different name or clear the specialty filter.
          </p>
        </section>
      ) : (
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" staggerDelay={0.08}>
          {filtered.map((member) => {
            const idx = clinicians.indexOf(member);
            const n = nextAvailable[idx];
            return (
              <StaggerItem key={member.id}>
                <ClinicianCard
                  member={member}
                  nextAvailable={n?.value ?? null}
                  nextAvailableLoading={n?.loading ?? true}
                />
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
