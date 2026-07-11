import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Mail, Phone, BellRing, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../components/ui/sheet";
import { Badge } from "../../components/ui/badge";
import { GradientAvatar } from "../../components/gradient-avatar";
import { StaggerContainer, StaggerItem } from "../../components/scroll-reveal";
import { MEETINGS, PATIENTS, PRACTICE_STATS, type PatientStatus } from "../../lib/psychologist";

export const Route = createFileRoute("/psychologist/patients")({
  validateSearch: (search: Record<string, unknown>): { open?: string } => ({
    open: typeof search.open === "string" ? search.open : undefined,
  }),
  component: PatientsPage,
});

function statusBadge(status: PatientStatus) {
  if (status === "Active") return <Badge className="bg-brand text-brand-foreground">Active</Badge>;
  if (status === "New") return <Badge variant="secondary">New</Badge>;
  return <Badge variant="outline">Inactive</Badge>;
}

function PatientsPage() {
  const { open } = Route.useSearch();
  const [tab, setTab] = useState<"All" | PatientStatus>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(open ?? null);

  useEffect(() => {
    if (open) setSelected(open);
  }, [open]);

  const filtered = PATIENTS.filter((p) => {
    const matchesTab = tab === "All" || p.status === tab;
    const q = search.toLowerCase();
    const matchesSearch =
      !q || p.name.toLowerCase().includes(q) || p.primaryConcern.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const detail = PATIENTS.find((p) => p.id === selected) ?? null;
  const detailHistory = detail ? MEETINGS.filter((m) => m.patientId === detail.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Patients
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Patient roster</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {PRACTICE_STATS.activePatients} active patients practice-wide
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="All">All</TabsTrigger>
            <TabsTrigger value="Active">Active</TabsTrigger>
            <TabsTrigger value="New">New</TabsTrigger>
            <TabsTrigger value="Inactive">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients…"
            className="w-48 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.04}>
        {filtered.map((p) => (
          <StaggerItem key={p.id}>
            <button
              onClick={() => setSelected(p.id)}
              className="group w-full rounded-2xl border border-border bg-background p-5 text-left transition hover:-translate-y-0.5 hover:border-brand/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <GradientAvatar name={p.name} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.primaryConcern}</p>
                  </div>
                </div>
                {statusBadge(p.status)}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Sessions</p>
                  <p className="font-semibold text-foreground">{p.totalSessions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Next session</p>
                  <p className="font-semibold text-foreground">{p.nextSession ?? "—"}</p>
                </div>
              </div>
            </button>
          </StaggerItem>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-16 text-center text-sm text-muted-foreground">
            No patients match your filters.
          </p>
        )}
      </StaggerContainer>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {detail && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <GradientAvatar name={detail.name} size="xl" />
                  <div>
                    <SheetTitle>{detail.name}</SheetTitle>
                    <SheetDescription>{detail.primaryConcern}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-2 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {detail.email}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> {detail.phone}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" /> Next session:{" "}
                  {detail.nextSession ?? "Not scheduled"}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {detail.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Session history ({detailHistory.length})
                </p>
                <div className="mt-3 space-y-2">
                  {detailHistory.map((m) => (
                    <div key={m.id} className="rounded-xl border border-border p-3 text-sm">
                      <p className="font-medium">{m.kind}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.date} · {m.time} · {m.mode}
                      </p>
                    </div>
                  ))}
                  {detailHistory.length === 0 && (
                    <p className="text-sm text-muted-foreground">No recorded sessions yet.</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => toast.success("Reminder sent to patient (mock).")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
              >
                <BellRing className="h-4 w-4" /> Log diary reminder
              </button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
