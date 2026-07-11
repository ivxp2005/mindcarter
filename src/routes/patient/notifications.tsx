import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarHeart, NotebookPen, MessageSquare, Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { StaggerContainer, StaggerItem } from "../../components/scroll-reveal";
import { NOTIFICATIONS, type NotificationKind, type PortalNotification } from "../../lib/patient";

export const Route = createFileRoute("/patient/notifications")({
  component: NotificationsPage,
});

const KIND_ICON: Record<NotificationKind, typeof CalendarHeart> = {
  session: CalendarHeart,
  journal: NotebookPen,
  message: MessageSquare,
  system: Bell,
};

function NotificationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<PortalNotification[]>(NOTIFICATIONS);
  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read.");
  };

  const handleClick = (n: PortalNotification) => {
    setItems((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)));
    if (n.actionTo) {
      navigate({ to: n.actionTo, search: n.actionSearch ?? {} });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Inbox · {unreadCount} unread
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Notifications</h1>
        </div>
        <button
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck className="h-4 w-4" /> Mark all as read
        </button>
      </div>

      <section className="rounded-2xl border border-border bg-background p-6">
        <StaggerContainer className="divide-y divide-border" staggerDelay={0.04}>
          {items.map((n) => {
            const Icon = KIND_ICON[n.kind];
            return (
              <StaggerItem key={n.id}>
                <button
                  onClick={() => handleClick(n)}
                  className="relative flex w-full items-start gap-4 rounded-xl p-3 text-left transition hover:bg-muted"
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                      n.read ? "bg-muted text-muted-foreground" : "bg-brand text-brand-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm ${n.read ? "font-medium text-foreground" : "font-bold text-foreground"}`}
                      >
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{n.time}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                  </div>
                  {!n.read && (
                    <span className="absolute right-3 top-3 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  )}
                </button>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>
    </div>
  );
}
