import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Quote } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { GradientAvatar } from "../../components/gradient-avatar";
import { StaggerContainer, StaggerItem } from "../../components/scroll-reveal";
import { usePsychologistData } from "../../lib/psychologist-store";

export const Route = createFileRoute("/psychologist/diaries")({
  validateSearch: (search: Record<string, unknown>): { open?: string } => ({
    open: typeof search.open === "string" ? search.open : undefined,
  }),
  component: DiariesPage,
});

type Filter = "all" | "pending_review" | "reviewed";

function DiariesPage() {
  const { open } = Route.useSearch();
  const { diaries: entries, saveDiaryNote, markDiaryReviewed } = usePsychologistData();
  const [filter, setFilter] = useState<Filter>("pending_review");
  const [selected, setSelected] = useState<string | null>(open ?? null);
  const [noteDraft, setNoteDraft] = useState("");

  useEffect(() => {
    if (open) setSelected(open);
  }, [open]);

  useEffect(() => {
    if (!selected && entries.length > 0) setSelected(entries[0].id);
  }, [selected, entries]);

  const detail = entries.find((d) => d.id === selected) ?? null;

  useEffect(() => {
    setNoteDraft(detail?.clinicianNote ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.id]);

  const filtered = entries.filter((d) => filter === "all" || d.status === filter);

  const markReviewed = (id: string) => {
    markDiaryReviewed(id);
    toast.success("Diary marked as reviewed.");
  };

  const saveNote = () => {
    if (!detail) return;
    saveDiaryNote(detail.id, noteDraft);
    toast.success("Note saved.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Clinical notes
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Patient diaries</h1>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="pending_review">
              Pending ({entries.filter((d) => d.status === "pending_review").length})
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              Reviewed ({entries.filter((d) => d.status === "reviewed").length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({entries.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <StaggerContainer className="space-y-2" staggerDelay={0.05}>
          {filtered.map((d) => (
            <StaggerItem key={d.id}>
              <button
                onClick={() => setSelected(d.id)}
                className={`w-full rounded-2xl border-l-4 p-4 text-left transition ${
                  selected === d.id
                    ? "border-l-brand bg-brand/5"
                    : d.status === "pending_review"
                      ? "border-l-brand/50 bg-background hover:bg-muted"
                      : "border-l-border bg-background hover:bg-muted"
                }`}
              >
                <div className="flex items-start gap-3">
                  <GradientAvatar name={d.patientName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{d.title}</p>
                      {d.status === "pending_review" ? (
                        <Badge variant="secondary" className="shrink-0">
                          Pending
                        </Badge>
                      ) : (
                        <Badge className="shrink-0 bg-brand text-brand-foreground">Reviewed</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{d.excerpt}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> Submitted {d.submitted}
                    </p>
                  </div>
                </div>
              </button>
            </StaggerItem>
          ))}
          {filtered.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No entries in this category.
            </p>
          )}
        </StaggerContainer>

        {detail ? (
          <section className="rounded-2xl border border-border bg-background p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <GradientAvatar name={detail.patientName} size="lg" />
                <div>
                  <h2 className="text-xl font-black tracking-tight">{detail.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {detail.patientName} · Submitted {detail.submitted}
                  </p>
                </div>
              </div>
              {detail.status === "pending_review" ? (
                <Badge variant="secondary">Pending</Badge>
              ) : (
                <Badge className="bg-brand text-brand-foreground">Reviewed</Badge>
              )}
            </div>

            <div className="relative mt-6 rounded-2xl bg-muted/40 p-5">
              <Quote className="h-5 w-5 text-brand/60" />
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
                {detail.content}
              </p>
            </div>

            <div className="mt-6">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Clinician note
              </label>
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={3}
                placeholder="Add a private note about this entry…"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
              />
              <button
                onClick={saveNote}
                className="mt-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
              >
                Save note
              </button>
            </div>

            {detail.status === "pending_review" && (
              <button
                onClick={() => markReviewed(detail.id)}
                className="mt-6 flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
              >
                <CheckCircle2 className="h-4 w-4" /> Mark as reviewed
              </button>
            )}
          </section>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
            Select an entry to view details.
          </div>
        )}
      </div>
    </div>
  );
}
