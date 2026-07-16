import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Phone, Star, CalendarClock, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GradientAvatar } from "../../components/gradient-avatar";
import { CountUp } from "../../components/count-up";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../../components/scroll-reveal";
import { Badge } from "../../components/ui/badge";
import { usePatientData } from "../../lib/patient-store";
import { todayISO } from "../../lib/patient";

export const Route = createFileRoute("/client/care-team")({
  component: CareTeamPage,
});

/** Premium ease-out — matches the marketing site's motion language. */
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function formatDate(dateStr: string) {
  if (dateStr === todayISO()) return "Today";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function CareTeamPage() {
  const { careTeam, sessions, openBooking } = usePatientData();
  const totalSessions = careTeam.reduce((sum, m) => sum + m.sessionCount, 0);

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
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Your care team
            </p>
            <h1 className="font-display mt-3 overflow-hidden text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.75, ease: EASE_OUT }}
              >
                Care team
              </motion.span>
            </h1>
            <motion.p
              className="mt-3 max-w-md text-sm text-background/60"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
            >
              The clinicians supporting your care. Message them directly or book a follow-up
              session.
            </motion.p>
          </div>

          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28, ease: EASE_OUT }}
          >
            <div className="rounded-2xl border border-background/15 bg-background/10 px-6 py-4 text-center backdrop-blur-md">
              <p className="text-2xl font-black tracking-tight">
                <CountUp value={careTeam.length} />
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-background/50">
                Clinicians
              </p>
            </div>
            <div className="rounded-2xl border border-background/15 bg-background/10 px-6 py-4 text-center backdrop-blur-md">
              <p className="text-2xl font-black tracking-tight">
                <CountUp value={totalSessions} />
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-background/50">
                Sessions together
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <StaggerContainer className="grid gap-4 lg:grid-cols-2" staggerDelay={0.08}>
        {careTeam.map((member) => {
          const history = sessions.filter((s) => s.psychologistId === member.id);
          return (
            <StaggerItem key={member.id}>
              <section className="group flex h-full flex-col rounded-2xl border border-border bg-background p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <GradientAvatar name={member.name} size="xl" />
                    <div>
                      <p className="text-lg font-bold leading-tight">{member.name}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {member.title}
                      </p>
                    </div>
                  </div>
                  {member.primary && (
                    <Badge className="shrink-0 bg-brand text-brand-foreground">Primary</Badge>
                  )}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{member.bio}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {member.specialties.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors group-hover:border-brand/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 border-y border-border py-4 text-center">
                  <div>
                    <p className="text-base font-bold text-foreground">
                      <CountUp value={member.sessionCount} />
                    </p>
                    <p className="mt-0.5 text-[9px] uppercase leading-tight tracking-wide text-muted-foreground">
                      Sessions
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center justify-center gap-1 text-base font-bold text-foreground">
                      <Star className="h-3.5 w-3.5 fill-brand text-brand" />{" "}
                      <CountUp value={member.rating} decimals={1} />
                    </p>
                    <p className="mt-0.5 text-[9px] uppercase leading-tight tracking-wide text-muted-foreground">
                      Rating
                    </p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">
                      {member.nextSession ? formatDate(member.nextSession) : "—"}
                    </p>
                    <p className="mt-0.5 text-[9px] uppercase leading-tight tracking-wide text-muted-foreground">
                      Next session
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> {member.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" /> {member.phone}
                  </p>
                  {history.length > 0 && (
                    <p className="flex items-center gap-2">
                      <CalendarClock className="h-3.5 w-3.5" /> {history.length} sessions on record
                    </p>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <button
                    onClick={() =>
                      toast.success(`Message sent to ${member.name} (mock).`, {
                        description: "They typically reply within one business day.",
                      })
                    }
                    className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-muted active:translate-y-0 active:scale-95"
                  >
                    <MessageCircle className="h-4 w-4" /> Message
                  </button>
                  <button
                    onClick={() => openBooking(member.id)}
                    className="rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
                  >
                    Book session
                  </button>
                </div>
              </section>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      <ScrollReveal>
        <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Looking for a different specialist?{" "}
            <Link to="/" className="font-semibold text-foreground underline underline-offset-2">
              Browse our full roster
            </Link>{" "}
            of psychologists and coaches.
          </p>
        </section>
      </ScrollReveal>
    </div>
  );
}
