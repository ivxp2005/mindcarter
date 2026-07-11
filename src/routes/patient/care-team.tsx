import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Phone, Star, CalendarClock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { GradientAvatar } from "../../components/gradient-avatar";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../../components/scroll-reveal";
import { Badge } from "../../components/ui/badge";
import { CARE_TEAM, SESSIONS, TODAY } from "../../lib/patient";

export const Route = createFileRoute("/patient/care-team")({
  component: CareTeamPage,
});

function formatDate(dateStr: string) {
  if (dateStr === TODAY) return "Today";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function CareTeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Your care team
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Care team</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          The clinicians supporting your care. Message them directly or book a follow-up session.
        </p>
      </div>

      <StaggerContainer className="grid gap-4 lg:grid-cols-2" staggerDelay={0.08}>
        {CARE_TEAM.map((member) => {
          const history = SESSIONS.filter((s) => s.psychologistId === member.id);
          return (
            <StaggerItem key={member.id}>
              <section className="flex h-full flex-col rounded-2xl border border-border bg-background p-6">
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
                      className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 border-y border-border py-4 text-center">
                  <div>
                    <p className="text-base font-bold text-foreground">{member.totalSessions}</p>
                    <p className="mt-0.5 text-[9px] uppercase leading-tight tracking-wide text-muted-foreground">
                      Sessions
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center justify-center gap-1 text-base font-bold text-foreground">
                      <Star className="h-3.5 w-3.5 fill-brand text-brand" /> {member.rating}
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
                    className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
                  >
                    <MessageCircle className="h-4 w-4" /> Message
                  </button>
                  <Link
                    to="/booking"
                    search={{ name: member.name, role: member.title, price: member.price }}
                    className="rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
                  >
                    Book session
                  </Link>
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
