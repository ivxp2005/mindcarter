import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Phone } from "lucide-react";
import { SiteShell } from "../components/site-shell";
import amarRajanImg from "../assets/amar-rajan.png";
import heroImg from "../assets/hero.jpg";
import aboutUsImg from "../assets/345.png";
import aboutBannerImg from "../assets/image copy.png";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../components/scroll-reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Mindcarter" },
      {
        name: "description",
        content:
          "Mindcarter is a research-backed psychology & organizational consulting practice. Learn about our mission, vision, and team.",
      },
      { property: "og:title", content: "About — Mindcarter" },
      { property: "og:description", content: "Our mission, vision and team." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

/* ── Small eyebrow label reused across sections ─────────────────────────── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
      <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" />
      {children}
    </p>
  );
}

/* ── 1. Hero banner — full-bleed geometric background, centered copy ────── */
function AboutHero() {
  return (
    <section className="relative overflow-hidden">
      <img
        src={aboutBannerImg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-foreground/15" />

      <div className="relative mx-auto max-w-3xl px-6 py-14 text-center sm:py-20">
        <ScrollReveal>
          <p
            className="text-sm font-semibold italic text-white"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
          >
            About Us
          </p>
          <h1
            className="font-display mt-4 text-3xl font-black leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl"
            style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
          >
            Where Organizational Psychology Meets{" "}
            <span className="italic text-brand">Human Potential</span>
          </h1>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── 2. About us — copy left, team photo right with floating purpose card ─ */
function AboutUs() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-28">
      {/* soft flowing wave pinned to the bottom edge, below the content */}
      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-24 w-full text-brand sm:h-32"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M-40 120 C 320 30, 680 210, 1040 110 C 1260 55, 1400 90, 1480 65 L 1480 200 L -40 200 Z"
          fill="currentColor"
          opacity="0.06"
        />
        <path
          d="M-40 150 C 340 60, 700 230, 1060 130 C 1270 72, 1400 105, 1480 85"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.16"
        />
      </svg>

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <ScrollReveal>
          <Eyebrow>About us</Eyebrow>
          <h2 className="font-display mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Better people decisions, through the science of human behavior.
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            MindCarter is an organizational psychology consulting firm that helps organizations
            understand the people behind performance.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            We partner with organizations to strengthen leadership, enhance employee wellbeing,
            improve talent decisions, and build high-performing workplaces using evidence-based
            organizational psychology. Our work is grounded in rigorous psychological science,
            informed by contemporary research, and translated into practical solutions that create
            lasting organizational impact.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Our expertise spans psychometric assessment, personality-based leadership development,
            employee assistance programs, behavioral interviewing, executive coaching, and
            organizational development — each solution designed to enable more effective hiring,
            stronger leadership, healthier teams, and more resilient organizational cultures.
          </p>

          <motion.div
            initial={false}
            animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Evidence is the foundation of every intervention. We integrate validated psychological
              frameworks, internationally recognized assessment methodologies, and behavioral
              science to deliver solutions that are scientifically robust, ethically grounded, and
              relevant to the realities of today&rsquo;s workplaces — tailored to each
              organization&rsquo;s strategic objectives, culture, and workforce rather than built on
              generic management practices.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We believe sustainable organizational success begins with understanding people. By
              combining scientific rigor with practical application, we help leaders make informed
              decisions, unlock individual and team potential, and create workplaces where people
              and organizations thrive together.
            </p>
          </motion.div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline decoration-brand decoration-2 underline-offset-4 transition hover:text-brand"
          >
            {expanded ? "Read less" : "Read more"}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </ScrollReveal>

        {/* Right — team photo with triangle corner accents */}
        <ScrollReveal delay={0.15} className="relative">
          <div className="relative overflow-hidden">
            <img
              src={aboutUsImg}
              alt="MindCarter consultants celebrating a successful working session"
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
          </div>

          {/* triangle cascade — top-left corner */}
          <svg
            aria-hidden
            className="pointer-events-none absolute -left-6 -top-6 h-40 w-40"
            viewBox="0 0 200 200"
          >
            <path d="M0 0 H80 L0 80 Z" className="fill-brand" />
            <path d="M90 0 H150 L90 60 Z" className="fill-foreground/85" />
            <path d="M0 90 H60 L0 150 Z" className="fill-foreground/20" />
            <path d="M160 0 H200 L160 40 Z" className="fill-brand/40" />
            <path d="M0 160 H40 L0 200 Z" className="fill-brand/40" />
          </svg>

          {/* triangle cascade — bottom-right corner */}
          <svg
            aria-hidden
            className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40"
            viewBox="0 0 200 200"
          >
            <path d="M200 200 V120 L120 200 Z" className="fill-brand" />
            <path d="M200 110 V50 L140 110 Z" className="fill-foreground/85" />
            <path d="M110 200 H50 L110 140 Z" className="fill-foreground/20" />
            <path d="M200 40 V0 L160 40 Z" className="fill-brand/40" />
            <path d="M40 200 H0 L40 160 Z" className="fill-brand/40" />
          </svg>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── 3. Our story — copy left, portrait on a full-height brand panel right ─ */
function OurStory() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-background">
      {/* full-height two-tone panel on the right — cream left half, gold right half */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] lg:block"
      >
        <div className="absolute inset-y-0 left-0 w-1/2 bg-brand/15" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-brand" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 sm:py-28 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        {/* Left — copy */}
        <ScrollReveal className="lg:pr-10">
          <Eyebrow>Our story</Eyebrow>
          <h2 className="font-display mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Built on the Science of Human Behavior. Designed for the Future of Work.
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            MindCarter was founded with a simple belief: organizations perform at their best when
            they understand the people behind performance. As workplaces become increasingly shaped
            by AI, technological disruption, and changing workforce expectations, success depends not
            only on innovation but also on understanding human behavior.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Drawing on the principles of organizational psychology and behavioral science, we help
            organizations make better people decisions—from selecting and developing talent to
            strengthening leadership, supporting employee wellbeing, and building high-performing
            teams. Every solution we deliver is grounded in scientific evidence, informed by real
            workplace challenges, and designed to create measurable organizational impact.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            At MindCarter, we exist to help individuals discover their potential, enable meaningful
            growth, and evolve alongside the organizations they help shape.
          </p>
        </ScrollReveal>

        {/* Right — portrait straddling the panel edge */}
        <ScrollReveal delay={0.15} className="relative lg:-translate-x-10">
          <div className="relative flex items-end justify-center overflow-hidden shadow-2xl">
            {/* split backdrop — gold left half, opaque cream right half */}
            <div aria-hidden className="absolute inset-y-0 left-0 w-1/2 bg-brand" />
            <div aria-hidden className="absolute inset-y-0 right-0 w-1/2 bg-[#fdf6e0]" />

            {/* bubbles floating across the whole backdrop */}
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 400 300"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* gold half — white bubbles */}
              <circle cx="35" cy="45" r="20" className="fill-white/35" />
              <circle cx="110" cy="25" r="9" className="fill-white/45" />
              <circle cx="26" cy="130" r="7" fill="none" strokeWidth="3" className="stroke-white/60" />
              <circle cx="45" cy="225" r="26" className="fill-white/25" />
              <circle cx="130" cy="272" r="11" className="fill-white/40" />
              {/* cream half — gold bubbles */}
              <circle cx="300" cy="42" r="22" className="fill-brand/35" />
              <circle cx="368" cy="24" r="9" fill="none" strokeWidth="3" className="stroke-brand/60" />
              <circle cx="378" cy="110" r="12" className="fill-brand/55" />
              <circle cx="352" cy="205" r="26" className="fill-brand/25" />
              <circle cx="288" cy="270" r="10" className="fill-brand/45" />
              <circle cx="386" cy="268" r="7" fill="none" strokeWidth="3" className="stroke-brand/50" />
            </svg>
            <img
              src={amarRajanImg}
              alt="Amar Rajan — CEO, Mindcarter"
              className="relative max-h-[480px] w-auto object-contain object-bottom"
              loading="lazy"
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── 4. Mission & Vision — centered heading above, three panels below ────── */
function MissionVision() {
  return (
    <section className="relative border-t border-border bg-background pt-20 sm:pt-28">
      {/* section heading */}
      <ScrollReveal>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Eyebrow>What drives us</Eyebrow>
          <h2 className="font-display mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            The principles that guide every engagement.
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Two commitments shape how we show up for the people and organizations we serve — one for
            today, one for the world we&rsquo;re working toward.
          </p>
        </div>
      </ScrollReveal>

      <div className="mt-14 grid lg:grid-cols-3">
        {/* Vision — cream panel */}
        <ScrollReveal className="flex flex-col items-center justify-center bg-[#fdf6e0] px-8 py-16 text-center text-foreground sm:px-12 lg:py-24">
          <h2 className="font-display text-3xl font-black uppercase leading-tight tracking-wide">
            Our
            <br />
            <span className="text-brand">Vision</span>
          </h2>
          <div aria-hidden className="mt-5 h-0.5 w-10 bg-brand" />
          <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            To be a globally trusted organizational psychology company advancing the future of work
            by integrating behavioral science, human-centered AI, and evidence-based practice. We
            envision a world where organizations harness technology not to replace human potential,
            but to discover it, enable it, and help it evolve.
          </p>
        </ScrollReveal>

        {/* Middle — team photo on white */}
        <ScrollReveal
          delay={0.1}
          className="flex items-center justify-center bg-background px-8 py-10 sm:px-12"
        >
          <img
            src={heroImg}
            alt="The Mindcarter team"
            className="max-h-[440px] w-full object-cover"
            loading="lazy"
          />
        </ScrollReveal>

        {/* Mission — gold panel */}
        <ScrollReveal
          delay={0.2}
          className="flex flex-col items-center justify-center bg-brand px-8 py-16 text-center text-brand-foreground sm:px-12 lg:py-24"
        >
          <h2 className="font-display text-3xl font-black uppercase leading-tight tracking-wide">
            Our
            <br />
            Mission
          </h2>
          <div aria-hidden className="mt-5 h-0.5 w-10 bg-brand-foreground" />
          <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-brand-foreground/80">
            To help individuals and organizations thrive in the age of AI by applying evidence-based
            organizational psychology to improve people decisions, strengthen leadership, enhance
            employee wellbeing, and build workplaces where human potential and technology work
            together to create sustainable organizational success.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}



/* ── 5. Why choose Mindcarter — dark panel, four numbered pillars ────────── */
const WHY_ITEMS = [
  {
    k: "01",
    t: "Evidence-based",
    sub: "Research, not intuition",
    d: "A premier authority in organizational behavior, offering evidence-based solutions grounded in academic rigor and published research.",
  },
  {
    k: "02",
    t: "Global expertise",
    sub: "Practitioners, not theorists",
    d: "A team of global experts and revered industry practitioners keeps us at the forefront of the latest trends.",
  },
  {
    k: "03",
    t: "Specialized offerings",
    sub: "Assessments to coaching",
    d: "Internationally recognized psychometric assessments, comprehensive training, developmental initiatives and coaching programs.",
  },
  {
    k: "04",
    t: "Lasting impact",
    sub: "Built to last",
    d: "Practical, research-rooted solutions that enhance organizational effectiveness and nurture employee satisfaction.",
  },
];

function WhyItem({ item }: { item: (typeof WHY_ITEMS)[number] }) {
  return (
    <div className="group">
      <p className="font-mono text-xs text-brand transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
        {item.k}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-background">{item.t}</h3>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand/80">{item.sub}</p>
      <p className="mt-2 text-sm leading-relaxed text-background/60">{item.d}</p>
    </div>
  );
}

function WhyChoose() {
  return (
    <section className="border-b border-border bg-foreground py-24 text-background">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-background/60">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" />
              Why Mindcarter
            </p>
            <h2 className="font-display mx-auto mt-3 max-w-2xl text-5xl font-black leading-[1.0] tracking-tight sm:text-6xl">
              Why Choose <span className="text-brand">Mindcarter?</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="relative mt-20">
          <svg
            aria-hidden
            viewBox="0 0 1200 160"
            preserveAspectRatio="none"
            className="pointer-events-none absolute -top-14 left-0 hidden h-28 w-full lg:block"
          >
            <path
              d="M0,140 Q600,-40 1200,140"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="2 10"
              strokeLinecap="round"
              className="text-background/25"
            />
          </svg>

          <StaggerContainer className="grid gap-14 sm:grid-cols-2 lg:gap-x-24">
            <StaggerItem>
              <WhyItem item={WHY_ITEMS[0]} />
            </StaggerItem>
            <StaggerItem>
              <WhyItem item={WHY_ITEMS[1]} />
            </StaggerItem>
            <StaggerItem>
              <WhyItem item={WHY_ITEMS[2]} />
            </StaggerItem>
            <StaggerItem>
              <WhyItem item={WHY_ITEMS[3]} />
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}

/* ── 6. Final CTA — gold rounded panel with booking actions ──────────────── */
function FinalCTA() {
  return (
    <section className="bg-background">
      <ScrollReveal className="mx-auto max-w-7xl px-6 py-24">
        <div
          className="relative overflow-hidden rounded-3xl bg-brand bg-cover bg-center p-10 sm:p-16"
          style={{ backgroundImage: `url(${aboutBannerImg})` }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-foreground/5"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-foreground/5"
          />
          <div className="relative grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/70">
                Begin
              </p>
              <h2 className="font-display mt-3 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                Ready to evolve? Book a confidential consultation.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 active:scale-95"
              >
                Book Consultation <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="tel:+14155550139"
                className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-background px-5 py-3 text-sm font-semibold text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-background/90 active:translate-y-0 active:scale-95"
              >
                <Phone className="h-4 w-4" /> Call Us
              </a>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

function AboutPage() {
  return (
    <SiteShell>
      <AboutHero />
      <AboutUs />
      <OurStory />
      <MissionVision />
      <WhyChoose />
      <FinalCTA />
    </SiteShell>
  );
}

