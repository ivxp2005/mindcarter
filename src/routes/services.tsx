import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "../components/site-shell";
import { PageHero } from "../components/page-hero";
import {
  Brain, Building2, ClipboardCheck, Compass, Sparkles, Bot,
  GraduationCap, HeartPulse, Users, ShieldCheck, ArrowRight
} from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../components/scroll-reveal";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Mindcarter" },
      { name: "description", content: "Individual therapy, organizational consulting, assessments, executive coaching and enterprise mental health." },
      { property: "og:title", content: "Services — Mindcarter" },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

const SERVICES = [
  { icon: Brain, title: "Individual Therapy", desc: "One-on-one clinical care with licensed psychologists, delivered in-person or online." },
  { icon: Building2, title: "Organizational Consulting", desc: "Diagnostics and interventions for culture, org design and complex change." },
  { icon: ClipboardCheck, title: "Psychometric Assessments", desc: "Validated instruments across personality, EI, cognition and workplace behavior." },
  { icon: Compass, title: "Executive Coaching", desc: "Confidential coaching for founders, executives and rising leaders." },
  { icon: Users, title: "Leadership Development", desc: "Cohort programs to build resilient, values-aligned leadership benches." },
  { icon: Sparkles, title: "Cognitive Crafting", desc: "Structured reframing using CBT, ACT and mindfulness practices." },
  { icon: Bot, title: "AI Assistant", desc: "24/7 reflective companion tuned to your clinical care plan." },
  { icon: GraduationCap, title: "Career Coaching", desc: "Purpose-led career navigation, transition and re-entry support." },
  { icon: HeartPulse, title: "Corporate Wellness", desc: "Enterprise mental health programs designed with people teams." },
  { icon: ShieldCheck, title: "Employee Assistance", desc: "Confidential EAP programs for organizations of every size." },
];

function AbstractBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div
        className="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vw] rounded-full opacity-[0.15] blur-[120px] dark:opacity-[0.05]"
        style={{ background: "radial-gradient(circle, var(--brand) 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-[40%] -right-[20%] h-[80vh] w-[60vw] rounded-full opacity-[0.08] blur-[150px] dark:opacity-[0.03]"
        style={{ background: "radial-gradient(circle, var(--foreground) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-[20%] left-[20%] h-[60vh] w-[80vw] rounded-full opacity-[0.12] blur-[120px] dark:opacity-[0.04]"
        style={{ background: "radial-gradient(circle, var(--brand) 0%, transparent 80%)" }}
      />
    </div>
  );
}

function ServicesPage() {
  return (
    <SiteShell>
      <AbstractBackground />
      <ScrollReveal yOffset={40}>
        <PageHero
          eyebrow="Services"
          title="Care and consulting, engineered for outcomes."
          description="A full-spectrum practice covering clinical therapy, assessments and enterprise mental health — all delivered by doctorate-level clinicians."
        />
      </ScrollReveal>
      <section className="py-20">
        <StaggerContainer className="mx-auto grid max-w-7xl gap-4 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <StaggerItem key={s.title}>
              <article
                className="group flex h-full flex-col rounded-2xl border border-border/60 bg-background/40 p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/30 hover:bg-background/80 hover:shadow-[0_20px_40px_-24px_rgba(244,196,48,0.15)] dark:hover:shadow-[0_20px_40px_-24px_rgba(244,196,48,0.05)]"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-foreground text-background transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-foreground">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-mono text-muted-foreground/70 transition-colors duration-300 group-hover:text-brand">
                    S/{String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="mt-6 text-xl font-semibold tracking-tight">{s.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                <Link to="/contact" className="mt-8 inline-flex w-fit items-center gap-1 text-sm font-semibold transition-transform duration-300 group-hover:translate-x-1">
                  Book Consultation <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>
    </SiteShell>
  );
}