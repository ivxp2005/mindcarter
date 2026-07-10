import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PortalShell } from "../components/portal-shell";
import { Users, CalendarDays, DollarSign, Activity } from "lucide-react";

export const Route = createFileRoute("/secure-admin-portal")({
  head: () => ({ meta: [{ title: "Admin — Mindcarter" }, { name: "robots", content: "noindex" }] }),
  component: AdminPortal,
});

function AdminPortal() {
  const [signedIn, setSignedIn] = useState(false);
  if (!signedIn) return <AdminLogin onSubmit={() => setSignedIn(true)} />;

  return (
    <PortalShell
      brand="Admin Console"
      navItems={[
        { label: "Dashboard" },
        { label: "Users" },
        { label: "Psychologists" },
        { label: "Appointments" },
        { label: "Revenue" },
        { label: "System Health" },
        { label: "Settings" },
      ]}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Overview</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Platform health</h1>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Users, l: "Patients", v: "18,540" },
          { icon: Users, l: "Psychologists", v: "241" },
          { icon: CalendarDays, l: "Appts (30d)", v: "9,214" },
          { icon: DollarSign, l: "Revenue (30d)", v: "$1.24M" },
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Manage users</h2>
            <input placeholder="Search users…" className="rounded-full border border-border bg-background px-4 py-1.5 text-xs outline-none focus:border-foreground" />
          </div>
          <table className="mt-6 w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="pb-3 font-semibold">Name</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {[
                ["Alex Morgan", "Patient", "Verified"],
                ["Dr. Aditi Carter", "Psychologist", "Verified"],
                ["Priya Shah", "Patient", "Pending"],
                ["Dr. Marcus Vale", "Psychologist", "Verified"],
                ["Daniel Reyes", "Patient", "Suspended"],
              ].map((r) => (
                <tr key={r[0]} className="border-t border-border">
                  <td className="py-3">{r[0]}</td>
                  <td className="py-3 text-muted-foreground">{r[1]}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">{r[2]}</span>
                  </td>
                  <td className="py-3 text-right"><button className="text-xs font-semibold">Manage →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-2xl border border-border bg-background p-6">
          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-brand" />
            <h2 className="text-lg font-semibold">System health</h2>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              ["API", "Operational"],
              ["Video service", "Operational"],
              ["Payments", "Degraded"],
              ["Backups", "Completed 02:14"],
              ["Maintenance window", "Sun 03:00 UTC"],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between rounded-xl border border-border p-3">
                <span>{k}</span>
                <span className="text-xs font-semibold text-muted-foreground">{v}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PortalShell>
  );
}

function AdminLogin({ onSubmit }: { onSubmit: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-foreground px-6 text-background">
      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
        className="w-full max-w-md rounded-3xl border border-background/10 bg-foreground p-10"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">Secure</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Admin sign in</h1>
        <p className="mt-2 text-sm text-background/60">Restricted access. All activity is audited.</p>
        <div className="mt-8 space-y-4">
          <input placeholder="Admin email" className="w-full rounded-xl border border-background/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-brand" required />
          <input type="password" placeholder="Password" className="w-full rounded-xl border border-background/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-brand" required />
          <input placeholder="2FA code" className="w-full rounded-xl border border-background/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-brand" required />
        </div>
        <button type="submit" className="mt-8 w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground">
          Sign in to console
        </button>
      </form>
    </div>
  );
}