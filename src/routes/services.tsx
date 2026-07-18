import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "../components/site-shell";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../components/scroll-reveal";
import {
  Brain,
  Building2,
  ClipboardCheck,
  Compass,
  Sparkles,
  Bot,
  GraduationCap,
  HeartPulse,
  Users,
  ShieldCheck,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Quote,
  type LucideIcon,
} from "lucide-react";
import amarRajanImg from "../assets/amar-rajan.png";
import servicesBannerImg from "../assets/image copy 6.png";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Mindcarter" },
      {
        name: "description",
        content:
          "Individual therapy, organizational consulting, assessments, executive coaching and enterprise mental health.",
      },
      { property: "og:title", content: "Services — Mindcarter" },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

const GOLD = "#F4C430";
const INK = "#111111";

const SERVICES: { icon: LucideIcon; title: string; desc: string }[] = [

  {
    icon: Building2,
    title: "Organizational Consulting",
    desc: "Diagnostics and interventions for culture, org design and complex change.",
  },
  {
    icon: ClipboardCheck,
    title: "Psychometric Assessments",
    desc: "Validated instruments across personality, EI, cognition and workplace behavior.",
  },
  {
    icon: Compass,
    title: "Executive Coaching",
    desc: "Confidential coaching for founders, executives and rising leaders.",
  },
  {
    icon: Users,
    title: "Leadership Development",
    desc: "Cohort programs to build resilient, values-aligned leadership benches.",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    desc: "24/7 reflective companion tuned to your clinical care plan.",
  },
  {
    icon: GraduationCap,
    title: "Career Coaching",
    desc: "Purpose-led career navigation, transition and re-entry support.",
  },
  {
    icon: ShieldCheck,
    title: "Employee Assistance",
    desc: "Confidential EAP programs for organizations of every size.",
  },
];

const PROCESS = [
  { n: "01", word: "Discover", variant: "black" as const },
  { n: "02", word: "Enable", variant: "gold" as const },
  { n: "03", word: "Evolve", variant: "black" as const },
];

const TEAM = [
  { name: "Dr. Aditi Carter", role: "Clinical Psychologist" },
  { name: "Dr. Marcus Vale", role: "Organizational Psychologist" },
  { name: "Dr. Lena Ortiz", role: "Neuropsychologist" },
  { name: "Dr. Rohan Mehra", role: "Executive Coach" },
];

function Eyebrow({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-[0.28em]"
      style={{ color: dark ? "rgba(255,255,255,0.65)" : "rgba(17,17,17,0.55)" }}
    >
      <span
        aria-hidden
        className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
        style={{ backgroundColor: GOLD }}
      />
      {label}
    </p>
  );
}

