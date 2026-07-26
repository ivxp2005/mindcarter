import { useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronDown, Star } from "lucide-react";
import { useSession } from "../lib/use-session";
import { GradientAvatar } from "./gradient-avatar";
import type { PublicPsychologistDTO } from "../lib/patient-data.server";

/** Shared psychologist card used on both the home page's featured "Our Team"
 *  band and the full `/psychologists` directory, so the two stay visually
 *  identical and any future change only needs to happen once. */
export function PsychologistCard({ p }: { p: PublicPsychologistDTO }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const { data: session } = useSession();

  const initials = p.name
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  // Anonymous visitors and non-patients (a signed-in psychologist/admin
  // browsing the marketing site) go to /login; only a signed-in patient goes
  // straight to the booking flow — see src/routes/employee/route.tsx's
  // beforeLoad guard, which would otherwise bounce anyone else back out.
  const isPatient = session?.role === "patient";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-[400ms] ease-out hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]">
      <div className="relative h-20 overflow-hidden bg-muted">
        <div
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/25 to-brand/5 transition duration-700 group-hover:scale-105"
          aria-hidden
        >
          <GradientAvatar name={p.name} initials={initials} size="md" className="shadow-none" />
        </div>
        {p.rating != null && p.rating > 0 && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest">
            <Star className="h-2.5 w-2.5 fill-brand text-brand" />
            {p.rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex flex-col p-4">
        <h3 className="text-sm font-bold leading-tight">{p.name}</h3>
        <p className="mt-0.5 text-[10px] uppercase leading-snug tracking-[0.14em] text-muted-foreground">
          {p.title}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 border-y border-border py-2 text-center">
          <div>
            <p className="text-sm font-bold text-foreground">
              {p.yearsExperience != null ? `${p.yearsExperience}+` : "—"}
            </p>
            <p className="mt-0.5 text-[8px] uppercase leading-tight tracking-wide text-muted-foreground">
              Years exp
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              {p.price != null ? `₹${p.price.toLocaleString("en-IN")}` : "—"}
            </p>
            <p className="mt-0.5 text-[8px] uppercase leading-tight tracking-wide text-muted-foreground">
              Per session
            </p>
          </div>
        </div>

        <motion.div
          id={panelId}
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="overflow-hidden"
        >
          <div className="pt-3">
            {p.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {p.specialties.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
              {p.bio || `${p.name} is a clinician at Mindcarter.`}
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col gap-1.5 pt-3">
          {isPatient ? (
            <Link
              to="/employee/book/$clinicianId"
              params={{ clinicianId: p.id }}
              className="w-full rounded-full bg-brand py-2 text-center text-[10px] font-bold uppercase tracking-wide text-brand-foreground transition-transform duration-200 ease-out group-hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
            >
              Book now
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-full rounded-full bg-brand py-2 text-center text-[10px] font-bold uppercase tracking-wide text-brand-foreground transition-transform duration-200 ease-out group-hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
            >
              Book now
            </Link>
          )}
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-center gap-1 rounded-full border border-border py-2 text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground transition hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
          >
            {open ? "Hide profile" : "View profile"}
            <ChevronDown
              className={`h-3 w-3 transition-transform duration-250 ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>
    </article>
  );
}

export function PsychologistCardSkeleton() {
  return (
    <div className="h-52 animate-pulse rounded-2xl border border-border bg-background/60" aria-hidden />
  );
}
