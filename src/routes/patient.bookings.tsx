import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Video, MapPin } from "lucide-react";
import { PortalPageHeader, PortalEmpty, StatusPill } from "../components/portal-page-header";
import { listBookings, type Booking } from "../services/patient-api";

export const Route = createFileRoute("/patient/bookings")({
  component: BookingsPage,
});

function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    // TODO: Supabase — listBookings()
    listBookings().then(setBookings);
  }, []);

  const filtered = useMemo(
    () => bookings?.filter((b) => (tab === "upcoming" ? !b.past : b.past)) ?? [],
    [bookings, tab],
  );

  return (
    <>
      <PortalPageHeader
        eyebrow="Bookings"
        title="Your sessions"
        actions={
          <button className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground">
            <Plus className="h-4 w-4" /> New Booking
          </button>
        }
      />

      <div className="mt-8 inline-flex rounded-full border border-border bg-background p-1">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              tab === t ? "bg-foreground text-background" : "text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {!bookings ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <PortalEmpty
            title={tab === "upcoming" ? "No upcoming sessions." : "No past sessions yet."}
            hint={tab === "upcoming" ? "Book with a doctor to get started." : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-background p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-foreground text-background">
                    {b.mode === "Video" ? <Video className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{b.doctor}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.service} · {b.mode}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold">
                    {b.date} · {b.time}
                  </p>
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <StatusPill status={b.status} />
                    {tab === "upcoming" && b.status === "confirmed" && (
                      <button className="rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-background">
                        Join
                      </button>
                    )}
                    {tab === "upcoming" && (
                      <button className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold">
                        Manage
                      </button>
                    )}
                    {tab === "past" && b.status === "completed" && (
                      <button className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold">
                        View notes
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}