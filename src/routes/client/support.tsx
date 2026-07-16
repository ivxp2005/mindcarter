import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LifeBuoy, Send } from "lucide-react";
import { toast } from "sonner";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../../components/scroll-reveal";
import { usePatientData } from "../../lib/patient-store";

export const Route = createFileRoute("/client/support")({
  component: SupportPage,
});

const PRIORITIES = ["low", "medium", "high"] as const;
const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};
const STATUS_COLOR: Record<string, string> = {
  open: "text-blue-600 bg-blue-50",
  in_progress: "text-amber-600 bg-amber-50",
  resolved: "text-emerald-600 bg-emerald-50",
};

function SupportPage() {
  const { tickets, submitTicket, replyToTicket } = usePatientData();
  const [selected, setSelected] = useState<string | null>(tickets[0]?.id ?? null);
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("medium");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const detail = tickets.find((t) => t.id === selected) ?? tickets[0] ?? null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    submitTicket({ subject: subject.trim(), priority, message: message.trim() });
    setSubject("");
    setMessage("");
    setPriority("medium");
    toast.success("Support ticket submitted.");
  };

  const handleReply = () => {
    if (!reply.trim() || !detail) return;
    replyToTicket(detail.id, reply.trim());
    setReply("");
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-foreground p-8 text-background">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-background/60">
          <LifeBuoy className="h-3.5 w-3.5" /> Support
        </p>
        <h1 className="font-display mt-3 text-3xl font-black tracking-tight">Help &amp; Support</h1>
        <p className="mt-2 max-w-md text-sm text-background/60">
          Run into a problem or have feedback? File a ticket and our team will get back to you here.
        </p>
      </section>

      <ScrollReveal>
        <section className="rounded-2xl border border-border bg-background p-6">
          <h2 className="text-lg font-semibold">New ticket</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's this about?"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground"
            />
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all duration-200 ease-out ${
                    priority === p
                      ? "bg-brand text-brand-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Describe the issue…"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground"
            />
            <button
              type="submit"
              className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
            >
              Submit ticket
            </button>
          </form>
        </section>
      </ScrollReveal>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <StaggerContainer className="space-y-2" staggerDelay={0.05}>
          {tickets.map((t) => (
            <StaggerItem key={t.id}>
              <button
                onClick={() => setSelected(t.id)}
                className={`w-full rounded-2xl border-l-4 p-4 text-left transition-all duration-200 ease-out ${
                  detail?.id === t.id
                    ? "border-l-brand bg-brand/5"
                    : "border-l-border bg-background hover:translate-x-0.5 hover:border-l-brand/50 hover:bg-muted"
                }`}
              >
                <p className="truncate text-sm font-semibold">{t.subject}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLOR[t.status]}`}
                  >
                    {STATUS_LABEL[t.status]}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            </StaggerItem>
          ))}
          {tickets.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No tickets yet — submit one above.
            </p>
          )}
        </StaggerContainer>

        {detail ? (
          <section className="flex flex-col rounded-2xl border border-border bg-background">
            <div className="flex items-center justify-between gap-4 border-b border-border p-5">
              <div>
                <h2 className="text-base font-black">{detail.subject}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Opened {new Date(detail.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_COLOR[detail.status]}`}
              >
                {STATUS_LABEL[detail.status]}
              </span>
            </div>
            <div className="flex-1 space-y-4 p-5">
              {detail.messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : ""}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                      m.sender === "user" ? "bg-brand/10" : "bg-muted"
                    }`}
                  >
                    <p>{m.text}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {new Date(m.time).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {detail.status !== "resolved" && (
              <div className="flex gap-2 border-t border-border p-4">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleReply();
                    }
                  }}
                  placeholder="Add more detail…"
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-foreground"
                />
                <button
                  onClick={handleReply}
                  disabled={!reply.trim()}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground transition disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
            Select a ticket to view the conversation.
          </div>
        )}
      </div>
    </div>
  );
}
