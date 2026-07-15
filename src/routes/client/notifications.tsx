import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarHeart, NotebookPen, MessageSquare, Bell, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { StaggerContainer, StaggerItem } from "../../components/scroll-reveal";
import { CountUp } from "../../components/count-up";
import { usePatientData } from "../../lib/patient-store";
import type { NotificationKind, PortalNotification } from "../../lib/patient";

export const Route = createFileRoute("/client/notifications")({
  component: NotificationsPage,
});

/** Premium ease-out — matches the marketing site's motion language. */
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const KIND_ICON: Record<NotificationKind, typeof CalendarHeart> = {
  session: CalendarHeart,
  journal: NotebookPen,
  message: MessageSquare,
  system: Bell,
};

function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications: items, stats, markNotificationRead, markAllRead } = usePatientData();
  const unreadCount = stats.unreadCount;

  const handleMarkAllRead = () => {
    markAllRead();
    toast.success("All notifications marked as read.");
  };

  const handleClick = (n: PortalNotification) => {
    markNotificationRead(n.id);
    if (n.actionTo) {
      navigate({ to: n.actionTo, search: n.actionSearch ?? {} });
    }
  };

  return (
    <div className="space-y-4">
      {/* ─────────────────────────── Hero band ─────────────────────────── */}
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
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand/25 blur-3xl"
          animate={{ scale: [1, 1.18, 1], x: [0, 24, 0], y: [0, -14, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative flex flex-col gap-8 p-8 sm:p-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-background/60">
              <span className="relative flex h-1.5 w-1.5">
                {unreadCount > 0 && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75 motion-reduce:animate-none" />
                )}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
              </span>
              Inbox · {unreadCount} unread
            </p>
            <h1 className="font-display mt-3 overflow-hidden text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.75, ease: EASE_OUT }}
              >
                Notifications
              </motion.span>
            </h1>
            <p className="mt-3 max-w-md text-sm text-background/60">
              Session reminders, journal nudges and messages from your care team.
            </p>
          </div>

          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28, ease: EASE_OUT }}
          >
            <div className="rounded-2xl border border-background/15 bg-background/10 px-6 py-4 text-center backdrop-blur-md">
              <p className="text-2xl font-black tracking-tight">
                <CountUp value={unreadCount} />
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-background/50">
                Unread
              </p>
            </div>
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              <CheckCheck className="h-4 w-4" /> Mark all as read
            </button>
          </motion.div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-background p-6">
        <StaggerContainer className="divide-y divide-border" staggerDelay={0.04}>
          {items.map((n) => {
            const Icon = KIND_ICON[n.kind];
            return (
              <StaggerItem key={n.id}>
                <button
                  onClick={() => handleClick(n)}
                  className="group relative flex w-full items-start gap-4 rounded-xl p-3 text-left transition-all duration-200 ease-out hover:translate-x-0.5 hover:bg-muted"
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-transform duration-200 group-hover:scale-105 ${
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
