import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Send, Search } from "lucide-react";
import { PortalPageHeader } from "../components/portal-page-header";
import {
  listConversations,
  listMessages,
  sendMessage,
  type Conversation,
  type Message,
} from "../services/patient-api";

export const Route = createFileRoute("/patient/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [thread, setThread] = useState<Message[] | null>(null);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    // TODO: Supabase — listConversations()
    listConversations().then((c) => {
      setConversations(c);
      setActiveId(c[0]?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setThread(null);
    // TODO: Supabase — listMessages(activeId)
    listMessages(activeId).then(setThread);
  }, [activeId]);

  const active = conversations?.find((c) => c.id === activeId) ?? null;
  const filtered =
    conversations?.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())) ?? [];

  const onSend = async () => {
    if (!draft.trim() || !activeId) return;
    // TODO: Supabase — sendMessage(activeId, draft)
    const msg = await sendMessage(activeId, draft.trim());
    setThread((t) => [...(t ?? []), msg]);
    setDraft("");
  };

  return (
    <>
      <PortalPageHeader eyebrow="Messages" title="Secure inbox" />

      <div className="mt-8 grid gap-4 overflow-hidden rounded-2xl border border-border bg-background lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-border lg:border-b-0 lg:border-r">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations"
                className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-foreground"
              />
            </div>
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            {!conversations ? (
              <div className="space-y-2 p-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-muted/40" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="p-6 text-center text-xs text-muted-foreground">No conversations.</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left transition ${
                    activeId === c.id
                      ? "border-foreground bg-muted/40"
                      : "border-transparent hover:bg-muted/30"
                  }`}
                >
                  <img src={c.avatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{c.name}</p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground">
                      {c.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="flex min-h-[520px] flex-col">
          {!active ? (
            <div className="grid flex-1 place-items-center text-sm text-muted-foreground">
              Select a conversation
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-border p-4">
                <img src={active.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold">{active.name}</p>
                  <p className="text-[11px] text-muted-foreground">{active.role}</p>
                </div>
              </header>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {!thread ? (
                  <div className="space-y-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-10 animate-pulse rounded-2xl bg-muted/40" />
                    ))}
                  </div>
                ) : (
                  thread.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm ${
                          m.from === "me"
                            ? "bg-foreground text-background"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p>{m.text}</p>
                        <p className="mt-1 text-[10px] opacity-70">{m.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSend();
                }}
                className="flex items-center gap-2 border-t border-border p-3"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message…"
                  className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-foreground"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foreground text-background"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </>
  );
}