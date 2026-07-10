import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "../components/portal-shell";
import { CalendarDays, Users, Notebook, Bell } from "lucide-react";

export const Route = createFileRoute("/psychologist")({
  head: () => ({ meta: [{ title: "Psychologist Portal — Mindcarter" }, { name: "robots", content: "noindex" }] }),
  component: PsychologistPortal,
});

function PsychologistPortal() {
  return (
    <PortalShell
      brand="Psychologist Portal"
      navItems={[
        { label: "Dashboard" },
        { label: "Meetings" },
        { label: "Patients" },
        { label: "Diaries" },
        { label: "Analytics" },
        { label: "Notifications" },
        { label: "Profile" },
      ]}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Practice overview</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Dr. Aditi Carter — Wednesday</h1>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full border border-border px-4 py-2 text-sm font-semibold">Open calendar</button>
          <button className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background">Start next session</button>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: CalendarDays, l: "Today's meetings", v: "5" },
          { icon: Users, l: "Active patients", v: "42" },
          { icon: Notebook, l: "Diaries pending", v: "3" },
          { icon: Bell, l: "Notifications", v: "7" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background">
              <s.icon className="h-4 w-4" />
            </span>
            <p className="mt-6 text-3xl font-black tracking-tight">{s.v}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-2xl border border-border bg-background p-6">
          <h2 className="text-lg font-semibold">Today's schedule</h2>
          <div className="mt-4 divide-y divide-border">
            {[
              { t: "09:00", n: "Alex M.", k: "Individual therapy" },
              { t: "10:30", n: "Priya S.", k: "Assessment review" },
              { t: "13:00", n: "Northwind exec cohort", k: "Group coaching" },
              { t: "15:00", n: "Daniel R.", k: "Executive coaching" },
              { t: "16:30", n: "Meera I.", k: "Intake" },
            ].map((s) => (
              <div key={s.t} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-muted-foreground">{s.t}</span>
                  <div>
                    <p className="text-sm font-semibold">{s.n}</p>
                    <p className="text-xs text-muted-foreground">{s.k}</p>
                  </div>
                </div>
                <button className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold">Open</button>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-background p-6">
          <h2 className="text-lg font-semibold">Recent patient diaries</h2>
          <ul className="mt-4 space-y-3">
            {["Alex M. — SOAP note", "Priya S. — Treatment plan v2", "Daniel R. — Progress review", "Meera I. — Intake summary"].map((a) => (
              <li key={a} className="rounded-xl border border-border p-3 text-sm">
                {a}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PortalShell>
  );
}