// ─── 1. Hero ──────────────────────────────────────────────────────────────
function ServicesHero() {
  return (
    <section className="relative overflow-hidden">
      <img
        src={servicesBannerImg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-foreground/15" />

      <div className="relative mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
        <ScrollReveal>
          <Eyebrow label="Services" dark />
          <h1
            className="font-display mt-4 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
            style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
          >
            Organizational Psychology Solutions, Designed for Impact.
          </h1>
          <p
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/85"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.45)" }}
          >
            Evidence-based assessments, coaching and consulting that help organizations make
            better people decisions.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold shadow-lg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95"
            style={{ backgroundColor: GOLD, color: INK }}
          >
            Book Consultation <ArrowRight className="h-4 w-4" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ─── 2. Who we are ──────────────────────────────────────────────────────────
function WhoWeAre() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-10">
        <ScrollReveal>
          <Eyebrow label="Who we are" />
          <h2 className="font-display mt-4 text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            A premier authority in organizational behavior.
          </h2>
          <p className="mt-6 max-w-lg text-lg font-semibold leading-snug text-foreground">
            MindCarter is an organizational psychology consulting firm that helps organizations
            make better people decisions through the science of human behavior.
          </p>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            We partner with organizations to strengthen leadership, enhance employee wellbeing,
            improve talent decisions, and build high-performing workplaces using evidence-based
            organizational psychology. Our work is grounded in rigorous psychological science,
            informed by contemporary research, and translated into practical solutions that
            create lasting organizational impact.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            style={{ backgroundColor: INK }}
          >
            Read More <ArrowRight className="h-4 w-4" />
          </Link>
        </ScrollReveal>

        <ScrollReveal delay={0.15} className="relative">
          <div
            aria-hidden
            className="absolute -right-10 -top-10 h-[110%] w-[85%]"
            style={{ backgroundColor: INK, clipPath: "polygon(20% 0, 100% 0, 80% 100%, 0% 100%)" }}
          />
          <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl shadow-2xl sm:w-4/5">
            <img src={amarRajanImg} alt="Amar Rajan — CEO, Mindcarter" className="h-full w-full object-cover object-top" />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ─── 3. What we do ──────────────────────────────────────────────────────────
function WhatWeDo() {
  return (
    <section className="border-t border-border bg-muted/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal className="text-center">
          <Eyebrow label="What we do" />
          <h2 className="font-display mx-auto mt-4 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            How we help you
          </h2>
        </ScrollReveal>

        <StaggerContainer className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <StaggerItem key={s.title} className="flex gap-4">
              <span
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full"
                style={{ backgroundColor: GOLD }}
              >
                <s.icon className="h-6 w-6" style={{ color: INK }} />
              </span>
              <div>
                <h3 className="text-base font-bold tracking-tight text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

// ─── 4. How we work ─────────────────────────────────────────────────────────
function HowWeWork() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <Eyebrow label="How we work" />
          <h2 className="font-display mt-4 text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Discover. Enable. Evolve.
          </h2>
        </ScrollReveal>

        <div className="mt-16 flex flex-col gap-3 sm:flex-row sm:gap-0">
          {PROCESS.map((step, i) => (
            <ScrollReveal key={step.word} delay={i * 0.1} className="relative flex-1">
              <div
                className="relative flex h-56 flex-col items-center justify-center gap-3 sm:mx-[-1.5rem]"
                style={{
                  backgroundColor: step.variant === "gold" ? GOLD : INK,
                  clipPath:
                    i === 0
                      ? "polygon(0 0, 100% 0, 88% 100%, 0% 100%)"
                      : i === PROCESS.length - 1
                        ? "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)"
                        : "polygon(12% 0, 100% 0, 88% 100%, 0% 100%)",
                }}
              >
                <span
                  className="text-xs font-mono"
                  style={{ color: step.variant === "gold" ? INK : GOLD }}
                >
                  {step.n}
                </span>
                <span
                  className="font-display text-3xl font-black uppercase tracking-tight"
                  style={{ color: step.variant === "gold" ? INK : "white" }}
                >
                  {step.word}
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 5. Meet the team ────────────────────────────────────────────────────────
function DiamondAvatar({ name }: { name: string }) {
  const initials = name
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <div
      className="mx-auto grid h-24 w-24 rotate-45 place-items-center overflow-hidden rounded-2xl shadow-xl"
      style={{ background: `linear-gradient(135deg, ${GOLD}, ${INK})` }}
    >
      <span className="-rotate-45 text-lg font-black text-white">{initials}</span>
    </div>
  );
}

function MeetTheTeam() {
  return (
    <section className="border-t border-border bg-muted/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal className="text-center">
          <Eyebrow label="Our creative bench" />
          <h2 className="font-display mx-auto mt-4 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Meet the team
          </h2>
        </ScrollReveal>

        <StaggerContainer className="mt-20 grid grid-cols-2 gap-x-6 gap-y-16 sm:grid-cols-4">
          {TEAM.map((t) => (
            <StaggerItem key={t.name} className="text-center">
              <DiamondAvatar name={t.name} />
              <p className="mt-6 text-sm font-bold tracking-tight text-foreground">{t.name}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {t.role}
              </p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

// ─── 6. Testimonial ──────────────────────────────────────────────────────────
function Testimonial() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <ScrollReveal className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 text-center sm:flex-row sm:text-left">
        <div
          className="grid h-24 w-24 shrink-0 rotate-45 place-items-center rounded-2xl shadow-xl"
          style={{ backgroundColor: GOLD }}
        >
          <Quote className="-rotate-45 h-8 w-8" style={{ color: INK }} strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-display text-2xl font-black italic leading-snug tracking-tight text-foreground sm:text-3xl">
            &ldquo;Every breakthrough begins with being understood.&rdquo;
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            — The Mindcarter Team
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}

// ─── 7. Get in touch ─────────────────────────────────────────────────────────
function GetInTouch() {
  return (
    <section className="border-t border-border py-20 sm:py-24" style={{ backgroundColor: INK }}>
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal className="text-center">
          <Eyebrow label="Get in touch" dark />
          <h2 className="font-display mx-auto mt-4 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl">
            Ready to evolve? Book a confidential consultation.
          </h2>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold shadow-lg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95"
            style={{ backgroundColor: GOLD, color: INK }}
          >
            Book Consultation <ArrowRight className="h-4 w-4" />
          </Link>
        </ScrollReveal>

        <StaggerContainer className="mx-auto mt-16 grid max-w-3xl gap-8 border-t border-white/10 pt-12 sm:grid-cols-3">
          <StaggerItem className="flex flex-col items-center gap-3 text-center">
            <Mail className="h-5 w-5" style={{ color: GOLD }} />
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Email</p>
            <p className="text-sm font-medium text-white">info@mindcarter.com</p>
          </StaggerItem>
          <StaggerItem className="flex flex-col items-center gap-3 text-center">
            <Phone className="h-5 w-5" style={{ color: GOLD }} />
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Phone</p>
            <p className="text-sm font-medium text-white">+91 75940 71071</p>
          </StaggerItem>
          <StaggerItem className="flex flex-col items-center gap-3 text-center">
            <MapPin className="h-5 w-5" style={{ color: GOLD }} />
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Office</p>
            <p className="text-sm font-medium text-white">
              Module no: A, Tejaswini, Technopark, Trivandrum
            </p>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}

function ServicesPage() {
  return (
    <SiteShell>
      <ServicesHero />
      <WhoWeAre />
      <WhatWeDo />
      <HowWeWork />
      <MeetTheTeam />
      <Testimonial />
      <GetInTouch />
    </SiteShell>
  );
}
