import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { GradientAvatar } from "../gradient-avatar";
import { formatINR } from "../../lib/booking-flow";
import type { CareTeamMemberDTO } from "../../lib/patient-store";

/**
 * Clinician card for the /employee/book listing — adapted from the home page's
 * Psychologists grid and the portal care-team card so all three stay visually
 * consistent. Photo/languages don't exist in the DB, so the card uses
 * GradientAvatar and shows only real fields.
 */
export function ClinicianCard({
  member,
  nextAvailable,
  nextAvailableLoading,
}: {
  member: CareTeamMemberDTO;
  /** Derived from real booked-slot data; null = nothing free in the horizon. */
  nextAvailable: string | null;
  nextAvailableLoading: boolean;
}) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-background p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <GradientAvatar name={member.name} size="xl" />
          <div className="min-w-0">
            <h3 className="text-lg font-bold leading-tight">{member.name}</h3>
            <p className="mt-0.5 text-[11px] uppercase leading-snug tracking-[0.16em] text-muted-foreground">
              {member.title}
            </p>
          </div>
        </div>
        {member.rating > 0 && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-semibold">
            <Star className="h-3.5 w-3.5 fill-brand text-brand" />
            {member.rating.toFixed(1)}
          </span>
        )}
      </div>

      {member.bio && (
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {member.bio}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {member.specialties.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors group-hover:border-brand/30"
          >
            {tag}
          </span>
        ))}
        {member.specialties.length > 3 && (
          <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            +{member.specialties.length - 3}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-2 border-y border-border py-3.5">
        <div>
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Per session</p>
          <p className="text-base font-bold text-foreground">
            {member.price > 0 ? formatINR(member.price) : "Fee confirmed at booking"}
          </p>
        </div>
        {nextAvailableLoading ? (
          <span className="h-6 w-32 animate-pulse rounded-full bg-muted" aria-hidden />
        ) : (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              nextAvailable ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"
            }`}
          >
            {nextAvailable && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
            )}
            {nextAvailable ? `Next: ${nextAvailable}` : "Limited availability"}
          </span>
        )}
      </div>

      <div className="mt-auto pt-4">
        <Link
          to="/employee/book/$clinicianId"
          params={{ clinicianId: member.id }}
          className="block w-full rounded-full bg-brand py-2.5 text-center text-sm font-semibold text-brand-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
        >
          Book now
        </Link>
      </div>
    </article>
  );
}
