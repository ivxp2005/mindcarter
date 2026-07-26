import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search } from "lucide-react";
import { SiteShell } from "../components/site-shell";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../components/scroll-reveal";
import { PsychologistCard, PsychologistCardSkeleton } from "../components/psychologist-card";
import {
  getPublicPsychologistsFn,
  type PublicPsychologistDTO,
} from "../lib/patient-data.server";

export const Route = createFileRoute("/psychologists")({
  head: () => ({
    meta: [
      { title: "Our Psychologists — Mindcarter" },
      {
        name: "description",
        content:
          "Meet the Mindcarter psychologists — evidence-based professionals helping people thrive at work.",
      },
      { property: "og:title", content: "Our Psychologists — Mindcarter" },
      { property: "og:url", content: "/psychologists" },
    ],
    links: [{ rel: "canonical", href: "/psychologists" }],
  }),
  component: PsychologistsPage,
});

function PsychologistsPage() {
  // Theme the browser scrollbar dark/gold on this page, matching the home page.
  useEffect(() => {
    document.documentElement.classList.add("mc-dark-scrollbar");
    return () => document.documentElement.classList.remove("mc-dark-scrollbar");
  }, []);

  return (
    <SiteShell>
      <Directory />

      <section className="relative overflow-hidden border-b border-border bg-foreground py-20 text-background">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal variant="blur-in">
            <div className="text-center">
              <h2 className="font-display mx-auto max-w-2xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
                Not sure who to <span className="text-brand">work with?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-background/70">
                Tell us a little about what you're looking for and our intake team will match you
                with the right clinician.
              </p>
              <div className="mt-8 flex justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-bold uppercase tracking-wide text-brand-foreground transition hover:brightness-95"
                >
                  Contact us
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </SiteShell>
  );
}

function Directory() {
  const [query, setQuery] = useState("");
  const [activeSpecialty, setActiveSpecialty] = useState<string | null>(null);
  const { data: psychologists = [], isLoading } = useQuery({
    queryKey: ["public-psychologists"],
    queryFn: () => getPublicPsychologistsFn(),
    staleTime: 5 * 60_000,
  });

  const specialties = useMemo(
    () => [...new Set(psychologists.flatMap((p) => p.specialties))].sort(),
    [psychologists],
  );

  const matchesQuery = (p: PublicPsychologistDTO) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.specialties.some((t) => t.toLowerCase().includes(q))
    );
  };

  const matchesSpecialty = (p: PublicPsychologistDTO) =>
    activeSpecialty == null || p.specialties.includes(activeSpecialty);

  const filtered = psychologists.filter((p) => matchesQuery(p) && matchesSpecialty(p));

  return (
    <section
      className="relative overflow-hidden border-b border-border py-16 sm:py-20"
      style={{ backgroundColor: "#F4C430" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-foreground/5"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-foreground/5"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <ScrollReveal variant="blur-in">
          <h1 className="font-display text-center text-5xl font-black leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Our Team
          </h1>

          <div className="relative mx-auto mt-8 max-w-2xl">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, title, or specialty…"
              className="w-full rounded-full border border-border bg-background py-3 pl-12 pr-5 text-sm shadow-sm outline-none transition focus:border-foreground"
            />
          </div>

          {specialties.length >= 2 && (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSpecialty(null)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                  activeSpecialty == null
                    ? "bg-foreground text-background"
                    : "border border-foreground/20 bg-background/60 text-foreground hover:border-foreground"
                }`}
              >
                All
              </button>
              {specialties.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setActiveSpecialty((cur) => (cur === s ? null : s))}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                    activeSpecialty === s
                      ? "bg-foreground text-background"
                      : "border border-foreground/20 bg-background/60 text-foreground hover:border-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {!isLoading && (
            <p className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.18em] text-foreground/60">
              Showing {filtered.length} of {psychologists.length} psychologists
            </p>
          )}

          {isLoading && (
            <div className="relative mt-6 flex flex-wrap justify-center gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-full max-w-[320px] sm:w-[calc(50%-0.5rem)] xl:w-[calc(25%-0.75rem)]">
                  <PsychologistCardSkeleton />
                </div>
              ))}
            </div>
          )}
          {!isLoading && (
            <StaggerContainer className="relative mt-6 flex flex-wrap items-start justify-center gap-4">
              {psychologists.length === 0 && (
                <p className="py-10 text-center text-sm text-foreground/70">
                  Our clinician directory is being updated. Please check back soon.
                </p>
              )}
              {psychologists.length > 0 && filtered.length === 0 && (
                <p className="py-10 text-center text-sm text-foreground/70">
                  No psychologists match your search.
                </p>
              )}
              {filtered.map((p) => (
                <StaggerItem
                  key={p.id}
                  className="w-full max-w-[320px] sm:w-[calc(50%-0.5rem)] xl:w-[calc(25%-0.75rem)]"
                >
                  <PsychologistCard p={p} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
