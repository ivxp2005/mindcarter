import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Clock, PenLine, Quote, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../components/ui/chart";
import { StaggerContainer, StaggerItem, ScrollReveal } from "../../components/scroll-reveal";
import { CountUp } from "../../components/count-up";
import { usePatientData } from "../../lib/patient-store";
import { MOOD_EMOJI, MOOD_LABEL, TODAY, type Mood } from "../../lib/patient";

export const Route = createFileRoute("/client/journal")({
  validateSearch: (search: Record<string, unknown>): { open?: string } => ({
    open: typeof search.open === "string" ? search.open : undefined,
  }),
  component: JournalPage,
});

/** Premium ease-out — matches the marketing site's motion language. */
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const moodConfig: ChartConfig = {
  mood: { label: "Mood", color: "var(--brand)" },
};

function formatDate(dateStr: string) {
  if (dateStr === TODAY) return "Today";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function JournalPage() {
  const { open } = Route.useSearch();
  const { journal: entries, stats, moodTrend, checkInMood, addJournalEntry } = usePatientData();
  const [selected, setSelected] = useState<string | null>(open ?? entries[0]?.id ?? null);
  const [checkedInMood, setCheckedInMood] = useState<Mood | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood>(3);
  const [tagDraft, setTagDraft] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (open) setSelected(open);
  }, [open]);

  const detail = entries.find((e) => e.id === selected) ?? null;

  const addTag = () => {
    const tag = tagDraft.trim();
    if (!tag || tags.includes(tag)) return;
    setTags((prev) => [...prev, tag]);
    setTagDraft("");
  };
  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleCheckIn = (m: Mood) => {
    setCheckedInMood(m);
    checkInMood(m);
    toast.success(`Mood logged: ${MOOD_LABEL[m]} ${MOOD_EMOJI[m]}`);
  };

  const handleSaveEntry = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    addJournalEntry({
      mood,
      title: title.trim(),
      content: content.trim(),
      tags,
    });
    setTitle("");
    setContent("");
    setTags([]);
    setMood(3);
    toast.success("Journal entry saved.");
  };

  return (
    <div className="space-y-4">
      {/* ─────────────────── Hero band + mood check-in ─────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-foreground text-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/25 blur-3xl"
          animate={{ scale: [1, 1.18, 1], x: [0, 20, 0], y: [0, -12, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative flex flex-col gap-6 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-background/60">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Wellness
            </p>
            <h1 className="font-display mt-3 overflow-hidden text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.75, ease: EASE_OUT }}
              >
                Wellness journal
              </motion.span>
            </h1>
            <p className="mt-3 max-w-md text-sm text-background/60">
              Track your mood day to day and jot down what's on your mind — your care team can spot
              patterns you might not notice yourself.
            </p>
            <div className="mt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-background/50">
                Today's check-in — how are you feeling?
              </p>
              <div className="mt-3 flex gap-2">
                {([1, 2, 3, 4, 5] as Mood[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleCheckIn(m)}
                    className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl transition-all duration-200 ease-out hover:-translate-y-1 active:scale-90 ${
                      checkedInMood === m ? "bg-brand" : "bg-background/10 hover:bg-background/20"
                    }`}
                    aria-label={MOOD_LABEL[m]}
                    title={MOOD_LABEL[m]}
                  >
                    {MOOD_EMOJI[m]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            className="grid shrink-0 grid-cols-3 gap-4 rounded-2xl border border-background/15 bg-background/10 p-5 text-center backdrop-blur-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28, ease: EASE_OUT }}
          >
            <div>
              <p className="text-2xl font-black">
                <CountUp value={stats.streakDays} />
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-background/60">
                Day streak
              </p>
            </div>
            <div>
              <p className="text-2xl font-black">
                <CountUp value={stats.avgMood} decimals={1} />
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-background/60">
                Avg mood
              </p>
            </div>
            <div>
              <p className="text-2xl font-black">
                <CountUp value={entries.length} />
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-background/60">
                Entries
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mood trend */}
      <ScrollReveal>
        <section className="rounded-2xl border border-border bg-background p-6">
          <h2 className="text-lg font-semibold">Mood trend</h2>
          <p className="text-sm text-muted-foreground">Weekly average over the last 8 weeks</p>
          <ChartContainer config={moodConfig} className="mt-4 aspect-auto h-56 w-full">
            <AreaChart data={moodTrend}>
              <defs>
                <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-mood)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-mood)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="mood"
                type="monotone"
                stroke="var(--color-mood)"
                fill="url(#moodFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </section>
      </ScrollReveal>

      {/* New entry composer */}
      <ScrollReveal>
        <section className="rounded-2xl border border-border bg-background p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <PenLine className="h-4 w-4 text-brand" /> New journal entry
          </h2>
          <form onSubmit={handleSaveEntry} className="mt-4 space-y-4">
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as Mood[]).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMood(m)}
                  className={`grid h-10 w-10 place-items-center rounded-xl text-xl transition-all duration-200 ease-out hover:-translate-y-0.5 ${
                    mood === m ? "bg-brand/20 ring-2 ring-brand" : "bg-muted hover:bg-muted/70"
                  }`}
                  aria-label={MOOD_LABEL[m]}
                  title={MOOD_LABEL[m]}
                >
                  {MOOD_EMOJI[m]}
                </button>
              ))}
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this entry a title…"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="What's on your mind today?"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground"
            />
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-foreground"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </span>
              ))}
              <input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag…"
                className="w-32 rounded-full border border-border bg-background px-3 py-1.5 text-xs outline-none transition-colors focus:border-foreground"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
            >
              Save entry
            </button>
          </form>
        </section>
      </ScrollReveal>

      {/* Entries list + detail */}
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <StaggerContainer className="space-y-2" staggerDelay={0.05}>
          {entries.map((e) => (
            <StaggerItem key={e.id}>
              <button
                onClick={() => setSelected(e.id)}
                className={`group w-full rounded-2xl border-l-4 p-4 text-left transition-all duration-200 ease-out ${
                  selected === e.id
                    ? "border-l-brand bg-brand/5"
                    : "border-l-border bg-background hover:translate-x-0.5 hover:border-l-brand/50 hover:bg-muted"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="text-xl leading-none transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-110"
                    aria-hidden
                  >
                    {MOOD_EMOJI[e.mood]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{e.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{e.content}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {formatDate(e.date)}
                    </p>
                  </div>
                </div>
              </button>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {detail ? (
          <section className="rounded-2xl border border-border bg-background p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-3xl leading-none" aria-hidden>
                  {MOOD_EMOJI[detail.mood]}
                </span>
                <div>
                  <h2 className="text-xl font-black tracking-tight">{detail.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(detail.date)} · Feeling {MOOD_LABEL[detail.mood]}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mt-6 rounded-2xl bg-muted/40 p-5">
              <Quote className="h-5 w-5 text-brand/60" />
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
                {detail.content}
              </p>
            </div>

            {detail.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {detail.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
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
