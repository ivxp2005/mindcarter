import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Star, MapPin, X } from "lucide-react";
import { PortalPageHeader, PortalEmpty, PortalLoading } from "../components/portal-page-header";
import { listDoctors, type Doctor } from "../services/patient-api";

export const Route = createFileRoute("/patient/doctors")({
  component: DoctorsPage,
});

function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [active, setActive] = useState<Doctor | null>(null);

  useEffect(() => {
    // TODO: Supabase — listDoctors()
    listDoctors().then(setDoctors);
  }, []);

  const specialties = useMemo(
    () => ["All", ...Array.from(new Set(doctors?.map((d) => d.specialty) ?? []))],
    [doctors],
  );

  const filtered = useMemo(() => {
    if (!doctors) return [];
    return doctors.filter((d) => {
      const matchesQ =
        !query ||
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.specialty.toLowerCase().includes(query.toLowerCase());
      const matchesS = specialty === "All" || d.specialty === specialty;
      return matchesQ && matchesS;
    });
  }, [doctors, query, specialty]);

  return (
    <>
      <PortalPageHeader
        eyebrow="Our Doctors"
        title="Find your clinician"
        subtitle="Board-certified psychologists, therapists and coaches — vetted for the Mindcarter standard."
      />

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or specialty…"
            className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {specialties.map((s) => (
            <button
              key={s}
              onClick={() => setSpecialty(s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                specialty === s
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {!doctors ? (
          <PortalLoading />
        ) : filtered.length === 0 ? (
          <PortalEmpty title="No doctors match your filters." hint="Try clearing the search or specialty." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((d) => (
              <button
                key={d.id}
                onClick={() => setActive(d)}
                className="group rounded-2xl border border-border bg-background p-5 text-left transition hover:border-foreground"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={d.photo}
                    alt={d.name}
                    className="h-14 w-14 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{d.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{d.specialty}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <Star className="h-3.5 w-3.5 fill-brand text-brand" />
                    {d.rating}
                    <span className="text-muted-foreground">({d.reviews})</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {d.location}
                  </span>
                </div>
                <p className="mt-4 line-clamp-2 text-xs text-muted-foreground">{d.bio}</p>
                <span className="mt-4 inline-block text-xs font-semibold group-hover:underline">
                  View profile →
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-0 sm:place-items-center sm:p-6"
          onClick={() => setActive(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-t-2xl bg-background sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border p-6">
              <div className="flex items-center gap-4">
                <img src={active.photo} alt={active.name} className="h-16 w-16 rounded-full object-cover" />
                <div>
                  <p className="text-lg font-semibold">{active.name}</p>
                  <p className="text-xs text-muted-foreground">{active.specialty}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold">
                    <Star className="h-3.5 w-3.5 fill-brand text-brand" />
                    {active.rating} · {active.reviews} reviews
                  </p>
                </div>
              </div>
              <button onClick={() => setActive(null)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6 text-sm">
              <p className="text-muted-foreground">{active.bio}</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-border p-3">
                  <p className="uppercase tracking-wider text-muted-foreground">Experience</p>
                  <p className="mt-1 text-sm font-semibold">{active.experience} years</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="uppercase tracking-wider text-muted-foreground">Languages</p>
                  <p className="mt-1 text-sm font-semibold">{active.languages.join(", ")}</p>
                </div>
                <div className="col-span-2 rounded-lg border border-border p-3">
                  <p className="uppercase tracking-wider text-muted-foreground">Location</p>
                  <p className="mt-1 text-sm font-semibold">{active.location}</p>
                </div>
              </div>
              <button className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-brand-foreground">
                Book with {active.name.split(" ")[1]}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}