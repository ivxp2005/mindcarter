import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, ClipboardList } from "lucide-react";
import { PortalPageHeader, PortalEmpty, StatusPill } from "../components/portal-page-header";
import { listAssessments, type Assessment } from "../services/patient-api";

export const Route = createFileRoute("/patient/assessments")({
  component: AssessmentsPage,
});

function AssessmentsPage() {
  const [items, setItems] = useState<Assessment[] | null>(null);
  const [active, setActive] = useState<Assessment | null>(null);

  useEffect(() => {
    // TODO: Supabase — listAssessments()
    listAssessments().then(setItems);
  }, []);

  return (
    <>
      <PortalPageHeader
        eyebrow="Assessments"
        title="Psychometrics & inventories"
        subtitle="Complete assessments to unlock personalised insights and share results with your clinician."
      />

      <div className="mt-8">
        {!items ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/40" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <PortalEmpty title="No assessments assigned." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((a) => (
              <div key={a.id} className="rounded-2xl border border-border bg-background p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {a.category} · {a.duration}
                    </p>
                    <p className="mt-1 text-base font-semibold">{a.title}</p>
                  </div>
                  <StatusPill status={a.status} />
                </div>
                {a.status === "in_progress" && (
                  <div className="mt-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-brand" style={{ width: `${a.progress}%` }} />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{a.progress}% complete</p>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <ClipboardList className="h-4 w-4" />
                    {a.status === "completed" ? `Score ${a.score}` : "Standardised"}
                  </div>
                  {a.status === "completed" ? (
                    <button
                      onClick={() => setActive(a)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold"
                    >
                      View results
                    </button>
                  ) : (
                    <button className="rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background">
                      {a.status === "in_progress" ? "Resume" : "Start"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-6" onClick={() => setActive(null)}>
          <div className="w-full max-w-md rounded-2xl bg-background" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-border p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {active.category}
                </p>
                <p className="mt-1 text-lg font-semibold">{active.title}</p>
              </div>
              <button onClick={() => setActive(null)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="rounded-2xl bg-foreground p-6 text-background">
                <p className="text-xs uppercase tracking-wider opacity-70">Composite score</p>
                <p className="mt-2 text-5xl font-black">{active.score}</p>
              </div>
              <p className="text-sm text-muted-foreground">{active.summary}</p>
              <button className="w-full rounded-full border border-border py-2.5 text-sm font-semibold">
                Download full report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}