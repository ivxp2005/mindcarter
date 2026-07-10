import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { PortalPageHeader, PortalEmpty } from "../components/portal-page-header";
import { listReports, type Report } from "../services/patient-api";

export const Route = createFileRoute("/patient/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const [reports, setReports] = useState<Report[] | null>(null);

  useEffect(() => {
    // TODO: Supabase — listReports()
    listReports().then(setReports);
  }, []);

  const max = reports ? Math.max(...reports.map((r) => r.score)) : 100;

  const handleDownload = (r: Report) => {
    // TODO: Supabase — generate signed URL from Storage bucket for `r.id`
    console.log("Download report", r.id);
  };

  return (
    <>
      <PortalPageHeader
        eyebrow="Reports"
        title="Your report library"
        subtitle="Assessment reports, therapy summaries and wellbeing snapshots. All exportable as PDF."
      />

      <section className="mt-8 rounded-2xl border border-border bg-background p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Score trend
            </p>
            <p className="mt-1 text-lg font-semibold">Composite index over time</p>
          </div>
        </div>
        {!reports ? (
          <div className="mt-6 h-40 animate-pulse rounded-xl bg-muted/40" />
        ) : (
          <div className="mt-6 flex h-40 items-end gap-4">
            {[...reports].reverse().map((r) => (
              <div key={r.id} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-foreground transition-all"
                  style={{ height: `${(r.score / max) * 100}%` }}
                  aria-label={`${r.title} score ${r.score}`}
                />
                <p className="text-[10px] font-semibold text-muted-foreground">{r.date.split(",")[0]}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-6">
        {!reports ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted/40" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <PortalEmpty title="No reports yet." hint="Complete an assessment to generate one." />
        ) : (
          <div className="divide-y divide-border rounded-2xl border border-border bg-background">
            {reports.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="flex items-center gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.type} · {r.date} · {r.size}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(r)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-semibold"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}