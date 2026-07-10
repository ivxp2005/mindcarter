import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarClock, MessageSquare, ClipboardList, FileBarChart2, UserRound } from "lucide-react";
import { PortalPageHeader } from "../components/portal-page-header";
import {
  listAssessments,
  listBookings,
  listReports,
  listConversations,
  type Assessment,
  type Booking,
} from "../services/patient-api";

export const Route = createFileRoute("/patient/")({
  component: PatientDashboard,
});

function PatientDashboard() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [assessments, setAssessments] = useState<Assessment[] | null>(null);
  const [counts, setCounts] = useState({ assessments: 0, reports: 0, messages: 0 });

  useEffect(() => {
    // TODO: Supabase — parallel fetch of dashboard data
    Promise.all([listBookings(), listAssessments(), listReports(), listConversations()]).then(
      ([b, a, r, c]) => {
        setBookings(b);
        setAssessments(a);
        setCounts({
          assessments: a.filter((x) => x.status !== "completed").length,
          reports: r.length,
          messages: c.reduce((n, x) => n + x.unread, 0),
        });
      },
    );
  }, []);

  const upcoming = bookings?.filter((b) => !b.past) ?? [];

  return (
    <>
      <PortalPageHeader
        eyebrow="Welcome back"
        title="Good afternoon, Alex."
        actions={
          <Link
            to="/patient/doctors"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
          >
            Book a session
          </Link>
        }
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: CalendarClock, l: "Upcoming", v: upcoming.length },
          { icon: ClipboardList, l: "Assessments", v: counts.assessments },
          { icon: FileBarChart2, l: "Reports", v: counts.reports },
          { icon: MessageSquare, l: "Messages", v: counts.messages },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background">
              <s.icon className="h-4 w-4" />
            </span>
            <p className="mt-6 text-3xl font-black tracking-tight">
              {bookings ? s.v : "—"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-border bg-background p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming appointments</h2>
            <Link to="/patient/bookings" className="text-xs font-semibold">
              View all →
            </Link>
          </div>
          {!bookings ? (
            <div className="mt-4 space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/40" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No upcoming sessions.</p>
          ) : (
            <div className="mt-4 divide-y divide-border">
              {upcoming.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-semibold">{a.doctor}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.service} · {a.mode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold">
                      {a.date} · {a.time}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button className="rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-background">
                        Join
                      </button>
                      <button className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold">
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-border bg-background p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recommended assessments</h2>
            <Link to="/patient/assessments" className="text-xs font-semibold">
              View all →
            </Link>
          </div>
          {!assessments ? (
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-muted/40" />
              ))}
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {assessments.slice(0, 4).map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{a.title}</p>
                  </div>
                  <Link
                    to="/patient/assessments"
                    className="text-xs font-semibold"
                  >
                    {a.status === "completed"
                      ? "View →"
                      : a.status === "in_progress"
                      ? "Resume →"
                      : "Start →"}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}